# PitchPal ⚽

**A multilingual, accessible GenAI stadium companion for FIFA World Cup 2026 fans.**

_PromptWars Virtual — Challenge 4: Smart Stadiums & Tournament Operations._

PitchPal is a fan-facing assistant that answers wayfinding, amenity, accessibility, and
transport questions **in the fan's own language**, grounded in a structured venue knowledge
base. It reasons over a lightweight **fan context** (language, accessibility needs, current
location) to give practical, context-aware answers — and returns rich, structured **action
cards** (routes, amenities, transport) alongside the reply.

It runs **out of the box with no API key** in a deterministic demo mode, and switches to live
Google **Gemini** responses when a key is provided.

---

## Chosen vertical: the Fan

Challenge 4 asks for a GenAI solution that improves the stadium experience for one persona.
PitchPal targets the **international fan** — the persona that most directly exercises the two
graded criteria the challenge calls out (**accessibility** and **multilingual assistance**),
and the one with the clearest real-world use during a global tournament where millions of
visitors arrive speaking dozens of languages.

| Capability | Example question | What PitchPal returns |
|---|---|---|
| Navigation / wayfinding | _"How do I get to section 205 from Gate B?"_ | A **route card**: steps, walk time, step-free status |
| Accessibility | _"¿Ruta en silla de ruedas a la sección 205?"_ | The same route, routed step-free, with a warning if a section isn't accessible |
| Amenities | _"Where's the nearest halal food?"_ | An **amenity card**: closest matching options, hours, step-free flags |
| Transport | _"How do I get downtown after the match?"_ | A **transport card**: accessible-first options and frequencies |
| Multilingual | Any of the above in EN / ES / FR / PT / AR | The whole reply, localized (with right-to-left layout for Arabic) |

---

## Approach & logic

The "smart, dynamic assistant" behavior comes from a small, **deterministic decision pipeline**
that grounds the language model instead of letting it improvise:

```
Fan context (language, accessibility, location)
        │
        ▼
  1. Classify intent   ──►  navigation | amenity | transport | general   (src/lib/intent.ts)
        │                    + accessibility focus (a cross-cutting modifier)
        ▼
  2. Retrieve slice    ──►  only the relevant gates/sections/amenities/    (src/lib/retrieval.ts)
        │                    transport, filtered to step-free when needed
        ▼
  3. Build prompt      ──►  persona + guardrails + injected VENUE FACTS    (server/prompt.ts)
        │
        ▼
  4. Generate          ──►  Gemini (live)  OR  deterministic composer (mock)
        │                                        (server/gemini.ts, src/lib/compose.ts)
        ▼
  5. Answer + card     ──►  prose reply + a validated structured card      (src/lib/cards.ts)
```

Why this shape:

- **Grounding, not guessing.** The model is only ever given the small slice of venue data
  relevant to the question, and is instructed to answer *only* from those facts. This keeps
  answers accurate, keeps token usage (and cost) low, and makes hallucination unlikely.
- **Accessibility is a first-class modifier.** A wheelchair or stroller profile changes *which*
  data is retrieved (step-free routes, accessible facilities and transport) — the logic adapts,
  it doesn't just re-word.
- **Deterministic core = testable + demoable.** Intent, retrieval, prompt assembly and card
  parsing are pure functions with no network dependency, so they're unit-tested and power a
  fully working offline demo.

---

## How the solution works

- **Frontend** (React + TypeScript + Vite): a chat UI plus a "your details" panel for language,
  accessibility profile and location. Replies stream in token-by-token over SSE and render
  structured cards.
- **Server** (thin Node layer): a single chat handler validates the request, applies rate
  limiting, grounds the prompt, and streams the answer. **The Gemini API key lives only on the
  server** and never reaches the browser. The same handler is mounted by the Vite dev plugin
  (`npm run dev`) and by the production Node server (`npm start`).
- **Mock fallback**: with no `GEMINI_API_KEY`, the server answers from the deterministic
  composer — grounded, localized, and instant — so judges can try everything without a key.

```
Browser (React)  ──POST /api/chat (context, message, history)──►  Node handler
     ▲   SSE stream: tokens + a fenced ```card JSON block            │
     │                                    ┌───────────────────────┐  │
     └───────────────────────────────────│ validate → rate-limit  │◄─┘
                                          │ → classify → retrieve  │
                                          │ → prompt → Gemini/mock │
                                          └───────────────────────┘
```

---

## Getting started

### Prerequisites
- Node.js **20+** (developed on Node 24)
- npm

### Install & run (demo mode — no key needed)
```bash
npm install
npm run dev
```
Open the printed URL (default http://localhost:5173). A **"Demo mode"** badge indicates
built-in sample answers.

### Enable live Gemini responses (optional)
```bash
cp .env.example .env
# edit .env and set GEMINI_API_KEY=your_key   (get one at https://aistudio.google.com/apikey)
npm run dev
```
The badge switches to **"Live AI"**. The key is read only on the server.

### Production build & serve
```bash
npm run build     # outputs to dist/
npm start         # serves dist/ + /api/chat on http://localhost:8080
```

### Tests, coverage, types
```bash
npm test              # run the full Vitest suite
npm run coverage      # run with coverage (thresholds enforced at 80%)
npm run typecheck     # strict TypeScript, no emit
```

---

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | _(empty)_ | Google Gemini key. Empty → deterministic mock mode. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model used for live responses. |
| `PORT` | `8080` | Port for the production server (`npm start`). |

Only `.env.example` is committed — never a real key. `.env` is git-ignored.

---

## Project structure

```
server/                 Thin Node layer (no framework)
  handler.ts            runChat() pipeline + HTTP/SSE adapter
  gemini.ts             Gemini client + deterministic mock streamer
  prompt.ts             Persona, guardrails, grounded prompt assembly
  security.ts           Zod validation, rate limiting, security headers/CSP
  index.ts              Production static + API server
src/
  features/
    context/            Fan context (language/accessibility/location) + provider
    chat/               Streaming useChat hook + message types
    venue/              Venue types + representative sample dataset
  lib/                  intent · retrieval · compose · cards (the deterministic core)
  components/           chat · cards · context-bar · ui (all accessible)
  i18n/                 UI chrome + answer phrases (EN/ES/FR/PT/AR)
  styles/               Design tokens + global + component CSS
tests/                  Vitest: unit · components · server (69+ tests)
```

---

## Evaluation criteria — how PitchPal addresses each

- **Code Quality** — small, focused, single-responsibility modules; strict TypeScript with no
  `any` on boundaries; pure functions for the core logic; feature-oriented structure; immutable
  state updates.
- **Security** — API key server-side only; all input schema-validated (Zod); per-IP rate
  limiting; 64 KB body cap; prompt-injection guardrails (venue data trusted, user input
  untrusted, model output never executed); React auto-escaping (no `dangerouslySetInnerHTML`);
  restrictive CSP + hardening headers; path-traversal guard on static serving.
- **Efficiency** — retrieval injects only the relevant venue slice (small prompts, low cost);
  streaming for fast perceived response; no heavy UI libraries (~65 KB gzipped JS); static data
  cached in memory.
- **Testing** — 69+ Vitest tests across the deterministic core, the server pipeline (incl. the
  HTTP adapter and a mocked Gemini client), and the React UI; coverage enforced at 80%.
- **Accessibility** — WCAG 2.2 AA intent: semantic landmarks, labelled controls, full keyboard
  operation, visible focus, a polite live region for streamed answers, right-to-left support for
  Arabic, `prefers-reduced-motion` handling, and an automated `jest-axe` check. The accessibility
  profile also makes the *content* accessible (step-free routing).

---

## Assumptions & limitations

- **Sample venue data.** `src/features/venue/venue-data.ts` is fictional-but-plausible data for a
  single representative stadium, clearly labelled — not official FIFA or venue information. The
  data shape mirrors what a real operations feed would expose, so going live is a data swap, not
  a rewrite.
- **Mock mode is English-leaning for free-form nuance** but fully localized for the templated
  answers it produces; live Gemini mode does complete free-form translation.
- **Rate limiting is in-memory** (per server instance), suitable for a demo/single instance; a
  shared store (e.g. Redis) would be the production step.
- Intent keywords cover English plus common Spanish/French/Portuguese terms; unrecognized
  phrasing safely falls back to a general, still-grounded response.

---

## Tech stack

React 18 · TypeScript · Vite · Node (native `http`) · Google Gemini (`@google/genai`) ·
Zod · Vitest + Testing Library + jest-axe.

## License

[MIT](./LICENSE)
