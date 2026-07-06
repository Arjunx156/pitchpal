import { useState, type FormEvent, type KeyboardEvent } from 'react';
import type { UiStrings } from '../../i18n/ui';

interface ComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
  ui: UiStrings;
}

export function Composer({ onSend, disabled, ui }: ComposerProps) {
  const [value, setValue] = useState('');

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

  // Enter sends; Shift+Enter inserts a newline.
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
      <button type="submit" className="composer__send" disabled={disabled || value.trim().length === 0}>
        {ui.send}
      </button>
    </form>
  );
}
