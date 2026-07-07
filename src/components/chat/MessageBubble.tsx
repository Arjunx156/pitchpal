import { Volume2 } from 'lucide-react';
import type { ChatMessage } from '../../features/chat/types';
import { useFanContext } from '../../features/context/ContextProvider';
import { useSpeech } from '../../features/voice/SpeechProvider';
import type { UiStrings } from '../../i18n/ui';
import { CardRenderer } from '../cards/CardRenderer';

export function MessageBubble({ message, ui }: { message: ChatMessage; ui: UiStrings }) {
  const { context } = useFanContext();
  const { output } = useSpeech();
  const speaker = message.role === 'user' ? ui.you : ui.assistant;
  const showTyping = message.pending && message.content.length === 0;
  const canRead =
    output.supported && message.role === 'assistant' && !message.pending && message.content.length > 0;

  return (
    <li className={`bubble bubble--${message.role}${message.error ? ' bubble--error' : ''}`}>
      <span className="bubble__speaker">
        {speaker}
        {canRead ? (
          <button
            type="button"
            className="bubble__read"
            aria-label={ui.voice.readAloud}
            onClick={() => output.speak(message.content, context.language)}
          >
            <Volume2 size={14} aria-hidden="true" />
          </button>
        ) : null}
      </span>
      {message.content ? <p className="bubble__text">{message.content}</p> : null}
      {showTyping ? (
        <p className="bubble__typing" aria-label={ui.thinking}>
          <span className="dot" aria-hidden="true" />
          <span className="dot" aria-hidden="true" />
          <span className="dot" aria-hidden="true" />
        </p>
      ) : null}
      {message.card ? <CardRenderer card={message.card} ui={ui} /> : null}
    </li>
  );
}
