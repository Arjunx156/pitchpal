import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Scoreboard } from '../../src/components/scoreboard/Scoreboard';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

/**
 * The ops simulation is a pure function of Date.now() over a 140-minute cycle:
 * 0–40 min pre-match, 40–135 live, 135–140 post. Pinning the system time to a
 * position in the cycle makes each phase's scoreboard state deterministic.
 */
const CYCLE_MS = 140 * 60_000;

function timeAtCyclePosition(minutes: number): number {
  const nowCycles = Math.floor(1_800_000_000_000 / CYCLE_MS); // stable anchor epoch
  return nowCycles * CYCLE_MS + minutes * 60_000;
}

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

describe('Scoreboard phases', () => {
  it('shows the kickoff countdown before the match', () => {
    vi.setSystemTime(timeAtCyclePosition(10)); // pre-match window
    renderWithProviders(<Scoreboard />);
    expect(screen.getByText(new RegExp(UI.en.ops.preMatch))).toBeInTheDocument();
  });

  it('shows the live chip with the match clock during play', () => {
    vi.setSystemTime(timeAtCyclePosition(70)); // 30' into the match
    renderWithProviders(<Scoreboard />);
    expect(screen.getByText(new RegExp(`${UI.en.ops.live}`))).toBeInTheDocument();
  });

  it('shows full time after the match', () => {
    vi.setSystemTime(timeAtCyclePosition(137)); // post-match window
    renderWithProviders(<Scoreboard />);
    expect(screen.getByText(UI.en.ops.postMatch)).toBeInTheDocument();
  });
});
