import type { IncomingMessage, ServerResponse } from 'node:http';
import { getOpsSnapshot } from '../src/features/ops/opsFeed';
import { answerOffline } from '../src/lib/tools-core';
import { resolveFixture } from '../src/features/tournament/fixture';
import { resolveVenue } from '../src/features/venue/venues';
import type { ChatStreamEvent } from '../src/features/chat/types';
import { runAgent } from './agent';
import {
  chatRequestSchema,
  rateLimit,
  securityHeaders,
  type ValidatedChatRequest,
} from './security';
import { resolveMode, tokenize, type AppEnv, type GenerationMode } from './gemini';

const MAX_BODY_BYTES = 8_000_000; // allows a base64 ticket image (~4 MB binary)
const STREAM_TIMEOUT_MS = 45_000; // wall-clock cap for one generation

/** Injectable generation deps so runChat is testable without a network. */
export interface ChatDeps {
  resolveMode: (env: AppEnv) => GenerationMode;
  runAgent: typeof runAgent;
}

const defaultDeps: ChatDeps = { resolveMode, runAgent };

/**
 * Core chat pipeline as an async event stream. Live mode drives the Gemini
 * function-calling agent; mock/offline uses the deterministic tool router. Both
 * emit the same structured events. Never throws — failures become an `error`.
 */
export async function* runChat(
  body: ValidatedChatRequest,
  env: AppEnv,
  deps: ChatDeps = defaultDeps,
  signal?: AbortSignal,
): AsyncGenerator<ChatStreamEvent> {
  const venue = resolveVenue(resolveFixture(body.context.matchId).venueId);
  const ops = getOpsSnapshot(venue);
  try {
    if (deps.resolveMode(env) === 'live') {
      yield* deps.runAgent(
        {
          message: body.message,
          history: body.history,
          context: body.context,
          venue,
          ops,
          image: body.image,
        },
        env,
        signal,
      );
    } else {
      const { toolName, result } = answerOffline(body.message, body.context, venue, ops);
      yield { type: 'status', tool: toolName };
      if (result.card) yield { type: 'tool_result', tool: toolName, card: result.card };
      for (const token of tokenize(result.summary)) yield { type: 'token', value: token };
    }
    if (signal?.aborted) return;
    yield { type: 'done' };
  } catch (err) {
    // Aborts (client gone / timeout) are not generation failures — end quietly
    // and let the HTTP adapter decide whether anyone is still listening.
    if (signal?.aborted) return;
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

function clientIp(req: IncomingMessage, trustProxy: boolean): string {
  // x-forwarded-for is client-controlled unless a trusted proxy overwrites it —
  // honouring it blindly lets callers rotate identities past the rate limiter.
  if (trustProxy) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0]?.trim() ?? 'unknown';
    }
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
  const trustProxy = env.TRUST_PROXY === '1' || env.TRUST_PROXY === 'true';
  const rl = rateLimit(clientIp(req, trustProxy));
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

  // Stop generating (and spending Gemini tokens) the moment the client is gone,
  // and never let one generation hang the connection past the wall-clock cap.
  const controller = new AbortController();
  let clientGone = false;
  res.on('close', () => {
    clientGone = true;
    controller.abort();
  });
  const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  try {
    for await (const event of runChat(validated.data, env, undefined, controller.signal)) {
      if (controller.signal.aborted) break;
      sseWrite(res, event);
    }
    if (controller.signal.aborted && !clientGone) {
      sseWrite(res, { type: 'error', message: 'The answer took too long. Please try again.' });
    }
  } finally {
    clearTimeout(timeout);
    res.end();
  }
}
