import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { MessageList } from '../../src/components/chat/MessageList';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

describe('MessageList', () => {
  it('shows an inviting empty state when there are no messages', () => {
    renderWithProviders(<MessageList />);
    expect(screen.getByText(UI.en.composerPlaceholder)).toBeInTheDocument();
  });
});
