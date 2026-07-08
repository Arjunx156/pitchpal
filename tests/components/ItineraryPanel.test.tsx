import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { ItineraryPanel } from '../../src/components/itinerary/ItineraryPanel';
import { ITINERARY } from '../../src/i18n/ui';
import { renderWithProviders } from '../helpers/render';

const MIN = 60_000;

describe('ItineraryPanel — live progress', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('marks past steps done and highlights the current one during the match', () => {
    // 60' into the cycle → live, kickoff was 20 min ago.
    vi.spyOn(Date, 'now').mockReturnValue(60 * MIN);
    renderWithProviders(<ItineraryPanel />);

    const items = screen.getAllByRole('listitem');
    const done = items.filter((li) => li.className.includes('is-done'));
    const current = items.filter((li) => li.className.includes('is-current'));

    // arrive/gate/seat/kickoff are in the past; kickoff is the current step.
    expect(done.length).toBeGreaterThanOrEqual(4);
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent(ITINERARY.en.kickoff);
  });

  it('keeps future steps unchecked before kickoff', () => {
    // 5' into the cycle → pre-match; kickoff/half-time/leave are still ahead.
    vi.spyOn(Date, 'now').mockReturnValue(5 * MIN);
    renderWithProviders(<ItineraryPanel />);

    const items = screen.getAllByRole('listitem');
    const kickoffItem = items.find((li) => li.textContent?.includes(ITINERARY.en.kickoff));
    const halftimeItem = items.find((li) => li.textContent?.includes(ITINERARY.en.halftime));
    expect(kickoffItem?.className).not.toContain('is-done');
    expect(halftimeItem?.className).not.toContain('is-done');
    expect(items.filter((li) => li.className.includes('is-current'))).toHaveLength(1);
  });
});
