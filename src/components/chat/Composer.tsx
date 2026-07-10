import { useCallback, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { ArrowUp, ImagePlus, Mic, Square } from 'lucide-react';
import { useChatContext } from '../../features/chat/ChatProvider';
import { useFanContext } from '../../features/context/ContextProvider';
import { useSpeechInput } from '../../features/voice/useSpeechInput';
import { cn } from '../../lib/utils';

const MAX_ROWS_PX = 140;

/** Read a File as base64 (no data: prefix) for the multimodal ticket scan. */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function Composer() {
  const { ui, context } = useFanContext();
  const { send, stop, isStreaming } = useChatContext();
  const [value, setValue] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const speech = useSpeechInput(context.language, (text) =>
    setValue((v) => (v ? `${v} ${text}` : text)),
  );

  const grow = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, MAX_ROWS_PX)}px`;
  }, []);

  const submit = useCallback(() => {
    const text = value.trim();
    if (!text || isStreaming) return;
    void send(text);
    setValue('');
    requestAnimationFrame(() => {
      if (taRef.current) taRef.current.style.height = 'auto';
    });
  }, [value, isStreaming, send]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onPickImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || isStreaming) return;
    const data = await fileToBase64(file);
    void send('', { mimeType: file.type, data });
  };

  const iconBtn =
    'grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="glass flex items-end gap-1.5 rounded-2xl p-1.5"
    >
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
      <button
        type="button"
        className={iconBtn}
        aria-label="Scan ticket"
        onClick={() => fileRef.current?.click()}
        disabled={isStreaming}
      >
        <ImagePlus size={18} aria-hidden />
      </button>

      {speech.supported ? (
        <button
          type="button"
          className={cn(iconBtn, speech.listening && 'bg-[color-mix(in_oklab,var(--color-live)_16%,transparent)] text-[var(--color-live)]')}
          aria-label={speech.listening ? ui.voice.stopListening : ui.voice.listen}
          aria-pressed={speech.listening}
          onClick={() => (speech.listening ? speech.stop() : speech.start())}
        >
          <Mic size={18} aria-hidden />
        </button>
      ) : null}

      <label htmlFor="composer-input" className="sr-only">
        {ui.composerLabel}
      </label>
      <textarea
        id="composer-input"
        ref={taRef}
        rows={1}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          grow();
        }}
        onKeyDown={onKeyDown}
        placeholder={ui.composerPlaceholder}
        className="max-h-[140px] flex-1 resize-none self-center bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />

      {isStreaming ? (
        <button
          type="button"
          onClick={stop}
          aria-label={ui.stop}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 text-foreground transition-transform hover:scale-105 active:scale-95"
        >
          <Square size={16} aria-hidden fill="currentColor" />
        </button>
      ) : (
        <button
          type="submit"
          aria-label={ui.send}
          disabled={!value.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-[var(--glow-gold)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <ArrowUp size={18} aria-hidden />
        </button>
      )}
    </form>
  );
}
