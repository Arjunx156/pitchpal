import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardHome } from '../../src/components/dashboard/DashboardHome';
import { renderWithProviders } from '../helpers/render';

describe('DashboardHome', () => {
  it('renders the match-day rundown panels', () => {
    renderWithProviders(<DashboardHome onAsk={vi.fn()} onOpenItinerary={vi.fn()} />);
    expect(screen.getByText('Gate risk')).toBeInTheDocument();
    expect(screen.getByText('Quick help')).toBeInTheDocument();
    expect(screen.getByText('Next up')).toBeInTheDocument();
  });

  it('sends a query when a quick-action chip is pressed', async () => {
    const onAsk = vi.fn();
    renderWithProviders(<DashboardHome onAsk={onAsk} onOpenItinerary={vi.fn()} />);
    // "Live score" is unique to the Quick help grid (not in the suggestions list).
    await userEvent.click(screen.getByRole('button', { name: /live score/i }));
    expect(onAsk).toHaveBeenCalledTimes(1);
    expect(onAsk.mock.calls[0]?.[0]).toBeTruthy();
  });

  it('opens the itinerary from the Next up shortcut', async () => {
    const onOpenItinerary = vi.fn();
    renderWithProviders(<DashboardHome onAsk={vi.fn()} onOpenItinerary={onOpenItinerary} />);
    await userEvent.click(screen.getByRole('button', { name: /full itinerary/i }));
    expect(onOpenItinerary).toHaveBeenCalledOnce();
  });
});
