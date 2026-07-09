import type { Venue } from '../venue/types';
import { gateQueueSeries, queueRiskLevel, type CongestionLevel } from './opsFeed';

export type RiskTrend = 'rising' | 'falling' | 'steady';

export interface GateRiskForecast {
  gateId: string;
  currentQueueMinutes: number;
  projectedQueueMinutes: number;
  currentLevel: CongestionLevel;
  projectedLevel: CongestionLevel;
  trend: RiskTrend;
  series: number[];
}

const SAMPLE_POINTS = 6;
const SAMPLE_STEP_MIN = 5;
const TREND_DEADBAND_MIN = 1.5;

/** Forecasts per-gate queue risk `horizonMin` minutes ahead from recent history. */
export function forecastGateRisk(venue: Venue, now: number, horizonMin = 15): GateRiskForecast[] {
  return venue.gates.map((gate) => {
    const series = gateQueueSeries(venue, gate.id, now, SAMPLE_POINTS, SAMPLE_STEP_MIN);
    const first = series[0] ?? 0;
    const last = series[series.length - 1] ?? 0;
    const historyMin = (SAMPLE_POINTS - 1) * SAMPLE_STEP_MIN;
    const perMinuteDelta = historyMin > 0 ? (last - first) / historyMin : 0;
    const projectedQueueMinutes = Math.max(0, Math.round(last + perMinuteDelta * horizonMin));

    const delta = last - first;
    const trend: RiskTrend =
      delta > TREND_DEADBAND_MIN ? 'rising' : delta < -TREND_DEADBAND_MIN ? 'falling' : 'steady';

    return {
      gateId: gate.id,
      currentQueueMinutes: last,
      projectedQueueMinutes,
      currentLevel: queueRiskLevel(last),
      projectedLevel: queueRiskLevel(projectedQueueMinutes),
      trend,
      series,
    };
  });
}
