import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleChatRequest } from './handler';
import { contentSecurityPolicy, securityHeaders } from './security';

// Load .env if present; absence just means mock mode.
try {
  process.loadEnvFile('.env');
} catch {
  /* no .env file — run in mock mode */
}

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT) || 8080;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

async function serveStatic(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const urlPath = decodeURIComponent(((req.url ?? '/').split('?')[0] ?? '/'));
  let filePath = join(DIST, normalize(urlPath));

  // Path-traversal guard: never serve outside DIST.
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403, securityHeaders());
    res.end('Forbidden');
    return;
  }

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    filePath = join(DIST, 'index.html'); // SPA fallback
  }

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    const headers: Record<string, string> = {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      ...securityHeaders(),
    };
    if (ext === '.html') headers['Content-Security-Policy'] = contentSecurityPolicy();
    res.writeHead(200, headers);
    res.end(data);
  } catch {
    res.writeHead(404, securityHeaders());
    res.end('Not found');
  }
}

const server = createServer((req, res) => {
  if (req.url?.startsWith('/api/chat')) {
    if (req.method !== 'POST') {
      res.writeHead(405, securityHeaders());
      res.end();
      return;
    }
    handleChatRequest(req, res).catch((err) => {
      console.error('[server] handler error:', err);
      if (!res.headersSent) res.writeHead(500, securityHeaders());
      res.end();
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, securityHeaders());
    res.end();
    return;
  }
  void serveStatic(req, res);
});

server.listen(PORT, () => {
  const mode = process.env.GEMINI_API_KEY ? 'live (Gemini)' : 'mock';
  console.log(`PitchPal running at http://localhost:${PORT}  —  mode: ${mode}`);
});
