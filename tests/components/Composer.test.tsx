import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Composer } from '../../src/components/chat/Composer';
import { renderWithProviders } from '../helpers/render';
import { mockChatResponse } from '../helpers/sse';
import { UI } from '../../src/i18n/ui';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Composer', () => {
  it('enables send only when there is text, and posts to /api/chat on submit', async () => {
    const fetchMock = vi.fn(async () =>
      mockChatResponse([{ type: 'token', value: 'Hi' }, { type: 'done' }]),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<Composer />);
    const input = screen.getByLabelText(UI.en.composerLabel);
    const send = screen.getByRole('button', { name: UI.en.send });
    expect(send).toBeDisabled();

    await userEvent.type(input, 'Where is my seat?');
    expect(send).toBeEnabled();
    await userEvent.click(send);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({ method: 'POST' }));
  });

  it('rejects an oversized image with a localized error and does not send', async () => {
    const fetchMock = vi.fn(async () => mockChatResponse([{ type: 'done' }]));
    vi.stubGlobal('fetch', fetchMock);

    const { container } = renderWithProviders(<Composer />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    // Allowed type (passes the input `accept` filter) but over the 5 MB cap.
    const bigFile = new File([new Uint8Array(6 * 1024 * 1024)], 'ticket.png', { type: 'image/png' });
    await userEvent.upload(fileInput, bigFile);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
