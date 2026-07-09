import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accessibility,
  Armchair,
  HeartPulse,
  LogOut,
  Navigation,
  Sparkles,
  Toilet,
  Trophy,
  Utensils,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { buildItinerary } from '../../features/itinerary/itinerary';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChatContext } from '../../features/chat/ChatProvider';
import { useMapFocus } from '../../features/map/useMapFocus';
import { suggestNextActions, type SuggestionKind } from '../../features/suggestions/suggestNextActions';
import { QUICK_ACTION_KEYS, type QuickActionKey, type UiStrings } from '../../i18n/ui';

const ICONS: Record<QuickActionKey, LucideIcon> = {
  seat: Armchair,
  score: Trophy,
  food: Utensils,
  restroom: Toilet,
  accessible: Accessibility,
  leave: LogOut,
  firstAid: HeartPulse,
};

const SUGGESTION_ICONS: Record<SuggestionKind, LucideIcon> = {
  amenity: Sparkles,
  reroute: Navigation,
  leave: LogOut,
  accessible: Accessibility,
};

function suggestionLabel(kind: SuggestionKind, ui: UiStrings): string {
  if (kind === 'reroute') return ui.risk.rerouteCta;
  if (kind === 'accessible') return ui.quickActions.accessible.label;
  if (kind === 'leave') return ui.quickActions.leave.label;
  return ui.quickActions.food.label;
}

export function SmartQuickActions() {
  const { ui, context, venue } = useFanContext();
  const { send, isStreaming } = useChatContext();
  const focus = useMapFocus();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const ops = useMemo(() => getOpsSnapshot(venue, now), [venue, now]);
  const itinerary = useMemo(
    () => buildItinerary(venue, ops, focus.originGateId),
    [venue, ops, focus.originGateId],
  );
  const suggestions = useMemo(
    () => suggestNextActions(context, ops, itinerary, ui),
    [context, ops, itinerary, ui],
  );

  return (
    <div className="quick-actions" role="group" aria-label={ui.quickActions.heading}>
      <p className="quick-actions__heading">{ui.dashboard.suggestedHeading}</p>
      <ul className="quick-actions__list">
        {suggestions.map((suggestion) => {
          const Icon = SUGGESTION_ICONS[suggestion.kind];
          return (
            <li key={suggestion.id}>
              <motion.button
                type="button"
                className="chip-btn chip-btn--suggested"
                disabled={isStreaming}
                onClick={() => void send(suggestion.query)}
                whileHover={isStreaming ? undefined : { scale: 1.03 }}
                whileTap={isStreaming ? undefined : { scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              >
                <Icon size={16} aria-hidden="true" />
                <span>
                  {suggestionLabel(suggestion.kind, ui)}
                  <span className="quick-actions__reason">{suggestion.reason}</span>
                </span>
              </motion.button>
            </li>
          );
        })}
        {QUICK_ACTION_KEYS.map((key) => {
          const action = ui.quickActions[key];
          const Icon = ICONS[key];
          return (
            <li key={key}>
              <motion.button
                type="button"
                className="chip-btn"
                disabled={isStreaming}
                onClick={() => void send(action.query)}
                whileHover={isStreaming ? undefined : { scale: 1.03 }}
                whileTap={isStreaming ? undefined : { scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              >
                <Icon size={16} aria-hidden="true" />
                {action.label}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
