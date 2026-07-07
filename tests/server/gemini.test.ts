import { describe, it, expect } from 'vitest';
import { resolveMode, tokenize } from '../../server/gemini';

describe('resolveMode', () => {
  it('is live only with a non-empty key', () => {
    expect(resolveMode({})).toBe('mock');
    expect(resolveMode({ GEMINI_API_KEY: '   ' })).toBe('mock');
    expect(resolveMode({ GEMINI_API_KEY: 'abc' })).toBe('live');
  });
});

describe('tokenize', () => {
  it('splits into chunks that rejoin to the original text', () => {
    const text = 'Head to Gate C, then take the elevator.';
    expect(tokenize(text).join('')).toBe(text);
    expect(tokenize(text).length).toBeGreaterThan(1);
  });

  it('returns an empty array for empty input', () => {
    expect(tokenize('')).toEqual([]);
  });
});
