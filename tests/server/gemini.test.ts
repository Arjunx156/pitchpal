import { describe, it, expect, vi } from 'vitest';

// Mock the SDK so streamLive can be tested without a network or key.
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContentStream: async () =>
        (async function* () {
          yield { text: 'Head ' };
          yield { text: 'to Gate C.' };
          yield { text: undefined }; // empty chunks are skipped
        })(),
    };
  },
}));

import { resolveMode, streamLive, streamMock } from '../../server/gemini';
import type { ComposedAnswer } from '../../src/lib/compose';
import type { BuiltPrompt } from '../../server/prompt';

async function collect(gen: AsyncGenerator<string>): Promise<string> {
  let out = '';
  for await (const chunk of gen) out += chunk;
  return out;
}

describe('resolveMode', () => {
  it('is live only with a non-empty key', () => {
    expect(resolveMode({})).toBe('mock');
    expect(resolveMode({ GEMINI_API_KEY: '   ' })).toBe('mock');
    expect(resolveMode({ GEMINI_API_KEY: 'abc' })).toBe('live');
  });
});

describe('streamMock', () => {
  it('streams prose plus a fenced card block that round-trips', async () => {
    const answer: ComposedAnswer = {
      text: 'Here you go.',
      card: { type: 'route', title: 'To 205', etaMinutes: 8, stepFree: true, steps: ['Enter at Gate C'] },
    };
    const out = await collect(streamMock(answer));
    expect(out).toContain('Here you go.');
    expect(out).toContain('```card');
    expect(out).toContain('"type":"route"');
  });

  it('streams just the prose when there is no card', async () => {
    const out = await collect(streamMock({ text: 'Hello there.' }));
    expect(out).toBe('Hello there.');
  });
});

describe('streamLive', () => {
  it('yields non-empty text chunks from the model', async () => {
    const prompt: BuiltPrompt = {
      systemInstruction: 'sys',
      contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
    };
    const out = await collect(streamLive(prompt, { GEMINI_API_KEY: 'test' }));
    expect(out).toBe('Head to Gate C.');
  });
});
