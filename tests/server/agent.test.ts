import { describe, it, expect } from 'vitest';
import { runAgent, type AgentAi, type AgentInput } from '../../server/agent';
import { venue } from '../../src/features/venue/venue-data';
import { getOpsSnapshot } from '../../src/features/ops/opsFeed';
import { DEFAULT_CONTEXT } from '../../src/features/context/types';
import type { ChatStreamEvent } from '../../src/features/chat/types';

type Chunk = { text?: string; functionCalls?: { name?: string; args?: Record<string, unknown> }[] };
type StreamRequest = { model: string; contents: unknown[]; config: Record<string, unknown> };

function input(over: Partial<AgentInput> = {}): AgentInput {
  const ops = getOpsSnapshot(venue);
  return {
    message: 'How do I get to section 205?',
    history: [],
    context: { ...DEFAULT_CONTEXT },
    venue,
    ops,
    image: undefined,
    ...over,
  };
}

/** Fake GenAI client scripted with one chunk-array per round. */
function fakeAi(rounds: Chunk[][]): { ai: AgentAi; requests: StreamRequest[] } {
  const requests: StreamRequest[] = [];
  const ai: AgentAi = {
    models: {
      async generateContentStream(params) {
        requests.push(params as unknown as StreamRequest);
        const round = rounds[Math.min(requests.length - 1, rounds.length - 1)] ?? [];
        return (async function* () {
          for (const chunk of round) yield chunk;
        })();
      },
    },
  };
  return { ai, requests };
}

async function collect(gen: AsyncGenerator<ChatStreamEvent>): Promise<ChatStreamEvent[]> {
  const out: ChatStreamEvent[] = [];
  for await (const e of gen) out.push(e);
  return out;
}

describe('runAgent (tool-calling loop)', () => {
  it('runs a tool round, feeds the result back, then streams the final text', async () => {
    const { ai, requests } = fakeAi([
      [{ functionCalls: [{ name: 'planRoute', args: { destination: 'section 205' } }] }],
      [{ text: 'Head to ' }, { text: 'Gate C.' }],
    ]);

    const events = await collect(runAgent(input(), { GEMINI_API_KEY: 'k' }, undefined, ai));

    expect(requests).toHaveLength(2);
    expect(events.some((e) => e.type === 'status' && e.tool === 'planRoute')).toBe(true);
    expect(events.some((e) => e.type === 'tool_result')).toBe(true);
    const text = events
      .filter((e) => e.type === 'token')
      .map((e) => (e as { value: string }).value)
      .join('');
    expect(text).toBe('Head to Gate C.');

    // The second request must carry the functionResponse turn back to the model.
    const followUp = JSON.stringify(requests[1]?.contents);
    expect(followUp).toContain('functionResponse');
    expect(followUp).toContain('planRoute');
  });

  it('attaches a ticket image to the user turn when provided', async () => {
    const { ai, requests } = fakeAi([[{ text: 'Nice ticket!' }]]);
    await collect(
      runAgent(
        input({ image: { mimeType: 'image/png', data: 'aGk=' } }),
        { GEMINI_API_KEY: 'k' },
        undefined,
        ai,
      ),
    );
    expect(JSON.stringify(requests[0]?.contents)).toContain('inlineData');
  });

  it('emits a localized fallback instead of silence when tool rounds run out', async () => {
    // Model insists on calling tools forever — every round returns another call.
    const { ai, requests } = fakeAi([[{ functionCalls: [{ name: 'getGateStatus', args: {} }] }]]);

    const events = await collect(
      runAgent(
        input({ context: { ...DEFAULT_CONTEXT, language: 'es' } }),
        { GEMINI_API_KEY: 'k' },
        undefined,
        ai,
      ),
    );

    expect(requests).toHaveLength(4); // MAX_TOOL_ROUNDS
    const last = events.at(-1);
    expect(last?.type).toBe('token');
    expect((last as { value: string }).value.length).toBeGreaterThan(0);
    // Spanish fallback, not the English one.
    expect((last as { value: string }).value).toContain('sencilla');
  });

  it('stops immediately when the signal is already aborted', async () => {
    const { ai, requests } = fakeAi([[{ text: 'never' }]]);
    const controller = new AbortController();
    controller.abort();

    const events = await collect(runAgent(input(), { GEMINI_API_KEY: 'k' }, controller.signal, ai));

    expect(events).toHaveLength(0);
    expect(requests).toHaveLength(0);
  });

  it('bails mid-stream on abort without emitting the overflow fallback', async () => {
    const controller = new AbortController();
    const { ai } = fakeAi([[{ text: 'partial ' }, { text: 'answer' }]]);
    // Abort after the first chunk is consumed.
    const events: ChatStreamEvent[] = [];
    const gen = runAgent(input(), { GEMINI_API_KEY: 'k' }, controller.signal, ai);
    for await (const e of gen) {
      events.push(e);
      controller.abort();
    }

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'token', value: 'partial ' });
  });
});
