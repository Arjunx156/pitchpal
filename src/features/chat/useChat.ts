import { useCallback, useRef, useState } from 'react';
import { parseAnswerCard } from '../../lib/cards';
import type { FanContext } from '../context/types';
import type { ChatMessage, ChatRequest, ChatStreamEvent } from './types';

export type ChatMode = 'unknown' | 'mock' | 'live';

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

function patchMessage(
  list: ChatMessage[],
  id: string,
  patch: Partial<ChatMessage>,
): ChatMessage[] {
  return list.map((m) => (m.id === id ? { ...m, ...patch } : m));
}

export interface UseChatResult {
  messages: ChatMessage[];
  isStreaming: boolean;
  mode: ChatMode;
  send: (text: string) => Promise<void>;
}

export function useChat(context: FanContext, errorText: string): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<ChatMode>('unknown');
  const idRef = useRef(0);
  const nextId = () => `m${(idRef.current += 1)}`;

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const userMessage: ChatMessage = { id: nextId(), role: 'user', content: trimmed };
      const assistantId = nextId();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: 'assistant', content: '', pending: true },
      ]);
      setIsStreaming(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, context, history } satisfies ChatRequest),
        });

        const headerMode = response.headers.get('X-Pitchpal-Mode');
        if (headerMode === 'live' || headerMode === 'mock') setMode(headerMode);
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const { events, rest } = extractEvents(buffer);
          buffer = rest;
          for (const event of events) {
            if (event.type === 'token') {
              accumulated += event.value;
              const { text } = parseAnswerCard(accumulated);
              setMessages((prev) => patchMessage(prev, assistantId, { content: text, pending: true }));
            } else if (event.type === 'error') {
              throw new Error(event.message);
            }
          }
        }

        const parsed = parseAnswerCard(accumulated);
        setMessages((prev) =>
          patchMessage(prev, assistantId, {
            content: parsed.text || errorText,
            ...(parsed.card ? { card: parsed.card } : {}),
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
    [messages, context, isStreaming, errorText],
  );

  return { messages, isStreaming, mode, send };
}
