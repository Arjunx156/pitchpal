import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWindow } from '../../src/components/chat/ChatWindow';
import { UI } from '../../src/i18n/ui';
import { renderWithProviders } from '../helpers/render';

function sseResponse(events: object[], mode = 'mock'): unknown {
  const payload = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
  const encoder = new TextEncoder();
  let sent = false;
  return {
    ok: true,
    headers: { get: (k: string) => (k === 'X-Pitchpal-Mode' ? mode : null) },
    body: {
      getReader: () => ({
        read: async () =>
          sent ? { done: true, value: undefined } : ((sent = true), { done: false, value: encoder.encode(payload) }),
      }),
    },
  };
}

describe('ChatWindow', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('shows the welcome state with tappable starter cards before any message', () => {
    renderWithProviders(<ChatWindow />);
    expect(screen.getByText(UI.en.tagline)).toBeInTheDocument();
    // The welcome card is the one surface that shows the raw starter query.
    expect(screen.getByText(UI.en.quickActions.seat.query)).toBeInTheDocument();
  });

  it('streams an answer into a bubble after sending', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(sseResponse([{ type: 'token', value: 'Gate C is quietest.' }, { type: 'done' }])),
    );
    renderWithProviders(<ChatWindow />);

    await userEvent.type(screen.getByLabelText(UI.en.composerLabel), 'which gate?');
    await userEvent.keyboard('{Enter}');

    // The bubble renders it, and the polite live region mirrors it for SRs.
    expect((await screen.findAllByText('Gate C is quietest.')).length).toBeGreaterThan(0);
    // Welcome state is gone once a conversation starts.
    expect(screen.queryByText(UI.en.tagline)).not.toBeInTheDocument();
  });

  it('surfaces a retry button on a failed turn and recovers on retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(sseResponse([{ type: 'error', message: 'boom' }]))
      .mockResolvedValueOnce(sseResponse([{ type: 'token', value: 'All good now.' }, { type: 'done' }]));
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<ChatWindow />);

    await userEvent.type(screen.getByLabelText(UI.en.composerLabel), 'which gate?');
    await userEvent.keyboard('{Enter}');

    const retryButton = await screen.findByRole('button', { name: new RegExp(UI.en.retry) });
    await userEvent.click(retryButton);

    expect((await screen.findAllByText('All good now.')).length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: new RegExp(UI.en.retry) })).not.toBeInTheDocument(),
    );
  });
});
