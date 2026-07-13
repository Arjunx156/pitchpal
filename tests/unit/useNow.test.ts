import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNow } from '../../src/hooks/useNow';

describe('useNow (shared clock)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns the current time and ticks on the interval', () => {
    const { result } = renderHook(() => useNow(1000));
    const first = result.current;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBeGreaterThan(first);
  });

  it('shares one interval between subscribers on the same cadence', () => {
    const spy = vi.spyOn(globalThis, 'setInterval');
    const a = renderHook(() => useNow(5000));
    const b = renderHook(() => useNow(5000));

    const intervalCalls = spy.mock.calls.filter(([, ms]) => ms === 5000);
    expect(intervalCalls).toHaveLength(1);

    // Both subscribers see the same tick.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(a.result.current).toBe(b.result.current);

    a.unmount();
    b.unmount();
    spy.mockRestore();
  });

  it('stops the interval when the last subscriber unmounts', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const a = renderHook(() => useNow(7000));
    const b = renderHook(() => useNow(7000));

    a.unmount();
    const cleared = clearSpy.mock.calls.length;
    b.unmount();

    expect(clearSpy.mock.calls.length).toBeGreaterThan(cleared);
    clearSpy.mockRestore();
  });
});
