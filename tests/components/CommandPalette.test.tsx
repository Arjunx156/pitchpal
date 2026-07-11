import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette } from '../../src/components/command/CommandPalette';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

function setup() {
  const onClose = vi.fn();
  const onFocusMap = vi.fn();
  const onAsk = vi.fn();
  renderWithProviders(
    <CommandPalette open onClose={onClose} onFocusMap={onFocusMap} onAsk={onAsk} />,
  );
  return { onClose, onFocusMap, onAsk };
}

describe('CommandPalette', () => {
  it('lists grouped actions and filters as you type', async () => {
    setup();
    expect(screen.getByPlaceholderText(UI.en.commandPalette.placeholder)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: UI.en.commandPalette.focusMap })).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(UI.en.commandPalette.placeholder), 'map');
    expect(screen.getByRole('button', { name: UI.en.commandPalette.focusMap })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: UI.en.commandPalette.toggleReadAloud }),
    ).not.toBeInTheDocument();
  });

  it('runs the "show map" action and closes', async () => {
    const { onFocusMap, onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: UI.en.commandPalette.focusMap }));
    expect(onFocusMap).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('sends an "ask" action query', async () => {
    const { onAsk } = setup();
    await userEvent.click(screen.getByRole('button', { name: UI.en.quickActions.seat.label }));
    expect(onAsk).toHaveBeenCalledWith(UI.en.quickActions.seat.query);
  });
});
