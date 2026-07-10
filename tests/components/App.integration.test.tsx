import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { markOnboarded } from '../helpers/render';
import { mockChatResponse } from '../helpers/sse';
import { UI } from '../../src/i18n/ui';

beforeEach(() => {
  localStorage.clear();
  markOnboarded();
});
afterEach(() => vi.unstubAllGlobals());

describe('App integration', () => {
  it('renders the scoreboard and switches surfaces via the nav', async () => {
    render(<App />);
    // Signature scoreboard is present on load.
    expect(screen.getByText('BRA')).toBeInTheDocument();
    expect(screen.getByText('ARG')).toBeInTheDocument();

    // Switch to the Map surface (nav appears in both the top bar and bottom nav).
    const [mapNav] = screen.getAllByRole('button', { name: UI.en.nav.map });
    await userEvent.click(mapNav!);
    expect(await screen.findByText(UI.en.map.heading)).toBeInTheDocument();
  });

  it('sends a quick action from home and streams an answer with a card into chat', async () => {
    const fetchMock = vi.fn(async () =>
      mockChatResponse([
        { type: 'token', value: 'Your seat is in section 114.' },
        {
          type: 'tool_result',
          tool: 'planRoute',
          card: { type: 'route', title: 'Route to 114', steps: ['Enter Gate C'] },
        },
        { type: 'done' },
      ]),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);
    const [seatChip] = screen.getAllByRole('button', { name: UI.en.quickActions.seat.label });
    await userEvent.click(seatChip!);

    // The answer streams into the chat surface.
    expect(await screen.findByText('Your seat is in section 114.')).toBeInTheDocument();
    expect(await screen.findByText('Route to 114')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({ method: 'POST' }));
  });
});
