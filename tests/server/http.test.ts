import { describe, it, expect, beforeEach } from 'vitest';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleChatRequest } from '../../server/handler';
import { rateLimit, resetRateLimit } from '../../server/security';

function mockReq(
  body: string,
  ip = '9.9.9.9',
  headers: Record<string, string> = {},
): IncomingMessage {
  const stream = Readable.from([Buffer.from(body, 'utf8')]) as unknown as IncomingMessage;
  stream.headers = headers;
  (stream as unknown as { socket: unknown }).socket = { remoteAddress: ip };
  return stream;
}

class MockRes extends EventEmitter {
  statusCode = 0;
  headers: Record<string, string> = {};
  chunks: string[] = [];
  headersSent = false;
  writeHead(status: number, headers: Record<string, string>) {
    this.statusCode = status;
    this.headers = headers;
    this.headersSent = true;
    return this;
  }
  write(chunk: string) {
    this.chunks.push(String(chunk));
    return true;
  }
  end(chunk?: string) {
    if (chunk) this.chunks.push(String(chunk));
    return this;
  }
  get body() {
    return this.chunks.join('');
  }
}

const validBody = JSON.stringify({
  message: 'How do I get to section 205?',
  context: { language: 'en', accessibility: 'none', location: '' },
  history: [],
});

describe('handleChatRequest (HTTP adapter)', () => {
  beforeEach(() => resetRateLimit());

  it('streams an SSE response in mock mode with the mode header', async () => {
    const res = new MockRes();
    await handleChatRequest(mockReq(validBody), res as unknown as ServerResponse, {});

    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toContain('text/event-stream');
    expect(res.headers['X-Pitchpal-Mode']).toBe('mock');
    expect(res.headers['X-Content-Type-Options']).toBe('nosniff');
    expect(res.body).toContain('"type":"token"');
    expect(res.body).toContain('"type":"done"');
  });

  it('rejects invalid JSON with 400', async () => {
    const res = new MockRes();
    await handleChatRequest(mockReq('{ not json'), res as unknown as ServerResponse, {});
    expect(res.statusCode).toBe(400);
  });

  it('rejects a schema-invalid body with 400', async () => {
    const res = new MockRes();
    const bad = JSON.stringify({ message: '', context: { language: 'en', accessibility: 'none' } });
    await handleChatRequest(mockReq(bad), res as unknown as ServerResponse, {});
    expect(res.statusCode).toBe(400);
  });

  it('returns 429 once the rate limit is exhausted', async () => {
    for (let i = 0; i < 20; i++) rateLimit('8.8.8.8');
    const res = new MockRes();
    await handleChatRequest(mockReq(validBody, '8.8.8.8'), res as unknown as ServerResponse, {});
    expect(res.statusCode).toBe(429);
    expect(res.headers['Retry-After']).toBeDefined();
  });

  it('ignores a spoofed x-forwarded-for unless TRUST_PROXY is set', async () => {
    // Exhaust the socket IP's budget; a rotating x-forwarded-for must not bypass it.
    for (let i = 0; i < 20; i++) rateLimit('7.7.7.7');
    const res = new MockRes();
    await handleChatRequest(
      mockReq(validBody, '7.7.7.7', { 'x-forwarded-for': '1.2.3.4' }),
      res as unknown as ServerResponse,
      {},
    );
    expect(res.statusCode).toBe(429);
  });

  it('honours x-forwarded-for when TRUST_PROXY is enabled', async () => {
    for (let i = 0; i < 20; i++) rateLimit('7.7.7.7');
    const res = new MockRes();
    await handleChatRequest(
      mockReq(validBody, '7.7.7.7', { 'x-forwarded-for': '1.2.3.4' }),
      res as unknown as ServerResponse,
      { TRUST_PROXY: '1' },
    );
    expect(res.statusCode).toBe(200);
  });

  it('stops streaming when the client disconnects mid-stream', async () => {
    const res = new MockRes();
    // Abort as soon as the first SSE chunk lands.
    const originalWrite = res.write.bind(res);
    let wrote = 0;
    res.write = (chunk: string) => {
      wrote += 1;
      const ok = originalWrite(chunk);
      if (wrote === 1) res.emit('close');
      return ok;
    };

    await handleChatRequest(mockReq(validBody), res as unknown as ServerResponse, {});

    // The stream ended early: no `done` event was written after the disconnect.
    expect(res.body).not.toContain('"type":"done"');
    expect(wrote).toBeLessThanOrEqual(2);
  });
});
