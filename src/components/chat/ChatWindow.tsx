import { useEffect, useMemo, useRef } from 'react';
import { WifiOff, Sparkles, FlaskConical } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChatContext } from '../../features/chat/ChatProvider';
import { useSpeech } from '../../features/voice/SpeechProvider';
import { type ChatMode } from '../../features/chat/useChat';
import type { UiStrings } from '../../i18n/ui';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { LiveRegion } from '../ui/LiveRegion';
import { QuickActions } from '../quick-actions/QuickActions';

function ModeBadge({ mode, ui }: { mode: ChatMode; ui: UiStrings }) {
  if (mode === 'unknown') return null;
  if (mode === 'offline') {
    return (
      <span className="mode-badge mode-badge--offline" title={ui.offline.hint}>
        <WifiOff size={13} aria-hidden="true" />
        {ui.offline.badge}
      </span>
    );
  }
  const isMock = mode === 'mock';
  return (
    <span className={`mode-badge mode-badge--${mode}`} title={isMock ? ui.modeMockHint : undefined}>
      {isMock ? <FlaskConical size={13} aria-hidden="true" /> : <Sparkles size={13} aria-hidden="true" />}
      {isMock ? ui.modeMock : ui.modeLive}
    </span>
  );
}

export function ChatWindow() {
  const { context, ui } = useFanContext();
  const { messages, isStreaming, mode, send } = useChatContext();
  const { autoRead, output } = useSpeech();
  const endRef = useRef<HTMLDivElement>(null);
  const spokenRef = useRef<string | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const lastAnswer = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'assistant' && !m.pending),
    [messages],
  );

  // Auto-read completed answers when enabled.
  useEffect(() => {
    if (!autoRead || !lastAnswer || !lastAnswer.content) return;
    if (spokenRef.current === lastAnswer.id) return;
    spokenRef.current = lastAnswer.id;
    output.speak(lastAnswer.content, context.language);
  }, [autoRead, lastAnswer, output, context.language]);

  const liveMessage = isStreaming ? ui.thinking : lastAnswer?.content ?? '';

  return (
    <section className="chat" aria-labelledby="chat-heading">
      <div className="chat__head">
        <h2 id="chat-heading" className="chat__heading display">
          {ui.assistant}
        </h2>
        <ModeBadge mode={mode} ui={ui} />
      </div>

      <div className="chat__scroll">
        {messages.length === 0 ? (
          <div className="chat__welcome">
            <p className="chat__welcome-title display">{ui.tagline}</p>
            <p className="chat__welcome-sub">{ui.suggestionsHeading}</p>
          </div>
        ) : (
          <MessageList messages={messages} ui={ui} />
        )}
        <div ref={endRef} />
      </div>

      <QuickActions />
      <Composer onSend={send} disabled={isStreaming} />
      <LiveRegion message={liveMessage} />
    </section>
  );
}
