import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ChatWindow } from '../../src/components/chat/ChatWindow';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

describe('ChatWindow', () => {
  it('renders the assistant header, an empty state and a composer', () => {
    renderWithProviders(<ChatWindow />);
    // Assistant name appears in the header and the empty state.
    expect(screen.getAllByText(UI.en.assistant).length).toBeGreaterThan(0);
    // Composer input is present.
    expect(screen.getByLabelText(UI.en.composerLabel)).toBeInTheDocument();
  });
});
