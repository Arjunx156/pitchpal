import { FanContextProvider, useFanContext } from './features/context/ContextProvider';
import { ContextBar } from './components/context-bar/ContextBar';
import { ChatWindow } from './components/chat/ChatWindow';
import { ThemeToggle } from './components/ui/ThemeToggle';
import './styles/app.css';

function Shell() {
  const { ui } = useFanContext();
  return (
    <>
      <a href="#chat-main" className="skip-link">
        {ui.skipToChat}
      </a>
      <div className="app">
        <header className="app__header">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              ⚽
            </span>
            <div>
              <h1 className="brand__title">{ui.title}</h1>
              <p className="brand__tagline">{ui.tagline}</p>
            </div>
          </div>
          <ThemeToggle ui={ui} />
        </header>

        <main className="app__main">
          <ContextBar />
          <div id="chat-main" tabIndex={-1} className="app__chat">
            <ChatWindow />
          </div>
        </main>

        <footer className="app__footer">
          <p>{ui.dataNote}</p>
        </footer>
      </div>
    </>
  );
}

export default function App() {
  return (
    <FanContextProvider>
      <Shell />
    </FanContextProvider>
  );
}
