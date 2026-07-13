import { useCallback, useEffect, useRef, useState } from 'react';
import { answerOffline } from '../../lib/tools-core';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { getOpsSnapshot } from '../ops/opsFeed';
import type { FanContext } from '../context/types';
import type { Venue } from '../venue/types';
import type { AnswerCard } from '../../lib/cards';
import type { ChatImage, ChatMessage, ChatRequest, ChatStreamEvent } from './types';

export type ChatMode = 'unknown' | 'mock' | 'live' | 'offline';

/** Split an SSE buffer into complete events, returning any trailing partial. */
export function extractEvents(buffer: string): { events: ChatStreamEvent[]; rest: string } {
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  const events: ChatStreamEvent[] = [];
  for (const part of parts) {
    const line = part.split('\n').find((l) => l.startsWith('data:'));
    if (!line) continue;
    const payload = line.slice('data:'.length).trim();
    if (!payload) continue;
    try {
      events.push(JSON.parse(payload) as ChatStreamEvent);
    } catch {
      /* ignore malformed event */
    }
  }
  return { events, rest };
}

function patchMessage(list: ChatMessage[], id: string, patch: Partial<ChatMessage>): ChatMessage[] {
  return list.map((m) => (m.id === id ? { ...m, ...patch } : m));
}

function appendCard(list: ChatMessage[], id: string, card: AnswerCard): ChatMessage[] {
  return list.map((m) => (m.id === id ? { ...m, cards: [...(m.cards ?? []), card] } : m));
}

/** POST the chat request and return the raw streaming Response (throws on network failure). */
function postChat(request: ChatRequest, signal: AbortSignal): Promise<Response> {
  return fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
}

/** Read an SSE response body to completion, invoking `onEvent` for each parsed event. */
async function readSseStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: ChatStreamEvent) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const { events, rest } = extractEvents(buffer);
    buffer = rest;
    for (const event of events) onEvent(event);
  }
}

interface StreamHandlers {
  onToken: (value: string) => void;
  onCard: (card: AnswerCard) => void;
  onStatus: (tool: string) => void;
  onContext: (patch: Partial<FanContext>) => void;
}

/** Dispatch one stream event to its handler. Throws on an `error` event; `done` is a no-op. */
function applyStreamEvent(event: ChatStreamEvent, handlers: StreamHandlers): void {
  switch (event.type) {
    case 'token':
      handlers.onToken(event.value);
      break;
    case 'tool_result':
      if (event.card) handlers.onCard(event.card);
      break;
    case 'status':
      handlers.onStatus(event.tool);
      break;
    case 'context':
      handlers.onContext(event.patch);
      break;
    case 'error':
      throw new Error(event.message);
  }
}

export interface UseChatResult {
  messages: ChatMessage[];
  isStreaming: boolean;
  mode: ChatMode;
  send: (text: string, image?: ChatImage) => Promise<void>;
  /** Cancel the in-flight response, keeping whatever text already streamed. */
  stop: () => void;
  /** Resend the last request after a failed turn. */
  retry: () => void;
}

export function useChat(
  context: FanContext,
  venue: Venue,
  errorText: string,
  applyPatch: (patch: Partial<FanContext>) => void,
): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<ChatMode>('unknown');
  const isOnline = useOnlineStatus();

  // Surface connectivity loss immediately (badge + screen-reader announcement)
  // instead of waiting for the next send to fail. Reconnecting clears the
  // offline badge; the real mode is re-resolved by the next send.
  useEffect(() => {
    if (!isOnline) {
      setMode('offline');
    } else {
      setMode((m) => (m === 'offline' ? 'unknown' : m));
    }
  }, [isOnline]);
  const idRef = useRef(0);
  const nextId = () => `m${(idRef.current += 1)}`;
  // Mirror of `messages` so send/retry always read the freshest history
  // (retry trims the failed turn synchronously before resending).
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;
  const abortRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<{ text: string; image?: ChatImage } | null>(null);

  const send = useCallback(
    async (text: string, image?: ChatImage) => {
      const trimmed = text.trim();
      if ((!trimmed && !image) || isStreaming) return;

      const controller = new AbortController();
      abortRef.current = controller;
      lastRequestRef.current = image ? { text: trimmed, image } : { text: trimmed };

      const history = messagesRef.current.map((m) => ({ role: m.role, content: m.content }));
      const userMessage: ChatMessage = { id: nextId(), role: 'user', content: trimmed || '📷' };
      const assistantId = nextId();
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: 'assistant', content: '', cards: [], pending: true },
      ]);
      setIsStreaming(true);

      const runLocal = () => {
        const ops = getOpsSnapshot(venue);
        const { result } = answerOffline(trimmed || 'help', context, venue, ops);
        setMode('offline');
        setMessages((prev) =>
          patchMessage(prev, assistantId, {
            content: result.summary,
            cards: result.card ? [result.card] : [],
            pending: false,
          }),
        );
      };

      // Finalize an aborted turn: keep the partial answer, or drop the empty
      // bubble entirely if nothing had streamed yet.
      const finalizeAborted = (content: string) => {
        setMessages((prev) =>
          content
            ? patchMessage(prev, assistantId, { content, status: undefined, pending: false })
            : prev.filter((m) => m.id !== assistantId),
        );
      };

      let content = '';
      let gotCard = false;

      let response: Response;
      try {
        // Known-offline: skip the doomed request and answer on-device.
        if (!navigator.onLine) throw new TypeError('offline');
        const request: ChatRequest = { message: trimmed || 'Scan my ticket.', context, history };
        if (image) request.image = image;
        response = await postChat(request, controller.signal);
      } catch {
        if (controller.signal.aborted) {
          finalizeAborted(content);
        } else {
          runLocal(); // network unreachable → answer on-device
        }
        setIsStreaming(false);
        return;
      }

      try {
        const headerMode = response.headers.get('X-Pitchpal-Mode');
        if (headerMode === 'live' || headerMode === 'mock') setMode(headerMode);
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

        await readSseStream(response.body, (event) =>
          applyStreamEvent(event, {
            onToken: (value) => {
              content += value;
              setMessages((prev) => patchMessage(prev, assistantId, { content, pending: true }));
            },
            onCard: (card) => {
              gotCard = true;
              setMessages((prev) => appendCard(prev, assistantId, card));
            },
            onStatus: (tool) =>
              setMessages((prev) => patchMessage(prev, assistantId, { status: tool })),
            onContext: (patch) => applyPatch(patch),
          }),
        );

        // A card-only turn is a legitimate answer — only a truly empty stream
        // (no text, no cards) is treated as a failure the user can retry.
        if (!content && !gotCard) throw new Error('empty stream');
        setMessages((prev) =>
          patchMessage(prev, assistantId, { content, status: undefined, pending: false }),
        );
      } catch {
        if (controller.signal.aborted) {
          finalizeAborted(content);
        } else {
          setMessages((prev) =>
            patchMessage(prev, assistantId, {
              content: content || errorText,
              status: undefined,
              pending: false,
              error: true,
            }),
          );
        }
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [context, venue, isStreaming, errorText, applyPatch],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retry = useCallback(() => {
    const request = lastRequestRef.current;
    if (!request || isStreaming) return;
    // Trim the failed assistant turn (and its user turn) so the resent request
    // doesn't carry the failure in its history or duplicate the bubbles.
    const base = messagesRef.current;
    let trimmed = base;
    const last = base[base.length - 1];
    if (last?.role === 'assistant' && last.error) {
      trimmed = base.slice(0, -1);
      if (trimmed[trimmed.length - 1]?.role === 'user') trimmed = trimmed.slice(0, -1);
    }
    messagesRef.current = trimmed;
    setMessages(trimmed);
    void send(request.text, request.image);
  }, [isStreaming, send]);

  return { messages, isStreaming, mode, send, stop, retry };
}
