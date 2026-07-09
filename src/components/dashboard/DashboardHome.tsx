import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Accessibility, Armchair, LogOut, Navigation, Sparkles, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChatContext } from '../../features/chat/ChatProvider';
import { useMapFocus } from '../../features/map/useMapFocus';
import { useItineraryOrder } from '../../features/itinerary/useItineraryOrder';
import { buildItinerary } from '../../features/itinerary/itinerary';
import { suggestNextActions, type SuggestionKind } from '../../features/suggestions/suggestNextActions';
import { staggerContainer, panelItem } from '../../lib/motion';
import { ItineraryPreviewTile } from './ItineraryPreviewTile';
import { GateRiskPanel } from '../risk/GateRiskPanel';
import { StadiumMap } from '../map/StadiumMap';
import { CrowdAnalytics } from '../analytics/CrowdAnalytics';
import { Standings } from '../standings/Standings';

const SUGGESTION_ICONS: Record<SuggestionKind, LucideIcon> = {
  amenity: Sparkles,
  reroute: Navigation,
  leave: LogOut,
  accessible: Accessibility,
};

export function DashboardHome({ onOpenItinerary }: { onOpenItinerary: () => void }) {
  const { ui, context, venue } = useFanContext();
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

  return (
    <div className="dashboard">
      <div className="dashboard__heading">
        <h1 className="dashboard__title display">{ui.dashboard.heading}</h1>
        <p className="dashboard__subtitle">{venue.name}</p>
      </div>

      <motion.div className="bento-grid" variants={staggerContainer} initial="hidden" animate="show">
        {/* Centerpiece: the live stadium map anchors the whole composition. */}
        <motion.div variants={panelItem} className="bento-cell bento-cell--map">
          <StadiumMap />
        </motion.div>

        <motion.div variants={panelItem} className="bento-cell">
          <GateRiskPanel />
        </motion.div>

        <motion.section
          variants={panelItem}
          className="bento-cell bento-tile dashboard-suggested"
          aria-labelledby="dashboard-suggested-heading"
        >
          <span className="bento-tile__eyebrow" id="dashboard-suggested-heading">
            {ui.dashboard.suggestedHeading}
          </span>
          <ul className="dashboard-suggested__list">
            {suggestions.length === 0
              ? (
                  [
                    { key: 'seat' as const, icon: Armchair },
                    { key: 'score' as const, icon: Trophy },
                  ].map(({ key, icon: Icon }) => (
                    <li key={key}>
                      <button
                        type="button"
                        className="chip-btn"
                        disabled={isStreaming}
                        onClick={() => void send(ui.quickActions[key].query)}
                      >
                        <Icon size={16} aria-hidden="true" />
                        <span>{ui.quickActions[key].label}</span>
                      </button>
                    </li>
                  ))
                )
              : null}
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

        <motion.div variants={panelItem} className="bento-cell">
          <ItineraryPreviewTile onSeeAll={onOpenItinerary} />
        </motion.div>

        <motion.div variants={panelItem} className="bento-cell">
          <CrowdAnalytics />
        </motion.div>

        <motion.div variants={panelItem} className="bento-cell">
          <Standings />
        </motion.div>
      </motion.div>
    </div>
  );
}
