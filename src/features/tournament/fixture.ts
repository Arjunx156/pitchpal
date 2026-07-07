/** Representative sample fixtures (not official). */
export interface Team {
  name: string;
  code: string;
}

export interface Fixture {
  id: string;
  venueId: string;
  home: Team;
  away: Team;
  group: string;
}

export const FIXTURES: Fixture[] = [
  {
    id: 'bra-arg',
    venueId: 'meadow',
    home: { name: 'Brazil', code: 'BRA' },
    away: { name: 'Argentina', code: 'ARG' },
    group: 'Group C',
  },
  {
    id: 'usa-mex',
    venueId: 'sunset',
    home: { name: 'United States', code: 'USA' },
    away: { name: 'Mexico', code: 'MEX' },
    group: 'Group A',
  },
  {
    id: 'fra-jpn',
    venueId: 'altiplano',
    home: { name: 'France', code: 'FRA' },
    away: { name: 'Japan', code: 'JPN' },
    group: 'Group D',
  },
  {
    id: 'eng-gha',
    venueId: 'maple',
    home: { name: 'England', code: 'ENG' },
    away: { name: 'Ghana', code: 'GHA' },
    group: 'Group F',
  },
];

export const DEFAULT_MATCH_ID = 'bra-arg';

const FALLBACK_FIXTURE = FIXTURES[0];

export function resolveFixture(id: string | undefined): Fixture {
  const match = FIXTURES.find((f) => f.id === id) ?? FALLBACK_FIXTURE;
  if (!match) throw new Error('FIXTURES must contain at least one entry');
  return match;
}

/** Deterministic sample scoreline derived from the virtual match clock. */
export function liveScore(matchClock: number | null): { home: number; away: number } {
  if (matchClock === null) return { home: 0, away: 0 };
  return {
    home: Math.min(4, Math.floor(matchClock / 28)),
    away: Math.min(4, Math.floor(Math.max(0, matchClock - 20) / 34)),
  };
}
