import { describe, it, expect } from 'vitest';
import { extractEvents } from '../../src/features/chat/useChat';

describe('extractEvents', () => {
  it('parses complete SSE events and keeps a trailing partial', () => {
    const buffer =
      'data: {"type":"token","value":"Hi"}\n\ndata: {"type":"done"}\n\ndata: {"type":"tok';
    const { events, rest } = extractEvents(buffer);
    expect(events).toEqual([{ type: 'token', value: 'Hi' }, { type: 'done' }]);
    expect(rest).toBe('data: {"type":"tok');
  });

  it('ignores malformed event payloads', () => {
    const buffer = 'data: not-json\n\ndata: {"type":"token","value":"ok"}\n\n';
    const { events } = extractEvents(buffer);
    expect(events).toEqual([{ type: 'token', value: 'ok' }]);
  });

  it('returns no events for an empty buffer', () => {
    expect(extractEvents('').events).toEqual([]);
  });
});
