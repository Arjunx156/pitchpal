import { describe, it, expect } from 'vitest';
import { retrieveContext } from '../../src/lib/retrieval';
import { venue } from '../../src/features/venue/venue-data';
import { DEFAULT_CONTEXT, type FanContext } from '../../src/features/context/types';

const ctx = (over: Partial<FanContext> = {}): FanContext => ({ ...DEFAULT_CONTEXT, ...over });

describe('retrieveContext — navigation', () => {
  it('resolves the target section and its nearest gate', () => {
    const slice = retrieveContext(
      'How do I get to section 205?',
      ctx({ location: 'Gate B' }),
      venue,
    );
    expect(slice.intent).toBe('navigation');
    expect(slice.sections.map((s) => s.id)).toContain('205');
    // 205's nearest gate is C; origin gate B is also included.
    const gateIds = slice.gates.map((g) => g.id);
    expect(gateIds).toContain('C');
    expect(gateIds).toContain('B');
    expect(slice.origin).toEqual({ kind: 'gate', gate: expect.objectContaining({ id: 'B' }) });
  });

  it('flags an accessibility focus from the saved profile', () => {
    const slice = retrieveContext(
      'route to section 120',
      ctx({ accessibility: 'wheelchair' }),
      venue,
    );
    expect(slice.accessibilityFocus).toBe(true);
    expect(slice.sections.map((s) => s.id)).toContain('120');
  });

  it('falls back to step-free example sections when none is named and access is needed', () => {
    const slice = retrieveContext(
      'how do I find my seat?',
      ctx({ accessibility: 'wheelchair' }),
      venue,
    );
    expect(slice.sections.length).toBeGreaterThan(0);
    expect(slice.sections.every((s) => s.stepFreeAccess)).toBe(true);
  });
});

describe('retrieveContext — amenity', () => {
  it('filters amenities by dietary tag', () => {
    const slice = retrieveContext('where is halal food?', ctx(), venue);
    expect(slice.intent).toBe('amenity');
    expect(slice.amenities.some((a) => a.tags.includes('halal'))).toBe(true);
  });

  it('prefers step-free amenities under an accessibility profile', () => {
    const slice = retrieveContext('nearest restroom', ctx({ accessibility: 'wheelchair' }), venue);
    expect(slice.amenities.length).toBeGreaterThan(0);
    expect(slice.amenities.every((a) => a.stepFree)).toBe(true);
  });
});

describe('retrieveContext — transport', () => {
  it('returns rail options when a train is requested', () => {
    const slice = retrieveContext('is there a train downtown?', ctx(), venue);
    expect(slice.intent).toBe('transport');
    expect(slice.transport.some((t) => t.mode === 'rail')).toBe(true);
  });

  it('prefers accessible transport under an accessibility profile', () => {
    const slice = retrieveContext(
      'how do I leave after the match?',
      ctx({ accessibility: 'wheelchair' }),
      venue,
    );
    expect(slice.transport.length).toBeGreaterThan(0);
    expect(slice.transport.every((t) => t.accessible)).toBe(true);
  });
});

describe('retrieveContext — origin-aware ranking', () => {
  it('ranks amenities nearest the origin gate first', () => {
    // Gate C's nearest section is 114; the halal grill sits by 114.
    const slice = retrieveContext(
      'where can I find food or a restroom?',
      ctx({ location: 'Gate C' }),
      venue,
    );
    expect(slice.intent).toBe('amenity');
    expect(slice.amenities[0]?.nearSection).toBe('114');
  });

  it('ranks amenities nearest the origin section first', () => {
    const slice = retrieveContext('any food nearby?', ctx({ location: 'Section 108' }), venue);
    expect(slice.amenities[0]?.nearSection).toBe('108');
  });

  it('offers example sections for a vague nav query without accessibility', () => {
    const slice = retrieveContext('help me find my seat', ctx(), venue);
    expect(slice.intent).toBe('navigation');
    expect(slice.sections.length).toBeGreaterThan(0);
  });
});

describe('retrieveContext — general', () => {
  it('returns a light orientation slice for small talk', () => {
    const slice = retrieveContext('hello!', ctx(), venue);
    expect(slice.intent).toBe('general');
    expect(slice.gates.length).toBeGreaterThan(0);
  });
});
