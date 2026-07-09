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
    renderWithProviders(<Composer onSend={onSend} onStop={vi.fn()} streaming={false} />);
    const input = screen.getByLabelText(UI.en.composerLabel);

    await userEvent.type(input, 'where is section 205');
    await userEvent.keyboard('{Enter}');

    expect(onSend).toHaveBeenCalledWith('where is section 205');
    expect(input).toHaveValue('');
  });

  it('inserts a newline on Shift+Enter without sending', async () => {
    const onSend = vi.fn();
    renderWithProviders(<Composer onSend={onSend} onStop={vi.fn()} streaming={false} />);
    const input = screen.getByLabelText(UI.en.composerLabel);

    await userEvent.type(input, 'line one');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');

    expect(onSend).not.toHaveBeenCalled();
    expect(input).toHaveValue('line one\n');
  });

  it('disables the send button when empty and enables it after typing', async () => {
    const onSend = vi.fn();
    renderWithProviders(<Composer onSend={onSend} onStop={vi.fn()} streaming={false} />);
    const button = screen.getByRole('button', { name: UI.en.send });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText(UI.en.composerLabel), 'hi');
    expect(button).toBeEnabled();
  });

  it('swaps send for a stop button while streaming and calls onStop', async () => {
    const onStop = vi.fn();
    renderWithProviders(<Composer onSend={vi.fn()} onStop={onStop} streaming={true} />);

    expect(screen.queryByRole('button', { name: UI.en.send })).not.toBeInTheDocument();
    const stopButton = screen.getByRole('button', { name: UI.en.stop });
    await userEvent.click(stopButton);
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('does not send on Enter while streaming', async () => {
    const onSend = vi.fn();
    renderWithProviders(<Composer onSend={onSend} onStop={vi.fn()} streaming={true} />);
    const input = screen.getByLabelText(UI.en.composerLabel);

    await userEvent.type(input, 'question');
    await userEvent.keyboard('{Enter}');

    expect(onSend).not.toHaveBeenCalled();
  });
});
