import { useEffect, useState } from 'react';
import type { UiStrings } from '../../i18n/ui';

type Theme = 'system' | 'light' | 'dark';
const ORDER: Theme[] = ['system', 'light', 'dark'];
const STORAGE_KEY = 'pitchpal.theme';
const ICONS: Record<Theme, string> = { system: '🖥️', light: '☀️', dark: '🌙' };

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* storage unavailable */
  }
  return 'system';
}

export function ThemeToggle({ ui }: { ui: UiStrings }) {
  const [theme, setTheme] = useState<Theme>(loadTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  const labels: Record<Theme, string> = {
    system: ui.theme.system,
    light: ui.theme.light,
    dark: ui.theme.dark,
  };
  const cycle = () => setTheme((current) => ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] ?? 'system');

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycle}
      aria-label={`${ui.theme.label}: ${labels[theme]}`}
    >
      <span aria-hidden="true">{ICONS[theme]}</span>
      <span className="theme-toggle__text">{labels[theme]}</span>
    </button>
  );
}
