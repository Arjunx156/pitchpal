import { createContext, useContext, useState, type ReactNode } from 'react';
import { useSpeechOutput, type SpeechOutput } from './useSpeechOutput';

interface SpeechValue {
  output: SpeechOutput;
  autoRead: boolean;
  toggleAutoRead: () => void;
}

const Ctx = createContext<SpeechValue | null>(null);

/** Shares one text-to-speech engine and the auto-read preference app-wide. */
export function SpeechProvider({ children }: { children: ReactNode }) {
  const output = useSpeechOutput();
  const [autoRead, setAutoRead] = useState(false);
  return (
    <Ctx.Provider value={{ output, autoRead, toggleAutoRead: () => setAutoRead((v) => !v) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSpeech(): SpeechValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useSpeech must be used within a SpeechProvider');
  return value;
}
