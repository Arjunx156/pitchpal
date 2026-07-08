import type { MatchPhase } from '../ops/opsFeed';
import { liveScore, type Fixture } from './fixture';

/**
 * Deterministic match-moment timeline derived from the virtual match clock.
 * Goals are reverse-engineered from liveScore() transitions so the ticker,
 * the scoreboard and the assistant can never disagree about the score.
 * Players are referred to by jersey number only — no invented names.
 */

export type MomentKind = 'kickoff' | 'goal' | 'yellow' | 'sub' | 'halftime' | 'fulltime';

export interface MatchMoment {
  minute: number;
  kind: MomentKind;
  /** Team the moment belongs to (absent for kickoff/halftime/fulltime). */
  teamCode?: string;
  /** e.g. jersey number for goals/cards. */
  detail?: string;
}

const HOME_SCORER_NUMBERS = [9, 10, 7, 11] as const;
const AWAY_SCORER_NUMBERS = [10, 9, 11, 7] as const;

/** Fixed non-goal beats so the feed stays lively between goals. */
const SET_PIECES: readonly { minute: number; kind: MomentKind; side: 'home' | 'away'; detail: string }[] = [
  { minute: 33, kind: 'yellow', side: 'away', detail: '#5' },
  { minute: 61, kind: 'sub', side: 'home', detail: '#17 ⇄ #7' },
  { minute: 74, kind: 'yellow', side: 'home', detail: '#4' },
];

/**
 * All moments up to (and including) the given match clock.
 * `matchClock` is null pre-match; pass phase 'post' for the full-time feed.
 */
export function matchMoments(
  fixture: Fixture,
  matchClock: number | null,
  phase: MatchPhase,
): MatchMoment[] {
  if (phase === 'pre') return [];
  const clock = phase === 'post' ? 90 : (matchClock ?? 0);

  const moments: MatchMoment[] = [{ minute: 0, kind: 'kickoff' }];

  // Derive goal minutes from score transitions — single source of truth.
  let homeGoals = 0;
  let awayGoals = 0;
  for (let m = 1; m <= clock; m += 1) {
    const s = liveScore(m);
    if (s.home > homeGoals) {
      moments.push({
        minute: m,
        kind: 'goal',
        teamCode: fixture.home.code,
        detail: `#${HOME_SCORER_NUMBERS[homeGoals % HOME_SCORER_NUMBERS.length]}`,
      });
      homeGoals = s.home;
    }
    if (s.away > awayGoals) {
      moments.push({
        minute: m,
        kind: 'goal',
        teamCode: fixture.away.code,
        detail: `#${AWAY_SCORER_NUMBERS[awayGoals % AWAY_SCORER_NUMBERS.length]}`,
      });
      awayGoals = s.away;
    }
  }

  for (const piece of SET_PIECES) {
    if (piece.minute <= clock) {
      moments.push({
        minute: piece.minute,
        kind: piece.kind,
        teamCode: piece.side === 'home' ? fixture.home.code : fixture.away.code,
        detail: piece.detail,
      });
    }
  }

  if (clock >= 45) moments.push({ minute: 45, kind: 'halftime' });
  if (phase === 'post') moments.push({ minute: 90, kind: 'fulltime' });

  return moments.sort((a, b) => a.minute - b.minute);
}

/** Most-recent-first slice for tickers/feeds. */
export function latestMoments(
  fixture: Fixture,
  matchClock: number | null,
  phase: MatchPhase,
  limit = 4,
): MatchMoment[] {
  return matchMoments(fixture, matchClock, phase).slice(-limit).reverse();
}

/** Fraction of the 90-minute match played (0..1) for progress bars. */
export function matchProgress(matchClock: number | null, phase: MatchPhase): number {
  if (phase === 'pre') return 0;
  if (phase === 'post') return 1;
  return Math.min(1, Math.max(0, (matchClock ?? 0) / 90));
}
