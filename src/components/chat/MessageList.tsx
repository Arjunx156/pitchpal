import type { ChatMessage } from '../../features/chat/types';
import type { UiStrings } from '../../i18n/ui';
import { MessageBubble } from './MessageBubble';

export function MessageList({ messages, ui }: { messages: ChatMessage[]; ui: UiStrings }) {
  return (
    // aria-live is off here; a dedicated LiveRegion announces the final answer,
    // avoiding token-by-token screen-reader spam during streaming.
    <ul className="messages" role="log" aria-label={ui.assistant} aria-live="off">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} ui={ui} />
      ))}
    </ul>
  );
}
