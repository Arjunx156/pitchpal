import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageBubble } from '../../src/components/chat/MessageBubble';
import type { ChatMessage } from '../../src/features/chat/types';
import { renderWithProviders } from '../helpers/render';

describe('MessageBubble', () => {
  it('renders a user message', () => {
    const msg: ChatMessage = { id: 'u1', role: 'user', content: 'Where is section 114?' };
    renderWithProviders(<MessageBubble message={msg} />);
    expect(screen.getByText('Where is section 114?')).toBeInTheDocument();
  });

  it('renders an assistant answer with an attached route card', () => {
    const msg: ChatMessage = {
      id: 'a1',
      role: 'assistant',
      content: "Here's your route.",
      cards: [{ type: 'route', title: 'Directions to 114', steps: ['Enter Gate C'] }],
    };
    renderWithProviders(<MessageBubble message={msg} />);
    expect(screen.getByText("Here's your route.")).toBeInTheDocument();
    expect(screen.getByText('Directions to 114')).toBeInTheDocument();
    expect(screen.getByText('Enter Gate C')).toBeInTheDocument();
  });

  it('offers a retry on a failed assistant turn', async () => {
    const onRetry = vi.fn();
    const msg: ChatMessage = { id: 'a2', role: 'assistant', content: 'Something went wrong.', error: true };
    renderWithProviders(<MessageBubble message={msg} onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
