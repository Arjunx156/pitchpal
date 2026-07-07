import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Command, Download, MessagesSquare, Map as MapIcon } from 'lucide-react';
import { ThemeProvider } from './features/theme/ThemeProvider';
import { Scoreboard } from './components/scoreboard/Scoreboard';
import { FanContextProvider, useFanContext } from './features/context/ContextProvider';
import { SpeechProvider } from './features/voice/SpeechProvider';
import { ChatProvider } from './features/chat/ChatProvider';
import { useInstallPrompt } from './features/pwa/useInstallPrompt';
import { ContextBar } from './components/context-bar/ContextBar';
import { OpsHud } from './components/ops/OpsHud';
import { CrowdAnalytics } from './components/analytics/CrowdAnalytics';
import { ChatWindow } from './components/chat/ChatWindow';
import { StadiumMap } from './components/map/StadiumMap';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { CommandPalette } from './components/command/CommandPalette';
import { Onboarding } from './components/onboarding/Onboarding';
import './styles/app.css';

const ONBOARDED_KEY = 'pitchpal.onboarded';

function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return true;
  }
}

type View = 'chat' | 'map';

function Shell() {
  const { ui } = useFanContext();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [view, setView] = useState<View>('chat');
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

  return (
    <>
      <a href="#chat-main" className="skip-link">
        {ui.skipToChat}
      </a>

      <div className="app" data-view={view}>
        <header className="topbar">
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

        <nav className="viewswitch" aria-label={ui.map.heading}>
          <button
            type="button"
            className={`viewswitch__btn${view === 'chat' ? ' is-active' : ''}`}
            aria-pressed={view === 'chat'}
            onClick={() => setView('chat')}
          >
            <MessagesSquare size={16} aria-hidden="true" />
            {ui.map.tabChat}
          </button>
          <button
            type="button"
            className={`viewswitch__btn${view === 'map' ? ' is-active' : ''}`}
            aria-pressed={view === 'map'}
            onClick={() => setView('map')}
          >
            <MapIcon size={16} aria-hidden="true" />
            {ui.map.tabMap}
          </button>
        </nav>

        <main className="workspace">
          <div className="rail">
            <ContextBar />
            <OpsHud />
            <CrowdAnalytics />
          </div>
          <div id="chat-main" tabIndex={-1} className="workspace__chat">
            <ChatWindow />
          </div>
          <div className="workspace__map">
            <StadiumMap />
          </div>
        </main>

        <footer className="app__footer">
          <p>{ui.dataNote}</p>
        </footer>
      </div>

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
