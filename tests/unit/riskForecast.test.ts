import { describe, it, expect } from 'vitest';
import { forecastGateRisk } from '../../src/features/ops/riskForecast';
import { venue } from '../../src/features/venue/venue-data';

const MIN = 60_000;

describe('forecastGateRisk', () => {
  it('returns one forecast per gate with a valid trend and level', () => {
    const forecasts = forecastGateRisk(venue, 30 * MIN);
    expect(forecasts).toHaveLength(venue.gates.length);
    for (const f of forecasts) {
      expect(['rising', 'falling', 'steady']).toContain(f.trend);
      expect(['ok', 'busy', 'jam']).toContain(f.currentLevel);
      expect(['ok', 'busy', 'jam']).toContain(f.projectedLevel);
      expect(f.projectedQueueMinutes).toBeGreaterThanOrEqual(0);
      expect(f.series.length).toBeGreaterThan(0);
    }
  });

  it('is deterministic for a given now', () => {
    expect(forecastGateRisk(venue, 42 * MIN)).toEqual(forecastGateRisk(venue, 42 * MIN));
  });

  it('projects further ahead as the horizon grows, in the direction of the trend', () => {
    const shortHorizon = forecastGateRisk(venue, 30 * MIN, 5);
    const longHorizon = forecastGateRisk(venue, 30 * MIN, 30);
    for (let i = 0; i < shortHorizon.length; i++) {
      const short = shortHorizon[i]!;
      const long = longHorizon[i]!;
      if (short.trend === 'rising') {
        expect(long.projectedQueueMinutes).toBeGreaterThanOrEqual(short.projectedQueueMinutes);
      } else if (short.trend === 'falling') {
        expect(long.projectedQueueMinutes).toBeLessThanOrEqual(short.projectedQueueMinutes);
      }
    }
  });
});
