import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItineraryPanel } from '../../src/components/itinerary/ItineraryPanel';
import { renderWithProviders } from '../helpers/render';

beforeEach(() => localStorage.clear());

describe('ItineraryPanel', () => {
  it('renders the deterministic match-day timeline with localized labels', () => {
    renderWithProviders(<ItineraryPanel />);
    expect(screen.getByText('Kickoff')).toBeInTheDocument();
    expect(screen.getByText(/half-time/i)).toBeInTheDocument();
    // Gate step resolves its {id} param, e.g. "Head to Gate A".
    expect(screen.getByText(/head to gate/i)).toBeInTheDocument();
  });

  it('lets a fan add and remove a custom step', async () => {
    renderWithProviders(<ItineraryPanel />);
    const input = screen.getByPlaceholderText(/add a step/i);
    await userEvent.type(input, 'Meet friends at fountain');
    await userEvent.click(screen.getByRole('button', { name: /add a step/i }));

    expect(screen.getByText('Meet friends at fountain')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /remove step/i }));
    // AnimatePresence keeps the row mounted during its exit animation; poll until
    // it unmounts. (waitFor is deterministic whether the exit already finished or
    // is still in flight, unlike waitForElementToBeRemoved which throws if it's
    // already gone.)
    await waitFor(() =>
      expect(screen.queryByText('Meet friends at fountain')).not.toBeInTheDocument(),
    );
  });
});
