import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestedActions } from '../../src/components/dashboard/SuggestedActions';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

const CYCLE_MS = 140 * 60_000;

/** Epoch pinned to a given minute inside the 140-minute virtual ops cycle. */
function timeAtCyclePosition(minutes: number): number {
  return Math.floor(1_800_000_000_000 / CYCLE_MS) * CYCLE_MS + minutes * 60_000;
}

afterEach(() => vi.useRealTimers());

describe('SuggestedActions', () => {
  it('always shows at least one actionable suggestion (evergreen fallback)', async () => {
    const onAsk = vi.fn();
    renderWithProviders(<SuggestedActions onAsk={onAsk} />);
    expect(screen.getByText('Suggested for you')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    await userEvent.click(buttons[0]!);
    expect(onAsk).toHaveBeenCalledOnce();
  });

  it('surfaces the live kickoff-soon suggestion in the pre-kickoff window', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(timeAtCyclePosition(25)); // 15 min to kickoff (kickoff at 40')
    renderWithProviders(<SuggestedActions onAsk={vi.fn()} />);
    expect(screen.getByText(UI.en.suggestions.kickoffSoonReason)).toBeInTheDocument();
  });

  it('surfaces the post-match exit suggestion after full time', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(timeAtCyclePosition(137)); // post-match window
    renderWithProviders(<SuggestedActions onAsk={vi.fn()} />);
    expect(screen.getByText(UI.en.suggestions.postMatchReason)).toBeInTheDocument();
  });
});
