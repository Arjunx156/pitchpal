import { useCallback, useRef, useSyncExternalStore } from 'react';

export type Surface = 'home' | 'chat' | 'map';

const SURFACES: readonly string[] = ['home', 'chat', 'map'];

function isSurface(value: string): value is Surface {
  return SURFACES.includes(value);
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/**
 * The active surface, backed by the URL hash: reload keeps the fan's place,
 * the browser back button moves between surfaces, and views are deep-linkable
 * (#home / #chat / #map). Non-surface hashes (e.g. the #stage skip-link
 * target) are ignored and keep the last valid surface.
 */
export function useHashSurface(): [Surface, (next: Surface) => void] {
  const lastValid = useRef<Surface>('home');

  const getSnapshot = () => {
    const value = window.location.hash.replace(/^#/, '');
    if (isSurface(value)) lastValid.current = value;
    return lastValid.current;
  };

  const view = useSyncExternalStore(subscribe, getSnapshot, () => 'home' as Surface);

  const setView = useCallback((next: Surface) => {
    window.location.hash = next;
  }, []);

  return [view, setView];
}
