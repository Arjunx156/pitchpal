import { describe, it, expect } from 'vitest';
import { buildItinerary, fixtureLabel } from '../../src/features/itinerary/itinerary';
import { getOpsSnapshot } from '../../src/features/ops/opsFeed';
import { venue } from '../../src/features/venue/venue-data';
import { FIXTURES } from '../../src/features/tournament/fixture';

describe('buildItinerary', () => {
  it('produces an ordered timeline anchored to kickoff', () => {
    const ops = getOpsSnapshot(venue, Date.now());
    const steps = buildItinerary(venue, ops, 'A');

    expect(steps.map((s) => s.kind)).toEqual([
      'arrive',
      'gate',
      'seat',
      'kickoff',
      'halftime',
      'leave',
    ]);
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]?.time).toBeGreaterThan(steps[i - 1]?.time as number);
    }
    expect(steps.find((s) => s.kind === 'kickoff')?.time).toBe(ops.kickoffAt);
  });

  it('uses the requested origin gate, falling back to the first gate', () => {
    const ops = getOpsSnapshot(venue, Date.now());
    const withGate = buildItinerary(venue, ops, 'C');
    expect(withGate.find((s) => s.kind === 'gate')?.gateId).toBe('C');

    const withoutGate = buildItinerary(venue, ops, undefined);
    expect(withoutGate.find((s) => s.kind === 'gate')?.gateId).toBe(venue.gates[0]?.id);
  });

  it('suggests the lowest-carbon transport option to leave', () => {
    const ops = getOpsSnapshot(venue, Date.now());
    const steps = buildItinerary(venue, ops);
    const greenest = [...venue.transport].sort((a, b) => a.carbonKg - b.carbonKg)[0];
    expect(steps.find((s) => s.kind === 'leave')?.transportName).toBe(greenest?.name);
  });
});

describe('fixtureLabel', () => {
  it('formats the home and away team names', () => {
    const fixture = FIXTURES[0]!;
    expect(fixtureLabel(fixture)).toBe(`${fixture.home.name} vs ${fixture.away.name}`);
  });
});
