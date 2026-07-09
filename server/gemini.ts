export type GenerationMode = 'live' | 'mock';

export interface AppEnv {
  GEMINI_API_KEY?: string | undefined;
  GEMINI_MODEL?: string | undefined;
  /** Set to '1'/'true' when a trusted proxy fronts the app; enables x-forwarded-for. */
  TRUST_PROXY?: string | undefined;
}

/** Live when a non-empty API key is present, otherwise the offline mock. */
export function resolveMode(env: AppEnv): GenerationMode {
  return env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0 ? 'live' : 'mock';
}

/** Split text into word-ish chunks so mock/offline answers can "stream". */
export function tokenize(text: string): string[] {
  return text.match(/\S+\s*|\s+/g) ?? (text ? [text] : []);
}
