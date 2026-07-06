import type { AccessibilityProfile } from '../features/context/types';

/**
 * What the fan is asking for. Intent selects which slice of venue data we
 * ground the model with. Accessibility is deliberately NOT an intent: it is a
 * cross-cutting modifier (see {@link hasAccessibilityFocus}) because a fan can
 * want an accessible *anything* — route, restroom, or shuttle.
 */
export type Intent = 'navigation' | 'amenity' | 'transport' | 'general';

interface IntentRule {
  intent: Intent;
  /** Lowercase substrings; multilingual where the script is shared (es/fr/pt). */
  keywords: string[];
}

const RULES: readonly IntentRule[] = [
  {
    intent: 'transport',
    keywords: [
      'leave', 'depart', 'exit the', 'after the match', 'after the game', 'go home',
      'get home', 'downtown', 'train', 'rail', 'metro', 'subway', 'bus', 'shuttle',
      'parking', 'park ', 'taxi', 'uber', 'lyft', 'rideshare', 'ride share', 'airport',
      'bike', 'cycle',
      // es / fr / pt
      'tren', 'autobús', 'autobus', 'estacionamiento', 'salir', 'centro',
      'gare', 'métro', 'metro', 'sortir', 'navette', 'stationnement',
      'comboio', 'ônibus', 'onibus', 'sair', 'estacionamento',
    ],
  },
  {
    intent: 'amenity',
    keywords: [
      'food', 'eat', 'drink', 'hungry', 'halal', 'vegan', 'vegetarian', 'kosher',
      'gluten', 'water', 'refill', 'toilet', 'restroom', 'bathroom', 'first aid',
      'first-aid', 'medical', 'nurse', 'family', 'baby', 'nursing', 'diaper',
      'prayer', 'pray', 'charge', 'charging', 'battery', 'atm', 'cash', 'store',
      'shop', 'merch', 'jersey', 'lost', 'found', 'information',
      // es / fr / pt
      'comida', 'comer', 'agua', 'baño', 'aseo', 'oración', 'rezar',
      'nourriture', 'manger', 'eau', 'toilettes', 'prière', 'prier',
      'água', 'banheiro', 'oração',
    ],
  },
  {
    intent: 'navigation',
    keywords: [
      'how do i get', 'how to get', 'where is', "where's", 'find my', 'my seat',
      'section', 'seat', 'gate', 'route', 'direction', 'way to', 'get to', 'map',
      'concourse', 'entrance', 'entry', 'block', 'stand',
      // es / fr / pt
      'cómo llego', 'como llego', 'dónde', 'donde', 'asiento', 'puerta', 'sección',
      'comment aller', 'où est', 'ou est', 'siège', 'porte',
      'como chego', 'onde', 'assento', 'portão', 'portao',
    ],
  },
];

const ACCESSIBILITY_KEYWORDS = [
  'accessible', 'accessibility', 'wheelchair', 'step-free', 'step free', 'stepfree',
  'elevator', 'lift', 'ramp', 'disabled', 'disability', 'mobility', 'low vision',
  'low-vision', 'blind', 'visually impaired', 'sensory', 'stroller', 'pram', 'buggy',
  // es / fr / pt
  'silla de ruedas', 'accesible', 'ascensor', 'rampa',
  'fauteuil roulant', 'accessible', 'ascenseur', 'rampe',
  'cadeira de rodas', 'acessível', 'elevador',
];

/** Count how many distinct keywords appear in the text (duplicates ignored). */
function scoreKeywords(text: string, keywords: readonly string[]): number {
  let score = 0;
  const seen = new Set<string>();
  for (const kw of keywords) {
    if (seen.has(kw)) continue;
    seen.add(kw);
    if (text.includes(kw)) score += 1;
  }
  return score;
}

/**
 * Classify a fan message into an intent. Ties are broken by rule order, which
 * is arranged most-specific-first (transport → amenity → navigation).
 */
export function classifyIntent(message: string): Intent {
  const text = message.toLowerCase();
  let best: Intent = 'general';
  let bestScore = 0;

  for (const rule of RULES) {
    const score = scoreKeywords(text, rule.keywords);
    if (score > bestScore) {
      bestScore = score;
      best = rule.intent;
    }
  }

  return best;
}

/**
 * Accessibility is a modifier applied regardless of intent: it is true when the
 * fan's saved profile needs it, or when the message itself mentions access needs.
 */
export function hasAccessibilityFocus(
  message: string,
  profile: AccessibilityProfile,
): boolean {
  if (profile !== 'none') return true;
  const text = message.toLowerCase();
  return scoreKeywords(text, ACCESSIBILITY_KEYWORDS) > 0;
}
