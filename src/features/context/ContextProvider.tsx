import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ACCESSIBILITY_PROFILES,
  DEFAULT_CONTEXT,
  isRtl,
  LANGUAGES,
  type FanContext,
} from './types';
import { UI, type UiStrings } from '../../i18n/ui';

interface FanContextValue {
  context: FanContext;
  ui: UiStrings;
  update: (patch: Partial<FanContext>) => void;
}

const Ctx = createContext<FanContextValue | null>(null);
const STORAGE_KEY = 'pitchpal.context';

function loadContext(): FanContext {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTEXT;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const languages: readonly string[] = LANGUAGES;
    const profiles: readonly string[] = ACCESSIBILITY_PROFILES;
    return {
      language: languages.includes(parsed.language as string)
        ? (parsed.language as FanContext['language'])
        : DEFAULT_CONTEXT.language,
      accessibility: profiles.includes(parsed.accessibility as string)
        ? (parsed.accessibility as FanContext['accessibility'])
        : DEFAULT_CONTEXT.accessibility,
      location: typeof parsed.location === 'string' ? parsed.location.slice(0, 120) : '',
    };
  } catch {
    return DEFAULT_CONTEXT;
  }
}

export function FanContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<FanContext>(loadContext);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
    } catch {
      /* storage may be unavailable — non-fatal */
    }
    document.documentElement.lang = context.language;
    document.documentElement.dir = isRtl(context.language) ? 'rtl' : 'ltr';
  }, [context]);

  const value = useMemo<FanContextValue>(
    () => ({
      context,
      ui: UI[context.language],
      update: (patch) => setContext((current) => ({ ...current, ...patch })),
    }),
    [context],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFanContext(): FanContextValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useFanContext must be used within a FanContextProvider');
  return value;
}
