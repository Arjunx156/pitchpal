import { useState, type ComponentType } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { Command, LayoutGrid, MessagesSquare, Map as MapIcon, MoreHorizontal } from 'lucide-react';
import { ThemeProvider } from './features/theme/ThemeProvider';
import { FanContextProvider, useFanContext } from './features/context/ContextProvider';
import { SpeechProvider } from './features/voice/SpeechProvider';
import { ChatProvider } from './features/chat/ChatProvider';
import { Scoreboard } from './components/scoreboard/Scoreboard';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { Panel } from './components/ui/Panel';
import { staggerContainer } from './lib/motion';
import { cn } from './lib/utils';

type Surface = 'home' | 'chat' | 'map';

interface NavDef {
  surface: Surface;
  label: string;
  icon: ComponentType<{ size?: number | string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

/** Temporary surface placeholder — replaced by real surfaces in the next passes. */
function StagePlaceholder({ title }: { title: string }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-3">
      <Panel eyebrow="Surface" heading={title}>
        <p className="text-sm text-muted-foreground">
          Rebuilding this surface on the broadcast HUD system.
        </p>
      </Panel>
    </motion.div>
  );
}

function Shell() {
  const { ui } = useFanContext();
  const [view, setView] = useState<Surface>('home');

  const navs: NavDef[] = [
    { surface: 'home', label: ui.nav.home, icon: LayoutGrid },
    { surface: 'chat', label: ui.nav.chat, icon: MessagesSquare },
    { surface: 'map', label: ui.nav.map, icon: MapIcon },
  ];

  return (
    <>
      <a href="#stage" className="skip-link">
        {ui.skipToChat}
      </a>

      <div className="app">
        <header className="hud-topbar glass">
          <div className="brand">
            <img className="brand__mark" src="/icons/favicon.svg" alt="" width={30} height={30} />
            <span className="brand__title">{ui.title}</span>
          </div>

          <nav className="viewswitch glass" aria-label={ui.nav.switcherHeading}>
            {navs.map(({ surface, label, icon: Icon }) => {
              const active = view === surface;
              return (
                <button
                  key={surface}
                  type="button"
                  className={cn('viewswitch__btn', active && 'is-active')}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setView(surface)}
                >
                  {active ? (
                    <motion.span layoutId="viewswitch-pill" className="viewswitch__pill" aria-hidden />
                  ) : null}
                  <span className="viewswitch__label">
                    <Icon size={16} aria-hidden />
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="hidden h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              aria-label={ui.commandPalette.open}
            >
              <Command size={14} aria-hidden />
              <kbd className="tabular text-[0.65rem]">K</kbd>
            </button>
            <ThemeToggle ui={ui} />
          </div>
        </header>

        <Scoreboard />

        <main id="stage" tabIndex={-1} className="workspace">
          {view === 'home' ? (
            <StagePlaceholder title={ui.nav.home} />
          ) : view === 'chat' ? (
            <StagePlaceholder title={ui.nav.chat} />
          ) : (
            <StagePlaceholder title={ui.map.heading} />
          )}
        </main>

        <footer className="app__footer">
          <p>{ui.dataNote}</p>
        </footer>
      </div>

      {/* mobile bottom nav */}
      <nav className="bottom-nav glass" aria-label={ui.nav.heading}>
        {navs.map(({ surface, label, icon: Icon }) => (
          <button
            key={surface}
            type="button"
            className={cn('bottom-nav__btn', view === surface && 'is-active')}
            aria-current={view === surface ? 'page' : undefined}
            onClick={() => setView(surface)}
          >
            <Icon size={18} aria-hidden />
            {label}
          </button>
        ))}
        <button type="button" className="bottom-nav__btn" aria-label={ui.nav.more}>
          <MoreHorizontal size={18} aria-hidden />
          {ui.nav.more}
        </button>
      </nav>
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <FanContextProvider>
          <SpeechProvider>
            <ChatProvider>
              <Shell />
            </ChatProvider>
          </SpeechProvider>
        </FanContextProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
