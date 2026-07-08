import { describe, it, expect } from 'vitest';
import { matchMoments, latestMoments, matchProgress } from '../../src/features/tournament/moments';
import { liveScore, resolveFixture } from '../../src/features/tournament/fixture';
import { answerOffline, isScoreQuestion, getMatchStatus } from '../../src/lib/tools-core';
import { getOpsSnapshot } from '../../src/features/ops/opsFeed';
import { venue } from '../../src/features/venue/venue-data';
import { DEFAULT_CONTEXT } from '../../src/features/context/types';

const fixture = resolveFixture('bra-arg');
const MIN = 60_000;

describe('matchMoments', () => {
  it('is empty before kickoff and starts with kickoff once live', () => {
    expect(matchMoments(fixture, null, 'pre')).toEqual([]);
    const first = matchMoments(fixture, 5, 'live')[0];
    expect(first).toMatchObject({ minute: 0, kind: 'kickoff' });
  });

  it('goal count always equals the deterministic liveScore', () => {
    for (const clock of [10, 30, 55, 70, 90]) {
      const goals = matchMoments(fixture, clock, 'live').filter((m) => m.kind === 'goal');
      const score = liveScore(clock);
      expect(goals).toHaveLength(score.home + score.away);
      const homeGoals = goals.filter((g) => g.teamCode === fixture.home.code);
      expect(homeGoals).toHaveLength(score.home);
    }
  });

  it('is sorted by minute and includes full time only post-match', () => {
    const live = matchMoments(fixture, 80, 'live');
    for (let i = 1; i < live.length; i += 1) {
      expect(live[i]!.minute).toBeGreaterThanOrEqual(live[i - 1]!.minute);
    }
    expect(live.some((m) => m.kind === 'fulltime')).toBe(false);
    const post = matchMoments(fixture, null, 'post');
    expect(post[post.length - 1]).toMatchObject({ minute: 90, kind: 'fulltime' });
  });

  it('latestMoments returns most-recent-first with a limit', () => {
    const latest = latestMoments(fixture, 80, 'live', 3);
    expect(latest).toHaveLength(3);
    expect(latest[0]!.minute).toBeGreaterThanOrEqual(latest[1]!.minute);
  });

  it('matchProgress maps phases to 0..1', () => {
    expect(matchProgress(null, 'pre')).toBe(0);
    expect(matchProgress(45, 'live')).toBeCloseTo(0.5);
    expect(matchProgress(null, 'post')).toBe(1);
  });
});

describe('getMatchStatus tool', () => {
  it('detects score questions in several languages', () => {
    expect(isScoreQuestion("What's the score?")).toBe(true);
    expect(isScoreQuestion('¿Cómo va el marcador?')).toBe(true);
    expect(isScoreQuestion('Quel est le score ?')).toBe(true);
    expect(isScoreQuestion('ما النتيجة؟')).toBe(true);
    expect(isScoreQuestion('Where is the nearest restroom?')).toBe(false);
    expect(isScoreQuestion('My goal is to find food, but fast')).toBe(false);
  });

  it('routes score questions offline to getMatchStatus with the live score', () => {
    const ops = getOpsSnapshot(venue, 60 * MIN); // live, clock = 20'
    const { toolName, result } = answerOffline("What's the score?", DEFAULT_CONTEXT, venue, ops);
    expect(toolName).toBe('getMatchStatus');
    const score = liveScore(ops.matchClock);
    expect(result.summary).toContain(`${score.home}–${score.away}`);
    expect(result.summary).toContain('Brazil');
  });

  it('localizes the summary (Spanish) and reports pre-match state', () => {
    const ops = getOpsSnapshot(venue, 10 * MIN); // pre-match
    const result = getMatchStatus({}, { ...DEFAULT_CONTEXT, language: 'es' }, venue, ops);
    expect(result.summary).toContain('comienza');
    expect(result.data?.phase).toBe('pre');
  });
});
