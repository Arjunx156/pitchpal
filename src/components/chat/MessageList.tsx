import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessagesSquare } from 'lucide-react';
import { useChatContext } from '../../features/chat/ChatProvider';
import { useFanContext } from '../../features/context/ContextProvider';
import { MessageBubble } from './MessageBubble';

/** Inviting empty state — an empty screen is an invitation to act. */
function EmptyState() {
  const { ui } = useFanContext();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--color-accent)_14%,transparent)] text-accent shadow-[var(--glow-gold)]">
        <MessagesSquare size={26} aria-hidden />
      </span>
      <h2 className="display text-xl text-foreground">{ui.assistant}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{ui.composerPlaceholder}</p>
    </motion.div>
  );
}

export function MessageList() {
  const { messages, retry } = useChatContext();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  if (messages.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-4 px-1 py-2">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onRetry={retry} />
      ))}
      <div ref={endRef} aria-hidden />
    </div>
  );
}
