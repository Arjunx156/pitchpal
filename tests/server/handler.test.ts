import { describe, it, expect, vi } from 'vitest';
import { runChat, type ChatDeps } from '../../server/handler';
import { streamMock } from '../../server/gemini';
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

function tokenText(events: ChatStreamEvent[]): string {
  return events.filter((e) => e.type === 'token').map((e) => (e as { value: string }).value).join('');
}

describe('runChat', () => {
  it('streams grounded mock tokens then done, with no network', async () => {
    const deps: ChatDeps = {
      resolveMode: () => 'mock',
      streamLive: streamMock as unknown as ChatDeps['streamLive'],
      streamMock,
    };
    const events = await collect(runChat(body('How do I get to section 205?'), {}, deps));

    expect(events.at(-1)).toEqual({ type: 'done' });
    const text = tokenText(events);
    expect(text).toContain('205'); // route card carries the section
    expect(text).toContain('"type":"route"');
  });

  it('routes to the live streamer with a grounded prompt when a key is present', async () => {
    let capturedSystem = '';
    const fakeLive: ChatDeps['streamLive'] = async function* (prompt) {
      capturedSystem = prompt.systemInstruction;
      yield 'Head ';
      yield 'to Gate C.';
    };
    const deps: ChatDeps = { resolveMode: () => 'live', streamLive: fakeLive, streamMock };

    const events = await collect(runChat(body('directions to 205'), { GEMINI_API_KEY: 'test-key' }, deps));

    expect(tokenText(events)).toBe('Head to Gate C.');
    expect(events.at(-1)).toEqual({ type: 'done' });
    expect(capturedSystem).toContain('Grand Meadow Stadium');
  });

  it('emits an error event (not done) when generation throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing: ChatDeps['streamLive'] = async function* () {
      throw new Error('boom');
    };
    const deps: ChatDeps = { resolveMode: () => 'live', streamLive: failing, streamMock };

    const events = await collect(runChat(body('directions to 205'), { GEMINI_API_KEY: 'k' }, deps));

    expect(events.some((e) => e.type === 'error')).toBe(true);
    expect(events.some((e) => e.type === 'done')).toBe(false);
    errorSpy.mockRestore();
  });
});
