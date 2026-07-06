import { describe, it, expect } from 'vitest';
import { buildPrompt, buildSystemInstruction } from '../../server/prompt';
import { retrieveContext } from '../../src/lib/retrieval';
import { venue } from '../../src/features/venue/venue-data';
import { DEFAULT_CONTEXT, type FanContext } from '../../src/features/context/types';

const ctx = (over: Partial<FanContext> = {}): FanContext => ({ ...DEFAULT_CONTEXT, ...over });

describe('buildSystemInstruction', () => {
  it('names the venue and the fan language', () => {
    const sys = buildSystemInstruction(ctx({ language: 'ar' }), venue);
    expect(sys).toContain(venue.name);
    expect(sys).toContain('Arabic');
  });

  it('includes anti-injection and grounding guardrails', () => {
    const sys = buildSystemInstruction(ctx(), venue);
    expect(sys.toLowerCase()).toContain('untrusted');
    expect(sys).toContain('VENUE FACTS');
  });
});

describe('buildPrompt', () => {
  it('maps history roles and appends grounded facts to the final user turn', () => {
    const message = 'How do I get to section 205?';
    const slice = retrieveContext(message, ctx(), venue);
    const history = [
      { role: 'user' as const, content: 'hi' },
      { role: 'assistant' as const, content: 'hello!' },
    ];
    const { contents, systemInstruction } = buildPrompt(message, history, slice, ctx(), venue);

    expect(systemInstruction).toContain(venue.name);
    // history + 1 final user turn
    expect(contents).toHaveLength(3);
    expect(contents[1]?.role).toBe('model'); // assistant mapped to model
    const last = contents[contents.length - 1];
    expect(last?.role).toBe('user');
    expect(last?.parts[0]?.text).toContain('VENUE FACTS');
    expect(last?.parts[0]?.text).toContain(message);
    expect(last?.parts[0]?.text).toContain('205');
  });
});
