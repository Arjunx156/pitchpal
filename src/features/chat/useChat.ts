import { useCallback, useRef, useState } from 'react';
import { answerOffline } from '../../lib/tools-core';
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

export interface UseChatResult {
  messages: ChatMessage[];
  isStreaming: boolean;
  mode: ChatMode;
  send: (text: string, image?: ChatImage) => Promise<void>;
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
  const idRef = useRef(0);
  const nextId = () => `m${(idRef.current += 1)}`;

  const send = useCallback(
    async (text: string, image?: ChatImage) => {
      const trimmed = text.trim();
      if ((!trimmed && !image) || isStreaming) return;

      const history = messages.map((m) => ({ role: m.role, content: m.content }));
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

      let response: Response;
      try {
        const request: ChatRequest = { message: trimmed || 'Scan my ticket.', context, history };
        if (image) request.image = image;
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
      } catch {
        runLocal(); // network unreachable → answer on-device
        setIsStreaming(false);
        return;
      }

      try {
        const headerMode = response.headers.get('X-Pitchpal-Mode');
        if (headerMode === 'live' || headerMode === 'mock') setMode(headerMode);
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let content = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const { events, rest } = extractEvents(buffer);
          buffer = rest;
          for (const event of events) {
            if (event.type === 'token') {
              content += event.value;
              setMessages((prev) => patchMessage(prev, assistantId, { content, pending: true }));
            } else if (event.type === 'tool_result') {
              if (event.card) setMessages((prev) => appendCard(prev, assistantId, event.card as AnswerCard));
            } else if (event.type === 'status') {
              setMessages((prev) => patchMessage(prev, assistantId, { status: event.tool }));
            } else if (event.type === 'context') {
              applyPatch(event.patch);
            } else if (event.type === 'error') {
              throw new Error(event.message);
            }
          }
        }

        setMessages((prev) =>
          patchMessage(prev, assistantId, {
            content: content || errorText,
            status: undefined,
            pending: false,
          }),
        );
      } catch {
        setMessages((prev) =>
          patchMessage(prev, assistantId, { content: errorText, pending: false, error: true }),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, context, venue, isStreaming, errorText, applyPatch],
  );

  return { messages, isStreaming, mode, send };
}
