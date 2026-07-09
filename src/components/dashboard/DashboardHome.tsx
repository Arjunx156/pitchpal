import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Accessibility, LogOut, Navigation, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChatContext } from '../../features/chat/ChatProvider';
import { useMapFocus } from '../../features/map/useMapFocus';
import { useItineraryOrder } from '../../features/itinerary/useItineraryOrder';
import { buildItinerary } from '../../features/itinerary/itinerary';
import { suggestNextActions, type SuggestionKind } from '../../features/suggestions/suggestNextActions';
import { GROUP_STANDINGS } from '../../features/tournament/standings';
import { staggerContainer, panelItem } from '../../lib/motion';
import { DashboardHeroCard } from './DashboardHeroCard';
import { ItineraryPreviewTile } from './ItineraryPreviewTile';
import { GateRiskPanel } from '../risk/GateRiskPanel';

const SUGGESTION_ICONS: Record<SuggestionKind, LucideIcon> = {
  amenity: Sparkles,
  reroute: Navigation,
  leave: LogOut,
  accessible: Accessibility,
};

export function DashboardHome({ onOpenItinerary }: { onOpenItinerary: () => void }) {
  const { ui, context, venue, fixture } = useFanContext();
  const { send, isStreaming } = useChatContext();
  const focus = useMapFocus();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const ops = useMemo(() => getOpsSnapshot(venue, now), [venue, now]);
  const baseSteps = useMemo(
    () => buildItinerary(venue, ops, focus.originGateId),
    [venue, ops, focus.originGateId],
  );
  const { steps } = useItineraryOrder(context.matchId, baseSteps);
  const suggestions = useMemo(() => suggestNextActions(context, ops, steps, ui), [context, ops, steps, ui]);
  const standingsRows = GROUP_STANDINGS[fixture.group] ?? [];

  return (
    <div className="dashboard">
      <div className="dashboard__heading">
        <h1 className="dashboard__title display">{ui.dashboard.heading}</h1>
        <p className="dashboard__subtitle">{fixture.group}</p>
      </div>

      <motion.div className="bento-grid" variants={staggerContainer} initial="hidden" animate="show">
        <DashboardHeroCard />

        <motion.div variants={panelItem}>
          <GateRiskPanel />
        </motion.div>

        <motion.section
          variants={panelItem}
          className="bento-tile dashboard-suggested"
          aria-labelledby="dashboard-suggested-heading"
        >
          <span className="bento-tile__eyebrow" id="dashboard-suggested-heading">
            {ui.dashboard.suggestedHeading}
          </span>
          <ul className="dashboard-suggested__list">
            {suggestions.length === 0 ? (
              <li className="text-sm text-muted-foreground">{ui.quickActions.heading}</li>
            ) : null}
            {suggestions.map((suggestion) => {
              const Icon = SUGGESTION_ICONS[suggestion.kind];
              return (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    className="chip-btn chip-btn--suggested"
                    disabled={isStreaming}
                    onClick={() => void send(suggestion.query)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{suggestion.reason}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.section>

        <motion.div variants={panelItem}>
          <ItineraryPreviewTile onSeeAll={onOpenItinerary} />
        </motion.div>

        <motion.section variants={panelItem} className="bento-tile" aria-labelledby="dashboard-standings-heading">
          <span className="bento-tile__eyebrow" id="dashboard-standings-heading">
            {ui.standings.heading}
          </span>
          <ul className="dashboard-itinerary-preview__list">
            {standingsRows.slice(0, 4).map((row) => (
              <li key={row.code} className="dashboard-itinerary-preview__row">
                <span className="standings__code">{row.code}</span>
                <span>{row.name}</span>
                <span className="standings__pts tabular" style={{ marginInlineStart: 'auto' }}>
                  {row.points}
                </span>
              </li>
            ))}
          </ul>
        </motion.section>
      </motion.div>
    </div>
  );
}
