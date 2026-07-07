import { useCallback, useEffect, useRef, useState } from 'react';
import type { LanguageCode } from '../context/types';
import { SPEECH_LOCALE } from './locale';

export interface SpeechInput {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

function getConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

/**
 * Speech-to-text via the Web Speech API, localized to the fan's language.
 * Progressive enhancement: `supported` is false where the API is unavailable
 * and every method becomes a safe no-op.
 */
export function useSpeechInput(
  language: LanguageCode,
  onFinal?: (text: string) => void,
): SpeechInput {
  const Ctor = getConstructor();
  const supported = Boolean(Ctor);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const start = useCallback(() => {
    if (!Ctor || listening) return;
    const recognition = new Ctor();
    recognition.lang = SPEECH_LOCALE[language];
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setError(null);
      setListening(true);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) final += text;
        else interim += text;
      }
      setTranscript(final || interim);
      if (final && onFinalRef.current) onFinalRef.current(final.trim());
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      /* already started */
    }
  }, [Ctor, language, listening]);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);
  const reset = useCallback(() => setTranscript(''), []);

  return { supported, listening, transcript, error, start, stop, reset };
}
