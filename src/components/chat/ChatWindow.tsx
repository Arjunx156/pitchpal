import { useChatContext } from '../../features/chat/ChatProvider';
import { useFanContext } from '../../features/context/ContextProvider';
import { MessageList } from './MessageList';
import { Composer } from './Composer';

function ModeBadge() {
  const { mode } = useChatContext();
  const { ui } = useFanContext();
  if (mode === 'unknown') return null;
  const map = {
    live: { label: ui.modeLive, color: 'var(--color-live)', live: true },
    mock: { label: ui.modeMock, color: 'var(--color-accent)', live: false },
    offline: { label: ui.offline.badge, color: 'var(--color-text-muted)', live: false },
  } as const;
  const m = map[mode];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.1em]"
      style={{ color: m.color, background: `color-mix(in oklab, ${m.color} 12%, transparent)` }}
    >
      {m.live ? <span className="live-dot" aria-hidden /> : null}
      {m.label}
    </span>
  );
}

export function ChatWindow() {
  const { ui } = useFanContext();
  return (
    <section
      aria-label={ui.assistant}
      className="glass flex h-full min-h-[60vh] flex-col overflow-hidden rounded-2xl lg:min-h-0"
    >
      <header className="flex items-center justify-between gap-2 border-b border-[color-mix(in_oklab,var(--color-border)_70%,transparent)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="hud-eyebrow text-accent">{ui.assistant}</span>
        </div>
        <ModeBadge />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <MessageList />
      </div>

      <div className="border-t border-[color-mix(in_oklab,var(--color-border)_70%,transparent)] p-2">
        <Composer />
      </div>
    </section>
  );
}
