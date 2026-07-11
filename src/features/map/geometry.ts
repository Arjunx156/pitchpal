import type { Side, Venue } from '../venue/types';

/**
 * Pure geometry for the stadium map. Positions are derived from each element's
 * `side` (angle around an elliptical bowl) and `level` (ring radius) — no
 * hand-placed coordinates — so the map stays in sync with the venue data and is
 * fully unit-testable.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Ring {
  level: 'lower' | 'club' | 'upper';
  rx: number;
  ry: number;
}

export interface PlacedGate {
  id: string;
  point: Point;
  angleDeg: number;
  side: Side;
}

export interface PlacedSection {
  id: string;
  point: Point;
  angleDeg: number;
  side: Side;
  level: 'lower' | 'club' | 'upper';
}

export interface MapGeometry {
  width: number;
  height: number;
  center: Point;
  rx: number;
  ry: number;
  rings: Ring[];
  gates: PlacedGate[];
  sections: PlacedSection[];
}

export const VIEW = { width: 440, height: 320, cx: 220, cy: 160, rx: 182, ry: 120 };

const SIDE_ANGLE: Record<Side, number> = { east: 0, south: 90, west: 180, north: 270 };
const LEVEL_FRACTION: Record<'lower' | 'club' | 'upper', number> = {
  lower: 0.5,
  club: 0.72,
  upper: 0.92,
};
const GATE_FRACTION = 1.08;
const SPREAD_DEG = 26;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function pointOnEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleDeg: number,
): Point {
  return { x: cx + rx * Math.cos(toRad(angleDeg)), y: cy + ry * Math.sin(toRad(angleDeg)) };
}

/** Spread multiple items sharing a side across a small angular fan. */
function spreadAngles(baseAngle: number, count: number): number[] {
  if (count <= 1) return [baseAngle];
  const step = SPREAD_DEG / (count - 1);
  const start = baseAngle - SPREAD_DEG / 2;
  return Array.from({ length: count }, (_, i) => start + i * step);
}

export function buildMapGeometry(venue: Venue): MapGeometry {
  const { cx, cy, rx, ry } = VIEW;

  const rings: Ring[] = (['upper', 'club', 'lower'] as const).map((level) => ({
    level,
    rx: rx * LEVEL_FRACTION[level],
    ry: ry * LEVEL_FRACTION[level],
  }));

  // Sections: group by side, fan them out, place on their level ring.
  const sections: PlacedSection[] = [];
  const bySide = new Map<Side, typeof venue.sections>();
  for (const s of venue.sections) {
    const arr = bySide.get(s.side) ?? [];
    arr.push(s);
    bySide.set(s.side, arr);
  }
  for (const [side, group] of bySide) {
    const angles = spreadAngles(SIDE_ANGLE[side], group.length);
    group.forEach((s, i) => {
      const angleDeg = angles[i] ?? SIDE_ANGLE[side];
      const f = LEVEL_FRACTION[s.level];
      sections.push({
        id: s.id,
        side,
        level: s.level,
        angleDeg,
        point: pointOnEllipse(cx, cy, rx * f, ry * f, angleDeg),
      });
    });
  }

  const gates: PlacedGate[] = venue.gates.map((g) => {
    const angleDeg = SIDE_ANGLE[g.side];
    return {
      id: g.id,
      side: g.side,
      angleDeg,
      point: pointOnEllipse(cx, cy, rx * GATE_FRACTION, ry * GATE_FRACTION, angleDeg),
    };
  });

  return {
    width: VIEW.width,
    height: VIEW.height,
    center: { x: cx, y: cy },
    rx,
    ry,
    rings,
    gates,
    sections,
  };
}

/** Normalize an angle delta into [-180, 180] for shortest-arc walking. */
function shortestDelta(from: number, to: number): number {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * A walking route from a gate to a section: in to the concourse ring, around it
 * the short way, then inward to the seat. Returns an SVG polyline of points.
 */
export function routePath(geo: MapGeometry, fromGateId: string, toSectionId: string): Point[] {
  const gate = geo.gates.find((g) => g.id === fromGateId);
  const section = geo.sections.find((s) => s.id === toSectionId);
  if (!gate || !section) return [];

  const { cx, cy } = { cx: geo.center.x, cy: geo.center.y };
  const concourseRx = geo.rx * LEVEL_FRACTION.upper;
  const concourseRy = geo.ry * LEVEL_FRACTION.upper;

  const points: Point[] = [gate.point];
  points.push(pointOnEllipse(cx, cy, concourseRx, concourseRy, gate.angleDeg));

  const delta = shortestDelta(gate.angleDeg, section.angleDeg);
  const steps = Math.max(1, Math.round(Math.abs(delta) / 15));
  for (let i = 1; i <= steps; i++) {
    const a = gate.angleDeg + (delta * i) / steps;
    points.push(pointOnEllipse(cx, cy, concourseRx, concourseRy, a));
  }

  points.push(section.point);
  return points;
}
