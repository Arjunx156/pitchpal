import { describe, it, expect } from 'vitest';
import { parseAnswerCard } from '../../src/lib/cards';

describe('parseAnswerCard', () => {
  it('extracts a valid route card and strips it from the prose', () => {
    const raw = [
      'Head to Gate C and take the elevator.',
      '```card',
      '{"type":"route","title":"To section 205","etaMinutes":8,"stepFree":true,"steps":["Enter at Gate C","Take the elevator to the club level"]}',
      '```',
    ].join('\n');

    const { text, card } = parseAnswerCard(raw);
    expect(text).toBe('Head to Gate C and take the elevator.');
    expect(card).toBeDefined();
    expect(card?.type).toBe('route');
    if (card?.type === 'route') {
      expect(card.steps).toHaveLength(2);
      expect(card.etaMinutes).toBe(8);
    }
  });

  it('accepts a json-fenced block too', () => {
    const raw = 'Options nearby:\n```json\n{"type":"amenity","title":"Food","items":[{"name":"Crescent Grill"}]}\n```';
    const { card } = parseAnswerCard(raw);
    expect(card?.type).toBe('amenity');
  });

  it('returns plain text with no card when there is no block', () => {
    const { text, card } = parseAnswerCard('  Just a friendly hello.  ');
    expect(text).toBe('Just a friendly hello.');
    expect(card).toBeUndefined();
  });

  it('never throws on malformed JSON — falls back to prose', () => {
    const raw = 'Here you go.\n```card\n{ not valid json ]\n```';
    const { text, card } = parseAnswerCard(raw);
    expect(text).toBe('Here you go.');
    expect(card).toBeUndefined();
  });

  it('rejects a structurally invalid card via schema validation', () => {
    const raw = 'Directions.\n```card\n{"type":"route","title":"x"}\n```';
    const { text, card } = parseAnswerCard(raw);
    expect(text).toBe('Directions.');
    expect(card).toBeUndefined();
  });
});
