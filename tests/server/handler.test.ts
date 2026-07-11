import { describe, it, expect, vi } from 'vitest';
import { runChat, type ChatDeps } from '../../server/handler';
import type { ValidatedChatRequest } from '../../server/security';
import type { ChatStreamEvent } from '../../src/features/chat/types';
import { DEFAULT_CONTEXT, type FanContext } from '../../src/features/context/types';

function body(message: string, context: Partial<FanContext> = {}): ValidatedChatRequest {
  return { message, context: { ...DEFAULT_CONTEXT, ...context }, history: [] };
}

async function collect(gen: AsyncGenerator<ChatStreamEvent>): Promise<ChatStreamEvent[]> {
  const out: ChatStreamEvent[] = [];
  for await (const event of gen) out.push(event);
  return out;
}

const noopAgent: ChatDeps['runAgent'] = async function* () {
  /* not used in mock mode */
};

describe('runChat', () => {
  it('mock mode: emits a tool_result card + streamed tokens + done, no network', async () => {
    const deps: ChatDeps = { resolveMode: () => 'mock', runAgent: noopAgent };
    const events = await collect(runChat(body('How do I get to section 205?'), {}, deps));

    expect(events.at(-1)).toEqual({ type: 'done' });
    expect(events.some((e) => e.type === 'tool_result')).toBe(true);
    const text = events
      .filter((e) => e.type === 'token')
      .map((e) => (e as { value: string }).value)
      .join('');
    expect(text.length).toBeGreaterThan(0);
  });

  it('live mode routes to the injected agent and appends done', async () => {
    const fakeAgent: ChatDeps['runAgent'] = async function* (input) {
      expect(input.message).toContain('205');
      yield { type: 'status', tool: 'planRoute' };
      yield { type: 'token', value: 'Head to Gate C.' };
    };
    const deps: ChatDeps = { resolveMode: () => 'live', runAgent: fakeAgent };
    const events = await collect(runChat(body('directions to 205'), { GEMINI_API_KEY: 'k' }, deps));

    expect(events.some((e) => e.type === 'status')).toBe(true);
    expect(
      events.some(
        (e) => e.type === 'token' && (e as { value: string }).value === 'Head to Gate C.',
      ),
    ).toBe(true);
    expect(events.at(-1)).toEqual({ type: 'done' });
  });

  it('emits an error event (not done) when the agent throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing: ChatDeps['runAgent'] = async function* () {
      throw new Error('boom');
    };
    const deps: ChatDeps = { resolveMode: () => 'live', runAgent: failing };
    const events = await collect(runChat(body('hi'), { GEMINI_API_KEY: 'k' }, deps));

    expect(events.some((e) => e.type === 'error')).toBe(true);
    expect(events.some((e) => e.type === 'done')).toBe(false);
    spy.mockRestore();
  });
});
