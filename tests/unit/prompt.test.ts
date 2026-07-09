import { describe, it, expect } from 'vitest';
import { buildAgentSystemInstruction } from '../../server/prompt';
import { venue } from '../../src/features/venue/venue-data';
import { getOpsSnapshot } from '../../src/features/ops/opsFeed';
import { DEFAULT_CONTEXT, type FanContext } from '../../src/features/context/types';

const ctx = (over: Partial<FanContext> = {}): FanContext => ({ ...DEFAULT_CONTEXT, ...over });

describe('buildAgentSystemInstruction', () => {
  it('names the venue and the fan language', () => {
    const sys = buildAgentSystemInstruction(ctx({ language: 'ar' }), venue);
    expect(sys).toContain(venue.name);
    expect(sys).toContain('Arabic');
  });

  it('includes anti-injection and anti-hallucination guardrails', () => {
    const sys = buildAgentSystemInstruction(ctx(), venue);
    expect(sys.toLowerCase()).toContain('untrusted');
    expect(sys).toContain('Never invent');
  });

  it('carries the accessibility profile into the instruction', () => {
    const sys = buildAgentSystemInstruction(ctx({ accessibility: 'wheelchair' }), venue);
    expect(sys).toContain('wheelchair');
    expect(sys).toContain('step-free');
  });

  it('embeds the live match phase when an ops snapshot is provided', () => {
    const ops = getOpsSnapshot(venue);
    const sys = buildAgentSystemInstruction(ctx(), venue, ops);
    expect(sys).toContain('getMatchStatus');
    expect(sys).toContain(ops.phase);
  });

  it('still insists on the match tool without an ops snapshot', () => {
    const sys = buildAgentSystemInstruction(ctx(), venue);
    expect(sys).toContain('getMatchStatus');
  });
});
