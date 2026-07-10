import type { OpsSnapshot } from '../ops/opsFeed';
import type { Venue } from '../venue/types';
import type { Fixture } from '../tournament/fixture';
import type { ItineraryStrings } from '../../i18n/ui';
import { fmt } from '../../i18n/answers';

const MIN_MS = 60_000;

export type ItineraryStepKind = 'arrive' | 'gate' | 'seat' | 'kickoff' | 'halftime' | 'leave' | 'custom';

export interface ItineraryStep {
  kind: ItineraryStepKind;
  time: number; // epoch ms
  gateId?: string;
  transportName?: string;
  /** Only set for `kind: 'custom'` steps — a stable id for reorder/remove, and the fan-entered label. */
  id?: string;
  label?: string;
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

/** Localized label for an itinerary step, resolving the {id}/{transport} params. */
export function stepLabel(step: ItineraryStep, strings: ItineraryStrings): string {
  switch (step.kind) {
    case 'gate':
      return fmt(strings.gate, { id: step.gateId ?? '' });
    case 'leave':
      return fmt(strings.leave, { transport: step.transportName ?? '' });
    case 'custom':
      return step.label ?? '';
    default:
      return strings[step.kind];
  }
}
