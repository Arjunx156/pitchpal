<div align="center">

# PitchPal ⚽

### A multilingual, accessible GenAI stadium companion for the FIFA World Cup 2026

_Wayfinding, accessibility, amenities, transport and live match operations — answered in the fan's own language, grounded in real venue data and a live match-day simulation, and rendered as a broadcast-grade match-day HUD._

</div>

---

## The problem

A World Cup draws millions of international fans into vast, unfamiliar stadiums, across three host nations, speaking dozens of languages, many with accessibility needs. The moment that matters most — _"How do I get to my seat? Where's step-free access? Which gate is jammed right now? How do I get home after the final whistle?"_ — is exactly where generic maps and English-only signage fail.

**PitchPal** is a fan-facing assistant that answers those questions **in the fan's own language**, grounded in a structured venue knowledge base **and** live match-day operations, and presents the answer not as a wall of text but as a **broadcast graphics package** — a persistent kinetic scoreboard, an interactive stadium map that lights up your route, and structured action cards.

It is **agentic**: Google **Gemini** drives a function-calling loop over a typed tool registry, and can **read a photo of your ticket** to find your seat. A deterministic, no-key fallback runs the _exact same tools_, so the product works fully offline and on-device — the AI degrades gracefully, it never goes dark.

---

## The chosen persona: the international fan

PitchPal targets the persona that most directly exercises the two hardest criteria — **accessibility** and **multilingual assistance** — and has the clearest real-world use during a global tournament.

| Need                | A fan asks…                                    | What PitchPal does                                                |
| ------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| **Navigation**      | _"How do I get to section 205 from Gate B?"_   | Returns a route card **and animates the path on the stadium map** |
| **Accessibility**   | _"¿Ruta en silla de ruedas a la sección 205?"_ | Step-free route, elevator, warnings — **answered in Spanish**     |
| **Amenities**       | _"Where's the nearest halal food?"_            | Amenity card with nearest options and opening hours               |
| **Transport**       | _"How do I get downtown after the match?"_     | Accessible-first transport options with carbon estimates          |
| **Live operations** | _"How busy is my gate?"_                       | Real-time gate congestion, and **reroutes you around the jam**    |

Every answer is shaped by the fan's **context** — language, accessibility profile, current location, ticket, and selected match — which the assistant reasons over continuously.

---

## Design — the Broadcast Match-Day HUD

PitchPal is deliberately _not_ a generic dashboard. Its visual identity is a **live-sports broadcast graphics package**: the interface a fan would recognise from a World Cup broadcast, made interactive.

- **Palette** — a night-stadium base (`#070B09`), **broadcast gold** (`#F5C518`) as the single signature accent, **pitch green** (`#19DD80`) for live/positive states, and a broadcast red for live pulses and congestion. Dark is the hero (graphics over night footage); a disciplined "day match / studio" light theme is a first-class, intentional counterpart.
- **Typography** — a deliberate three-role system, not a default stack: **Archivo Expanded** for the scoreboard and headlines (used on its true _width axis_ for the wide broadcast feel), **Hanken Grotesk** for body, and **Martian Mono** for scores, clocks and data. **IBM Plex Sans Arabic** carries full Arabic coverage.
- **The signature** — a persistent, kinetic scoreboard: **split-flap flip-number** scores that tick over, a live match clock, moment "stingers" that slam in when a goal drops, and a 90-minute progress rail with a half-time notch that blends pitch-green into gold.
- **Motion with intent** — Framer Motion throughout: HUD reveal on load, self-drawing sparklines and map routes, broadcast-style panel entrances, and micro-interactions on every control. All of it honours `prefers-reduced-motion`.

The whole product reads as **one graphics system** across three surfaces — a match-day **home** rundown, an assistant **chat**, and a **map** — bound together by the always-on scoreboard.

---

## Signature capabilities

- **🤖 Agentic tool-calling** — Gemini decides which typed tools to invoke (`planRoute`, `findAmenities`, `getTransport`, `getGateStatus`, `getMatchStatus`, `getSustainability`, `bookAccessibilityService`, `setFanTicket`); the server executes them against a pure core, and structured **cards stream back from the tool results** — the UI even surfaces the tool it is running ("Planning your route…"). The same tools power the live, mock, and offline paths, so behaviour is identical everywhere.
- **🎫 Scan your ticket (multimodal)** — snap or upload a photo of a ticket; Gemini reads the section, seat and gate and auto-fills the fan's context to route them.
- **🏟️ Multi-venue + fixtures** — four representative host venues and matches behind a match picker; switching the match swaps the venue, ops cycle, scoreboard, map and group **standings** together.
- **⚽ Live match engine** — a deterministic moments timeline (goals, cards, substitutions) derived from a virtual match clock powers _both_ the animated scoreboard _and_ the assistant's `getMatchStatus` tool. The score can **never disagree** between the UI and the AI — ask "What's the score?" in any of the five languages, even offline.
- **🗺️ Interactive stadium map** — an accessible SVG bowl computed entirely from the venue data: it colours each seating section by live crowd density, highlights gates and amenities, and **animates your route** when the assistant answers. Every section and gate is clickable to ask about it — fully keyboard- and screen-reader-operable.
- **📊 Live operations HUD** — a real-time read of stadium load, per-gate congestion and queue times, plus a **gate-risk forecast** that projects which gates will jam and offers a one-tap reroute. The assistant factors this congestion into its advice ("Gate C is busy — use Gate A"), grounded into both the live prompt and the offline composer.
- **🗓️ "My Match Day" itinerary** — a personalised timeline (arrive → gate → seat → kickoff → half-time → leave, with a low-carbon transport suggestion), reorderable and extensible, with an opt-in **on-device alert** that fires when the fan's gate gets congested.
- **🎙️ Voice** — ask by speech in the fan's language, and have answers **read aloud** — progressive enhancement, hidden where the browser lacks the APIs.
- **🌱 Sustainability & ♿ services** — low-carbon route recommendations with CO₂ estimates per transport option, and a bookable accessibility-service flow (wheelchair assist, sensory room, meeting point).
- **⌘K command palette · quick-action chips · first-run onboarding** — a fast, complete UX layer over the whole app.
- **📴 Installable PWA, offline-capable** — installs to the home screen and **still answers with no signal** by running the same deterministic assistant on-device.
- **🌍 Fully localised** — UI _and_ answers in **EN / ES / FR / PT / AR**, with right-to-left layout and native Arabic typography.

---

## How the intelligence works

The intelligence is a small, **deterministic pipeline that grounds the model** rather than letting it improvise. The same pure functions feed the live agent, the mock, and the offline engine.

```
Fan context ( language · accessibility · location · ticket · selected match )
   +  resolved venue ( from the match's venueId )   +  live ops snapshot
                              │
                              ▼
   LIVE     Gemini function-calling loop
            model → picks tool(s) → server runs them against the pure core
            → tool results become cards → model composes a short reply
                              │
   MOCK /   deterministic router runs the SAME tools → identical events
   OFFLINE  (no API key, or no network) → the product never goes dark
                              │
                              ▼
   Structured stream (SSE):  status · tool_result(card) · token · context-patch · done
                              │
                              ▼
   Map · crowd density · gate-risk forecast · scoreboard · standings · itinerary
   all derive from the same pure retrieval/ops functions — no extra round-trips.
```

Two decisions make this reliable:

1. **One pure tool implementation, reused three ways.** The live agent, the demo mock, and the offline engine call the identical typed tools — so the assistant's behaviour is consistent and fully unit-testable, and the score/route/ops can never diverge across surfaces.
2. **Cards come from tool _results_, not parsed prose.** Structured answers (routes, amenities, transport) are produced by validated tool outputs and streamed to the UI as typed cards — never scraped out of free-text, so malformed or injected content can't reach the interface as a card.

---

## Architecture at a glance

PitchPal separates a portable **brain** (pure domain logic, data and AI wiring) from a replaceable **broadcast UI**, with a thin secure server in front of Gemini.

```
server/            HTTP handler · Gemini function-calling agent · tool declarations ·
                   mock generator · ops-aware prompt builder · security (CSP · Zod · rate limit)

src/
  features/        THE BRAIN — pure, testable, framework-light
    context/         fan context (language · accessibility · location · match) provider
    chat/            streaming chat hook with transparent offline fallback
    ops/             deterministic match-day operations simulation (shared client + server)
    tournament/      four fixtures, group standings, live scoreline & moments timeline
    map/             stadium-bowl geometry + focus derivation (both pure)
    itinerary/       "My Match Day" timeline builder + persistence
    notifications/   on-device gate-jam alert hook
    voice/ theme/ pwa/ venue/   speech, theming, install prompt, venue registry + data
  lib/             intent · retrieval · compose · cards · tools-core — the deterministic core
  i18n/            UI chrome + answer phrases in five languages
  components/      THE BROADCAST UI
    scoreboard/      the signature kinetic scoreboard (flip digits · clock · stingers)
    dashboard/       match-day home: gate-risk viz · suggestions · next-up · quick actions
    chat/  cards/    streamed conversation · route/amenity/transport action cards
    map/  ops/       interactive stadium map · live ops HUD + crowd trend
    standings/ itinerary/ context-bar/ command/ onboarding/ charts/ ui/
  styles/          design tokens · broadcast HUD layer · Tailwind

tests/             187 tests — pure core · server pipeline · UI components · axe a11y
```

A redesign of the interface touches only `components/` and `styles/`; the brain, the AI contract, and the multilingual answers are untouched.

---

## Engineering principles

- **Code quality** — small, feature-oriented modules; strict TypeScript with explicit public contracts; pure functions for all logic; immutable state updates; shared providers instead of prop-drilling.
- **Security** — the Gemini key lives **server-side only** and never reaches the browser; Zod validation at every boundary; per-IP rate limiting and a request-body cap; prompt-injection guardrails; a restrictive Content-Security-Policy plus hardening headers; a path-traversal guard; and no raw HTML injection anywhere in the UI.
- **Performance** — only the relevant slice of venue data is grounded into the prompt; answers stream token-by-token; the client CSS is a few KB gzipped; fonts are self-hosted and subsetted; and the map, ops, forecast, standings and itinerary are all computed from pure functions with no extra network round-trips.
- **Testing** — **187 tests** (~96% statement coverage, enforced at 80%) spanning the pure core (venues, fixtures, itinerary, gate alerts, retrieval, ops), the server pipeline (HTTP adapter + a mocked Gemini agent), the React UI (every surface — scoreboard, chat, map, ops, itinerary, overlays), an end-to-end App integration flow, and automated **axe** accessibility checks. Enforced by a strict ESLint + TypeScript gate.
- **Accessibility** — built to a WCAG floor: semantic landmarks, full keyboard operation (including the SVG map and command palette), visible focus, polite live regions, colour never used as the sole signal, Arabic RTL, and `prefers-reduced-motion` respected. Accessibility is in the _content_ too — step-free routing is driven by the fan's own profile.

---

## Honesty about the data

- **Venue, fixture and operations data are representative samples** — fictional-but-plausible, clearly labelled in-product, and **not** official FIFA information. The operations simulation runs on a virtual match cycle so the demo is always lively. Crucially, the data _shapes_ mirror real feeds, so going live against production data is a **data swap, not a rewrite**.
- **On-device notifications** use the browser Notification API behind an explicit opt-in; a production build would add Web Push for alerts while the tab is closed.
- **Voice and install** are progressive enhancements — present only where the browser supports them.

---

## Tech stack

**Frontend** React 18 · TypeScript · Vite · Tailwind CSS · Radix primitives · Framer Motion · vite-plugin-pwa
**Intelligence** Google Gemini (`@google/genai`, function-calling + vision) · a pure, deterministic tool core shared across live/mock/offline
**Backend** Node (native `http`, esbuild-bundled) · Zod · server-side prompt + security layer
**Design** Archivo Expanded · Hanken Grotesk · Martian Mono · IBM Plex Sans Arabic (self-hosted) · Lucide icons
**Quality** Vitest · Testing Library · jest-axe · ESLint (typescript-eslint) · strict TypeScript

---

## License

[MIT](./LICENSE)
