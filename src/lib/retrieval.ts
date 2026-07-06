import type {
  Amenity,
  AmenityType,
  Gate,
  Section,
  TransportMode,
  TransportOption,
  Venue,
} from '../features/venue/types';
import type { FanContext } from '../features/context/types';
import { classifyIntent, hasAccessibilityFocus, type Intent } from './intent';

export interface ContextSlice {
  intent: Intent;
  accessibilityFocus: boolean;
  /** Resolved from the fan's saved location, if it names a gate or section. */
  origin?: { kind: 'gate'; gate: Gate } | { kind: 'section'; section: Section };
  sections: Section[];
  gates: Gate[];
  amenities: Amenity[];
  transport: TransportOption[];
}

const MAX_RESULTS = 3;

/** Section ids are 3-digit; only return ids that exist in the venue. */
function extractSectionIds(message: string, venue: Venue): string[] {
  const ids = new Set(venue.sections.map((s) => s.id));
  const found = message.match(/\b\d{3}\b/g) ?? [];
  return [...new Set(found)].filter((id) => ids.has(id));
}

/** Match "gate a", "gate B", "puerta c" → uppercase gate id that exists. */
function extractGateIds(message: string, venue: Venue): string[] {
  const ids = new Set(venue.gates.map((g) => g.id));
  const matches = message.match(/\b(?:gate|puerta|porte|portão|portao)\s+([a-f])\b/gi) ?? [];
  const letters: string[] = [];
  for (const m of matches) {
    const letter = m.trim().split(/\s+/).pop()?.toUpperCase();
    if (letter && ids.has(letter)) letters.push(letter);
  }
  return [...new Set(letters)];
}

function resolveOrigin(context: FanContext, venue: Venue): ContextSlice['origin'] {
  const loc = context.location.trim();
  if (!loc) return undefined;

  const gateId = extractGateIds(loc, venue)[0];
  if (gateId) {
    const gate = venue.gates.find((g) => g.id === gateId);
    if (gate) return { kind: 'gate', gate };
  }

  const sectionId = extractSectionIds(loc, venue)[0];
  if (sectionId) {
    const section = venue.sections.find((s) => s.id === sectionId);
    if (section) return { kind: 'section', section };
  }

  return undefined;
}

/** Keyword → amenity filter (type match or tag match). */
const AMENITY_KEYWORD_MAP: ReadonlyArray<{ keys: string[]; type?: AmenityType; tag?: string }> = [
  { keys: ['halal'], tag: 'halal' },
  { keys: ['vegan'], tag: 'vegan' },
  { keys: ['vegetarian', 'veggie'], tag: 'vegetarian' },
  { keys: ['gluten'], tag: 'gluten-free' },
  { keys: ['kosher'], tag: 'kosher' },
  { keys: ['water', 'refill', 'agua', 'eau', 'água'], type: 'water' },
  { keys: ['restroom', 'toilet', 'bathroom', 'baño', 'toilettes', 'banheiro'], type: 'restroom' },
  { keys: ['first aid', 'first-aid', 'medical', 'nurse', 'médic', 'medic'], type: 'first-aid' },
  { keys: ['family', 'baby', 'nursing', 'diaper', 'stroller', 'pram'], type: 'family' },
  { keys: ['prayer', 'pray', 'oración', 'rezar', 'prière', 'oração'], type: 'prayer' },
  { keys: ['charge', 'charging', 'battery'], type: 'charging' },
  { keys: ['atm', 'cash'], type: 'atm' },
  { keys: ['store', 'shop', 'merch', 'jersey'], type: 'store' },
  { keys: ['lost', 'found', 'information', 'info'], type: 'info' },
  { keys: ['food', 'eat', 'hungry', 'comida', 'nourriture'], type: 'food' },
];

const TRANSPORT_KEYWORD_MAP: ReadonlyArray<{ keys: string[]; mode: TransportMode }> = [
  { keys: ['train', 'rail', 'metro', 'subway', 'tren', 'métro', 'comboio'], mode: 'rail' },
  { keys: ['bus', 'autobús', 'autobus', 'ônibus', 'onibus'], mode: 'bus' },
  { keys: ['shuttle', 'navette'], mode: 'shuttle' },
  { keys: ['taxi', 'uber', 'lyft', 'rideshare', 'ride share'], mode: 'rideshare' },
  { keys: ['parking', 'park', 'estacionamiento', 'stationnement', 'estacionamento'], mode: 'parking' },
  { keys: ['bike', 'cycle', 'vélo', 'velo'], mode: 'bike' },
];

/** Rank helper: matches origin section first, then step-free when needed. */
function proximityRank(
  nearSection: string,
  origin: ContextSlice['origin'],
  venue: Venue,
): number {
  if (!origin) return 2;
  const originSectionId =
    origin.kind === 'section' ? origin.section.id : nearestSectionForGate(origin.gate, venue)?.id;
  if (!originSectionId) return 2;
  if (nearSection === originSectionId) return 0;
  const a = venue.sections.find((s) => s.id === nearSection);
  const b = venue.sections.find((s) => s.id === originSectionId);
  if (a && b && a.side === b.side) return 1;
  return 2;
}

function nearestSectionForGate(gate: Gate, venue: Venue): Section | undefined {
  return venue.sections.find((s) => s.nearestGate === gate.id);
}

function retrieveNavigation(
  message: string,
  venue: Venue,
  accessibilityFocus: boolean,
  origin: ContextSlice['origin'],
): Pick<ContextSlice, 'sections' | 'gates'> {
  const mentioned = extractSectionIds(message, venue);
  let sections = venue.sections.filter((s) => mentioned.includes(s.id));

  if (sections.length === 0 && origin?.kind === 'section') {
    sections = [origin.section];
  }
  if (sections.length === 0) {
    // No specific section — surface a few step-free-friendly examples.
    sections = venue.sections.filter((s) => (accessibilityFocus ? s.stepFreeAccess : true)).slice(0, MAX_RESULTS);
  }

  const gateIds = new Set<string>();
  for (const s of sections) gateIds.add(s.nearestGate);
  for (const g of extractGateIds(message, venue)) gateIds.add(g);
  if (origin?.kind === 'gate') gateIds.add(origin.gate.id);

  const gates = venue.gates.filter((g) => gateIds.has(g.id));
  return { sections, gates };
}

function retrieveAmenities(
  message: string,
  venue: Venue,
  accessibilityFocus: boolean,
  origin: ContextSlice['origin'],
): Amenity[] {
  const text = message.toLowerCase();
  const wantedTypes = new Set<AmenityType>();
  const wantedTags = new Set<string>();

  for (const entry of AMENITY_KEYWORD_MAP) {
    if (entry.keys.some((k) => text.includes(k))) {
      if (entry.type) wantedTypes.add(entry.type);
      if (entry.tag) wantedTags.add(entry.tag);
    }
  }

  let pool = venue.amenities;
  if (wantedTypes.size > 0 || wantedTags.size > 0) {
    pool = venue.amenities.filter(
      (a) => wantedTypes.has(a.type) || a.tags.some((t) => wantedTags.has(t)),
    );
  }
  if (accessibilityFocus) {
    const stepFree = pool.filter((a) => a.stepFree);
    if (stepFree.length > 0) pool = stepFree;
  }

  return [...pool]
    .sort((a, b) => proximityRank(a.nearSection, origin, venue) - proximityRank(b.nearSection, origin, venue))
    .slice(0, MAX_RESULTS);
}

function retrieveTransport(
  message: string,
  venue: Venue,
  accessibilityFocus: boolean,
): TransportOption[] {
  const text = message.toLowerCase();
  const modes = new Set<TransportMode>();
  for (const entry of TRANSPORT_KEYWORD_MAP) {
    if (entry.keys.some((k) => text.includes(k))) modes.add(entry.mode);
  }

  let pool = modes.size > 0 ? venue.transport.filter((t) => modes.has(t.mode)) : venue.transport;
  if (accessibilityFocus) {
    const accessible = pool.filter((t) => t.accessible);
    if (accessible.length > 0) pool = accessible;
  }
  return pool.slice(0, MAX_RESULTS);
}

/**
 * Select the slice of venue data relevant to a fan message. Pure and
 * deterministic so it is fully unit-testable and keeps prompt tokens small.
 */
export function retrieveContext(
  message: string,
  context: FanContext,
  venue: Venue,
): ContextSlice {
  const intent = classifyIntent(message);
  const accessibilityFocus = hasAccessibilityFocus(message, context.accessibility);
  const origin = resolveOrigin(context, venue);

  const slice: ContextSlice = {
    intent,
    accessibilityFocus,
    sections: [],
    gates: [],
    amenities: [],
    transport: [],
  };
  if (origin) slice.origin = origin;

  if (intent === 'navigation') {
    Object.assign(slice, retrieveNavigation(message, venue, accessibilityFocus, origin));
  } else if (intent === 'amenity') {
    slice.amenities = retrieveAmenities(message, venue, accessibilityFocus, origin);
  } else if (intent === 'transport') {
    slice.transport = retrieveTransport(message, venue, accessibilityFocus);
  } else {
    // general — a light overview to orient the fan
    slice.gates = venue.gates.slice(0, 2);
    slice.transport = venue.transport.filter((t) => t.accessible).slice(0, 1);
  }

  return slice;
}
