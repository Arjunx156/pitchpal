import { useCallback, useEffect, useState } from 'react';
import type { LanguageCode } from '../context/types';
import { SPEECH_LOCALE } from './locale';

export interface SpeechOutput {
  supported: boolean;
  speaking: boolean;
  speak: (text: string, language: LanguageCode) => void;
  cancel: () => void;
}

function isSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Text-to-speech via the Web Speech API, reading answers aloud in the fan's
 * language. Progressive enhancement — no-ops where unsupported.
 */
export function useSpeechOutput(): SpeechOutput {
  const supported = isSupported();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis?.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, language: LanguageCode) => {
      if (!supported || !text.trim()) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LOCALE[language];
      const match = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith(language));
      if (match) utterance.voice = match;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      synth.speak(utterance);
    },
    [supported],
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { supported, speaking, speak, cancel };
}
