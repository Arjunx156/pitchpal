import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Accessibility,
  Armchair,
  HeartPulse,
  LogOut,
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
import { suggestNextActions } from '../../features/suggestions/suggestNextActions';
import { QUICK_ACTION_KEYS, type QuickActionKey } from '../../i18n/ui';
import { useNow } from '../../lib/useNow';
import { SuggestionChip } from './SuggestionChip';

const ICONS: Record<QuickActionKey, LucideIcon> = {
  seat: Armchair,
  score: Trophy,
  food: Utensils,
  restroom: Toilet,
  accessible: Accessibility,
  leave: LogOut,
  firstAid: HeartPulse,
};

export function SmartQuickActions() {
  const { ui, context, venue } = useFanContext();
  const { send, isStreaming } = useChatContext();
  const focus = useMapFocus();
  const now = useNow(30_000);

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
        {suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <SuggestionChip
              suggestion={suggestion}
              ui={ui}
              disabled={isStreaming}
              onRun={(query) => void send(query)}
            />
          </li>
        ))}
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
