# PitchPal ⚽ — Match Day Edition

**A multilingual, accessible GenAI stadium companion for FIFA World Cup 2026 fans.**

_PromptWars Virtual — Challenge 4: Smart Stadiums & Tournament Operations._

PitchPal is a fan-facing assistant that answers wayfinding, amenity, accessibility, and
transport questions **in the fan's own language**, grounded in a structured venue knowledge base
and **live match-day operations**. It pairs a streaming chat with an **interactive stadium map**,
**voice** input/output, a **live ops HUD**, and works **offline** as an installable PWA.

Powered by Google **Gemini** with a deterministic **no-key fallback**, so it runs out of the box.

---

## Chosen vertical: the Fan

Challenge 4 asks for a GenAI solution that improves the stadium experience for one persona.
PitchPal targets the **international fan** — the persona that most directly exercises two graded
criteria (**accessibility** and **multilingual assistance**) and has the clearest real-world use
during a global tournament.

| Capability | Example question | What PitchPal does |
|---|---|---|
| Navigation | _"How do I get to section 205 from Gate B?"_ | Route card **+ the map lights up the path** |
| Accessibility | _"¿Ruta en silla de ruedas a la sección 205?"_ | Step-free route, elevator, warnings — in Spanish |
| Amenities | _"Where's the nearest halal food?"_ | Amenity card, nearest options, hours |
| Transport | _"How do I get downtown after the match?"_ | Accessible-first transport options |
| Live ops | _"How busy is my gate?"_ | Real gate congestion + **reroutes you around jams** |

---

## Signature features

- **🗺️ Interactive stadium map** — an accessible SVG bowl (computed from the venue data) that
  highlights your seat, gates and amenities and **animates the route** when the assistant answers.
  Click any section or gate to ask about it. Fully keyboard- and screen-reader-operable.
- **🎙️ Voice** — ask by speech (speech-to-text in your language) and have answers **read aloud**
  (text-to-speech). Progressive enhancement — hidden where unsupported.
- **📊 Live match-day ops HUD** — kickoff countdown, per-gate congestion + queue times, and
  weather. The assistant **factors congestion into its advice** ("Gate C is busy — use Gate A"),
  grounded into both the live Gemini prompt and the offline composer.
- **📴 PWA + offline** — installable to the home screen, and it **still answers with no signal** by
  running the same deterministic assistant logic on-device.
- **⌘K command palette · quick-action chips · first-run onboarding** — fast, complete UX.
- **🌍 Fully localized** UI + answers in EN / ES / FR / PT / AR, with right-to-left layout for Arabic.

---

## Approach & logic

The intelligence is a small, **deterministic pipeline** that grounds the model instead of letting
it improvise:

```
Fan context (language · accessibility · location)  +  live ops snapshot
        │
        ▼
  1. Classify intent   →  navigation | amenity | transport | general   (src/lib/intent.ts)
  2. Retrieve slice    →  only the relevant gates/sections/amenities,   (src/lib/retrieval.ts)
                          filtered step-free when needed
  3. Ground + reason   →  Gemini prompt with venue + ops facts          (server/prompt.ts)
                          OR the deterministic composer (mock/offline)   (src/lib/compose.ts)
  4. Answer + card     →  prose + a schema-validated action card         (src/lib/cards.ts)
        │
        ▼
  The map derives its highlights from the same pure retrieval — no server round-trip.
```

Why: **grounding, not guessing** keeps answers accurate and tokens (cost) low; the **pure core**
is fully unit-tested and doubles as the offline engine and the map's highlight source.

---

## Getting started

### Prerequisites
- Node.js **20+** (developed on Node 24) · npm

### Run (demo mode — no key needed)
```bash
npm install
npm run dev        # http://localhost:5173  — "Demo mode" badge
```

### Live Gemini responses
```bash
cp .env.example .env      # then set GEMINI_API_KEY=your_key
npm run dev               # badge switches to "Live AI"
```
The key is read **only on the server** and never reaches the browser. `.env` is git-ignored.

### Production & PWA
```bash
npm run build     # → dist/ (also generates the service worker + manifest)
npm start         # serves dist/ + /api/chat on http://localhost:8080
```

### Quality
```bash
npm test          # 113 tests (Vitest + Testing Library + jest-axe)
npm run coverage  # thresholds enforced at 80%
npm run typecheck # strict TypeScript
```

---

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | _(empty)_ | Google Gemini key. Empty → deterministic mock mode. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model for live responses. |
| `PORT` | `8080` | Production server port. |

---

## Deploy (Render)

The app ships as a single Node web service (serves the built SPA **and** the `/api/chat` proxy),
so the Gemini key stays server-side. A [`render.yaml`](./render.yaml) blueprint is included.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Arjunx156/pitchpal)

**Blueprint (recommended):**
1. On [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint** → connect this repo.
2. Render reads `render.yaml`. When prompted, paste your **`GEMINI_API_KEY`** (kept secret, never in git).
3. Deploy. Your app is live at `https://pitchpal.onrender.com` (or similar).

**Manual web service** (equivalent):
- Build command: `npm install --include=dev && npm run build`
- Start command: `npm start`
- Env var: `GEMINI_API_KEY` (optional — omit for the deterministic demo mode)

Notes: the production build bundles the server to `dist-server/index.js` (via esbuild) so runtime
needs no dev tooling. `npm start` binds `0.0.0.0` and honors the platform `PORT`. The **free plan
sleeps after ~15 min idle** and cold-starts on the next request. The same setup works on Railway,
Fly.io, or any Node host; a Dockerfile can be added on request.

---

## Project structure

```
server/            handler · gemini(+mock) · prompt(ops-aware) · security(CSP) · index (prod)
src/
  features/
    context/       fan context provider (language/accessibility/location)
    chat/          streaming useChat (with offline fallback) + ChatProvider
    ops/           deterministic match-day ops simulation (shared client + server)
    map/           map geometry + useMapFocus (both pure)
    voice/         speech input/output hooks + provider (browser APIs)
    theme/         theme provider · pwa/ install prompt · venue/ sample dataset
  lib/             intent · retrieval · compose · cards (the deterministic core)
  components/      chat · cards · map · ops · command · onboarding · quick-actions · ui
  i18n/            UI chrome + answer phrases (EN/ES/FR/PT/AR)
  styles/          design tokens + global + component CSS
tests/             113 tests — unit · components · server
public/icons/      PWA + favicon assets
```

Design system: a **"Match Day" broadcast** direction (charcoal + gold + pitch-green, self-hosted
Bebas Neue + Source Sans 3, Lucide icons) — derived via the `ui-ux-pro-max` design engine. Both
light and dark themes are intentional.

---

## Evaluation criteria

- **Code Quality** — small, feature-oriented modules; strict TypeScript; pure functions for all
  logic; immutable state; shared providers instead of prop-drilling.
- **Security** — Gemini key server-side only; Zod validation; per-IP rate limiting; 64 KB body cap;
  prompt-injection guardrails; restrictive CSP (self-only, incl. `worker-src`/`manifest-src`) +
  hardening headers; path-traversal guard; no `dangerouslySetInnerHTML`.
- **Efficiency** — only the relevant venue slice is grounded into the prompt; streaming; ~85 KB
  gzipped JS; self-hosted subsetted fonts; ops/map computed from pure functions.
- **Testing** — 113 tests across the pure core, the server pipeline (HTTP adapter + mocked Gemini),
  and the React UI (map, ops, palette, onboarding, voice, offline); coverage enforced at 80%.
- **Accessibility** — WCAG 2.2 AA: landmarks, keyboard operation (incl. the SVG map and palette),
  focus management, polite live regions, accessible congestion meters, Arabic RTL,
  `prefers-reduced-motion`, and an automated `jest-axe` check. Content is accessible too
  (step-free routing driven by the fan's profile).

---

## Assumptions & limitations

- **Sample venue + ops data** (`src/features/venue/venue-data.ts`, `src/features/ops/opsFeed.ts`) —
  fictional-but-plausible, clearly labelled, not official FIFA information. Ops runs on a virtual
  140-minute match cycle so the demo is always lively. The shapes mirror real feeds, so going live
  is a data swap, not a rewrite.
- **Voice & install** are progressive enhancements — hidden where the browser lacks the APIs.
- **Rate limiting** is in-memory (per instance); a shared store (Redis) would be the production step.
- Bebas Neue / Source Sans 3 cover Latin scripts; Arabic falls back to a system Arabic font.

## Tech stack

React 18 · TypeScript · Vite · vite-plugin-pwa · Node (native `http`) · Google Gemini
(`@google/genai`) · Zod · Lucide icons · @fontsource · Vitest + Testing Library + jest-axe.

## License

[MIT](./LICENSE)
