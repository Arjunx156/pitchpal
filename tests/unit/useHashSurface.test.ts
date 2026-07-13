import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHashSurface } from '../../src/lib/useHashSurface';

describe('useHashSurface', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('starts on home when the URL has no hash', () => {
    const { result } = renderHook(() => useHashSurface());
    expect(result.current[0]).toBe('home');
  });

  it('honours a surface deep link on load', () => {
    window.location.hash = '#map';
    const { result } = renderHook(() => useHashSurface());
    expect(result.current[0]).toBe('map');
  });

  it('writes the hash and updates the view when the surface changes', async () => {
    const { result } = renderHook(() => useHashSurface());
    act(() => {
      result.current[1]('chat');
    });
    expect(window.location.hash).toBe('#chat');
    await waitFor(() => expect(result.current[0]).toBe('chat'));
  });

  it('keeps the current surface for non-surface hashes like the skip-link target', async () => {
    const { result } = renderHook(() => useHashSurface());
    act(() => {
      result.current[1]('chat');
    });
    await waitFor(() => expect(result.current[0]).toBe('chat'));

    act(() => {
      window.location.hash = '#stage';
    });
    await waitFor(() => expect(window.location.hash).toBe('#stage'));
    expect(result.current[0]).toBe('chat');
  });
});
