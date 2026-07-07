import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../../src/components/ui/ThemeToggle';
import { ThemeProvider } from '../../src/features/theme/ThemeProvider';
import { UI } from '../../src/i18n/ui';

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle ui={UI.en} />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('cycles system → light → dark → system and stamps data-theme', async () => {
    renderToggle();
    const button = screen.getByRole('button');

    expect(button).toHaveAccessibleName(`${UI.en.theme.label}: ${UI.en.theme.system}`);
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);

    await userEvent.click(button);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    await userEvent.click(button);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    await userEvent.click(button);
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem('pitchpal.theme')).toBe('system');
  });
});
