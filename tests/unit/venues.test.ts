import { describe, it, expect } from 'vitest';
import {
  VENUES,
  VENUE_OPTIONS,
  DEFAULT_VENUE_ID,
  resolveVenue,
} from '../../src/features/venue/venues';
import {
  FIXTURES,
  DEFAULT_MATCH_ID,
  resolveFixture,
  liveScore,
} from '../../src/features/tournament/fixture';
import { GROUP_STANDINGS } from '../../src/features/tournament/standings';

describe('venue registry', () => {
  it('exposes one venue option per registered venue with distinct cities', () => {
    expect(VENUE_OPTIONS).toHaveLength(Object.keys(VENUES).length);
    const cities = new Set(VENUE_OPTIONS.map((v) => v.city));
    expect(cities.size).toBe(VENUE_OPTIONS.length);
  });

  it('resolves a known id to its venue', () => {
    expect(resolveVenue('sunset')).toBe(VENUES.sunset);
  });

  it('falls back to the default venue for an unknown or missing id', () => {
    expect(resolveVenue('nonexistent')).toBe(VENUES[DEFAULT_VENUE_ID]);
    expect(resolveVenue(undefined)).toBe(VENUES[DEFAULT_VENUE_ID]);
  });
});

describe('fixtures', () => {
  it('resolves a known match id to its fixture', () => {
    const fixture = resolveFixture('usa-mex');
    expect(fixture.home.code).toBe('USA');
    expect(fixture.venueId).toBe('sunset');
  });

  it('falls back to the default match for an unknown id', () => {
    expect(resolveFixture('nonexistent').id).toBe(DEFAULT_MATCH_ID);
    expect(resolveFixture(undefined).id).toBe(DEFAULT_MATCH_ID);
  });

  it('every fixture points at a registered venue and a standings group', () => {
    for (const fixture of FIXTURES) {
      expect(VENUES[fixture.venueId]).toBeDefined();
      expect(GROUP_STANDINGS[fixture.group]).toBeDefined();
    }
  });

  it('derives a deterministic scoreline from the match clock', () => {
    expect(liveScore(null)).toEqual({ home: 0, away: 0 });
    expect(liveScore(0)).toEqual({ home: 0, away: 0 });
    expect(liveScore(90)).toEqual({ home: 3, away: 2 });
  });
});
