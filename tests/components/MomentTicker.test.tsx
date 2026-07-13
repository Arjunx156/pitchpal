import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MomentTicker } from '../../src/components/scoreboard/MomentTicker';
import { renderWithProviders } from '../helpers/render';
import { MOMENT_LABELS } from '../../src/i18n/answers';
import { UI } from '../../src/i18n/ui';

/** Same virtual-cycle pinning as the Scoreboard phase tests. */
const CYCLE_MS = 140 * 60_000;
function timeAtCyclePosition(minutes: number): number {
  const nowCycles = Math.floor(1_800_000_000_000 / CYCLE_MS);
  return nowCycles * CYCLE_MS + minutes * 60_000;
}

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

describe('MomentTicker', () => {
  it('scrolls localized match moments during play, with an sr-only summary', () => {
    vi.setSystemTime(timeAtCyclePosition(70)); // 30' into the match
    renderWithProviders(<MomentTicker />);

    expect(screen.getByRole('region', { name: UI.en.ops.heading })).toBeInTheDocument();
    // Kickoff (minute 0) is always part of the feed once live.
    expect(screen.getAllByText(new RegExp(MOMENT_LABELS.en.kickoff)).length).toBeGreaterThan(0);
  });

  it('carries live gate queues before kickoff so the strip is never empty', () => {
    vi.setSystemTime(timeAtCyclePosition(10)); // pre-match window
    renderWithProviders(<MomentTicker />);

    expect(screen.getAllByText(new RegExp(`${UI.en.ops.gate} `)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/min/).length).toBeGreaterThan(0);
  });
});
