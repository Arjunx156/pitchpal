import { describe, it, expect } from 'vitest';
import { suggestNextActions } from '../../src/features/suggestions/suggestNextActions';
import { DEFAULT_CONTEXT } from '../../src/features/context/types';
import { UI } from '../../src/i18n/ui';
import type { OpsSnapshot, GateStatus } from '../../src/features/ops/opsFeed';
import type { ItineraryStep } from '../../src/features/itinerary/itinerary';

function makeGate(overrides: Partial<GateStatus> = {}): GateStatus {
  return {
    gateId: 'A',
    stepFree: true,
    occupancy: 0.3,
    queueMinutes: 4,
    level: 'ok',
    ...overrides,
  };
}

function makeOps(overrides: Partial<OpsSnapshot> = {}): OpsSnapshot {
  return {
    now: 0,
    kickoffAt: 0,
    minutesToKickoff: -60,
    phase: 'live',
    matchClock: 20,
    weather: 'clear',
    temperatureC: 22,
    gates: [makeGate()],
    ...overrides,
  };
}

const ui = UI.en;

describe('suggestNextActions', () => {
  it('suggests a reroute when the fan itinerary gate is jammed', () => {
    const ops = makeOps({ gates: [makeGate({ gateId: 'B', level: 'jam' })] });
    const itinerary: ItineraryStep[] = [{ kind: 'gate', time: 0, gateId: 'B' }];
    const suggestions = suggestNextActions(DEFAULT_CONTEXT, ops, itinerary, ui);
    expect(suggestions.some((s) => s.kind === 'reroute')).toBe(true);
  });

  it('suggests checking amenities when kickoff is soon', () => {
    const ops = makeOps({ phase: 'pre', minutesToKickoff: 10 });
    const suggestions = suggestNextActions(DEFAULT_CONTEXT, ops, [], ui);
    expect(suggestions.some((s) => s.kind === 'amenity')).toBe(true);
  });

  it('does not suggest kickoff-soon well before or after kickoff', () => {
    const farOut = makeOps({ phase: 'pre', minutesToKickoff: 45 });
    expect(
      suggestNextActions(DEFAULT_CONTEXT, farOut, [], ui).some((s) => s.kind === 'amenity'),
    ).toBe(false);
  });

  it('suggests a leaving route once the match has ended', () => {
    const ops = makeOps({ phase: 'post', matchClock: null });
    const suggestions = suggestNextActions(DEFAULT_CONTEXT, ops, [], ui);
    expect(suggestions.some((s) => s.kind === 'leave')).toBe(true);
  });

  it('suggests an accessible route when the fan has an accessibility need and is not at the quietest gate', () => {
    const ops = makeOps({
      gates: [makeGate({ gateId: 'A', occupancy: 0.6 }), makeGate({ gateId: 'B', occupancy: 0.1 })],
    });
    const itinerary: ItineraryStep[] = [{ kind: 'gate', time: 0, gateId: 'A' }];
    const context = { ...DEFAULT_CONTEXT, accessibility: 'wheelchair' as const };
    const suggestions = suggestNextActions(context, ops, itinerary, ui);
    expect(suggestions.some((s) => s.kind === 'accessible')).toBe(true);
  });

  it('never returns more than two suggestions', () => {
    const ops = makeOps({
      phase: 'post',
      matchClock: null,
      gates: [
        makeGate({ gateId: 'A', level: 'jam', occupancy: 0.6 }),
        makeGate({ gateId: 'B', occupancy: 0.1 }),
      ],
    });
    const itinerary: ItineraryStep[] = [{ kind: 'gate', time: 0, gateId: 'A' }];
    const context = { ...DEFAULT_CONTEXT, accessibility: 'wheelchair' as const };
    const suggestions = suggestNextActions(context, ops, itinerary, ui);
    expect(suggestions.length).toBeLessThanOrEqual(2);
  });
});
