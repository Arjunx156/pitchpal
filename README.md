# PitchPal ⚽ — Match Day Edition

**A multilingual, accessible GenAI stadium companion for FIFA World Cup 2026 fans.**

_PromptWars Virtual — Challenge 4: Smart Stadiums & Tournament Operations._

PitchPal is a fan-facing assistant that answers wayfinding, amenity, accessibility, and
transport questions **in the fan's own language**, grounded in a structured venue knowledge base
and **live match-day operations**, across **four host venues and matches** the fan can switch
between. It pairs a streaming chat with an **interactive stadium map + crowd heatmap**, **voice**
input/output, a **live ops HUD + analytics strip**, a **"My Match Day" itinerary with on-device gate
alerts**, and works **offline** as an installable PWA.

The assistant is **agentic**: Google **Gemini** drives a **function-calling** loop over a typed tool
registry (route planning, amenities, transport, live gate status, sustainability, accessibility
service booking, ticket reading), and can **read a photo of your ticket** (multimodal) to auto-find
your seat. A deterministic **no-key fallback** runs the exact same tools, so everything works out of
the box and offline.

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

- **🤖 Agentic tool-calling** — Gemini decides which typed tools to call (`planRoute`,
  `findAmenities`, `getTransport`, `getGateStatus`, `getSustainability`,
  `bookAccessibilityService`, `setFanTicket`), the server runs them against the pure core, and
  structured **cards** stream back from tool results — the UI even shows the live tool it's running
  ("Planning your route…"). The same tools power the mock and offline paths.
- **🎫 Scan your ticket (multimodal)** — snap or upload a photo of your ticket; Gemini reads the
  section, seat and gate and auto-fills your context to route you.
- **🏟️ Multi-venue + fixtures** — 4 representative host venues and matches with a **match picker**;
  switching match swaps the venue, ops cycle, scoreboard, map and group **standings** together.
- **🗓️ "My Match Day" itinerary** — a deterministic timeline (arrive → gate → seat → kickoff →
  half-time → leave, with a green-transport suggestion) plus an opt-in **on-device notification**
  that fires once your gate gets congested.
- **🗺️ Interactive stadium map + crowd heatmap** — an accessible SVG bowl (computed from the venue
  data) that highlights your seat, gates and amenities, **animates the route** when the assistant
  answers, and can overlay a live per-section **density heatmap**. Click any section or gate to ask
  about it. Fully keyboard- and screen-reader-operable.
- **📈 Analytics strip** — accessible SVG sparklines (crowd trend, busiest-gate queue trend) with
  text-equivalent summaries, no chart library.
- **🌱 Sustainability + ♿ accessibility services** — a green-route recommendation with CO₂ estimates
  per transport option, and a bookable-service flow (wheelchair assist, sensory room, meeting point).
- **🎙️ Voice** — ask by speech (speech-to-text in your language) and have answers **read aloud**
  (text-to-speech). Progressive enhancement — hidden where unsupported.
- **📊 Live match-day ops HUD** — kickoff countdown, per-gate congestion + queue times, and
  weather. The assistant **factors congestion into its advice** ("Gate C is busy — use Gate A"),
  grounded into both the live Gemini prompt and the offline composer.
- **📴 PWA + offline** — installable to the home screen, and it **still answers with no signal** by
  running the same deterministic assistant logic on-device.
- **⌘K command palette · quick-action chips · first-run onboarding** — fast, complete UX, with
  Framer Motion micro-interactions (card entrance, palette open/close, chip press feedback).
- **🌍 Fully localized** UI + answers in EN / ES / FR / PT / AR, with right-to-left layout for Arabic.

---

## Approach & logic

The intelligence is a small, **deterministic pipeline** that grounds the model instead of letting
it improvise:

```
Fan context (language · accessibility · location · ticket · selected match)
  +  resolved venue (from the match's venueId)  +  live ops snapshot
        │
        ▼
  LIVE:  Gemini function-calling loop  (server/agent.ts)
         model → picks tool(s) → server runs them (src/lib/tools-core.ts) → cards + summary
         → model composes a short reply.   Tools: planRoute · findAmenities · getTransport
         · getGateStatus · getSustainability · bookAccessibilityService · setFanTicket (reads
         a ticket photo).
  MOCK / OFFLINE:  deterministic router (answerOffline) runs the SAME tools → identical events.
        │
        ▼
  Structured SSE:  status · tool_result(card) · token · context-patch · done
        │
        ▼
  The map, heatmap, analytics, scoreboard, standings and itinerary all derive from the same
  pure retrieval/ops functions — no server round-trip beyond the chat call itself.
```

Why: the **tools are one pure implementation** reused by the live agent, the mock, and the offline
engine — so behaviour is identical everywhere and fully unit-tested; **cards come from tool results**
(reliable), not parsed from prose.

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
npm test          # 144 tests (Vitest + Testing Library + jest-axe)
npm run coverage  # thresholds enforced at 80% (currently ~96% statements)
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
server/            handler · agent(Gemini function-calling) · tools(declarations) · gemini(+mock)
                    · prompt(ops-aware) · security(CSP/Zod) · index (prod)
src/
  features/
    context/       fan context provider (language/accessibility/location/selected match)
    chat/          streaming useChat (with offline fallback) + ChatProvider
    ops/           deterministic match-day ops simulation (shared client + server)
    map/           map geometry + useMapFocus (both pure)
    tournament/    fixtures (4 matches), group standings, live scoreline
    itinerary/     "My Match Day" timeline builder (pure)
    notifications/ on-device gate-jam alert hook (Notification API)
    voice/         speech input/output hooks + provider (browser APIs)
    theme/         theme provider · pwa/ install prompt
    venue/         venues/ registry (4 host venues) + sample dataset per venue
  lib/             intent · retrieval · compose · cards · tools-core (the deterministic core)
  components/      chat · cards · map · ops · scoreboard · standings · itinerary · analytics ·
                   charts · ticket-scan · command · onboarding · quick-actions · ui (shadcn)
  i18n/            UI chrome + answer phrases (EN/ES/FR/PT/AR)
  styles/          Tailwind + design tokens + global + component CSS
tests/             144 tests — unit · components · server
public/icons/      PWA + favicon assets
```

Design system: a **"Match Day" broadcast** direction (charcoal + gold + pitch-green, self-hosted
Bebas Neue + Source Sans 3, Lucide icons) on **Tailwind CSS + shadcn/ui (Radix) primitives +
Framer Motion**. Both light and dark themes are intentional.

---

## Evaluation criteria

- **Code Quality** — small, feature-oriented modules; strict TypeScript; pure functions for all
  logic; immutable state; shared providers instead of prop-drilling.
- **Security** — Gemini key server-side only; Zod validation; per-IP rate limiting; 64 KB body cap;
  prompt-injection guardrails; restrictive CSP (self-only, incl. `worker-src`/`manifest-src`) +
  hardening headers; path-traversal guard; no `dangerouslySetInnerHTML`.
- **Efficiency** — only the relevant venue slice is grounded into the prompt; streaming; ~135 KB
  gzipped JS (within the app-page budget); self-hosted subsetted fonts; ops/map/itinerary/standings
  all computed from pure functions, no extra network round-trips.
- **Testing** — 144 tests across the pure core (incl. venues, fixtures, itinerary, gate alerts), the
  server pipeline (HTTP adapter + mocked Gemini agent), and the React UI (map, ops, scoreboard,
  standings, palette, onboarding, voice, ticket scan, offline); coverage enforced at 80%
  (~96%/83%/90% statements/branches/functions).
- **Accessibility** — WCAG 2.2 AA: landmarks, keyboard operation (incl. the SVG map and palette),
  focus management, polite live regions, accessible congestion meters, Arabic RTL,
  `prefers-reduced-motion`, and an automated `jest-axe` check. Content is accessible too
  (step-free routing driven by the fan's profile).

---

## Assumptions & limitations

- **Sample venue, fixture and ops data** (`src/features/venue/venues/`,
  `src/features/tournament/`, `src/features/ops/opsFeed.ts`) — fictional-but-plausible, clearly
  labelled, not official FIFA information. Ops runs on a virtual 140-minute match cycle so the demo
  is always lively. The shapes mirror real feeds, so going live is a data swap, not a rewrite.
- **On-device notifications** use the browser Notification API directly (gated behind an explicit
  opt-in button); a production build would add Web Push + VAPID for alerts while the tab is closed.
- **Voice & install** are progressive enhancements — hidden where the browser lacks the APIs.
- **Rate limiting** is in-memory (per instance); a shared store (Redis) would be the production step.
- Bebas Neue / Source Sans 3 cover Latin scripts; Arabic falls back to a system Arabic font.

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS + shadcn/ui (Radix) + Framer Motion · vite-plugin-pwa ·
Node (native `http`, esbuild-bundled) · Google Gemini (`@google/genai`, function-calling + vision) ·
Zod · Lucide icons · @fontsource · Vitest + Testing Library + jest-axe.

## License

[MIT](./LICENSE)
