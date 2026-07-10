import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextBar } from '../../src/components/context-bar/ContextBar';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

describe('ContextBar', () => {
  it('changing the language updates the shared context and re-localizes the UI', async () => {
    renderWithProviders(<ContextBar />);
    // English heading first.
    expect(screen.getByText(UI.en.settingsHeading)).toBeInTheDocument();

    const languageSelect = screen.getByLabelText(UI.en.languageLabel);
    await userEvent.selectOptions(languageSelect, 'es');

    // The whole panel re-renders in Spanish.
    expect(screen.getByText(UI.es.settingsHeading)).toBeInTheDocument();
  });

  it('changing the match switches the fixture/venue in context', async () => {
    renderWithProviders(<ContextBar />);
    // Fields render in order: language, accessibility, match, location.
    const matchSelect = screen.getAllByRole('combobox')[2] as HTMLSelectElement;
    await userEvent.selectOptions(matchSelect, 'usa-mex');
    expect(matchSelect.value).toBe('usa-mex');
  });
});
