import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('opens the command palette with Ctrl+K', async () => {
    render(<App />);
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('switches to the stadium map view', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${UI.en.map.tabMap}$`) }));
    expect(document.querySelector('.app')?.getAttribute('data-view')).toBe('map');
  });
});
