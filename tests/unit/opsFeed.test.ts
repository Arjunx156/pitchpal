import { describe, it, expect } from 'vitest';
import {
  getOpsSnapshot,
  gateStatus,
  quietestAccessibleGate,
  sectionDensity,
  densityLevel,
  crowdSeries,
  gateQueueSeries,
  busiestGate,
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

describe('crowd analytics helpers', () => {
  it('sectionDensity returns a 0..1 value for every section', () => {
    const density = sectionDensity(venue, 30 * MIN);
    for (const s of venue.sections) {
      expect(density[s.id]).toBeGreaterThanOrEqual(0.05);
      expect(density[s.id]).toBeLessThanOrEqual(0.98);
    }
  });

  it('densityLevel buckets values into low/medium/high', () => {
    expect(densityLevel(0.2)).toBe('low');
    expect(densityLevel(0.6)).toBe('medium');
    expect(densityLevel(0.9)).toBe('high');
  });

  it('crowdSeries and gateQueueSeries return the requested number of points', () => {
    expect(crowdSeries(venue, 60 * MIN, 8)).toHaveLength(8);
    expect(gateQueueSeries(venue, 'A', 60 * MIN, 8)).toHaveLength(8);
  });

  it('busiestGate returns the most congested gate', () => {
    const snap = getOpsSnapshot(venue, 30 * MIN);
    const busy = busiestGate(snap);
    const maxOcc = Math.max(...snap.gates.map((g) => g.occupancy));
    expect(busy?.occupancy).toBe(maxOcc);
  });
});
