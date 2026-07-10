import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Self-hosted variable fonts (bundled by Vite → same-origin, satisfies CSP).
// Archivo + Martian Mono ship a width axis for the expanded broadcast look.
import '@fontsource-variable/archivo/standard.css';
import '@fontsource-variable/hanken-grotesk/wght.css';
import '@fontsource-variable/martian-mono/standard.css';
// Arabic coverage for the multilingual assistant.
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';

import './styles/tokens.css';
import './styles/tailwind.css'; // @tailwind base + components
import './styles/base.css'; // our resets/atmosphere (override preflight)
import './styles/hud.css'; // broadcast component classes
import './styles/tailwind-utilities.css'; // @tailwind utilities — LAST so utilities win

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
