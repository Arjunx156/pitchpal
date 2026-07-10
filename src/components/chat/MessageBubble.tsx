import { motion } from 'framer-motion';
import { AlertTriangle, RotateCw, Volume2 } from 'lucide-react';
import type { ChatMessage } from '../../features/chat/types';
import { useFanContext } from '../../features/context/ContextProvider';
import { useSpeech } from '../../features/voice/SpeechProvider';
import { CardRenderer } from '../cards/CardRenderer';
import { cn } from '../../lib/utils';

/** Three-dot "typing" indicator shown while the assistant's first tokens land. */
function Typing({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export function MessageBubble({ message, onRetry }: { message: ChatMessage; onRetry?: () => void }) {
  const { ui, context } = useFanContext();
  const { output } = useSpeech();
  const isUser = message.role === 'user';
  const showTyping = message.pending && !message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={cn('flex w-full flex-col gap-1', isUser ? 'items-end' : 'items-start')}
    >
      <span className="hud-eyebrow px-1">{isUser ? ui.you : ui.assistant}</span>

      <div
        className={cn(
          'max-w-[86%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-accent text-on-accent'
            : 'glass rounded-bl-sm text-foreground',
          message.error && 'border border-[color-mix(in_oklab,var(--color-danger)_50%,transparent)]',
        )}
      >
        {message.status && message.pending ? (
          <span className="hud-eyebrow mb-1 block text-accent">{message.status}</span>
        ) : null}

        {showTyping ? (
          <Typing label={ui.thinking} />
        ) : (
          <p className="flex items-start gap-1.5 whitespace-pre-wrap">
            {message.error ? (
              <AlertTriangle
                size={14}
                aria-hidden
                className="mt-0.5 shrink-0 text-[var(--color-danger)]"
              />
            ) : null}
            <span>{message.content}</span>
          </p>
        )}
      </div>

      {/* structured cards */}
      {message.cards && message.cards.length > 0 ? (
        <div className={cn('w-full max-w-[86%]', isUser && 'self-end')}>
          {message.cards.map((card, i) => (
            <CardRenderer key={i} card={card} ui={ui} />
          ))}
        </div>
      ) : null}

      {/* per-message controls (assistant only) */}
      {!isUser && !message.pending ? (
        <div className="flex items-center gap-1 px-1">
          {output.supported && message.content ? (
            <button
              type="button"
              onClick={() => output.speak(message.content, context.language)}
              aria-label={ui.voice.readAloud}
              className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <Volume2 size={14} aria-hidden />
            </button>
          ) : null}
          {message.error && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-accent transition-colors hover:bg-surface-2"
            >
              <RotateCw size={13} aria-hidden />
              {ui.retry}
            </button>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
