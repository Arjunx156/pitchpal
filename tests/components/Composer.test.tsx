import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Composer } from '../../src/components/chat/Composer';
import { UI } from '../../src/i18n/ui';
import { renderWithProviders } from '../helpers/render';

describe('Composer', () => {
  beforeEach(() => localStorage.clear());

  it('sends on Enter and clears the input', async () => {
    const onSend = vi.fn();
    renderWithProviders(<Composer onSend={onSend} disabled={false} />);
    const input = screen.getByLabelText(UI.en.composerLabel);

    await userEvent.type(input, 'where is section 205');
    await userEvent.keyboard('{Enter}');

    expect(onSend).toHaveBeenCalledWith('where is section 205');
    expect(input).toHaveValue('');
  });

  it('inserts a newline on Shift+Enter without sending', async () => {
    const onSend = vi.fn();
    renderWithProviders(<Composer onSend={onSend} disabled={false} />);
    const input = screen.getByLabelText(UI.en.composerLabel);

    await userEvent.type(input, 'line one');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');

    expect(onSend).not.toHaveBeenCalled();
    expect(input).toHaveValue('line one\n');
  });

  it('disables the send button when empty and enables it after typing', async () => {
    const onSend = vi.fn();
    renderWithProviders(<Composer onSend={onSend} disabled={false} />);
    const button = screen.getByRole('button', { name: UI.en.send });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText(UI.en.composerLabel), 'hi');
    expect(button).toBeEnabled();
  });

  it('disables the send button while streaming', () => {
    renderWithProviders(<Composer onSend={vi.fn()} disabled={true} />);
    expect(screen.getByRole('button', { name: UI.en.send })).toBeDisabled();
  });
});
