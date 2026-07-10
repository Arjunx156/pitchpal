import { motion } from 'framer-motion';
import { ArrowUpRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import { type CongestionLevel } from '../../features/ops/opsFeed';
import { forecastGateRisk, type RiskTrend } from '../../features/ops/riskForecast';
import { fmt } from '../../i18n/answers';
import { useNow } from '../../lib/useNow';
import { rowItem } from '../../lib/motion';
import { Panel } from '../ui/Panel';
import { Sparkline } from '../charts/Sparkline';

const LEVEL_COLOR: Record<CongestionLevel, string> = {
  ok: 'var(--color-ok)',
  busy: 'var(--color-warn)',
  jam: 'var(--color-jam)',
};
const TREND_ICON: Record<RiskTrend, typeof TrendingUp> = {
  rising: TrendingUp,
  falling: TrendingDown,
  steady: Minus,
};

export function GateRiskPanel({ onAsk }: { onAsk: (query: string) => void }) {
  const { ui, venue } = useFanContext();
  const now = useNow(5000);
  const forecasts = forecastGateRisk(venue, now)
    .slice()
    .sort((a, b) => b.projectedQueueMinutes - a.projectedQueueMinutes)
    .slice(0, 4);

  const worst = forecasts[0];
  const showReroute = worst && worst.projectedLevel === 'jam';
  const gateName = (id: string) => venue.gates.find((g) => g.id === id)?.name ?? id;
  const levelLabel: Record<CongestionLevel, string> = {
    ok: ui.ops.quiet,
    busy: ui.ops.busy,
    jam: ui.ops.packed,
  };

  return (
    <Panel
      eyebrow={ui.risk.heading}
      heading={ui.dashboard.riskHeading}
      action={
        showReroute ? (
          <button
            type="button"
            onClick={() => onAsk(fmt(ui.risk.rerouteAsk, { gate: gateName(worst.gateId) }))}
            className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--color-jam)_16%,transparent)] px-3 py-1 text-2xs font-bold uppercase tracking-[0.1em] text-[var(--color-jam)] transition-transform hover:-translate-y-px"
          >
            {ui.risk.rerouteCta}
            <ArrowUpRight size={13} aria-hidden />
          </button>
        ) : null
      }
    >
      <ul className="flex flex-col divide-y divide-[color-mix(in_oklab,var(--color-border)_70%,transparent)]">
        {forecasts.map((f) => {
          const Trend = TREND_ICON[f.trend];
          const color = LEVEL_COLOR[f.projectedLevel];
          return (
            <motion.li
              key={f.gateId}
              variants={rowItem}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {gateName(f.gateId)}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em]"
                    style={{ color, background: `color-mix(in oklab, ${color} 14%, transparent)` }}
                  >
                    {levelLabel[f.projectedLevel]}
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-2xs text-muted-foreground">
                  <span className="tabular text-foreground">{f.currentQueueMinutes}</span>
                  <ArrowUpRight size={11} aria-hidden className="opacity-50" />
                  <span className="tabular" style={{ color }}>
                    {f.projectedQueueMinutes}m
                  </span>
                  <span className="opacity-70">· {fmt(ui.risk.projectedIn, { min: 15 })}</span>
                </p>
              </div>
              <Trend size={15} aria-hidden style={{ color }} className="shrink-0" />
              <Sparkline values={f.series} color={color} width={72} height={26} className="shrink-0" />
            </motion.li>
          );
        })}
      </ul>
    </Panel>
  );
}
