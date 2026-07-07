import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StadiumMap } from '../../src/components/map/StadiumMap';
import { UI } from '../../src/i18n/ui';
import { fmt } from '../../src/i18n/answers';
import { venue } from '../../src/features/venue/venue-data';
import { mockChatResponse } from '../helpers/sse';
import { renderWithProviders } from '../helpers/render';

describe('StadiumMap', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn(async () => mockChatResponse([{ type: 'done' }])));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('renders a button for every gate and section', () => {
    renderWithProviders(<StadiumMap />);
    const buttons = screen.getAllByRole('button');
    // 4 gates + 9 sections
    expect(buttons.length).toBe(venue.gates.length + venue.sections.length);
    expect(screen.getByText(UI.en.map.heading)).toBeInTheDocument();
  });

  it('seeds a localized question when a section is clicked', async () => {
    const fetchMock = vi.fn(async () => mockChatResponse([{ type: 'done' }]));
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<StadiumMap />);

    await userEvent.click(screen.getByRole('button', { name: fmt(UI.en.map.askSection, { id: '205' }) }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(call[1].body as string);
    expect(body.message).toContain('205');
  });

  it('activates a gate with the keyboard', async () => {
    const fetchMock = vi.fn(async () => mockChatResponse([{ type: 'done' }]));
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<StadiumMap />);

    const gate = screen.getByRole('button', { name: /Gate A/i });
    gate.focus();
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });
});
