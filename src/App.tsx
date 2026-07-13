import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import {
  Command,
  Download,
  LayoutGrid,
  MessagesSquare,
  Map as MapIcon,
  MoreHorizontal,
} from 'lucide-react';
import { ThemeProvider } from './features/theme/ThemeProvider';
import { FanContextProvider, useFanContext } from './features/context/ContextProvider';
import { SpeechProvider } from './features/voice/SpeechProvider';
import { ChatProvider, useChatContext } from './features/chat/ChatProvider';
import { useInstallPrompt } from './features/pwa/useInstallPrompt';
import { Scoreboard } from './components/scoreboard/Scoreboard';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { ChatWindow } from './components/chat/ChatWindow';
import { ContextBar } from './components/context-bar/ContextBar';
import { ItineraryPanel } from './components/itinerary/ItineraryPanel';
import { Standings } from './components/standings/Standings';
import { OpsHud } from './components/ops/OpsHud';
import { StadiumMap } from './components/map/StadiumMap';
import { CommandPalette } from './components/command/CommandPalette';
import { Onboarding } from './components/onboarding/Onboarding';
import { staggerContainer } from './lib/motion';
import { cn } from './lib/utils';

type Surface = 'home' | 'chat' | 'map';

interface NavDef {
  surface: Surface;
  label: string;
  icon: ComponentType<{ size?: number | string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

const ONBOARDED_KEY = 'pitchpal.onboarded';

function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return true;
  }
}

function Shell() {
  const { ui } = useFanContext();
  const { send } = useChatContext();
  const [view, setView] = useState<Surface>('home');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => !hasOnboarded());
  const { canInstall, promptInstall } = useInstallPrompt();

  const ask = useCallback(
    (query: string) => {
      setView('chat');
      void send(query);
    },
    [send],
  );

  const closeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      /* storage unavailable — non-fatal */
    }
    setOnboardingOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navs: NavDef[] = [
    { surface: 'home', label: ui.nav.home, icon: LayoutGrid },
    { surface: 'chat', label: ui.nav.chat, icon: MessagesSquare },
    { surface: 'map', label: ui.nav.map, icon: MapIcon },
  ];

  // Rendered in the triptych center on the map view and in the right rail on
  // the chat view — one element, one set of props.
  const stadiumMap = <StadiumMap onAsk={ask} />;

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

          <nav
            className="viewswitch glass hidden lg:inline-flex"
            aria-label={ui.nav.switcherHeading}
          >
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
                    <motion.span
                      layoutId="viewswitch-pill"
                      className="viewswitch__pill"
                      aria-hidden
                    />
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
            {canInstall ? (
              <button
                type="button"
                onClick={() => void promptInstall()}
                className="hidden h-9 items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--color-accent)_40%,transparent)] px-3 text-xs font-semibold text-accent transition-colors hover:bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] sm:inline-flex"
              >
                <Download size={14} aria-hidden />
                {ui.install}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground sm:inline-flex"
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
            <DashboardHome onAsk={ask} onOpenItinerary={() => setView('chat')} />
          ) : (
            <div className="workspace--triptych">
              <motion.aside
                className="rail rail--left"
                aria-label={ui.settingsHeading}
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                <ContextBar />
                <ItineraryPanel />
              </motion.aside>

              <div className="min-h-[62vh] lg:min-h-0">
                {view === 'chat' ? <ChatWindow /> : stadiumMap}
              </div>

              <motion.aside
                className="rail rail--right"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {view === 'chat' ? stadiumMap : null}
                <OpsHud />
                <Standings />
              </motion.aside>
            </div>
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
        <button
          type="button"
          className="bottom-nav__btn"
          aria-label={ui.commandPalette.open}
          onClick={() => setPaletteOpen(true)}
        >
          <MoreHorizontal size={18} aria-hidden />
          {ui.nav.more}
        </button>
      </nav>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onFocusMap={() => setView('map')}
        onAsk={ask}
      />
      <Onboarding open={onboardingOpen} onClose={closeOnboarding} />
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
