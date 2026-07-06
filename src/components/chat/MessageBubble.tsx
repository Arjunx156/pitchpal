import type { ChatMessage } from '../../features/chat/types';
import type { UiStrings } from '../../i18n/ui';
import { CardRenderer } from '../cards/CardRenderer';

export function MessageBubble({ message, ui }: { message: ChatMessage; ui: UiStrings }) {
  const speaker = message.role === 'user' ? ui.you : ui.assistant;
  const showTyping = message.pending && message.content.length === 0;

  return (
    <li className={`bubble bubble--${message.role}${message.error ? ' bubble--error' : ''}`}>
      <span className="bubble__speaker">{speaker}</span>
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
