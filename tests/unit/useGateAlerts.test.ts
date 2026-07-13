import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGateAlerts } from '../../src/features/notifications/useGateAlerts';
import { getOpsSnapshot, type OpsSnapshot } from '../../src/features/ops/opsFeed';
import { venue } from '../../src/features/venue/venue-data';

function jamSnapshot(): OpsSnapshot {
  const ops = getOpsSnapshot(venue, Date.now());
  return { ...ops, gates: ops.gates.map((g) => ({ ...g, level: 'jam' as const })) };
}

describe('useGateAlerts', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports unsupported when the Notification API is unavailable', () => {
    vi.stubGlobal('Notification', undefined);
    const { result } = renderHook(() => useGateAlerts(jamSnapshot(), 'A', 'title', 'body'));
    expect(result.current.permission).toBe('unsupported');
  });

  it('fires a notification once permission is granted and the gate jams', async () => {
    const NotificationSpy = vi.fn();
    const FakeNotification = Object.assign(NotificationSpy, {
      permission: 'default' as NotificationPermission,
      requestPermission: vi.fn().mockResolvedValue('granted' as NotificationPermission),
    });
    vi.stubGlobal('Notification', FakeNotification);

    const { result } = renderHook(() => useGateAlerts(jamSnapshot(), 'A', 'title', 'body'));
    expect(result.current.permission).toBe('default');

    await act(async () => {
      await result.current.enable();
    });

    await waitFor(() => expect(NotificationSpy).toHaveBeenCalledTimes(1));
    expect(NotificationSpy).toHaveBeenCalledWith('title', { body: 'body' });
  });

  it('exposes a screen-reader announcement even without notification permission', async () => {
    vi.stubGlobal('Notification', undefined);
    const { result } = renderHook(() =>
      useGateAlerts(jamSnapshot(), 'A', 'title', 'Gate A is congested'),
    );
    await waitFor(() => expect(result.current.announcement).toBe('Gate A is congested'));
  });
});
