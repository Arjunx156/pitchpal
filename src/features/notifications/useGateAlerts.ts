import { useCallback, useEffect, useRef, useState } from 'react';
import { gateStatus, type OpsSnapshot } from '../ops/opsFeed';

export type NotificationSupport = 'unsupported' | 'default' | 'granted' | 'denied';

function readPermission(): NotificationSupport {
  if (typeof window === 'undefined' || !window.Notification) return 'unsupported';
  return window.Notification.permission;
}

/**
 * Fires a local (on-device) notification the first time the fan's gate hits
 * 'jam', and exposes the alert text as a screen-reader `announcement` that
 * does not depend on notification permission.
 */
export function useGateAlerts(
  ops: OpsSnapshot,
  gateId: string | undefined,
  title: string,
  body: string,
) {
  const [permission, setPermission] = useState<NotificationSupport>(readPermission);
  const [announcement, setAnnouncement] = useState('');
  const announcedRef = useRef(false);
  const notifiedRef = useRef(false);

  const enable = useCallback(async () => {
    if (typeof window === 'undefined' || !window.Notification) {
      setPermission('unsupported');
      return;
    }
    const result = await window.Notification.requestPermission();
    setPermission(result);
  }, []);

  useEffect(() => {
    announcedRef.current = false;
    notifiedRef.current = false;
  }, [gateId]);

  useEffect(() => {
    const status = gateId ? gateStatus(ops, gateId) : undefined;
    if (status?.level !== 'jam') return;
    if (!announcedRef.current) {
      announcedRef.current = true;
      setAnnouncement(body);
    }
    if (permission === 'granted' && !notifiedRef.current) {
      notifiedRef.current = true;
      try {
        new window.Notification(title, { body });
      } catch {
        /* some browsers restrict Notification outside a user gesture — non-fatal */
      }
    }
  }, [ops, gateId, permission, title, body]);

  return { permission, enable, announcement };
}
