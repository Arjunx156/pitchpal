import { describe, it, expect } from 'vitest';
import { classifyIntent, hasAccessibilityFocus } from '../../src/lib/intent';

describe('classifyIntent', () => {
  it('classifies wayfinding questions as navigation', () => {
    expect(classifyIntent('How do I get to seat 205 from gate B?')).toBe('navigation');
    expect(classifyIntent('Where is my section 114?')).toBe('navigation');
  });

  it('classifies food/facility questions as amenity, even when a section is named', () => {
    expect(classifyIntent("Where's the nearest halal food near section 114?")).toBe('amenity');
    expect(classifyIntent('I need a water refill')).toBe('amenity');
    expect(classifyIntent('Where is the prayer room?')).toBe('amenity');
  });

  it('classifies leaving-the-stadium questions as transport', () => {
    expect(classifyIntent('How do I get downtown after the match?')).toBe('transport');
    expect(classifyIntent('Is there a train to the airport?')).toBe('transport');
  });

  it('falls back to general for small talk', () => {
    expect(classifyIntent('Hello there!')).toBe('general');
    expect(classifyIntent('Thanks for your help')).toBe('general');
  });

  it('handles common Spanish phrasing', () => {
    expect(classifyIntent('¿Cómo llego a mi asiento 205?')).toBe('navigation');
    expect(classifyIntent('¿Dónde puedo comer comida halal?')).toBe('amenity');
  });
});

describe('hasAccessibilityFocus', () => {
  it('is true when the saved profile needs it, regardless of message', () => {
    expect(hasAccessibilityFocus('where is food', 'wheelchair')).toBe(true);
    expect(hasAccessibilityFocus('where is food', 'stroller')).toBe(true);
  });

  it('is true when the message mentions access needs', () => {
    expect(hasAccessibilityFocus('step-free route to my seat', 'none')).toBe(true);
    expect(hasAccessibilityFocus('is there an elevator?', 'none')).toBe(true);
  });

  it('is false for a plain message with no profile', () => {
    expect(hasAccessibilityFocus('where is the nearest food', 'none')).toBe(false);
  });
});
