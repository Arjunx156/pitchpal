import { motion } from 'framer-motion';
import {
  Accessibility,
  ArrowRight,
  Armchair,
  Coffee,
  LogOut,
  Route,
  UtensilsCrossed,
} from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { buildItinerary } from '../../features/itinerary/itinerary';
import {
  suggestNextActions,
  type SuggestionKind,
} from '../../features/suggestions/suggestNextActions';
import { useNow } from '../../hooks/useNow';
import { rowItem } from '../../lib/motion';
import { Panel } from '../ui/Panel';

const KIND_ICON: Record<SuggestionKind, typeof Coffee> = {
  amenity: Coffee,
  reroute: Route,
  leave: LogOut,
  accessible: Accessibility,
};

interface Row {
  id: string;
  reason: string;
  query: string;
  icon: typeof Coffee;
  live?: boolean;
}

export function SuggestedActions({ onAsk }: { onAsk: (query: string) => void }) {
  const { ui, context, venue } = useFanContext();
  const now = useNow(15000);
  const ops = getOpsSnapshot(venue, now);
  const itinerary = buildItinerary(venue, ops);
  const smart = suggestNextActions(context, ops, itinerary, ui);

  // Live, context-aware suggestions come first; evergreen prompts keep the
  // panel useful (never barren) when nothing urgent is happening.
  const rows: Row[] = smart.map((s) => ({
    id: s.id,
    reason: s.reason,
    query: s.query,
    icon: KIND_ICON[s.kind],
    live: true,
  }));
  const evergreen: Row[] = [
    {
      id: 'seat',
      reason: ui.quickActions.seat.label,
      query: ui.quickActions.seat.query,
      icon: Armchair,
    },
    {
      id: 'food',
      reason: ui.quickActions.food.label,
      query: ui.quickActions.food.query,
      icon: UtensilsCrossed,
    },
    {
      id: 'leave',
      reason: ui.quickActions.leave.label,
      query: ui.quickActions.leave.query,
      icon: LogOut,
    },
  ];
  const shown = [...rows, ...evergreen].slice(0, 3);

  return (
    <Panel eyebrow={ui.dashboard.forYou} heading={ui.dashboard.suggestedHeading}>
      <ul className="flex flex-col gap-2">
        {shown.map((s) => {
          const Icon = s.icon;
          return (
            <motion.li key={s.id} variants={rowItem}>
              <button
                type="button"
                onClick={() => onAsk(s.query)}
                className="group flex w-full items-center gap-3 rounded-lg border border-border bg-[color-mix(in_oklab,var(--color-surface)_50%,transparent)] p-3 text-left transition-colors hover:border-[color-mix(in_oklab,var(--color-accent)_45%,transparent)] hover:bg-surface-2"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    s.live
                      ? 'bg-[color-mix(in_oklab,var(--color-accent)_16%,transparent)] text-accent'
                      : 'bg-surface-2 text-muted-foreground group-hover:text-accent'
                  }`}
                >
                  <Icon size={16} aria-hidden />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">{s.reason}</span>
                {s.live ? <span className="live-dot" aria-hidden /> : null}
                <ArrowRight
                  size={16}
                  aria-hidden
                  className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </button>
            </motion.li>
          );
        })}
      </ul>
    </Panel>
  );
}
