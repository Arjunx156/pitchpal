import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageList } from '../../src/components/chat/MessageList';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

describe('MessageList', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows an inviting empty state when there are no messages', () => {
    renderWithProviders(<MessageList />);
    expect(screen.getByText(UI.en.composerPlaceholder)).toBeInTheDocument();
  });

  it('offers starter chips in the empty state that send the matching query', async () => {
    // No network in jsdom: the send falls back to the on-device engine.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderWithProviders(<MessageList />);

    await userEvent.click(screen.getByRole('button', { name: UI.en.quickActions.seat.label }));

    // The chip's query becomes the user bubble and the empty state is gone.
    expect(await screen.findByText(UI.en.quickActions.seat.query)).toBeInTheDocument();
    expect(screen.queryByText(UI.en.composerPlaceholder)).not.toBeInTheDocument();
  });
});
