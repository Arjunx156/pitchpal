import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextUp } from '../../src/components/dashboard/NextUp';
import { renderWithProviders } from '../helpers/render';

describe('NextUp', () => {
  it('renders upcoming itinerary steps with times', () => {
    renderWithProviders(<NextUp onOpenItinerary={vi.fn()} />);
    expect(screen.getByText('Next up')).toBeInTheDocument();
    // At least one step time is rendered (HH:MM).
    expect(screen.getAllByText(/\d{1,2}:\d{2}/).length).toBeGreaterThan(0);
  });

  it('invokes onOpenItinerary from the "see full itinerary" control', async () => {
    const onOpenItinerary = vi.fn();
    renderWithProviders(<NextUp onOpenItinerary={onOpenItinerary} />);
    await userEvent.click(screen.getByRole('button', { name: /full itinerary/i }));
    expect(onOpenItinerary).toHaveBeenCalledOnce();
  });
});
