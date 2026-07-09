import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../../src/features/chat/useChat';
import { DEFAULT_CONTEXT } from '../../src/features/context/types';
import { venue } from '../../src/features/venue/venue-data';

const ERROR_TEXT = 'Something went wrong.';

/** Minimal mock of an SSE Response streaming the given events in one chunk. */
function sseResponse(events: object[], mode = 'mock'): unknown {
  const payload = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
  const encoder = new TextEncoder();
  let sent = false;
  return {
    ok: true,
    headers: { get: (k: string) => (k === 'X-Pitchpal-Mode' ? mode : null) },
    body: {
      getReader: () => ({
        read: async () =>
          sent ? { done: true, value: undefined } : ((sent = true), { done: false, value: encoder.encode(payload) }),
      }),
    },
  };
}

function setup() {
  return renderHook(() => useChat(DEFAULT_CONTEXT, venue, ERROR_TEXT, () => {}));
}

describe('useChat — streaming edge cases', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('marks an error event as retryable and retry resends without duplicating turns', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(sseResponse([{ type: 'error', message: 'boom' }]))
      .mockResolvedValueOnce(sseResponse([{ type: 'token', value: 'Gate C is open.' }, { type: 'done' }]));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = setup();

    await act(async () => {
      await result.current.send('which gate?');
    });
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]?.error).toBe(true);
    expect(result.current.messages[1]?.content).toBe(ERROR_TEXT);

    await act(async () => {
      result.current.retry();
    });
    await waitFor(() => expect(result.current.isStreaming).toBe(false));

    // Failed turn was trimmed, not stacked: still one user + one assistant.
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]?.content).toBe('Gate C is open.');
    expect(result.current.messages[1]?.error).toBeFalsy();
    // Second request must not carry the failed turn in its history.
    const secondBody = JSON.parse((fetchMock.mock.calls[1] as [string, RequestInit])[1].body as string);
    expect(secondBody.history).toEqual([]);
  });

  it('treats a truly empty stream as a retryable failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sseResponse([{ type: 'done' }])));
    const { result } = setup();

    await act(async () => {
      await result.current.send('hello?');
    });

    expect(result.current.messages[1]?.error).toBe(true);
    expect(result.current.messages[1]?.content).toBe(ERROR_TEXT);
  });

  it('accepts a card-only turn as a legitimate answer', async () => {
    const card = { type: 'route', title: 'To 205', fromLabel: 'Gate A', toLabel: '205', etaMinutes: 5, stepFree: true, steps: [] };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(sseResponse([{ type: 'tool_result', tool: 'planRoute', card }, { type: 'done' }])),
    );
    const { result } = setup();

    await act(async () => {
      await result.current.send('route to 205');
    });

    expect(result.current.messages[1]?.error).toBeFalsy();
    expect(result.current.messages[1]?.cards).toHaveLength(1);
  });

  it('stop() keeps the partial answer without marking it as an error', async () => {
    const encoder = new TextEncoder();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        const signal = init.signal as AbortSignal;
        let step = 0;
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'live' },
          body: {
            getReader: () => ({
              read: () => {
                step += 1;
                if (step === 1) {
                  return Promise.resolve({
                    done: false,
                    value: encoder.encode('data: {"type":"token","value":"Partial answer"}\n\n'),
                  });
                }
                // Hang until aborted, like a stalled live stream.
                return new Promise((_resolve, reject) => {
                  signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
                });
              },
            }),
          },
        });
      }),
    );
    const { result } = setup();

    await act(async () => {
      void result.current.send('long question');
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.messages[1]?.content).toBe('Partial answer'));

    await act(async () => {
      result.current.stop();
    });
    await waitFor(() => expect(result.current.isStreaming).toBe(false));

    expect(result.current.messages[1]?.content).toBe('Partial answer');
    expect(result.current.messages[1]?.pending).toBeFalsy();
    expect(result.current.messages[1]?.error).toBeFalsy();
  });
});
