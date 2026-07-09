import { useCallback, useEffect, useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { Command, Download, MessagesSquare, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { staggerContainer } from './lib/motion';
import { ThemeProvider } from './features/theme/ThemeProvider';
import { Scoreboard } from './components/scoreboard/Scoreboard';
import { FanContextProvider, useFanContext } from './features/context/ContextProvider';
import { SpeechProvider } from './features/voice/SpeechProvider';
import { ChatProvider } from './features/chat/ChatProvider';
import { useInstallPrompt } from './features/pwa/useInstallPrompt';
import { ContextBar } from './components/context-bar/ContextBar';
import { OpsHud } from './components/ops/OpsHud';
import { CrowdAnalytics } from './components/analytics/CrowdAnalytics';
import { Standings } from './components/standings/Standings';
import { ItineraryPanel } from './components/itinerary/ItineraryPanel';
import { ChatWindow } from './components/chat/ChatWindow';
import { StadiumMap } from './components/map/StadiumMap';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { CommandPalette } from './components/command/CommandPalette';
import { Onboarding } from './components/onboarding/Onboarding';
import { BottomNav, type Surface } from './components/nav/BottomNav';
import { MoreSheet } from './components/nav/MoreSheet';
import './styles/index.css';

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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [view, setView] = useState<Surface>('home');
  const [onboardingOpen, setOnboardingOpen] = useState(() => !hasOnboarded());
  const { canInstall, promptInstall } = useInstallPrompt();

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

  const closeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      /* ignore */
    }
    setOnboardingOpen(false);
  }, []);

  const focusMap = useCallback(() => {
    setView('map');
    requestAnimationFrame(() => document.getElementById('map-heading')?.scrollIntoView({ block: 'nearest' }));
  }, []);

  const openItinerary = useCallback(() => {
    setView('itinerary');
    requestAnimationFrame(() => document.getElementById('itinerary-heading')?.scrollIntoView({ block: 'nearest' }));
  }, []);

  return (
    <>
      <a href="#chat-main" className="skip-link">
        {ui.skipToChat}
      </a>

      <div className="app" data-view={view}>
        <header className="topbar glass-panel">
          <div className="brand">
            <img className="brand__mark" src="/icons/favicon.svg" alt="" width={34} height={34} />
            <span className="brand__title display">{ui.title}</span>
          </div>
          <div className="topbar__actions">
            {canInstall ? (
              <button type="button" className="btn-secondary topbar__install" onClick={() => void promptInstall()}>
                <Download size={16} aria-hidden="true" />
                <span>{ui.install}</span>
              </button>
            ) : null}
            <button
              type="button"
              className="cmdk-btn"
              onClick={() => setPaletteOpen(true)}
              aria-label={ui.commandPalette.open}
            >
              <Command size={15} aria-hidden="true" />
              <kbd>K</kbd>
            </button>
            <ThemeToggle ui={ui} />
          </div>
        </header>

        <Scoreboard />

        <nav className="viewswitch" aria-label={ui.nav.switcherHeading}>
          {(
            [
              { surface: 'home' as const, label: ui.nav.home, icon: LayoutGrid },
              { surface: 'chat' as const, label: ui.nav.chat, icon: MessagesSquare },
              { surface: 'map' as const, label: ui.nav.map, icon: MapIcon },
            ]
          ).map(({ surface, label, icon: Icon }) => (
            <button
              key={surface}
              type="button"
              className={`viewswitch__btn${view === surface ? ' is-active' : ''}`}
              aria-current={view === surface ? 'page' : undefined}
              onClick={() => setView(surface)}
            >
              {view === surface ? (
                <motion.span layoutId="viewswitch-pill" className="viewswitch__pill" aria-hidden="true" />
              ) : null}
              <span className="viewswitch__label">
                <Icon size={16} aria-hidden="true" />
                {label}
              </span>
            </button>
          ))}
        </nav>

        <main className="workspace">
          <motion.aside
            className="rail rail--left"
            aria-label={ui.settingsHeading}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <ContextBar />
            <ItineraryPanel />
            <Standings />
          </motion.aside>
          <div id="chat-main" tabIndex={-1} className="workspace__chat">
            {view === 'home' ? <DashboardHome onOpenItinerary={openItinerary} /> : <ChatWindow />}
          </div>
          <motion.aside
            className="rail rail--right workspace__map"
            aria-label={ui.map.heading}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <StadiumMap />
            <OpsHud />
            <CrowdAnalytics />
          </motion.aside>
        </main>

        <footer className="app__footer">
          <p>{ui.dataNote}</p>
        </footer>
      </div>

      <BottomNav surface={view} onChange={setView} onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onFocusMap={focusMap} />
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
