import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFanContext } from '../../features/context/ContextProvider';
import { sectionDensity, densityLevel } from '../../features/ops/opsFeed';
import { buildMapGeometry, routePath, VIEW } from '../../features/map/geometry';
import { useMapFocus } from '../../features/map/useMapFocus';
import { useNow } from '../../lib/useNow';
import { fmt } from '../../i18n/answers';
import { Panel } from '../ui/Panel';

// Colors are applied via the CSS `fill`/`stroke` *style* (not SVG attributes),
// because presentation attributes don't accept var()/color-mix().
const DENSITY_COLOR = {
  low: 'var(--color-pitch)',
  medium: 'var(--color-warn)',
  high: 'var(--color-jam)',
} as const;
const PITCH_LINE = 'color-mix(in oklab, var(--color-pitch) 55%, transparent)';

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-2xs text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function StadiumMap({ onAsk }: { onAsk?: (query: string) => void }) {
  const { ui, venue } = useFanContext();
  const now = useNow(5000);
  const geo = useMemo(() => buildMapGeometry(venue), [venue]);
  const density = sectionDensity(venue, now);
  const focus = useMapFocus();

  const route =
    focus.originGateId && focus.targetSectionId
      ? routePath(geo, focus.originGateId, focus.targetSectionId)
      : [];
  const routeLine = route.map((p) => `${p.x},${p.y}`).join(' ');

  const targetSection = geo.sections.find((s) => s.id === focus.targetSectionId);
  const originGate = geo.gates.find((g) => g.id === focus.originGateId);
  const summary =
    originGate && targetSection
      ? fmt(ui.map.summaryRoute, { from: originGate.id, to: targetSection.id })
      : ui.map.summaryIdle;

  return (
    <Panel
      eyebrow={ui.nav.map}
      heading={ui.map.heading}
      className="overflow-hidden"
      action={
        <div className="hidden gap-3 sm:flex">
          <LegendDot color="var(--color-accent)" label={ui.map.legendGate} />
          <LegendDot color="var(--color-pitch)" label={ui.map.legendSeat} />
          <LegendDot color="var(--color-accent)" label={ui.map.legendRoute} />
        </div>
      }
    >
      <div className="relative overflow-hidden rounded-lg bg-[color-mix(in_oklab,var(--color-bg)_70%,transparent)]">
        <svg
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          className="w-full"
          role="img"
          aria-label={summary}
        >
          <defs>
            <radialGradient id="pitch-grad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" style={{ stopColor: 'var(--color-pitch)', stopOpacity: 0.32 }} />
              <stop offset="100%" style={{ stopColor: 'var(--color-pitch)', stopOpacity: 0.1 }} />
            </radialGradient>
          </defs>

          {/* stand rings */}
          {geo.rings.map((ring) => (
            <ellipse
              key={ring.level}
              cx={geo.center.x}
              cy={geo.center.y}
              rx={ring.rx}
              ry={ring.ry}
              strokeWidth={0.6}
              style={{
                fill: 'none',
                stroke: 'color-mix(in oklab, var(--color-border-strong) 60%, transparent)',
              }}
            />
          ))}

          {/* pitch */}
          <g>
            <rect
              x={geo.center.x - 46}
              y={geo.center.y - 28}
              width={92}
              height={56}
              rx={5}
              strokeWidth={0.8}
              style={{ fill: 'url(#pitch-grad)', stroke: PITCH_LINE }}
            />
            <line
              x1={geo.center.x}
              y1={geo.center.y - 28}
              x2={geo.center.x}
              y2={geo.center.y + 28}
              strokeWidth={0.6}
              style={{ stroke: PITCH_LINE }}
            />
            <circle
              cx={geo.center.x}
              cy={geo.center.y}
              r={9}
              strokeWidth={0.6}
              style={{ fill: 'none', stroke: PITCH_LINE }}
            />
          </g>

          {/* sections — colored by live crowd density */}
          {geo.sections.map((s) => {
            const level = densityLevel(density[s.id] ?? 0.4);
            const isTarget = s.id === focus.targetSectionId;
            const isAmenity = focus.amenitySectionIds.includes(s.id);
            return (
              <motion.circle
                key={s.id}
                cx={s.point.x}
                cy={s.point.y}
                r={isTarget ? 4.6 : 3.2}
                strokeWidth={isAmenity ? 1.4 : 0}
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  isTarget ? { scale: [1, 1.25, 1], opacity: 1 } : { scale: 1, opacity: 0.9 }
                }
                transition={
                  isTarget
                    ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.4 }
                }
                style={{
                  fill: isTarget ? 'var(--color-accent)' : DENSITY_COLOR[level],
                  stroke: isAmenity ? 'var(--color-accent)' : 'transparent',
                  transformOrigin: `${s.point.x}px ${s.point.y}px`,
                  cursor: onAsk ? 'pointer' : 'default',
                }}
                onClick={onAsk ? () => onAsk(fmt(ui.map.askSection, { id: s.id })) : undefined}
              />
            );
          })}

          {/* wayfinding route */}
          {routeLine ? (
            <motion.polyline
              points={routeLine}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fill: 'none', stroke: 'var(--color-accent)' }}
            />
          ) : null}

          {/* gates */}
          {geo.gates.map((g) => {
            const isOrigin = g.id === focus.originGateId;
            const isTransport = focus.transportGateIds.includes(g.id);
            return (
              <g
                key={g.id}
                style={{ cursor: onAsk ? 'pointer' : 'default' }}
                onClick={onAsk ? () => onAsk(fmt(ui.map.askGate, { id: g.id })) : undefined}
              >
                <rect
                  x={g.point.x - 4}
                  y={g.point.y - 4}
                  width={8}
                  height={8}
                  rx={2}
                  strokeWidth={1}
                  style={{
                    fill: isOrigin ? 'var(--color-accent)' : 'var(--color-surface-2)',
                    stroke:
                      isOrigin || isTransport
                        ? 'var(--color-accent)'
                        : 'var(--color-border-strong)',
                  }}
                />
                <text
                  x={g.point.x}
                  y={g.point.y - 6}
                  textAnchor="middle"
                  fontSize={6}
                  className="tabular"
                  style={{ fill: 'var(--color-text-muted)' }}
                >
                  {g.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{summary}</p>
    </Panel>
  );
}
