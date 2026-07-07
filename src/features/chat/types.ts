import type { FanContext } from '../context/types';
import type { AnswerCard } from '../../lib/cards';

export type Role = 'user' | 'assistant';

export interface ChatTurn {
  role: Role;
  content: string;
}

export interface ChatMessage extends ChatTurn {
  id: string;
  /** Structured cards produced by tool results. */
  cards?: AnswerCard[];
  /** Transient tool-activity label while the agent works. */
  status?: string;
  /** True while assistant tokens are still streaming in. */
  pending?: boolean;
  /** True when this message failed to complete. */
  error?: boolean;
}

/** Optional image payload for multimodal (ticket scan). */
export interface ChatImage {
  mimeType: string;
  /** Base64 data (no data: prefix). */
  data: string;
}

/** Request body sent to POST /api/chat. */
export interface ChatRequest {
  message: string;
  context: FanContext;
  history: ChatTurn[];
  image?: ChatImage;
}

/** Server-sent event payloads streamed back from /api/chat. */
export type ChatStreamEvent =
  | { type: 'status'; tool: string }
  | { type: 'tool_result'; tool: string; card?: AnswerCard }
  | { type: 'token'; value: string }
  | { type: 'context'; patch: Partial<FanContext> }
  | { type: 'done' }
  | { type: 'error'; message: string };
