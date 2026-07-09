import { useCallback, useEffect, useRef, useState } from 'react';
import type { NotificationSupport } from './useGateAlerts';

const DEFAULT_LEAD_MIN = 15;

/**
 * Best-effort local reminder N minutes before a match-day step. Mirrors
 * `useGateAlerts`'s device-notification approach: requires the tab to stay
 * open, no service-worker push. Shares the caller's Notification `permission`
 * (obtained once via `useGateAlerts`) rather than requesting it again per row.
 */
export function useStepReminder(
  permission: NotificationSupport,
  stepTimeMs: number,
  title: string,
  body: string,
  leadMinutes = DEFAULT_LEAD_MIN,
) {
  const [armed, setArmed] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
  }, [stepTimeMs]);

  useEffect(() => {
    if (!armed || permission !== 'granted') return;
    const fireAt = stepTimeMs - leadMinutes * 60_000;
    const delay = fireAt - Date.now();

    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      try {
        new window.Notification(title, { body });
      } catch {
        /* some browsers restrict Notification outside a user gesture — non-fatal */
      }
    };

    if (delay <= 0) {
      fire();
      return;
    }
    const id = setTimeout(fire, delay);
    return () => clearTimeout(id);
  }, [armed, permission, stepTimeMs, title, body, leadMinutes]);

  const toggle = useCallback(() => setArmed((a) => !a), []);

  return { armed, toggle };
}
