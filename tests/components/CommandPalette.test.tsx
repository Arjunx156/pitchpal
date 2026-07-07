import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette } from '../../src/components/command/CommandPalette';
import { UI } from '../../src/i18n/ui';
import { renderWithProviders } from '../helpers/render';

describe('CommandPalette', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('lists actions and filters them by query', async () => {
    renderWithProviders(<CommandPalette open onClose={vi.fn()} onFocusMap={vi.fn()} />);
    expect(screen.getByText(UI.en.quickActions.seat.label)).toBeInTheDocument();
    expect(screen.getByText(UI.en.commandPalette.toggleTheme)).toBeInTheDocument();

    await userEvent.type(screen.getByRole('combobox'), 'theme');
    expect(screen.getByText(UI.en.commandPalette.toggleTheme)).toBeInTheDocument();
    expect(screen.queryByText(UI.en.quickActions.seat.label)).not.toBeInTheDocument();
  });

  it('shows an empty state when nothing matches', async () => {
    renderWithProviders(<CommandPalette open onClose={vi.fn()} onFocusMap={vi.fn()} />);
    await userEvent.type(screen.getByRole('combobox'), 'zzzzz');
    expect(screen.getByText(UI.en.commandPalette.empty)).toBeInTheDocument();
  });

  it('runs an action with keyboard (Enter) and closes', async () => {
    const onClose = vi.fn();
    renderWithProviders(<CommandPalette open onClose={onClose} onFocusMap={vi.fn()} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'theme');
    await userEvent.keyboard('{Enter}');

    expect(onClose).toHaveBeenCalled();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('changes language when a language action is clicked', async () => {
    const onClose = vi.fn();
    renderWithProviders(<CommandPalette open onClose={onClose} onFocusMap={vi.fn()} />);
    await userEvent.click(screen.getByText('Español'));

    expect(onClose).toHaveBeenCalled();
    const saved = JSON.parse(localStorage.getItem('pitchpal.context') ?? '{}');
    expect(saved.language).toBe('es');
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    renderWithProviders(<CommandPalette open onClose={onClose} onFocusMap={vi.fn()} />);
    await userEvent.type(screen.getByRole('combobox'), '{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when closed', () => {
    const { container } = renderWithProviders(
      <CommandPalette open={false} onClose={vi.fn()} onFocusMap={vi.fn()} />,
    );
    expect(container.querySelector('.palette')).toBeNull();
  });
});
