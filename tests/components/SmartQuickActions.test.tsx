import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartQuickActions } from '../../src/components/quick-actions/SmartQuickActions';
import { QUICK_ACTION_KEYS, UI } from '../../src/i18n/ui';
import { renderWithProviders } from '../helpers/render';

describe('SmartQuickActions', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders every static quick-action chip', () => {
    renderWithProviders(<SmartQuickActions />);
    for (const key of QUICK_ACTION_KEYS) {
      expect(screen.getByRole('button', { name: new RegExp(UI.en.quickActions[key].label) })).toBeInTheDocument();
    }
  });

  it('sends the canned query when a chip is tapped', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('offline')); // falls back on-device
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<SmartQuickActions />);

    await userEvent.click(screen.getByRole('button', { name: new RegExp(UI.en.quickActions.food.label) }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.message).toBe(UI.en.quickActions.food.query);
  });
});
