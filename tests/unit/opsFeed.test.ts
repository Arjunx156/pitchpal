import { describe, it, expect } from 'vitest';
import {
  getOpsSnapshot,
  gateStatus,
  quietestAccessibleGate,
} from '../../src/features/ops/opsFeed';
import { venue } from '../../src/features/venue/venue-data';

const MIN = 60_000;

describe('getOpsSnapshot', () => {
  it('is pre-match with a positive countdown early in the cycle', () => {
    const snap = getOpsSnapshot(venue, 10 * MIN);
    expect(snap.phase).toBe('pre');
    expect(snap.minutesToKickoff).toBe(30);
    expect(snap.matchClock).toBeNull();
  });

  it('is live with a match clock after kickoff', () => {
    const snap = getOpsSnapshot(venue, 60 * MIN);
    expect(snap.phase).toBe('live');
    expect(snap.matchClock).toBe(20);
    expect(snap.minutesToKickoff).toBeLessThan(0);
  });

  it('is post-match late in the cycle', () => {
    const snap = getOpsSnapshot(venue, 137 * MIN);
    expect(snap.phase).toBe('post');
  });

  it('produces a status for every gate within valid ranges', () => {
    const snap = getOpsSnapshot(venue, 30 * MIN);
    expect(snap.gates).toHaveLength(venue.gates.length);
    for (const g of snap.gates) {
      expect(g.occupancy).toBeGreaterThanOrEqual(0.05);
      expect(g.occupancy).toBeLessThanOrEqual(0.99);
      expect(g.queueMinutes).toBeGreaterThanOrEqual(0);
      expect(['ok', 'busy', 'jam']).toContain(g.level);
    }
  });

  it('is deterministic for a given now', () => {
    expect(getOpsSnapshot(venue, 42 * MIN)).toEqual(getOpsSnapshot(venue, 42 * MIN));
  });

  it('reports plausible weather and temperature', () => {
    const snap = getOpsSnapshot(venue, 5 * MIN);
    expect(['clear', 'cloudy', 'rain']).toContain(snap.weather);
    expect(snap.temperatureC).toBeGreaterThanOrEqual(21);
    expect(snap.temperatureC).toBeLessThanOrEqual(27);
  });
});

describe('gateStatus & quietestAccessibleGate', () => {
  it('looks up a gate and returns undefined for unknown ids', () => {
    const snap = getOpsSnapshot(venue, 20 * MIN);
    expect(gateStatus(snap, 'A')?.gateId).toBe('A');
    expect(gateStatus(snap, 'Z')).toBeUndefined();
  });

  it('returns the least-congested step-free gate', () => {
    const snap = getOpsSnapshot(venue, 20 * MIN);
    const quietest = quietestAccessibleGate(snap);
    expect(quietest).toBeDefined();
    expect(quietest?.stepFree).toBe(true);
    const stepFree = snap.gates.filter((g) => g.stepFree);
    const minOcc = Math.min(...stepFree.map((g) => g.occupancy));
    expect(quietest?.occupancy).toBe(minOcc);
  });
});
