import { describe, it, expect, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../../src/components/ui/ThemeToggle';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
});

describe('ThemeToggle', () => {
  it('cycles the theme when pressed (system → light)', async () => {
    renderWithProviders(<ThemeToggle ui={UI.en} />);
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('light'));
  });
});
