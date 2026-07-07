import { describe, it, expect } from 'vitest';
import { composeGroundedAnswer } from '../../src/lib/compose';
import { retrieveContext } from '../../src/lib/retrieval';
import { venue } from '../../src/features/venue/venue-data';
import { DEFAULT_CONTEXT, type FanContext } from '../../src/features/context/types';
import { ANSWER_PHRASES } from '../../src/i18n/answers';
import type { OpsSnapshot } from '../../src/features/ops/opsFeed';

const ctx = (over: Partial<FanContext> = {}): FanContext => ({ ...DEFAULT_CONTEXT, ...over });

const jammedOps: OpsSnapshot = {
  now: 0,
  kickoffAt: 0,
  minutesToKickoff: 5,
  phase: 'pre',
  matchClock: null,
  weather: 'clear',
  temperatureC: 22,
  gates: [
    { gateId: 'C', stepFree: true, occupancy: 0.93, queueMinutes: 20, level: 'jam' },
    { gateId: 'A', stepFree: true, occupancy: 0.25, queueMinutes: 5, level: 'ok' },
    { gateId: 'B', stepFree: true, occupancy: 0.4, queueMinutes: 9, level: 'ok' },
    { gateId: 'D', stepFree: false, occupancy: 0.5, queueMinutes: 11, level: 'busy' },
  ],
};

function answerFor(message: string, context: FanContext) {
  const slice = retrieveContext(message, context, venue);
  return composeGroundedAnswer(slice, context, venue);
}

describe('composeGroundedAnswer', () => {
  it('builds a localized route card for a navigation query', () => {
    const context = ctx({ language: 'es' });
    const { text, card } = answerFor('¿Cómo llego a la sección 205?', context);
    expect(text).toBe(ANSWER_PHRASES.es.navIntro);
    expect(card?.type).toBe('route');
    if (card?.type === 'route') {
      expect(card.title).toContain('205');
      expect(card.steps.length).toBeGreaterThanOrEqual(3);
      expect(card.etaMinutes).toBe(8);
    }
  });

  it('warns and marks the card when a section is not step-free for a wheelchair user', () => {
    const context = ctx({ accessibility: 'wheelchair' });
    const { text, card } = answerFor('route to section 120', context);
    expect(text).toContain(ANSWER_PHRASES.en.stepFreeNo);
    if (card?.type === 'route') expect(card.stepFree).toBe(false);
  });

  it('uses the elevator step for a wheelchair user when the section has one', () => {
    const { card } = answerFor('route to section 205', ctx({ accessibility: 'wheelchair' }));
    expect(card?.type).toBe('route');
    if (card?.type === 'route') {
      expect(card.stepFree).toBe(true);
      expect(card.steps.some((s) => s.toLowerCase().includes('elevator'))).toBe(true);
    }
  });

  it('builds an amenity card filtered by dietary tag', () => {
    const { card } = answerFor('where is halal food?', ctx());
    expect(card?.type).toBe('amenity');
    if (card?.type === 'amenity') {
      expect(card.items.some((i) => i.name === 'Crescent Grill')).toBe(true);
    }
  });

  it('builds a transport card', () => {
    const { card } = answerFor('is there a train downtown?', ctx());
    expect(card?.type).toBe('transport');
    if (card?.type === 'transport') {
      expect(card.options.length).toBeGreaterThan(0);
    }
  });

  it('adds a live congestion warning and reroutes to a quieter step-free gate', () => {
    const context = ctx();
    const slice = retrieveContext('how do I get to section 205?', context, venue);
    const { text } = composeGroundedAnswer(slice, context, venue, jammedOps);
    // 205's nearest gate is C (jammed) → warn + suggest the quietest step-free gate (A).
    expect(text).toContain('very busy');
    expect(text).toContain('Gate A');
  });

  it('gives a localized greeting with no card for small talk', () => {
    const context = ctx({ language: 'fr' });
    const { text, card } = answerFor('bonjour', context);
    expect(text).toBe(ANSWER_PHRASES.fr.generalIntro);
    expect(card).toBeUndefined();
  });
});
