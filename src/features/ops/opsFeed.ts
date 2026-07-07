import type { Venue } from '../venue/types';

/**
 * Deterministic match-day operations simulation. Pure functions of `now`, so
 * the same snapshot can be produced on the client (for the HUD) and the server
 * (to ground the assistant), and everything is unit-testable.
 *
 * A virtual 140-minute match cycle keeps the demo lively whenever it is opened:
 *   0–40 min   → pre-match (kickoff countdown)
 *   40–135 min → live (match clock 0–90')
 *   135–140    → post-match (exodus)
 */

export type CongestionLevel = 'ok' | 'busy' | 'jam';
export type MatchPhase = 'pre' | 'live' | 'post';
export type Weather = 'clear' | 'cloudy' | 'rain';

export interface GateStatus {
  gateId: string;
  stepFree: boolean;
  occupancy: number; // 0..1
  queueMinutes: number;
  level: CongestionLevel;
}

export interface OpsSnapshot {
  now: number;
  kickoffAt: number;
  minutesToKickoff: number; // negative once in play
  phase: MatchPhase;
  matchClock: number | null; // minutes played when live
  weather: Weather;
  temperatureC: number;
  gates: GateStatus[];
}

const CYCLE_MIN = 140;
const KICKOFF_MIN = 40;
const LIVE_END_MIN = 135;
const MS = 60_000;
const MAX_QUEUE_MIN = 22;
const WEATHERS: Weather[] = ['clear', 'cloudy', 'rain'];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function congestionLevel(occupancy: number): CongestionLevel {
  if (occupancy < 0.5) return 'ok';
  if (occupancy < 0.8) return 'busy';
  return 'jam';
}

/** Position within the current virtual cycle, in minutes [0, 140). */
function cyclePositionMin(now: number): number {
  const cycleMs = CYCLE_MIN * MS;
  const t = ((now % cycleMs) + cycleMs) % cycleMs;
  return t / MS;
}

function gateOccupancy(
  gateId: string,
  now: number,
  minutesToKickoff: number,
  phase: MatchPhase,
): number {
  let base: number;
  if (phase === 'pre') base = clamp(0.95 - minutesToKickoff / 55, 0.25, 0.96);
  else if (phase === 'live') base = 0.28;
  else base = 0.72;

  const seed = gateId.charCodeAt(0);
  const wobble = 0.1 * Math.sin(now / (7 * MS) + seed);
  const gateBias = (((seed % 4) - 1.5) / 1.5) * 0.08;
  return clamp(base + wobble + gateBias, 0.05, 0.99);
}

export function getOpsSnapshot(venue: Venue, now: number = Date.now()): OpsSnapshot {
  const pos = cyclePositionMin(now);
  const kickoffAt = now - pos * MS + KICKOFF_MIN * MS;
  const minutesToKickoff = Math.round((kickoffAt - now) / MS);

  let phase: MatchPhase;
  let matchClock: number | null = null;
  if (pos < KICKOFF_MIN) {
    phase = 'pre';
  } else if (pos < LIVE_END_MIN) {
    phase = 'live';
    matchClock = Math.min(90, Math.floor(pos - KICKOFF_MIN));
  } else {
    phase = 'post';
  }

  const cycleIndex = Math.floor(now / (CYCLE_MIN * MS));
  const weather = WEATHERS[((cycleIndex % WEATHERS.length) + WEATHERS.length) % WEATHERS.length] ?? 'clear';
  const temperatureC = 21 + (cycleIndex % 6);

  const gates: GateStatus[] = venue.gates.map((gate) => {
    const occupancy = gateOccupancy(gate.id, now, minutesToKickoff, phase);
    return {
      gateId: gate.id,
      stepFree: gate.stepFree,
      occupancy,
      queueMinutes: Math.round(occupancy * MAX_QUEUE_MIN),
      level: congestionLevel(occupancy),
    };
  });

  return { now, kickoffAt, minutesToKickoff, phase, matchClock, weather, temperatureC, gates };
}

export function gateStatus(snapshot: OpsSnapshot, gateId: string): GateStatus | undefined {
  return snapshot.gates.find((g) => g.gateId === gateId);
}

/** The least-congested step-free gate — used to reroute fans around jams. */
export function quietestAccessibleGate(snapshot: OpsSnapshot): GateStatus | undefined {
  return snapshot.gates
    .filter((g) => g.stepFree)
    .reduce<GateStatus | undefined>(
      (best, g) => (!best || g.occupancy < best.occupancy ? g : best),
      undefined,
    );
}

export type DensityLevel = 'low' | 'medium' | 'high';

export function densityLevel(value: number): DensityLevel {
  if (value < 0.45) return 'low';
  if (value < 0.75) return 'medium';
  return 'high';
}

/** Crowd density (0..1) per seating section, derived from nearby gate load. */
export function sectionDensity(venue: Venue, now: number = Date.now()): Record<string, number> {
  const snapshot = getOpsSnapshot(venue, now);
  const byGate = new Map(snapshot.gates.map((g) => [g.gateId, g.occupancy]));
  const out: Record<string, number> = {};
  for (const section of venue.sections) {
    const base = byGate.get(section.nearestGate) ?? 0.4;
    const wobble = 0.12 * Math.sin(now / (5 * MS) + section.id.charCodeAt(2));
    out[section.id] = clamp(base * 0.8 + 0.12 + wobble, 0.05, 0.98);
  }
  return out;
}

/** Average stadium occupancy % over the last `points` intervals (for a trend chart). */
export function crowdSeries(venue: Venue, now: number, points = 12, stepMin = 5): number[] {
  const series: number[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const snapshot = getOpsSnapshot(venue, now - i * stepMin * MS);
    const avg = snapshot.gates.reduce((a, g) => a + g.occupancy, 0) / snapshot.gates.length;
    series.push(Math.round(avg * 100));
  }
  return series;
}

/** Queue-minute history for one gate over the last `points` intervals (sparkline). */
export function gateQueueSeries(
  venue: Venue,
  gateId: string,
  now: number,
  points = 12,
  stepMin = 5,
): number[] {
  const series: number[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const g = gateStatus(getOpsSnapshot(venue, now - i * stepMin * MS), gateId);
    series.push(g?.queueMinutes ?? 0);
  }
  return series;
}

/** The busiest gate right now — used to headline the analytics strip. */
export function busiestGate(snapshot: OpsSnapshot): GateStatus | undefined {
  return snapshot.gates.reduce<GateStatus | undefined>(
    (worst, g) => (!worst || g.occupancy > worst.occupancy ? g : worst),
    undefined,
  );
}
