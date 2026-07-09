import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { UI } from '../../src/i18n/ui';
import { markOnboarded } from '../helpers/render';

describe('ContextBar', () => {
  beforeEach(() => {
    localStorage.clear();
    markOnboarded();
    document.documentElement.dir = 'ltr';
  });

  it('switches the whole UI language and sets RTL for Arabic', async () => {
    render(<App />);
    const viewswitch = document.querySelector('.viewswitch');
    if (!viewswitch) throw new Error('viewswitch nav not found');
    await userEvent.click(within(viewswitch as HTMLElement).getByRole('button', { name: new RegExp(`^${UI.en.nav.chat}$`) }));
    expect(screen.getByText(UI.en.tagline)).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(UI.en.languageLabel), 'ar');

    expect(screen.getByText(UI.ar.tagline)).toBeInTheDocument();
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('persists the fan location to storage', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText(UI.en.locationLabel), 'Gate B');

    const saved = JSON.parse(localStorage.getItem('pitchpal.context') ?? '{}');
    expect(saved.location).toBe('Gate B');
  });

  it('updates the accessibility profile', async () => {
    render(<App />);
    await userEvent.selectOptions(
      screen.getByLabelText(UI.en.accessibilityLabel),
      UI.en.accessibility.wheelchair,
    );
    const saved = JSON.parse(localStorage.getItem('pitchpal.context') ?? '{}');
    expect(saved.accessibility).toBe('wheelchair');
  });

  it('switches match, venue and standings group together', async () => {
    render(<App />);
    expect(screen.getByLabelText(/Brazil.*Argentina/)).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(UI.en.matchLabel), 'usa-mex');

    const saved = JSON.parse(localStorage.getItem('pitchpal.context') ?? '{}');
    expect(saved.matchId).toBe('usa-mex');
    expect(screen.getByLabelText(/United States.*Mexico/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Group A/ })).toBeInTheDocument();
  });
});
