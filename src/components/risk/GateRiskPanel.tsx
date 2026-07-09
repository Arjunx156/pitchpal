import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Navigation } from 'lucide-react';
import { getOpsSnapshot, type CongestionLevel } from '../../features/ops/opsFeed';
import { forecastGateRisk, type RiskTrend } from '../../features/ops/riskForecast';
import { buildItinerary } from '../../features/itinerary/itinerary';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChatContext } from '../../features/chat/ChatProvider';
import { useMapFocus } from '../../features/map/useMapFocus';
import { fmt } from '../../i18n/answers';
import { panelItem, rowItem, staggerContainer } from '../../lib/motion';

const HORIZON_MIN = 15;

function TrendIcon({ trend }: { trend: RiskTrend }) {
  if (trend === 'rising') return <TrendingUp size={14} aria-hidden="true" />;
  if (trend === 'falling') return <TrendingDown size={14} aria-hidden="true" />;
  return <Minus size={14} aria-hidden="true" />;
}

const SEVERITY_RANK: Record<CongestionLevel, number> = { jam: 2, busy: 1, ok: 0 };

export function GateRiskPanel() {
  const { ui, venue } = useFanContext();
  const { send, isStreaming } = useChatContext();
  const focus = useMapFocus();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const ops = useMemo(() => getOpsSnapshot(venue, now), [venue, now]);
  const forecasts = useMemo(() => forecastGateRisk(venue, now, HORIZON_MIN), [venue, now]);
  const sorted = useMemo(
    () =>
      [...forecasts].sort(
        (a, b) =>
          SEVERITY_RANK[b.projectedLevel] - SEVERITY_RANK[a.projectedLevel] ||
          b.projectedQueueMinutes - a.projectedQueueMinutes,
      ),
    [forecasts],
  );

  const myGateStep = useMemo(
    () => buildItinerary(venue, ops, focus.originGateId).find((s) => s.kind === 'gate'),
    [venue, ops, focus.originGateId],
  );
  const myGateForecast = forecasts.find((f) => f.gateId === myGateStep?.gateId);
  const showReroute =
    myGateForecast && (myGateForecast.projectedLevel === 'jam' || myGateForecast.currentLevel === 'jam');

  const trendLabel = (trend: RiskTrend) =>
    trend === 'rising' ? ui.risk.rising : trend === 'falling' ? ui.risk.falling : ui.risk.steady;

  return (
    <motion.section className="risk-panel" aria-labelledby="risk-heading" variants={panelItem}>
      <h2 id="risk-heading" className="risk-panel__heading">
        {ui.risk.heading}
      </h2>

      <motion.ul className="risk-panel__list" variants={staggerContainer} initial="hidden" animate="show">
        {sorted.map((forecast) => (
          <motion.li
            key={forecast.gateId}
            className={`risk-panel__row${forecast.projectedLevel === 'jam' ? ' is-jam' : ''}`}
            variants={rowItem}
          >
            <span className="risk-panel__gate">
              {ui.ops.gate} {forecast.gateId}
            </span>
            <span className={`risk-panel__badge risk-panel__badge--${forecast.trend}`}>
              <TrendIcon trend={forecast.trend} />
              {trendLabel(forecast.trend)}
            </span>
            <span className="tabular" title={fmt(ui.risk.projectedIn, { min: String(HORIZON_MIN) })}>
              {forecast.projectedQueueMinutes} min
            </span>
          </motion.li>
        ))}
      </motion.ul>

      {showReroute && myGateStep?.gateId ? (
        <button
          type="button"
          className="risk-panel__reroute"
          disabled={isStreaming}
          onClick={() => void send(fmt(ui.risk.rerouteAsk, { gate: myGateStep.gateId ?? '' }))}
        >
          <Navigation size={14} aria-hidden="true" />
          {ui.risk.rerouteCta}
        </button>
      ) : null}
    </motion.section>
  );
}
