import type { LanguageCode } from '../context/types';

/** Map our app languages to BCP-47 locales for speech APIs. */
export const SPEECH_LOCALE: Record<LanguageCode, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  pt: 'pt-BR',
  ar: 'ar-SA',
};
