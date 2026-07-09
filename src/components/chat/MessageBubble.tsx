import { motion } from 'framer-motion';
import { Loader2, RotateCcw, Volume2 } from 'lucide-react';
import type { ChatMessage } from '../../features/chat/types';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChatContext } from '../../features/chat/ChatProvider';
import { useSpeech } from '../../features/voice/SpeechProvider';
import { TOOL_STATUS, type UiStrings } from '../../i18n/ui';
import { CardRenderer } from '../cards/CardRenderer';

export function MessageBubble({ message, ui }: { message: ChatMessage; ui: UiStrings }) {
  const { context } = useFanContext();
  const { retry, isStreaming } = useChatContext();
  const { output } = useSpeech();
  const speaker = message.role === 'user' ? ui.you : ui.assistant;
  const toolLabel =
    message.pending && message.status ? TOOL_STATUS[context.language]?.[message.status] : undefined;
  const showTyping = message.pending && message.content.length === 0 && !toolLabel;
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
      {toolLabel ? (
        <p className="bubble__tool" aria-live="polite">
          <Loader2 className="bubble__tool-spin" size={14} aria-hidden="true" />
          {toolLabel}
        </p>
      ) : null}
      {message.content ? <p className="bubble__text">{message.content}</p> : null}
      {message.error && !isStreaming ? (
        <button type="button" className="bubble__retry" onClick={retry}>
          <RotateCcw size={13} aria-hidden="true" />
          {ui.retry}
        </button>
      ) : null}
      {showTyping ? (
        <p className="bubble__typing" aria-label={ui.thinking}>
          <span className="dot" aria-hidden="true" />
          <span className="dot" aria-hidden="true" />
          <span className="dot" aria-hidden="true" />
        </p>
      ) : null}
      {message.cards?.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 26 }}
        >
          <CardRenderer card={card} ui={ui} />
        </motion.div>
      ))}
    </li>
  );
}
