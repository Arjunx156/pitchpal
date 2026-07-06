import { z } from 'zod';
import {
  ACCESSIBILITY_PROFILES,
  LANGUAGES,
} from '../src/features/context/types';

/** Validation schema for the POST /api/chat body. Rejects anything unexpected. */
const turnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  context: z.object({
    language: z.enum(LANGUAGES),
    accessibility: z.enum(ACCESSIBILITY_PROFILES),
    location: z.string().max(120).default(''),
  }),
  history: z.array(turnSchema).max(20).default([]),
});

export type ValidatedChatRequest = z.infer<typeof chatRequestSchema>;

/* ------------------------------------------------------------------ */
/* Rate limiting — simple in-memory sliding window (per instance).     */
/* ------------------------------------------------------------------ */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const MAX_TRACKED_IPS = 5_000;

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function rateLimit(ip: string, now: number = Date.now()): RateLimitResult {
  // Opportunistic cap to keep memory bounded on a long-running instance.
  if (hits.size > MAX_TRACKED_IPS) hits.clear();

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    const oldest = recent[0] ?? now;
    return { allowed: false, retryAfterSeconds: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) };
  }

  recent.push(now);
  hits.set(ip, recent);
  return { allowed: true };
}

/** For tests: reset the in-memory limiter. */
export function resetRateLimit(): void {
  hits.clear();
}

/* ------------------------------------------------------------------ */
/* Security headers                                                    */
/* ------------------------------------------------------------------ */

export function securityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
}

/** Restrictive CSP for the app shell — self-hosted assets only. */
export function contentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "font-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join('; ');
}
