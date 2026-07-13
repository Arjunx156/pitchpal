/// <reference types="vitest/config" />
import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { contentSecurityPolicy } from './server/security';

// Load .env into process.env so the dev API handler runs in live mode when a
// GEMINI_API_KEY is present (Vite does not expose .env to process.env itself).
// Standard dotenv precedence: an explicitly-set environment variable wins over
// the file — this lets e2e force mock mode with GEMINI_API_KEY=''.
const explicitKey = process.env.GEMINI_API_KEY;
try {
  process.loadEnvFile('.env');
} catch {
  /* no .env — dev runs in mock mode */
}
if (explicitKey !== undefined) process.env.GEMINI_API_KEY = explicitKey;

/**
 * Dev-only plugin: mounts the same chat handler used in production so that a
 * single `npm run dev` serves both the UI and the `/api/chat` endpoint. The
 * handler is loaded lazily via Vite's SSR module graph so the Gemini key and
 * server code never leak into the client bundle.
 */
function apiPlugin(): PluginOption {
  return {
    name: 'pitchpal-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/chat')) return next();
        if (req.method !== 'POST') return next();
        server
          .ssrLoadModule('/server/handler.ts')
          .then((mod) => mod.handleChatRequest(req, res))
          .catch((err) => {
            server.config.logger.error(`[api] ${String(err)}`);
            if (!res.headersSent) res.statusCode = 500;
            res.end();
          });
      });
    },
  };
}

/**
 * Build-only plugin: injects a `<meta>` CSP into the built index.html so the
 * app carries a policy even when served by a static host/CDN (or `vite preview`)
 * that doesn't set the server's CSP header. `frame-ancestors` is dropped because
 * it is invalid in a meta CSP (browsers ignore it) — it stays enforced by the
 * Node server. Reusing `contentSecurityPolicy()` keeps the two from drifting.
 * Not applied in dev, where @vitejs/plugin-react injects an inline preamble that
 * `script-src 'self'` would block.
 */
function cspMetaPlugin(): PluginOption {
  return {
    name: 'pitchpal-csp-meta',
    apply: 'build',
    transformIndexHtml() {
      const policy = contentSecurityPolicy()
        .split('; ')
        .filter((directive) => !directive.startsWith('frame-ancestors'))
        .join('; ');
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: policy },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    apiPlugin(),
    cspMetaPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png', 'icons/favicon-64.png'],
      manifest: {
        name: 'PitchPal — Stadium Companion',
        short_name: 'PitchPal',
        description: 'Multilingual, accessible GenAI stadium companion for FIFA World Cup 2026.',
        theme_color: '#070b09',
        background_color: '#070b09',
        display: 'standalone',
        start_url: '/',
        lang: 'en',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Never let the SPA navigation fallback swallow the SSE endpoint.
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173 },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2022',
    rollupOptions: {
      output: {
        // Stable vendor chunks: the app code changes every deploy, the
        // frameworks don't — split them so returning fans hit warm caches.
        // Function form so subpath modules (react/jsx-runtime …) match too.
        manualChunks(id: string) {
          const normalized = id.replace(/\\/g, '/');
          if (!normalized.includes('node_modules')) return undefined;
          if (/\/(react|react-dom|scheduler)\//.test(normalized)) return 'react';
          if (normalized.includes('framer-motion')) return 'motion';
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}', 'server/**/*.ts'],
      exclude: [
        'src/main.tsx',
        'src/**/*.d.ts',
        'server/index.ts',
        'src/i18n/**',
        // Thin presentational primitive (styling only, no behaviour to cover).
        // Button, Dialog, ThemeToggle and LiveRegion carry real runtime roles
        // and are tested, so they stay in the coverage denominator.
        'src/components/ui/Panel.tsx',
        // Type-only modules (interfaces/unions) — no runtime to cover.
        'src/features/chat/types.ts',
        'src/features/venue/types.ts',
        // Browser-only APIs (speech, install prompt) — not exercisable in jsdom.
        'src/features/voice/useSpeechInput.ts',
        'src/features/voice/useSpeechOutput.ts',
        'src/features/pwa/**',
      ],
      // Set just below the achieved coverage (~97% lines, ~84% branches) so a
      // real regression fails CI while normal variance doesn't.
      thresholds: { lines: 95, functions: 85, branches: 82, statements: 95 },
    },
  },
});
