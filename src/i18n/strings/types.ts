import type { AccessibilityProfile } from '../../features/context/types';

/** UI chrome strings, fully localized so the interface matches the fan's language. */
export interface QuickAction {
  label: string;
  query: string;
}

export interface UiStrings {
  title: string;
  tagline: string;
  skipToChat: string;
  settingsHeading: string;
  languageLabel: string;
  accessibilityLabel: string;
  accessibility: Record<AccessibilityProfile, string>;
  locationLabel: string;
  locationPlaceholder: string;
  matchLabel: string;
  suggestionsHeading: string;
  composerLabel: string;
  composerPlaceholder: string;
  /** Shown when a picked ticket image is the wrong type or too large. Uses {max}. */
  composerImageError: string;
  send: string;
  you: string;
  assistant: string;
  thinking: string;
  modeMock: string;
  modeLive: string;
  modeMockHint: string;
  /** Screen-reader announcement on mode change; {mode} is the localized mode label. */
  modeAnnouncement: string;
  errorGeneric: string;
  retry: string;
  stop: string;
  install: string;
  card: {
    from: string;
    to: string;
    walk: string; // uses {min}
    stepFree: string;
    notStepFree: string;
    accessible: string;
    hours: string;
    frequency: string;
  };
  theme: { label: string; system: string; light: string; dark: string };
  offline: { badge: string; hint: string };
  voice: { listen: string; stopListening: string; readAloud: string; stopReading: string };
  ops: {
    heading: string;
    preMatch: string;
    live: string;
    postMatch: string;
    gatesHeading: string;
    gate: string;
    queue: string; // {min}
    weather: string;
    weatherClear: string;
    weatherCloudy: string;
    weatherRain: string;
    quiet: string;
    busy: string;
    packed: string;
  };
  map: {
    heading: string;
    tabChat: string;
    tabMap: string;
    legendGate: string;
    legendSeat: string;
    legendAmenity: string;
    legendRoute: string;
    summaryIdle: string;
    summaryRoute: string; // {from} {to}
    focus: string;
    askSection: string; // {id}
    askGate: string; // {id}
  };
  quickActions: {
    heading: string;
    seat: QuickAction;
    food: QuickAction;
    restroom: QuickAction;
    accessible: QuickAction;
    leave: QuickAction;
    firstAid: QuickAction;
    score: QuickAction;
  };
  commandPalette: {
    open: string;
    placeholder: string;
    empty: string;
    groupAsk: string;
    groupSettings: string;
    changeLanguage: string;
    toggleTheme: string;
    toggleReadAloud: string;
    focusMap: string;
  };
  onboarding: {
    title: string;
    subtitle: string;
    stepLanguage: string;
    stepAccess: string;
    stepSeat: string;
    next: string;
    back: string;
    finish: string;
    skip: string;
    step: string; // {n} {total}
  };
  dataNote: string;
  standings: {
    heading: string;
    played: string;
    points: string;
  };
  nav: {
    heading: string;
    switcherHeading: string;
    home: string;
    chat: string;
    map: string;
    itinerary: string;
    more: string;
  };
  dashboard: {
    heading: string;
    heroLabel: string;
    riskHeading: string;
    suggestedHeading: string;
    /** Eyebrow above the suggestions panel. */
    forYou: string;
    /** Heading of the itinerary preview tile. */
    nextUp: string;
    seeAll: string;
  };
  /** Eyebrow above the fan-context panel. */
  settingsEyebrow: string;
  risk: {
    heading: string;
    rising: string;
    falling: string;
    steady: string;
    rerouteAsk: string; // {gate}
    rerouteCta: string;
    projectedIn: string; // {min}
  };
  suggestions: {
    kickoffSoonReason: string;
    kickoffSoonQuery: string;
    gateJamReason: string; // {gate}
    postMatchReason: string;
    postMatchQuery: string;
    accessibleRouteReason: string;
  };
}

export interface ScanStrings {
  button: string;
  query: string;
  invalid: string;
  scanning: string;
  hint: string;
  retake: string;
  use: string;
  cancel: string;
}

export interface ItineraryStrings {
  heading: string;
  arrive: string;
  gate: string; // {id}
  seat: string;
  kickoff: string;
  halftime: string;
  leave: string; // {transport}
  alertsEnable: string;
  alertsOn: string;
  alertsUnsupported: string;
  alertTitle: string;
  alertBody: string; // {gate}
  reorderHint: string;
  addStep: string;
  removeStep: string;
  dragHandleLabel: string; // {step}
  reminderToggle: string; // {step}
  reminderOn: string; // {step}
  moveEarlier: string; // {step}
  moveLater: string; // {step}
}

export interface AnalyticsStrings {
  heading: string;
  heatmap: string;
  crowd: string;
  queue: string; // {gate}
  low: string;
  medium: string;
  high: string;
  crowdSummary: string; // {pct}
  queueSummary: string; // {gate} {min}
}
