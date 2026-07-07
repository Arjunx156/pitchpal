import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'system' | 'light' | 'dark';
const ORDER: Theme[] = ['system', 'light', 'dark'];
const STORAGE_KEY = 'pitchpal.theme';

interface ThemeValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycle: () => void;
}

const Ctx = createContext<ThemeValue | null>(null);

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* storage unavailable */
  }
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
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

  const cycle = () => setTheme((t) => ORDER[(ORDER.indexOf(t) + 1) % ORDER.length] ?? 'system');

  return <Ctx.Provider value={{ theme, setTheme, cycle }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useTheme must be used within a ThemeProvider');
  return value;
}
