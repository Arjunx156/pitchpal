/// <reference types="vitest/config" />
import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';

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

export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: { port: 5173 },
  build: { outDir: 'dist', sourcemap: false, target: 'es2022' },
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
        // Type-only modules (interfaces/unions) — no runtime to cover.
        'src/features/chat/types.ts',
        'src/features/venue/types.ts',
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
