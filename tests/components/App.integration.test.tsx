import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { UI } from '../../src/i18n/ui';
import { mockChatResponse, cardBlock } from '../helpers/sse';

const routeCard = {
  type: 'route',
  title: 'Directions to section 205',
  toLabel: '#205',
  etaMinutes: 8,
  stepFree: true,
  steps: ['Enter at Gate C', 'Take the elevator to the club level'],
};

describe('App — end-to-end fan flow (mock fetch)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a question and renders the streamed answer with a route card', async () => {
    const fetchMock = vi.fn(async () =>
      mockChatResponse([
        { type: 'token', value: 'Head to Gate C.' },
        { type: 'token', value: cardBlock(routeCard) },
        { type: 'done' },
      ]),
    );
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    render(<App />);
    const input = screen.getByLabelText(UI.en.composerLabel);
    await userEvent.type(input, 'How do I get to section 205?');
    await userEvent.click(screen.getByRole('button', { name: UI.en.send }));

    // Wait for completion via the unique card title, then assert within the log
    // (the prose is intentionally echoed into the visually-hidden live region).
    await screen.findByText('Directions to section 205');
    const log = screen.getByRole('log');
    expect(within(log).getByText('Head to Gate C.')).toBeInTheDocument();
    expect(within(log).getByText('Enter at Gate C')).toBeInTheDocument();
    expect(within(log).getByText(UI.en.card.stepFree)).toBeInTheDocument();
    // Mode badge reflects the response header.
    expect(screen.getByText(UI.en.modeMock)).toBeInTheDocument();

    // The request carried the fan context.
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(call[1].body as string);
    expect(body.message).toBe('How do I get to section 205?');
    expect(body.context.language).toBe('en');
  });

  it('shows an error bubble when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => mockChatResponse([], 'mock', 500)) as unknown as typeof fetch,
    );

    render(<App />);
    await userEvent.type(screen.getByLabelText(UI.en.composerLabel), 'hello');
    await userEvent.click(screen.getByRole('button', { name: UI.en.send }));

    const log = await screen.findByRole('log');
    expect(within(log).getByText(UI.en.errorGeneric)).toBeInTheDocument();
  });
});
