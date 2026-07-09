import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardHome } from '../../src/components/dashboard/DashboardHome';
import { ANALYTICS, UI } from '../../src/i18n/ui';
import { venue } from '../../src/features/venue/venue-data';
import { renderWithProviders } from '../helpers/render';

const MIN = 60_000;

describe('DashboardHome', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Date, 'now').mockReturnValue(30 * MIN);
  });
  afterEach(() => vi.restoreAllMocks());

  it('composes the hero with venue identity and primary actions', () => {
    renderWithProviders(<DashboardHome onOpenItinerary={vi.fn()} />);

    expect(screen.getByRole('heading', { name: UI.en.dashboard.heading })).toBeInTheDocument();
    expect(screen.getByText(venue.city)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(UI.en.quickActions.seat.label) })).toBeEnabled();
  });

  it('mounts every bento tile: risk, suggested, itinerary preview, analytics, standings and map', () => {
    renderWithProviders(<DashboardHome onOpenItinerary={vi.fn()} />);

    expect(screen.getByText(UI.en.risk.heading)).toBeInTheDocument();
    expect(screen.getByText(UI.en.dashboard.suggestedHeading)).toBeInTheDocument();
    expect(screen.getByText(ANALYTICS.en.heading)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Group/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: UI.en.map.heading })).toBeInTheDocument();
  });

  it('routes "see all" to the itinerary surface', async () => {
    const onOpenItinerary = vi.fn();
    renderWithProviders(<DashboardHome onOpenItinerary={onOpenItinerary} />);

    const seeAllButtons = screen.getAllByRole('button', { name: new RegExp(UI.en.dashboard.seeAll) });
    await userEvent.click(seeAllButtons[0] as HTMLElement);
    expect(onOpenItinerary).toHaveBeenCalled();
  });
});
