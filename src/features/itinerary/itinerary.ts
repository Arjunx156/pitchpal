import type { OpsSnapshot } from '../ops/opsFeed';
import type { Venue } from '../venue/types';
import type { Fixture } from '../tournament/fixture';

const MIN_MS = 60_000;

export type ItineraryStepKind = 'arrive' | 'gate' | 'seat' | 'kickoff' | 'halftime' | 'leave';

export interface ItineraryStep {
  kind: ItineraryStepKind;
  time: number; // epoch ms
  gateId?: string;
  transportName?: string;
}

/** Deterministic "My Match Day" timeline, derived from the venue and ops cycle. */
export function buildItinerary(venue: Venue, ops: OpsSnapshot, originGateId?: string): ItineraryStep[] {
  const gate = venue.gates.find((g) => g.id === originGateId) ?? venue.gates[0];
  const greenest = [...venue.transport].sort((a, b) => a.carbonKg - b.carbonKg)[0];

  return [
    { kind: 'arrive', time: ops.kickoffAt - 90 * MIN_MS },
    { kind: 'gate', time: ops.kickoffAt - 60 * MIN_MS, gateId: gate?.id },
    { kind: 'seat', time: ops.kickoffAt - 20 * MIN_MS },
    { kind: 'kickoff', time: ops.kickoffAt },
    { kind: 'halftime', time: ops.kickoffAt + 45 * MIN_MS },
    { kind: 'leave', time: ops.kickoffAt + 100 * MIN_MS, transportName: greenest?.name },
  ];
}

export function fixtureLabel(fixture: Fixture): string {
  return `${fixture.home.name} vs ${fixture.away.name}`;
}
