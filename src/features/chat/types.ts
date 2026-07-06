import type { FanContext } from '../context/types';
import type { AnswerCard } from '../../lib/cards';

export type Role = 'user' | 'assistant';

export interface ChatTurn {
  role: Role;
  content: string;
}

export interface ChatMessage extends ChatTurn {
  id: string;
  /** Optional structured card parsed from an assistant message. */
  card?: AnswerCard;
  /** True while assistant tokens are still streaming in. */
  pending?: boolean;
  /** True when this message failed to complete. */
  error?: boolean;
}

/** Request body sent to POST /api/chat. */
export interface ChatRequest {
  message: string;
  context: FanContext;
  history: ChatTurn[];
}

/** Server-sent event payloads streamed back from /api/chat. */
export type ChatStreamEvent =
  | { type: 'token'; value: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
