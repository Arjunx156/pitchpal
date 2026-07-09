import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { UI } from '../../src/i18n/ui';
import { markOnboarded } from '../helpers/render';

describe('App shell interactions', () => {
  beforeEach(() => {
    localStorage.clear();
    markOnboarded();
  });

  it('opens the command palette via the toolbar button and closes on Escape', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: UI.en.commandPalette.open }));
    // The palette is code-split — it mounts once its chunk resolves.
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('opens the command palette with Ctrl+K', async () => {
    render(<App />);
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('switches to the stadium map view', async () => {
    render(<App />);
    const viewswitch = document.querySelector('.viewswitch');
    if (!viewswitch) throw new Error('viewswitch nav not found');
    await userEvent.click(within(viewswitch as HTMLElement).getByRole('button', { name: new RegExp(`^${UI.en.nav.map}$`) }));
    expect(document.querySelector('.app')?.getAttribute('data-view')).toBe('map');
  });
});
