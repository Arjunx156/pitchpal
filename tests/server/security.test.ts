import { describe, it, expect, beforeEach } from 'vitest';
import {
  chatRequestSchema,
  contentSecurityPolicy,
  rateLimit,
  resetRateLimit,
  securityHeaders,
} from '../../server/security';

describe('chatRequestSchema', () => {
  it('accepts a valid request and applies defaults', () => {
    const result = chatRequestSchema.safeParse({
      message: 'How do I get to my seat?',
      context: { language: 'en', accessibility: 'none' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.history).toEqual([]);
      expect(result.data.context.location).toBe('');
    }
  });

  it('rejects an unknown language or accessibility value', () => {
    expect(
      chatRequestSchema.safeParse({
        message: 'hi',
        context: { language: 'xx', accessibility: 'none' },
      }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        message: 'hi',
        context: { language: 'en', accessibility: 'flying' },
      }).success,
    ).toBe(false);
  });

  it('rejects an empty or oversized message', () => {
    expect(
      chatRequestSchema.safeParse({
        message: '   ',
        context: { language: 'en', accessibility: 'none' },
      }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        message: 'a'.repeat(1001),
        context: { language: 'en', accessibility: 'none' },
      }).success,
    ).toBe(false);
  });

  it('caps history length', () => {
    const history = Array.from({ length: 21 }, () => ({ role: 'user' as const, content: 'x' }));
    expect(
      chatRequestSchema.safeParse({
        message: 'hi',
        context: { language: 'en', accessibility: 'none' },
        history,
      }).success,
    ).toBe(false);
  });
});

describe('rateLimit', () => {
  beforeEach(() => resetRateLimit());

  it('allows a burst then blocks with a retry hint', () => {
    const now = 1_000_000;
    for (let i = 0; i < 20; i++) {
      expect(rateLimit('1.1.1.1', now).allowed).toBe(true);
    }
    const blocked = rateLimit('1.1.1.1', now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks IPs independently', () => {
    const now = 1_000_000;
    for (let i = 0; i < 20; i++) rateLimit('crowded', now);
    expect(rateLimit('fresh', now).allowed).toBe(true);
  });

  it('frees capacity once the window passes', () => {
    const start = 1_000_000;
    for (let i = 0; i < 20; i++) rateLimit('roamer', start);
    expect(rateLimit('roamer', start).allowed).toBe(false);
    expect(rateLimit('roamer', start + 61_000).allowed).toBe(true);
  });
});

describe('security headers', () => {
  it('sets hardening headers', () => {
    const headers = securityHeaders();
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('no-referrer');
  });

  it('builds a self-only CSP that blocks framing and objects', () => {
    const csp = contentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
});
