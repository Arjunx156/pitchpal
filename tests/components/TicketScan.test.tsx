import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketScan } from '../../src/components/ticket-scan/TicketScan';
import { SCAN_STRINGS } from '../../src/i18n/ui';
import { renderWithProviders } from '../helpers/render';
import { mockChatResponse } from '../helpers/sse';

describe('TicketScan', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('renders a scan button', () => {
    vi.stubGlobal('fetch', vi.fn(async () => mockChatResponse([{ type: 'done' }])));
    renderWithProviders(<TicketScan />);
    expect(screen.getByRole('button', { name: SCAN_STRINGS.en.button })).toBeInTheDocument();
  });

  it('previews a chosen ticket image and sends it with the request', async () => {
    const fetchMock = vi.fn(async () => mockChatResponse([{ type: 'done' }]));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderWithProviders(<TicketScan />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['ticketdata'], 'ticket.png', { type: 'image/png' });
    await userEvent.upload(input, file);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: SCAN_STRINGS.en.use }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(call[1].body as string);
    expect(body.image?.mimeType).toBe('image/png');
    expect(typeof body.image?.data).toBe('string');
  });
});
