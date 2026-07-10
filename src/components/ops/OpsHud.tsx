import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import {
  busiestGate,
  crowdSeries,
  getOpsSnapshot,
  queueRiskLevel,
  type CongestionLevel,
  type Weather,
} from '../../features/ops/opsFeed';
import { fmt } from '../../i18n/answers';
import { ANALYTICS } from '../../i18n/ui';
import { useNow } from '../../lib/useNow';
import { rowItem, staggerContainer } from '../../lib/motion';
import { Panel } from '../ui/Panel';
import { Sparkline } from '../charts/Sparkline';

const WEATHER_ICON = { clear: Sun, cloudy: Cloud, rain: CloudRain } as const;
const LEVEL_COLOR: Record<CongestionLevel, string> = {
  ok: 'var(--color-ok)',
  busy: 'var(--color-warn)',
  jam: 'var(--color-jam)',
};

export function OpsHud() {
  const { ui, context, venue } = useFanContext();
  const now = useNow(5000);
  const ops = getOpsSnapshot(venue, now);
  const series = crowdSeries(venue, now, 14);
  const currentAvg = series[series.length - 1] ?? 0;
  const busiest = busiestGate(ops);
  const WeatherIcon = WEATHER_ICON[ops.weather as Weather];
  const levelLabel: Record<CongestionLevel, string> = {
    ok: ui.ops.quiet,
    busy: ui.ops.busy,
    jam: ui.ops.packed,
  };
  const gateName = (id: string) => venue.gates.find((g) => g.id === id)?.name ?? id;
  const gates = ops.gates.slice().sort((a, b) => b.occupancy - a.occupancy);

  return (
    <Panel
      eyebrow={ui.ops.heading}
      heading={ui.ops.gatesHeading}
      action={
        <span className="hud-eyebrow inline-flex items-center gap-1.5">
          <WeatherIcon size={13} aria-hidden />
          <span className="tabular text-foreground">{ops.temperatureC}°</span>
        </span>
      }
    >
      {/* crowd pulse */}
      <div className="mb-3 flex items-end justify-between gap-3 rounded-lg bg-[color-mix(in_oklab,var(--color-surface-2)_60%,transparent)] p-3">
        <div>
          <p className="hud-eyebrow">{ANALYTICS[context.language].crowd}</p>
          <p className="mt-0.5">
            <span className="tabular text-2xl font-bold text-foreground">{currentAvg}</span>
            <span className="text-sm text-muted-foreground">% full</span>
          </p>
        </div>
        <Sparkline values={series} color="var(--color-accent)" width={120} height={34} />
      </div>

      {/* gate queues */}
      <motion.ul variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-2.5">
        {gates.map((g) => {
          const color = LEVEL_COLOR[g.level];
          return (
            <motion.li key={g.gateId} variants={rowItem} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm font-medium text-foreground">
                {gateName(g.gateId)}
              </span>
              <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(g.occupancy * 100)}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
              <span className="tabular w-14 shrink-0 text-right text-xs" style={{ color }}>
                {fmt(ui.ops.queue, { min: g.queueMinutes })}
              </span>
            </motion.li>
          );
        })}
      </motion.ul>

      {busiest ? (
        <p className="mt-3 text-2xs text-muted-foreground">
          <span className="font-semibold" style={{ color: LEVEL_COLOR[queueRiskLevel(busiest.queueMinutes)] }}>
            {gateName(busiest.gateId)}
          </span>{' '}
          — {levelLabel[busiest.level]}
        </p>
      ) : null}
    </Panel>
  );
}
