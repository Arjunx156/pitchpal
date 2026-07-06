import { describe, it, expect, beforeEach } from 'vitest';
import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleChatRequest } from '../../server/handler';
import { rateLimit, resetRateLimit } from '../../server/security';

function mockReq(body: string, ip = '9.9.9.9'): IncomingMessage {
  const stream = Readable.from([Buffer.from(body, 'utf8')]) as unknown as IncomingMessage;
  stream.headers = {};
  (stream as unknown as { socket: unknown }).socket = { remoteAddress: ip };
  return stream;
}

class MockRes {
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
});
