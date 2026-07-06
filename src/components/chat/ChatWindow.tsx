import { useEffect, useMemo, useRef } from 'react';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChat, type ChatMode } from '../../features/chat/useChat';
import type { UiStrings } from '../../i18n/ui';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { LiveRegion } from '../ui/LiveRegion';

function ModeBadge({ mode, ui }: { mode: ChatMode; ui: UiStrings }) {
  if (mode === 'unknown') return null;
  const isMock = mode === 'mock';
  return (
    <span
      className={`mode-badge mode-badge--${mode}`}
      title={isMock ? ui.modeMockHint : undefined}
    >
      <span className="mode-badge__dot" aria-hidden="true" />
      {isMock ? ui.modeMock : ui.modeLive}
    </span>
  );
}

function Suggestions({ ui, onPick }: { ui: UiStrings; onPick: (text: string) => void }) {
  return (
    <div className="suggestions">
      <p className="suggestions__heading">{ui.suggestionsHeading}</p>
      <ul className="suggestions__list">
        {ui.suggestions.map((suggestion, i) => (
          <li key={i}>
            <button type="button" className="suggestion" onClick={() => onPick(suggestion)}>
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChatWindow() {
  const { context, ui } = useFanContext();
  const { messages, isStreaming, mode, send } = useChat(context, ui.errorGeneric);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const liveMessage = useMemo(() => {
    if (isStreaming) return ui.thinking;
    const last = messages[messages.length - 1];
    return last && last.role === 'assistant' && !last.pending ? last.content : '';
  }, [messages, isStreaming, ui.thinking]);

  return (
    <section className="chat" aria-labelledby="chat-heading">
      <div className="chat__head">
        <h2 id="chat-heading" className="chat__heading">
          {ui.assistant}
        </h2>
        <ModeBadge mode={mode} ui={ui} />
      </div>

      <div className="chat__scroll">
        {messages.length === 0 ? (
          <Suggestions ui={ui} onPick={send} />
        ) : (
          <MessageList messages={messages} ui={ui} />
        )}
        <div ref={endRef} />
      </div>

      <Composer onSend={send} disabled={isStreaming} ui={ui} />
      <LiveRegion message={liveMessage} />
    </section>
  );
}
