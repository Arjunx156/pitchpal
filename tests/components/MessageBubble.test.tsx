import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageBubble } from '../../src/components/chat/MessageBubble';
import type { ChatMessage } from '../../src/features/chat/types';
import { UI } from '../../src/i18n/ui';
import { renderWithProviders } from '../helpers/render';

const speak = vi.fn();

describe('MessageBubble', () => {
  beforeEach(() => {
    speak.mockClear();
    vi.stubGlobal('speechSynthesis', { getVoices: () => [], speak, cancel: vi.fn() });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        lang = '';
        constructor(public text: string) {}
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  function bubble(message: ChatMessage) {
    return renderWithProviders(
      <ul>
        <MessageBubble message={message} ui={UI.en} />
      </ul>,
    );
  }

  it('offers read-aloud on a completed assistant message and speaks on click', async () => {
    bubble({ id: 'a1', role: 'assistant', content: 'Head to Gate C.', pending: false });
    const readBtn = screen.getByRole('button', { name: UI.en.voice.readAloud });
    await userEvent.click(readBtn);
    expect(speak).toHaveBeenCalled();
  });

  it('does not offer read-aloud on a user message', () => {
    bubble({ id: 'u1', role: 'user', content: 'hello' });
    expect(screen.queryByRole('button', { name: UI.en.voice.readAloud })).toBeNull();
  });

  it('shows a typing indicator for a pending empty assistant message', () => {
    bubble({ id: 'a2', role: 'assistant', content: '', pending: true });
    expect(screen.getByLabelText(UI.en.thinking)).toBeInTheDocument();
  });
});
