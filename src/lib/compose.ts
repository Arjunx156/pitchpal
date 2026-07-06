import type { ContextSlice } from './retrieval';
import type { AnswerCard } from './cards';
import type { FanContext } from '../features/context/types';
import type { Venue } from '../features/venue/types';
import { ANSWER_PHRASES, fmt, type AnswerPhrases } from '../i18n/answers';

export interface ComposedAnswer {
  text: string;
  card?: AnswerCard;
}

function originLabel(slice: ContextSlice, fallback: string): string | undefined {
  if (!slice.origin) return fallback || undefined;
  return slice.origin.kind === 'gate' ? slice.origin.gate.name : `#${slice.origin.section.id}`;
}

function composeNavigation(
  slice: ContextSlice,
  context: FanContext,
  venue: Venue,
  p: AnswerPhrases,
): ComposedAnswer {
  const target = slice.sections[0];
  if (!target) return composeGeneral(p);

  const gate = venue.gates.find((g) => g.id === target.nearestGate);
  const gateName = gate?.name ?? target.nearestGate;
  const level = p.levels[target.level];
  const side = p.sides[target.side];

  const steps: string[] = [
    fmt(p.enterGate, { gate: gateName }),
    target.hasElevator && slice.accessibilityFocus
      ? fmt(p.elevator, { level })
      : fmt(p.headTo, { level }),
    fmt(p.sectionInfo, { section: target.id, side, min: target.walkMinutes }),
  ];

  const stepFree = target.stepFreeAccess;
  if (slice.accessibilityFocus) {
    steps.push(stepFree ? p.stepFreeYes : p.stepFreeNo);
  }

  const lines = [p.navIntro];
  if (slice.accessibilityFocus && !stepFree) lines.push(p.stepFreeNo);
  const text = lines.join(' ');

  const card: AnswerCard = {
    type: 'route',
    title: fmt(p.navTitle, { section: target.id }),
    toLabel: `#${target.id}`,
    etaMinutes: target.walkMinutes,
    stepFree,
    steps,
  };
  const from = originLabel(slice, context.location);
  if (from) card.fromLabel = from;

  return { text, card };
}

function composeAmenity(slice: ContextSlice, p: AnswerPhrases): ComposedAnswer {
  if (slice.amenities.length === 0) return { text: p.amenityNone };

  const card: AnswerCard = {
    type: 'amenity',
    title: p.amenityTitle,
    items: slice.amenities.map((a) => ({
      name: a.name,
      detail: fmt(p.amenityNear, { section: a.nearSection, level: p.levels[a.level] }),
      stepFree: a.stepFree,
      hours: a.hours,
    })),
  };
  return { text: p.amenityIntro, card };
}

function composeTransport(slice: ContextSlice, p: AnswerPhrases): ComposedAnswer {
  if (slice.transport.length === 0) return composeGeneral(p);

  const card: AnswerCard = {
    type: 'transport',
    title: p.transportTitle,
    options: slice.transport.map((t) => ({
      name: t.name,
      detail: t.description,
      accessible: t.accessible,
      frequency: t.frequency,
    })),
  };
  return { text: p.transportIntro, card };
}

function composeGeneral(p: AnswerPhrases): ComposedAnswer {
  return { text: p.generalIntro };
}

/**
 * Deterministically compose a grounded, localized answer (and optional card)
 * from a retrieved slice. Used by the offline mock so the app is fully usable
 * without an API key, and unit-testable without a network.
 */
export function composeGroundedAnswer(
  slice: ContextSlice,
  context: FanContext,
  venue: Venue,
): ComposedAnswer {
  const p = ANSWER_PHRASES[context.language];
  switch (slice.intent) {
    case 'navigation':
      return composeNavigation(slice, context, venue, p);
    case 'amenity':
      return composeAmenity(slice, p);
    case 'transport':
      return composeTransport(slice, p);
    default:
      return composeGeneral(p);
  }
}
