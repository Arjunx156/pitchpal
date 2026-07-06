/** The fan context the assistant reasons over. */

export const LANGUAGES = ['en', 'es', 'fr', 'pt', 'ar'] as const;
export type LanguageCode = (typeof LANGUAGES)[number];

export const ACCESSIBILITY_PROFILES = [
  'none',
  'wheelchair',
  'stroller',
  'low-vision',
] as const;
export type AccessibilityProfile = (typeof ACCESSIBILITY_PROFILES)[number];

export interface FanContext {
  language: LanguageCode;
  accessibility: AccessibilityProfile;
  /** Free-form current location, e.g. "Gate B" or "Section 114". Optional. */
  location: string;
}

export const DEFAULT_CONTEXT: FanContext = {
  language: 'en',
  accessibility: 'none',
  location: '',
};

/** Languages that read right-to-left. */
export const RTL_LANGUAGES: ReadonlySet<LanguageCode> = new Set<LanguageCode>(['ar']);

export function isRtl(language: LanguageCode): boolean {
  return RTL_LANGUAGES.has(language);
}
