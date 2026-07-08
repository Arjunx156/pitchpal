import { useMemo, useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { buildMapGeometry, routePath, VIEW } from '../../features/map/geometry';
import { useMapFocus } from '../../features/map/useMapFocus';
import { getOpsSnapshot, gateStatus, sectionDensity, densityLevel } from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChatContext } from '../../features/chat/ChatProvider';
import { fmt } from '../../i18n/answers';
import { ANALYTICS } from '../../i18n/ui';
import { panelItem } from '../../lib/motion';

function onActivate(handler: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };
}

export function StadiumMap() {
  const { ui, context, venue } = useFanContext();
  const { send, isStreaming } = useChatContext();
  const focus = useMapFocus();
  const geo = useMemo(() => buildMapGeometry(venue), [venue]);
  const ops = useMemo(() => getOpsSnapshot(venue), [venue, focus]);
  const [showHeat, setShowHeat] = useState(true);
  const density = useMemo(() => sectionDensity(venue), [venue, focus]);
  const a = ANALYTICS[context.language];

  const route = useMemo(
    () =>
      focus.originGateId && focus.targetSectionId
        ? routePath(geo, focus.originGateId, focus.targetSectionId)
        : [],
    [geo, focus.originGateId, focus.targetSectionId],
  );
  const routePoints = route.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const originGate = venue.gates.find((g) => g.id === focus.originGateId);
  const target = venue.sections.find((s) => s.id === focus.targetSectionId);
  const summary = target
    ? fmt(ui.map.summaryRoute, { from: originGate?.name ?? focus.originGateId ?? '', to: target.id })
    : ui.map.summaryIdle;

  const ask = (query: string) => {
    if (!isStreaming) void send(query);
  };

  return (
    <motion.section className="map" aria-labelledby="map-heading" variants={panelItem}>
      <div className="map__head">
        <h2 id="map-heading" className="map__heading">
          {ui.map.heading}
        </h2>
        <button
          type="button"
          className="map__toggle"
          aria-pressed={showHeat}
          onClick={() => setShowHeat((v) => !v)}
        >
          <Flame size={14} aria-hidden="true" />
          {a.heatmap}
        </button>
      </div>

      <div role="status" aria-live="polite" className="visually-hidden">
        {summary}
      </div>

      <div className="map__frame">
        <svg
          className="map__svg"
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          role="group"
          aria-label={ui.map.heading}
        >
          {/* Bowl rings */}
          {geo.rings.map((ring) => (
            <ellipse
              key={ring.level}
              className="map-ring"
              cx={geo.center.x}
              cy={geo.center.y}
              rx={ring.rx}
              ry={ring.ry}
            />
          ))}
          {/* Pitch */}
          <ellipse
            className="map-pitch"
            cx={geo.center.x}
            cy={geo.center.y}
            rx={geo.rx * 0.3}
            ry={geo.ry * 0.3}
          />
          <line
            className="map-pitch-line"
            x1={geo.center.x}
            y1={geo.center.y - geo.ry * 0.3}
            x2={geo.center.x}
            y2={geo.center.y + geo.ry * 0.3}
          />

          {/* Route — draws itself in whenever a new route is highlighted */}
          {routePoints ? (
            <motion.polyline
              key={routePoints}
              className="map-route"
              points={routePoints}
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          ) : null}

          {/* Sections */}
          {geo.sections.map((s) => {
            const isTarget = s.id === focus.targetSectionId;
            const isAmenity = focus.amenitySectionIds.includes(s.id);
            const heat = showHeat ? ` heat-${densityLevel(density[s.id] ?? 0)}` : '';
            const cls = `map-seat${heat}${isTarget ? ' is-target' : ''}${isAmenity ? ' is-amenity' : ''}`;
            const query = fmt(ui.map.askSection, { id: s.id });
            return (
              <g
                key={s.id}
                className={cls}
                role="button"
                tabIndex={0}
                aria-label={query}
                onClick={() => ask(query)}
                onKeyDown={onActivate(() => ask(query))}
              >
                <title>{query}</title>
                {isTarget ? (
                  <motion.circle
                    className="map-seat__pulse"
                    cx={s.point.x}
                    cy={s.point.y}
                    r={14}
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: [0.7, 0.15, 0.7] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                ) : null}
                <circle cx={s.point.x} cy={s.point.y} r={isTarget ? 9 : 6} />
                <text x={s.point.x} y={s.point.y + 3} className="map-seat__label">
                  {s.id}
                </text>
              </g>
            );
          })}

          {/* Gates */}
          {geo.gates.map((g) => {
            const status = gateStatus(ops, g.id);
            const level = status?.level ?? 'ok';
            const isOrigin = g.id === focus.originGateId;
            const gate = venue.gates.find((v) => v.id === g.id);
            const label = `${ui.ops.gate} ${g.id}${status ? ` · ${ui.ops.queue.replace('{min}', String(status.queueMinutes))}` : ''}`;
            const query = fmt(ui.map.askGate, { id: g.id });
            return (
              <g
                key={g.id}
                className={`map-gate is-${level}${isOrigin ? ' is-origin' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`${label}${gate ? `, ${gate.name}` : ''}`}
                onClick={() => ask(query)}
                onKeyDown={onActivate(() => ask(query))}
              >
                <title>{`${label}${gate ? `, ${gate.name}` : ''}`}</title>
                <circle cx={g.point.x} cy={g.point.y} r={11} />
                <text x={g.point.x} y={g.point.y + 4} className="map-gate__label">
                  {g.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="map__legend" aria-hidden="true">
        <li>
          <span className="dot dot--gate" /> {ui.map.legendGate}
        </li>
        <li>
          <span className="dot dot--seat" /> {ui.map.legendSeat}
        </li>
        <li>
          <span className="dot dot--amenity" /> {ui.map.legendAmenity}
        </li>
        <li>
          <span className="dot dot--route" /> {ui.map.legendRoute}
        </li>
      </ul>
      <p className="map__hint">{context.location ? summary : ui.map.summaryIdle}</p>
    </motion.section>
  );
}
