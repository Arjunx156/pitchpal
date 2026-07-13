import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../../src/features/chat/useChat';
import { DEFAULT_CONTEXT } from '../../src/features/context/types';
import { venue } from '../../src/features/venue/venue-data';

describe('useChat — offline fallback', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('answers on-device with a grounded card when the network is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const { result } = renderHook(() => useChat(DEFAULT_CONTEXT, venue, 'error', () => {}));

    await act(async () => {
      await result.current.send('How do I get to section 205?');
    });

    expect(result.current.mode).toBe('offline');
    const assistant = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistant?.content.length ?? 0).toBeGreaterThan(0);
    expect(assistant?.cards?.[0]?.type).toBe('route');
    expect(assistant?.error).toBeFalsy();
  });

  it('skips the network entirely when the browser reports offline', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    try {
      const { result } = renderHook(() => useChat(DEFAULT_CONTEXT, venue, 'error', () => {}));
      await act(async () => {
        await result.current.send('Where is the nearest food?');
      });

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result.current.mode).toBe('offline');
      const assistant = result.current.messages.find((m) => m.role === 'assistant');
      expect(assistant?.content.length ?? 0).toBeGreaterThan(0);
    } finally {
      Reflect.deleteProperty(window.navigator, 'onLine');
    }
  });

  it('ignores empty input', async () => {
    const { result } = renderHook(() => useChat(DEFAULT_CONTEXT, venue, 'error', () => {}));
    await act(async () => {
      await result.current.send('   ');
    });
    expect(result.current.messages).toHaveLength(0);
  });
});
