# ASTRA — Honest Status Audit

**Audit date:** 2026-11-04
**Auditor role:** Senior Game Developer / Software Architect / 3D Experience Designer / UI-UX Lead
**Mode:** Report-only. No source, config, dependency, or git changes were made. Only this file was written.
**Workspace root:** `c:\Users\HP\Desktop\NASA SPACE APPS`

---

## 1. Architecture (layers / modules / data flow)

ASTRA is a local-first, client-side React + TypeScript single-page app. No backend. The layering
is real and is mostly respected in code.

### Stack (as actually built — `package.json`)
React 18.3, TypeScript 5.9, Vite 5.4, Tailwind CSS 3.4, Zustand 4.5, Zod 3.25, Recharts 2.15,
React Router 6.30, **Phaser 3.90 (installed, unused — see §3 Risk R7)**, Vitest 2.1. Playwright is
referenced in docs but is **not installed** (no `@playwright/test` in `package.json`).

### Layers present in code
| Layer | Location | Real? |
|-------|----------|-------|
| Presentation | `src/app/` (router, providers), `src/features/`, `src/components/`, `src/game/` | Mostly empty — only `features/mission-debrief` has a real screen. `src/components/*` and `src/game/*` are empty directories. |
| Application | `src/hooks/useMissionControl.ts`, `src/store/mission-store.ts`, `src/store/app-store.ts` | Real and tested. `useMissionControl` is the only place that instantiates `SimulationEngine`. |
| Domain / Simulation | `src/simulation/` (core, resources, systems, events, types) | Real, pure-TS, tested. This is the strongest part of the project. |
| Data | `src/data/nasa/*`, `src/data/validation/*` | Real, validated with Zod on load. |
| AI | `src/ai/*` (assistant, knowledge-base, prompts, schemas, context, barrel) | Real and unit-tested, but **not wired into any screen**. |
| Reporting | `src/features/mission-debrief/` | Real (debrief screen + scoring). |

### Data flow (as actually implemented)
`User action → useMissionControl → SimulationEngine.step(action) → Result<SimulationResult> →
missionStore.updateFromSimResult(result) → React re-render.` The engine owns simulation state and
the decision log; the Zustand store holds only a snapshot plus setup choices. This matches
`docs/architecture.md` and `.kiro/steering/architecture.md`.

### Path aliases
Configured in both `vite.config.ts` and `tsconfig.app.json`: `@/`, `@simulation/`, `@data/`,
`@ai/`, `@game/`, `@store/`. Verified consistent. `tsconfig.app.json` has `strict: true`,
`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`
— matches the coding-standards steering.

### Route → user's 11-screen mapping
`src/app/router.tsx` defines exactly 6 routes. Mapping to the user's 11 requested screens:

| # | User's screen | Route / file | Real status |
|---|----------------|--------------|-------------|
| 1 | Welcome / Main Menu | `/` → `PlaceholderScreen` | PLACEHOLDER |
| 2 | Planet Selection | `/select-planet` → `PlaceholderScreen` | PLACEHOLDER |
| 3 | Location Selection | **none** | NOT STARTED — no route, no screen, and not mentioned in requirements.md / design.md / architecture.md. Genuine spec gap (see §3 R11). |
| 4 | Mission Configuration | split: `/select-crew` + `/configure-base` | both PLACEHOLDER. "Mission Configuration" is modeled as two steps (crew then base). |
| 5 | Base Preparation | `/configure-base` → `PlaceholderScreen` (guarded by `RequireSetup`) | PLACEHOLDER |
| 6 | 3D Mission Control | `/mission` → `PlaceholderScreen` (guarded by `RequireSetup` + `RequireMission`) | PLACEHOLDER. Planned as 2D Phaser, NOT 3D (see §3 R7). |
| 7 | Resource Management | sub-panel of Mission Control | NOT STARTED (UI). Only the debrief screen renders resource charts. |
| 8 | Environmental Events | sub-panel of Mission Control | Simulation EXISTS; UI NOT STARTED |
| 9 | Decision Interfaces | sub-panel of Mission Control | Simulation handles `RESOLVE_EVENT`; UI NOT STARTED |
| 10 | Astro-AI Assistant | sub-panel of Mission Control | Service EXISTS; not integrated |
| 11 | Mission Debrief | `/debrief` → `MissionDebriefScreen.tsx` | EXISTS (working) — the only real screen |

Route guards are real and tested: `RequireSetup` (planet + crew), `RequireMission`
(`missionActive`), `RequireMissionStarted` (keeps debrief reachable after `endMission`).

---

## 2. Per-Feature Real Status

Classifications grounded in specific files. EXISTS = working; PARTIAL = core present, UI/some path missing;
PLACEHOLDER = only a stub; NOT STARTED = nothing.

| Feature (spec ID) | Real status | Evidence |
|---|---|---|
| F01 Onboarding | PLACEHOLDER | `router.tsx` `/` renders `PlaceholderScreen`; `src/features/onboarding/` is an empty dir. |
| F02 Planet Selection | PLACEHOLDER | `/select-planet` placeholder; `src/features/planet-selection/` empty. Store action `selectPlanet` exists and is tested. |
| F03 Crew Selection | PLACEHOLDER | `/select-crew` placeholder; `src/features/crew-selection/` empty. `setCrewSize` + 1–8 validation exist in store. Crew size IS configurable; **mission duration is NOT** (engine comment "missionDurationDays: 30 — reserved for future"). |
| F04 Base Configuration | PLACEHOLDER | `/configure-base` placeholder (guarded); `src/features/base-configuration/` empty. `setBaseConfig` exists. No system-config sliders UI. |
| F05 Mission Control | PLACEHOLDER | `/mission` placeholder; `src/features/mission-control/`, `src/components/*`, `src/game/*` all empty. No ResourcePanel / EnvironmentPanel / EventPanel / AstroAIPanel / Phaser canvas exist. |
| F06 Environmental Events | PARTIAL | Simulation side real: `lunar-events.ts` (4 events), `martian-events.ts` (4 events), `event-engine.ts` (`processEvents`), consequences wired into the engine step. UI NOT STARTED: no EventCard/DecisionButton, `src/features/events/` empty. |
| F07 Astro-AI Assistant | EXISTS (service) / NOT INTEGRATED | `astro-assistant.ts` (OpenAI-compatible, Zod-validated, 8s timeout, graceful fallback), `knowledge-base.ts` (17 entries), 3 prompt builders, `astro-response.schema.ts`, `simulation-context.ts` builder, `index.ts` barrel. 16 unit tests pass. No screen consumes it; debrief uses static `getLearningText` with an `// AI-007: Replace with AstroAssistant.getMissionSummary()` TODO. |
| F08 Mission Debrief | EXISTS (working) | `MissionDebriefScreen.tsx`: outcome banner, score breakdown (5 rows), 4 Recharts resource-history charts, decision log, learning summary, Play Again. 7 component tests pass. |
| Simulation Engine (pure-TS core) | EXISTS (working) | `simulation-engine.ts` 14-step `step()`, `prng.ts` (mulberry32), `simulation-clock.ts`, 4 resource models, 4 systems, event engine, `mission-scoring.ts`. Integration tests (7) + unit tests pass. Pure (see §4). |
| Data Layer (NASA profiles + Zod) | EXISTS (working) | `moon-profile.ts`, `mars-profile.ts` (source-commented), `life-support-constants.ts`, `planet-profile.schema.ts`, `simulation-state.schema.ts`. Validated on load; schema tests pass. |
| Mission Scoring | EXISTS (working) | `calculateMissionScore`, thresholds 800/400, documented in `docs/simulation-model.md`. |

**Honest summary:** the **domain/simulation, data, and AI layers are substantially built and tested**.
The **presentation layer is almost entirely missing** — 5 of 6 routes are placeholders, only the
debrief screen is real, and the shared component library + game/Phaser layer are empty directories.

---

## 3. Confirmed Risks (each with evidence)

**R1 — Production bundle is one unsplit, oversized chunk.**
Evidence (build output): `dist/assets/index-DMRmL8Mw.js 652.85 kB │ gzip: 186.99 kB`, and Vite
emitted: `(!) Some chunks are larger than 500 kB after minification. Consider: Using dynamic
import() ... manualChunks`. `vite.config.ts` defines no `manualChunks` and no route-level lazy
loading. NFR-01-3 requires code-splitting with initial chunk < 500 KB gzipped; the gzipped size
(186.99 kB) passes the number, but the **"code-split" requirement is unmet** — everything is in one
chunk. Recharts (pulls in d3 deps) is the heaviest contributor.

**R2 — Five placeholder screens are still wired into the router.**
Evidence: `router.tsx` renders `PlaceholderScreen` for `/`, `/select-planet`, `/select-crew`,
`/configure-base`, `/mission`; each shows "PLACEHOLDER — not yet implemented". Empty feature dirs:
`src/features/{onboarding,planet-selection,crew-selection,base-configuration,mission-control,events}`,
`src/components/*`, `src/game/*`.

**R3 — decisionLog is not injected into the store on each step (latent bug).**
Evidence: `mission-store.ts` lines 108–111 comment claims "decisionLog is passed in via the result
so the store always reflects the engine's accumulated log. The hook reads engine.getDecisionLog()
and injects it here on every step." But `updateFromSimResult` (lines 90–113) does **not** set
`decisionLog`, and `useMissionControl.ts` `advanceDay`/`resolveEvent`/`emergencyRation` (lines 126,
144, 162) call only `updateFromSimResult(result.value)` with no log. `SimulationResult` has no
`decisionLog` field. The log is only populated at `endMission` (`useMissionControl.ts:179-180`,
`mission-store.ts:115`). Net effect: the store's `decisionLog` selector is **stale/empty during
the mission**; it only becomes correct after `endMission()`. FR-06-7 (debrief uses the log) is
satisfied, but any future live UI reading `decisionLog` (MissionControl decision feed, Astro-AI
context) will get `[]`. The comment is misleading and should be fixed.

**R4 — No WebGL-unavailable fallback exists.**
Evidence: grep across `src/**/*` for `webgl|WebGL|getContext('webgl'|fallback|isWebglAvailable|noWebGL`
returned only the **AI** fallback (`astro-assistant.ts`) and the React **ErrorBoundary** fallback —
neither relates to WebGL. No capability detection. (Also no 3D rendering exists yet — `src/game/*`
empty, Phaser never imported, three.js not installed.) `docs/team-workflow.md` lists "Phaser canvas
is not accessible via keyboard" as a known limitation but specifies no WebGL-unavailable path.

**R5 — No reduced-motion support.**
Evidence: grep across `src/**/*` for `prefers-reduced-motion|reduce-motion|motion-reduce|prefersReducedMotion`
→ **no matches**. No motion/animations exist yet, so this is latent; it must be added before
animations/3D land per the user's experience direction.

**R6 — Accessibility gaps.**
Evidence: grep across `src/**/*` for `aria-|role=|ariaLabel|aria-label` → **no aria/role usage
anywhere**. Only semantic markup present is `<section>` + `<h1/h2/h3>` + `<button type="button">`
in `MissionDebriefScreen.tsx` and the `ErrorBoundary.tsx` button; placeholder screens are
unsemantic `<div>` + `<Link>`. No skip-links, no `focus-visible` styling (only `hover:` /
`transition-colors`), Recharts charts have no screen-reader text, keyboard navigation is
unverified. NFR-04-1 (keyboard) and NFR-04-2 (not color-alone) are unaddressed.

**R7 — Phaser-vs-3D stack/direction mismatch (critical).**
Evidence: `package.json` dependency `phaser ^3.90.0`; grep across `src/**/*` for
`from 'phaser'|require('phaser'|from 'three'|from '@react-three'` → **no matches** (Phaser is
installed but never imported; `src/game/*` empty). `three`/`@react-three` are **not installed**.
The architecture/steering documents all standardize on Phaser (2D). The user's confirmed direction
is "a fully immersive 3D experience" with a "playable space mission" 3D world. **Steering conflict:**
`product.md` "Out-of-Scope Features (V1)" explicitly lists **"3D rendering / WebGL environments"** as
out-of-scope, directly contradicting the user's latest requirement. This must be reconciled before
any 3D work: decide whether to drop Phaser and adopt a 3D stack (three.js / React Three Fiber) and
update the steering, or keep Phaser 2D. Right now Phaser is dead dependency weight.

**R8 — Mission non-reproducibility at the app level (determinism).**
Evidence: `useMissionControl.ts` seeds the engine with `seed: Date.now()` (line ~112). The
simulation layer itself is pure (see §4), so it is deterministic *given a seed*, but the app never
exposes a fixed-seed control, so a specific mission run cannot be reproduced. NFR-02-3 holds
internally; reproducibility is not usable in practice.

**R9 — Mission duration not configurable (user requirement gap).**
Evidence: `simulation-engine.ts` comment "missionDurationDays: 30 — reserved for future
configurable mission lengths"; `MissionScoring` uses `daysRun`. No config field, no UI. The user
explicitly wants "configurable mission duration." Not implemented.

**R10 — Documentation drift (scripts).**
Evidence: `docs/team-workflow.md` documents `npm run typecheck`, `npm run test:coverage`,
`npm run lint:fix`, but `package.json` only defines `dev, build, lint, preview, test, test:watch`.
Those three commands do not exist. Also Playwright is referenced in docs but is not a dependency.

**R11 — "Location Selection" screen is absent from spec and code.**
Evidence: the user's screen #3 "Location Selection" has no route, no file, and no mention in
`requirements.md`, `design.md` (screen inventory SCR-01..SCR-06), or `architecture.md`. Either
add it to the spec or explicitly fold location choice into Planet Selection.

**R12 — React Router v7 future-flag warnings (non-critical).**
Evidence: test output prints warnings suggesting `v7_startTransition` and
`v7_relativeSplatPath` future flags. Cosmetic; opt in during the next router pass.

---

## 4. Simulation-Layer Purity Check

Invariant (`.kiro/steering/coding-standards.md` + `architecture.md`): `src/simulation/` must
import **no** React, Zustand, Phaser, or three, and must not call `Date.now()` or `Math.random()`.

What I checked:
- Read `src/simulation/core/simulation-engine.ts`, `src/simulation/core/mission-scoring.ts`, and
  `src/simulation/resources/energy-model.ts` in full — none import react/zustand/phaser/three.
- Ripgrep across `src/simulation/**/*` for
  `(import.*from ['"]react|import.*from ['"]zustand|import.*from ['"]phaser|import.*from ['"]three|from ['"]@react)` →
  **0 matches**.
- Ripgrep across `src/simulation/**/*` for `Date\.now\(\)|Math\.random\(\)` → only **comment**
  occurrences ("NO Math.random()", "NEVER calls Math.random()", "no Date.now()"); **zero actual calls**.

Result: **the simulation layer is pure.** The architectural invariant holds. (Caveat: the
*application* layer seeds the engine with `Date.now()` in `useMissionControl.ts` — outside the
simulation dir — so R8 applies, but it is not a simulation-layer purity violation.)

---

## 5. Build & Test Results (exact)

### `npm run build` (from workspace root)
- **Exit code: 0** (`tsc -b && vite build` — zero TypeScript errors, NFR-05-4 met).
- Output (key lines):
  - `transforming...` → `✓ 678 modules transformed.`
  - `dist/index.html 0.48 kB │ gzip: 0.32 kB`
  - `dist/assets/index-7AZCNFaI.css 10.07 kB │ gzip: 2.68 kB`
  - `dist/assets/index-DMRmL8Mw.js 652.85 kB │ gzip: 186.99 kB`
  - `(!) Some chunks are larger than 500 kB after minification.` (chunk-size warning — see R1)
  - `✓ built in 5.29s`
- Note: PowerShell wrapped some `stderr` lines (React-Router warnings during tests, and the npm
  `node.exe` child-process stderr) as a `NativeCommandError`; these are PowerShell stderr-capture
  quirks, **not** build/test failures. Exit codes were 0 in both cases.

### `npm run test -- --run` (from workspace root)
- **Exit code: 0.**
- Result: **14 test files passed, 91 tests passed (91).** Matches the expected ~91/91.
- Per-file counts:
  - `unit/simulation/oxygen-model.test.ts` 5 · `food-model.test.ts` 5 · `energy-model.test.ts` 7 ·
    `water-model.test.ts` 5 · `resource-history.test.ts` 6 · `prng.test.ts` 4
  - `unit/store/mission-store.test.ts` 14
  - `unit/ai/astro-assistant.test.ts` 6 · `knowledge-base.test.ts` 5 · `astro-response.schema.test.ts` 5
  - `unit/hooks/useMissionControl.test.ts` 12 · `useMissionControl.failure.test.ts` 3
  - `unit/features/MissionDebriefScreen.test.tsx` 7
  - `integration/simulation/simulation-engine.test.ts` 7

---

## 6. Bottom-line assessment

- **Build: green (exit 0). Tests: green — 91/91 passing.** TypeScript strict mode compiles clean.
- **The simulation/data/AI foundation is the project's strength** — pure, deterministic, tested,
  scientifically sourced. Mission Scoring and the Astro-AI service are real and working in isolation.
- **The presentation layer is the project's gap** — 5/6 screens are placeholders, only Debrief is
  real, the component library and game layer are empty directories.
- **Top items to reconcile before more UI work:** (1) the Phaser-vs-3D decision and the
  `product.md` "3D out-of-scope" conflict (R7); (2) code-splitting the bundle (R1); (3) the
  decisionLog live-injection discrepancy (R3); (4) add the missing Location Selection screen or
  fold it in (R11); (5) accessibility + reduced-motion + WebGL-fallback are all currently absent
  and will matter once 3D/animations land (R4–R6).
- **Phase status vs `workflow.md`:** workflow.md marks Phase 8 (Astro-AI) as NOT_STARTED and
  Phase 9 (Mission Debrief) as NOT_STARTED, but in reality the **AI service** is built and tested
  (Phase 8 AI-001..AI-005 substantially done; only AI-006 integration is missing) and the
  **Debrief screen** is built and tested (DEB-002/003/004 effectively done). The workflow state
  document understates actual progress in those two areas.
