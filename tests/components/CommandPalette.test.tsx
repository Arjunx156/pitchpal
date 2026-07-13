import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette } from '../../src/components/command/CommandPalette';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

function setup(onInstall?: () => void) {
  const onClose = vi.fn();
  const onFocusMap = vi.fn();
  const onAsk = vi.fn();
  renderWithProviders(
    <CommandPalette
      open
      onClose={onClose}
      onFocusMap={onFocusMap}
      onAsk={onAsk}
      onInstall={onInstall}
    />,
  );
  return { onClose, onFocusMap, onAsk };
}

describe('CommandPalette', () => {
  it('lists grouped actions and filters as you type', async () => {
    setup();
    expect(screen.getByPlaceholderText(UI.en.commandPalette.placeholder)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: UI.en.commandPalette.focusMap })).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(UI.en.commandPalette.placeholder), 'map');
    expect(screen.getByRole('option', { name: UI.en.commandPalette.focusMap })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: UI.en.commandPalette.toggleReadAloud }),
    ).not.toBeInTheDocument();
  });

  it('runs the "show map" action and closes', async () => {
    const { onFocusMap, onClose } = setup();
    await userEvent.click(screen.getByRole('option', { name: UI.en.commandPalette.focusMap }));
    expect(onFocusMap).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('sends an "ask" action query', async () => {
    const { onAsk } = setup();
    await userEvent.click(screen.getByRole('option', { name: UI.en.quickActions.seat.label }));
    expect(onAsk).toHaveBeenCalledWith(UI.en.quickActions.seat.query);
  });

  it('moves the highlight with arrow keys and runs the active command on Enter', async () => {
    const { onAsk, onClose } = setup();
    const user = userEvent.setup();
    const input = screen.getByRole('combobox', { name: UI.en.commandPalette.open });

    // First option is highlighted by default.
    expect(screen.getByRole('option', { name: UI.en.quickActions.seat.label })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.click(input);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: UI.en.quickActions.food.label })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(input).toHaveAttribute('aria-activedescendant', 'palette-opt-food');

    await user.keyboard('{Enter}');
    expect(onAsk).toHaveBeenCalledWith(UI.en.quickActions.food.query);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('wraps the highlight when arrowing up from the first option', async () => {
    setup();
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: UI.en.commandPalette.open }));
    await user.keyboard('{ArrowUp}');
    expect(
      screen.getByRole('option', { name: UI.en.commandPalette.toggleReadAloud }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('offers an install command when the browser can install the app', async () => {
    const onInstall = vi.fn();
    const { onClose } = setup(onInstall);
    await userEvent.click(screen.getByRole('option', { name: UI.en.install }));
    expect(onInstall).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('hides the install command when install is unavailable', () => {
    setup();
    expect(screen.queryByRole('option', { name: UI.en.install })).not.toBeInTheDocument();
  });
});
