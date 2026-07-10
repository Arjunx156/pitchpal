import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItineraryPanel } from '../../src/components/itinerary/ItineraryPanel';
import { renderWithProviders } from '../helpers/render';

beforeEach(() => localStorage.clear());

describe('ItineraryPanel', () => {
  it('renders the deterministic match-day timeline', () => {
    renderWithProviders(<ItineraryPanel />);
    expect(screen.getByText('Kickoff')).toBeInTheDocument();
    expect(screen.getByText('Half-time')).toBeInTheDocument();
  });

  it('lets a fan add and remove a custom step', async () => {
    renderWithProviders(<ItineraryPanel />);
    const input = screen.getByPlaceholderText(/add a step/i);
    await userEvent.type(input, 'Meet friends at fountain');
    await userEvent.click(screen.getByRole('button', { name: /add step/i }));

    expect(screen.getByText('Meet friends at fountain')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /remove step/i }));
    // AnimatePresence keeps the row mounted during its exit animation.
    await waitForElementToBeRemoved(() => screen.queryByText('Meet friends at fountain'));
  });
});
