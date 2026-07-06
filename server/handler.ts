import type { IncomingMessage, ServerResponse } from 'node:http';
import { retrieveContext } from '../src/lib/retrieval';
import { composeGroundedAnswer } from '../src/lib/compose';
import { venue } from '../src/features/venue/venue-data';
import type { ChatStreamEvent } from '../src/features/chat/types';
import { buildPrompt } from './prompt';
import {
  chatRequestSchema,
  rateLimit,
  securityHeaders,
  type ValidatedChatRequest,
} from './security';
import {
  resolveMode,
  streamLive,
  streamMock,
  type AppEnv,
  type GenerationMode,
} from './gemini';

const MAX_BODY_BYTES = 64_000;

/** Injectable generation deps so runChat is testable without a network. */
export interface ChatDeps {
  resolveMode: (env: AppEnv) => GenerationMode;
  streamLive: typeof streamLive;
  streamMock: typeof streamMock;
}

const defaultDeps: ChatDeps = { resolveMode, streamLive, streamMock };

/**
 * Core chat pipeline as an async event stream. Pure of HTTP concerns so it can
 * be unit-tested directly. Never throws — generation failures become an
 * `error` event.
 */
export async function* runChat(
  body: ValidatedChatRequest,
  env: AppEnv,
  deps: ChatDeps = defaultDeps,
): AsyncGenerator<ChatStreamEvent> {
  const mode = deps.resolveMode(env);
  const slice = retrieveContext(body.message, body.context, venue);

  try {
    const stream =
      mode === 'live'
        ? deps.streamLive(buildPrompt(body.message, body.history, slice, body.context, venue), env)
        : deps.streamMock(composeGroundedAnswer(slice, body.context, venue));

    for await (const chunk of stream) {
      yield { type: 'token', value: chunk };
    }
    yield { type: 'done' };
  } catch (err) {
    console.error('[chat] generation failed:', err);
    yield { type: 'error', message: 'The assistant is unavailable right now. Please try again.' };
  }
}

/* ------------------------------------------------------------------ */
/* HTTP adapter — used by both the Vite dev plugin and the prod server */
/* ------------------------------------------------------------------ */

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      data += chunk.toString('utf8');
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json', ...securityHeaders() });
  res.end(JSON.stringify(payload));
}

function sseWrite(res: ServerResponse, event: ChatStreamEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export async function handleChatRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: AppEnv = process.env,
): Promise<void> {
  const rl = rateLimit(clientIp(req));
  if (!rl.allowed) {
    res.writeHead(429, {
      'Content-Type': 'application/json',
      'Retry-After': String(rl.retryAfterSeconds ?? 60),
      ...securityHeaders(),
    });
    res.end(JSON.stringify({ error: 'Too many requests. Please slow down.' }));
    return;
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body.' });
    return;
  }

  const validated = chatRequestSchema.safeParse(parsedBody);
  if (!validated.success) {
    sendJson(res, 400, { error: 'Invalid request.' });
    return;
  }

  const mode = resolveMode(env);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'X-Pitchpal-Mode': mode,
    ...securityHeaders(),
  });

  for await (const event of runChat(validated.data, env)) {
    sseWrite(res, event);
  }
  res.end();
}
