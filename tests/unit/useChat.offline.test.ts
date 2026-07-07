import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../../src/features/chat/useChat';
import { DEFAULT_CONTEXT } from '../../src/features/context/types';

describe('useChat — offline fallback', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('answers on-device with a grounded card when the network is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const { result } = renderHook(() => useChat(DEFAULT_CONTEXT, 'error', () => {}));

    await act(async () => {
      await result.current.send('How do I get to section 205?');
    });

    expect(result.current.mode).toBe('offline');
    const assistant = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistant?.content.length ?? 0).toBeGreaterThan(0);
    expect(assistant?.cards?.[0]?.type).toBe('route');
    expect(assistant?.error).toBeFalsy();
  });

  it('ignores empty input', async () => {
    const { result } = renderHook(() => useChat(DEFAULT_CONTEXT, 'error', () => {}));
    await act(async () => {
      await result.current.send('   ');
    });
    expect(result.current.messages).toHaveLength(0);
  });
});
