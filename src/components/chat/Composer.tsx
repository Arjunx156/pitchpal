import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Mic, Send, Square } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import { useSpeechInput } from '../../features/voice/useSpeechInput';

interface ComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function Composer({ onSend, disabled }: ComposerProps) {
  const { context, ui } = useFanContext();
  const [value, setValue] = useState('');
  const speech = useSpeechInput(context.language, (final) => setValue(final));

  // Reflect the interim transcript in the field while listening.
  useEffect(() => {
    if (speech.listening && speech.transcript) setValue(speech.transcript);
  }, [speech.transcript, speech.listening]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <label htmlFor="composer-input" className="visually-hidden">
        {ui.composerLabel}
      </label>
      <textarea
        id="composer-input"
        className="composer__input"
        rows={1}
        value={value}
        maxLength={1000}
        placeholder={ui.composerPlaceholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {speech.supported ? (
        <button
          type="button"
          className={`icon-btn composer__mic${speech.listening ? ' is-live' : ''}`}
          aria-pressed={speech.listening}
          aria-label={speech.listening ? ui.voice.stopListening : ui.voice.listen}
          onClick={() => (speech.listening ? speech.stop() : speech.start())}
        >
          {speech.listening ? <Square size={16} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
        </button>
      ) : null}
      <button type="submit" className="composer__send" disabled={disabled || value.trim().length === 0}>
        <Send size={16} aria-hidden="true" />
        <span>{ui.send}</span>
      </button>
    </form>
  );
}
