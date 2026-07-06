import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Composer } from '../../src/components/chat/Composer';
import { UI } from '../../src/i18n/ui';

describe('Composer', () => {
  it('sends on Enter and clears the input', async () => {
    const onSend = vi.fn();
    render(<Composer onSend={onSend} disabled={false} ui={UI.en} />);
    const input = screen.getByLabelText(UI.en.composerLabel);

    await userEvent.type(input, 'where is section 205');
    await userEvent.keyboard('{Enter}');

    expect(onSend).toHaveBeenCalledWith('where is section 205');
    expect(input).toHaveValue('');
  });

  it('inserts a newline on Shift+Enter without sending', async () => {
    const onSend = vi.fn();
    render(<Composer onSend={onSend} disabled={false} ui={UI.en} />);
    const input = screen.getByLabelText(UI.en.composerLabel);

    await userEvent.type(input, 'line one');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');

    expect(onSend).not.toHaveBeenCalled();
    expect(input).toHaveValue('line one\n');
  });

  it('disables the send button when empty or streaming', async () => {
    const onSend = vi.fn();
    const { rerender } = render(<Composer onSend={onSend} disabled={false} ui={UI.en} />);
    const button = screen.getByRole('button', { name: UI.en.send });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText(UI.en.composerLabel), 'hi');
    expect(button).toBeEnabled();

    rerender(<Composer onSend={onSend} disabled={true} ui={UI.en} />);
    expect(button).toBeDisabled();
  });
});
