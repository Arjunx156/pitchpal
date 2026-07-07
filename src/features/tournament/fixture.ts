/** Representative sample fixture (not official). */
export interface Team {
  name: string;
  code: string;
}

export interface Fixture {
  home: Team;
  away: Team;
  group: string;
}

export const CURRENT_FIXTURE: Fixture = {
  home: { name: 'Brazil', code: 'BRA' },
  away: { name: 'Argentina', code: 'ARG' },
  group: 'Group C',
};

/** Deterministic sample scoreline derived from the virtual match clock. */
export function liveScore(matchClock: number | null): { home: number; away: number } {
  if (matchClock === null) return { home: 0, away: 0 };
  return {
    home: Math.min(4, Math.floor(matchClock / 28)),
    away: Math.min(4, Math.floor(Math.max(0, matchClock - 20) / 34)),
  };
}
