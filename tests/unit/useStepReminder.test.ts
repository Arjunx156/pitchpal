import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepReminder } from '../../src/features/notifications/useStepReminder';

class FakeNotification {
  static instances: { title: string; body?: string }[] = [];
  constructor(title: string, options?: { body?: string }) {
    FakeNotification.instances.push({ title, body: options?.body });
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  FakeNotification.instances = [];
  vi.stubGlobal('Notification', FakeNotification);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useStepReminder', () => {
  it('fires a notification at the lead time once armed', () => {
    const stepTime = Date.now() + 30 * 60_000; // step in 30 min
    const { result } = renderHook(() =>
      useStepReminder('granted', stepTime, 'My match day', 'Kickoff · 18:00', 15),
    );

    act(() => result.current.toggle());
    expect(result.current.armed).toBe(true);
    expect(FakeNotification.instances).toHaveLength(0);

    // Advance to 15 minutes before the step — the reminder fires exactly once.
    act(() => vi.advanceTimersByTime(15 * 60_000 + 50));
    expect(FakeNotification.instances).toHaveLength(1);
    expect(FakeNotification.instances[0]?.title).toBe('My match day');
  });

  it('fires immediately when armed inside the lead window', () => {
    const stepTime = Date.now() + 5 * 60_000; // step in 5 min, lead is 15
    const { result } = renderHook(() =>
      useStepReminder('granted', stepTime, 'My match day', 'Enter gate · 17:50'),
    );
    act(() => result.current.toggle());
    expect(FakeNotification.instances).toHaveLength(1);
  });

  it('does nothing without granted permission', () => {
    const stepTime = Date.now() + 30 * 60_000;
    const { result } = renderHook(() =>
      useStepReminder('default', stepTime, 'My match day', 'Kickoff'),
    );
    act(() => result.current.toggle());
    act(() => vi.advanceTimersByTime(60 * 60_000));
    expect(FakeNotification.instances).toHaveLength(0);
  });
});
