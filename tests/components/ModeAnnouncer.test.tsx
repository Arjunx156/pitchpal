import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModeAnnouncer } from '../../src/components/ui/ModeAnnouncer';
import { useChatContext } from '../../src/features/chat/ChatProvider';
import { renderWithProviders } from '../helpers/render';

function SendTrigger() {
  const { send } = useChatContext();
  return (
    <button type="button" onClick={() => void send('where is my seat?')}>
      trigger send
    </button>
  );
}

describe('ModeAnnouncer', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('announces nothing before the assistant mode is known', () => {
    renderWithProviders(<ModeAnnouncer />);
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('announces the offline mode to screen readers when the network drops', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ModeAnnouncer />
        <SendTrigger />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'trigger send' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Assistant mode: Offline'),
    );
  });
});
