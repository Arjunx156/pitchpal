import type { FanContext } from '../context/types';
import { quietestAccessibleGate, type OpsSnapshot } from '../ops/opsFeed';
import type { ItineraryStep } from '../itinerary/itinerary';
import type { UiStrings } from '../../i18n/ui';
import { fmt } from '../../i18n/answers';

export type SuggestionKind = 'amenity' | 'reroute' | 'leave' | 'accessible';

export interface SuggestedAction {
  id: string;
  kind: SuggestionKind;
  reason: string;
  query: string;
}

const MAX_SUGGESTIONS = 2;
const KICKOFF_SOON_MIN = 20;

/** Context-aware next-best-action suggestions. Pure — the caller decides how to render/send them. */
export function suggestNextActions(
  context: FanContext,
  ops: OpsSnapshot,
  itinerary: ItineraryStep[],
  ui: UiStrings,
): SuggestedAction[] {
  const suggestions: SuggestedAction[] = [];

  const gateStep = itinerary.find((s) => s.kind === 'gate');
  const myGate = gateStep?.gateId ? ops.gates.find((g) => g.gateId === gateStep.gateId) : undefined;
  if (myGate?.level === 'jam') {
    suggestions.push({
      id: 'reroute',
      kind: 'reroute',
      reason: fmt(ui.suggestions.gateJamReason, { gate: myGate.gateId }),
      query: fmt(ui.risk.rerouteAsk, { gate: myGate.gateId }),
    });
  }

  if (ops.phase === 'pre' && ops.minutesToKickoff > 0 && ops.minutesToKickoff <= KICKOFF_SOON_MIN) {
    suggestions.push({
      id: 'kickoff-soon',
      kind: 'amenity',
      reason: ui.suggestions.kickoffSoonReason,
      query: ui.suggestions.kickoffSoonQuery,
    });
  }

  if (ops.phase === 'post') {
    suggestions.push({
      id: 'post-match',
      kind: 'leave',
      reason: ui.suggestions.postMatchReason,
      query: ui.suggestions.postMatchQuery,
    });
  }

  if (context.accessibility !== 'none') {
    const quietest = quietestAccessibleGate(ops);
    if (quietest && quietest.gateId !== myGate?.gateId) {
      suggestions.push({
        id: 'accessible-route',
        kind: 'accessible',
        reason: ui.suggestions.accessibleRouteReason,
        query: ui.quickActions.accessible.query,
      });
    }
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}
