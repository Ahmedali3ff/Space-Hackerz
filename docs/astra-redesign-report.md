# ASTRA — Technical Audit, 3D Experience Redesign & Roadmap

**Project:** ASTRA — Mission Control Academy
**Report date:** 2026-11-04
**Author role:** Senior Game Developer / Software Architect / 3D Experience Designer / UI-UX Lead
**Workspace root:** `c:\Users\HP\Desktop\NASA SPACE APPS`
**Mode:** REPORT ONLY — no source, config, dependency, or git changes were made. This is the only file written.
**Inputs synthesized:** `.agents/tasks/audit.md` (codebase audit), `.agents/tasks/research-3d.md` (3D stack), `.agents/tasks/research-visual.md` (visual/UX). Claims were spot-verified against live source (`router.tsx`, `package.json`, `tailwind.config.js`, `mission-store.ts`, directory tree).

> **Important framing.** This report reconciles two facts that have to be stated up front because they shape every section:
> 1. **The domain/simulation, data, and AI layers are substantially built, tested, and scientifically grounded** — this is the project's real strength and must be preserved, not rewritten.
> 2. **The presentation layer is almost entirely missing** — 5 of 6 routes are `PlaceholderScreen` stubs, only the Mission Debrief screen is real, the shared component library and the game/3D layer are empty directories, and there is no design system (Tailwind `theme.extend` is empty). The "generic admin dashboard" problem is, at its root, *the absence of a design language* plus *no 3D layer at all*.
>
> So the work ahead is **not** "rebuild ASTRA" — it is **skin and connect an already-working engine, add two missing gameplay features, and introduce a decoupled 3D layer** while keeping the pure-TS simulation untouched.

---

## 1. Existing Project Architecture

ASTRA is a **local-first, client-side React 18 + TypeScript single-page app. No backend, no database.** The layering described in `.kiro/steering/architecture.md` is real and is mostly respected in code.

### Stack (as actually built — `package.json`, verified)
React `^18.3.1`, TypeScript `^5.9.3`, Vite `^5.4.21`, Tailwind CSS `^3.4.19`, Zustand `^4.5.7`, Zod `^3.25.76`, Recharts `^2.15.4`, React Router `^6.30.6`, **Phaser `^3.90.0` (installed, never imported — see §4 R7)**, Vitest `^2.1.9`. Playwright is referenced in docs but is **not installed** (no `@playwright/test` in `package.json`). `three` / `@react-three/*` are **not installed**.

### Layers present in code

| Layer | Location | Real? |
|-------|----------|-------|
| Presentation | `src/app/` (router, providers), `src/features/`, `src/components/`, `src/game/` | Almost empty. Only `src/features/mission-debrief/` has a real screen. `src/components/*` and `src/game/*` are empty directories. `tailwind.config.js` has an empty `theme.extend` → no design system exists. |
| Application | `src/hooks/useMissionControl.ts`, `src/store/mission-store.ts`, `src/store/app-store.ts` | Real and tested. `useMissionControl` is the only place that instantiates `SimulationEngine`. |
| Domain / Simulation | `src/simulation/` (core, resources, systems, events, types) | Real, pure-TS, tested. The strongest part of the project. |
| Data | `src/data/nasa/*`, `src/data/validation/*` | Real, validated with Zod on load, source-commented. |
| AI | `src/ai/*` (assistant, knowledge-base, prompts, schemas, context, barrel) | Real and unit-tested, but **not wired into any screen**. |
| Reporting | `src/features/mission-debrief/` | Real (debrief screen + scoring). |

### Data flow (as actually implemented)
```
User action
  → useMissionControl (application layer)
    → SimulationEngine.step(action)
      → Result<SimulationResult>
    → missionStore.updateFromSimResult(result)
    → React re-render from Zustand selectors
```
The engine owns simulation state and the decision log; the Zustand store holds only a snapshot plus setup choices. This matches `docs/architecture.md` and `.kiro/steering/architecture.md`.

### Path aliases
Configured in both `vite.config.ts` and `tsconfig.app.json`: `@/`, `@simulation/`, `@data/`, `@ai/`, `@game/`, `@store/`. Verified consistent. `tsconfig.app.json` has `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports` — matches the coding-standards steering.

### Dependency rules (from `architecture.md`, enforced by convention)
```
presentation → application → domain/simulation
presentation → data (read-only via repositories)
ai → data (read-only)
ai → application (receives context, never modifies state)
game → application (via event bus)
NO: simulation → React
NO: simulation → Zustand
NO: ai → simulation (writes)
```

### Route → user's 11-screen mapping (`src/app/router.tsx`, verified)
The router defines exactly 6 routes. Mapping to the user's 11 requested screens:

| # | User's screen | Route / file | Real status |
|---|----------------|--------------|-------------|
| 1 | Welcome / Main Menu | `/` → `PlaceholderScreen` | PLACEHOLDER |
| 2 | Planet Selection | `/select-planet` → `PlaceholderScreen` | PLACEHOLDER |
| 3 | Location Selection | **none** | NOT STARTED — no route, no screen, not mentioned in `requirements.md` / `design.md` / `architecture.md`. Genuine spec gap. |
| 4 | Mission Configuration | split: `/select-crew` + `/configure-base` | both PLACEHOLDER. Crew size IS configurable; mission duration is NOT. |
| 5 | Base Preparation | `/configure-base` → `PlaceholderScreen` (guarded by `RequireSetup`) | PLACEHOLDER |
| 6 | 3D Mission Control | `/mission` → `PlaceholderScreen` (guarded by `RequireSetup` + `RequireMission`) | PLACEHOLDER. Planned as 2D Phaser, NOT 3D. |
| 7 | Resource Management | sub-panel of Mission Control | NOT STARTED (UI). Only the debrief screen renders resource charts. |
| 8 | Environmental Events | sub-panel of Mission Control | Simulation EXISTS; UI NOT STARTED. |
| 9 | Decision Interfaces | sub-panel of Mission Control | Simulation handles `RESOLVE_EVENT`; UI NOT STARTED. |
| 10 | Astro-AI Assistant | sub-panel of Mission Control | Service EXISTS; not integrated. |
| 11 | Mission Debrief | `/debrief` → `MissionDebriefScreen.tsx` | EXISTS (working) — the only real screen. |

Route guards are real and tested: `RequireSetup` (planet + crew), `RequireMission` (`missionActive`), `RequireMissionStarted` (keeps debrief reachable after `endMission`).

---

## 2. Implemented Features and Their Actual Status

Classifications grounded in specific files (spot-verified). **EXISTS** = working; **PARTIAL** = core present, UI/some path missing; **PLACEHOLDER** = only a stub; **NOT STARTED** = nothing.

| Feature (spec ID) | Real status | Evidence |
|---|---|---|
| F01 Onboarding | **PLACEHOLDER** | `router.tsx` `/` renders `PlaceholderScreen`; `src/features/onboarding/` is an empty dir. |
| F02 Planet Selection | **PLACEHOLDER** | `/select-planet` placeholder; `src/features/planet-selection/` empty. Store action `selectPlanet` exists and is tested. |
| F03 Crew Selection | **PLACEHOLDER** | `/select-crew` placeholder; `src/features/crew-selection/` empty. `setCrewSize` + 1–8 validation exist in store. Crew size IS configurable. |
| F04 Base Configuration | **PLACEHOLDER** | `/configure-base` placeholder (guarded); `src/features/base-configuration/` empty. `setBaseConfig` exists. No system-config sliders UI. |
| F05 Mission Control | **PLACEHOLDER** | `/mission` placeholder; `src/features/mission-control/`, `src/components/*`, `src/game/*` all empty. No ResourcePanel / EnvironmentPanel / EventPanel / AstroAIPanel / canvas exist. |
| F06 Environmental Events | **PARTIAL** | Simulation side real: `src/simulation/events/lunar-events.ts` (4 events), `martian-events.ts` (4 events), `event-engine.ts` (`processEvents`), consequences wired into the engine step. UI NOT STARTED: no EventCard/DecisionButton; `src/features/events/` empty. |
| F07 Astro-AI Assistant | **EXISTS (service) / NOT INTEGRATED** | `src/ai/astro-assistant.ts` (OpenAI-compatible, Zod-validated, 8s timeout, graceful fallback), `knowledge-base.ts` (17 entries), 3 prompt builders, `astro-response.schema.ts`, `simulation-context.ts` builder, `index.ts` barrel. 16 unit tests pass. No screen consumes it; debrief uses a static `getLearningText` with an `// AI-007: Replace with AstroAssistant.getMissionSummary()` TODO. |
| F08 Mission Debrief | **EXISTS (working)** | `src/features/mission-debrief/MissionDebriefScreen.tsx`: outcome banner, score breakdown (5 rows), 4 Recharts resource-history charts, decision log, learning summary, Play Again. 7 component tests pass. |
| Simulation Engine (pure-TS core) | **EXISTS (working)** | `src/simulation/core/simulation-engine.ts` 14-step `step()`, `prng.ts` (mulberry32), `simulation-clock.ts`, 4 resource models, 4 systems, event engine, `mission-scoring.ts`. Integration tests (7) + unit tests pass. Pure (see §4 purity check). |
| Data Layer (NASA profiles + Zod) | **EXISTS (working)** | `src/data/nasa/moon-profile.ts`, `mars-profile.ts` (source-commented), `life-support-constants.ts`, `planet-profile.schema.ts`, `simulation-state.schema.ts`. Validated on load; schema tests pass. |
| Mission Scoring | **EXISTS (working)** | `calculateMissionScore`, thresholds 800/400, documented in `docs/simulation-model.md`. |
| Configurable Crew Size | **EXISTS (working)** | `setCrewSize` with 1–8 validation in store + `useMissionControl`. |
| Configurable Mission Duration | **NOT STARTED** | `simulation-engine.ts` comment: "missionDurationDays: 30 — reserved for future"; `MissionScoring` uses `daysRun`. No config field, no UI. |
| Location Selection | **NOT STARTED** | No route, file, or mention in spec/design/architecture. |
| 3D / Immersive World | **NOT STARTED** | Phaser installed but never imported; `src/game/*` empty; `three` not installed. |
| WebGL-unavailable fallback | **NOT STARTED** | No capability detection anywhere. |
| Reduced-motion support | **NOT STARTED** | No `prefers-reduced-motion` usage anywhere. |
| Accessibility (aria/keyboard/focus) | **NOT STARTED** | No `aria-*`/`role=` usage anywhere except incidental semantic markup in Debrief. |

**Honest summary:** the **domain/simulation, data, and AI layers are substantially built and tested.** The **presentation layer is almost entirely missing** — 5 of 6 routes are placeholders, only the debrief screen is real, and the shared component library + game/3D layer are empty directories with no design tokens defined.

---

## 3. Missing and Incomplete Features

### Missing entirely (not in spec, not in code)
- **Location Selection screen (NEW requirement).** No route, no file, no mention in `requirements.md`, `design.md`, or `architecture.md`. The user's screen #3 has no home. Must be added to the spec and inserted into the flow between Planet Selection and Mission Configuration. *(BUILD FROM SCRATCH)*
- **Configurable Mission Duration (NEW requirement).** The engine has a "reserved" comment but no field, no UI, and scoring is duration-agnostic. The user explicitly wants "configurable mission duration." *(BUILD FROM SCRATCH — engine field + scoring tie-in + UI)*
- **3D / immersive world.** No 3D layer exists at all. Phaser is dead weight; `three`/R3F are not installed. The user wants "a fully immersive 3D experience" and "a playable space mission, not just a background behind ordinary cards." *(BUILD FROM SCRATCH)*
- **WebGL-unavailable fallback.** No capability detection today; mandatory for the school-machine context (some locked-down Chromebooks, disabled drivers). *(BUILD FROM SCRATCH)*
- **Reduced-motion support.** No `prefers-reduced-motion` handling anywhere; must be added before 3D/animations land. *(BUILD FROM SCRATCH)*
- **Accessibility baseline.** No aria/role, no skip-links, no `focus-visible` styling, no screen-reader text on charts, keyboard nav unverified. For an 8–12 audience this should be a committed baseline (WCAG AA + AAA body contrast), not a stretch goal. *(BUILD FROM SCRATCH)*

### Incomplete (core present, UI missing)
- **Mission Control screen and its sub-panels:** Resource Management, Environmental Events, Decision Interfaces, Astro-AI integration. The simulation supports all of these (`advanceDay`, `resolveEvent`, `emergencyRation`, the event engine); no UI consumes them. *(BUILD FROM SCRATCH for UI; simulation EXISTS)*
- **Astro-AI integration into Mission Control.** Service is built and tested; not wired into any screen; debrief has a static-text fallback with a replacement TODO. *(NEEDS IMPROVEMENT — integration only)*
- **Onboarding, Planet Selection, Crew Selection, Base Configuration screens.** Store actions exist for each (planet, crew size, base config), but the screens are `PlaceholderScreen` stubs. *(BUILD FROM SCRATCH for screens)*

### Spec/doc drift (not a feature, but a gap to fix)
- `product.md` lists **"3D rendering / WebGL environments"** under **Out-of-Scope (V1)**, directly contradicting the user's directive. This must be re-scoped before any 3D work (see §7 and Open Decisions).
- `docs/team-workflow.md` documents `npm run typecheck`, `test:coverage`, `lint:fix` that do not exist in `package.json` (only `dev, build, lint, preview, test, test:watch`).

---

## 4. Existing Bugs and Technical Risks

All grounded in evidence; numbers are exact from the audit's build/test runs.

### R1 — Production bundle is one unsplit, oversized chunk (HIGH)
Build output: `dist/assets/index-*.js 652.85 kB │ gzip: 186.99 kB`, and Vite emitted `(!) Some chunks are larger than 500 kB after minification. Consider: Using dynamic import() ... manualChunks`. `vite.config.ts` defines no `manualChunks` and no route-level lazy loading. Recharts (pulls in d3 deps) is the heaviest contributor. **Adding a 3D engine compounds this.** Code-splitting is mandatory before or alongside the 3D work. The gzipped size passes ~500 KB but the *code-split requirement is unmet* — everything is in one chunk.

### R2 — Five placeholder screens still wired into the router (MEDIUM)
`router.tsx` renders `PlaceholderScreen` for `/`, `/select-planet`, `/select-crew`, `/configure-base`, `/mission`; each shows "PLACEHOLDER — not yet implemented". Empty feature dirs: `src/features/{onboarding,planet-selection,crew-selection,base-configuration,mission-control,events,astro-ai}`, `src/components/{charts,common,feedback,layout}`, `src/game/{config,entities,scenes,systems}` (all verified empty).

### R3 — decisionLog is not injected into the store on each step (latent bug, MEDIUM)
Confirmed in `src/store/mission-store.ts`: `updateFromSimResult` (lines ~90–113) sets `currentResources`, `currentMissionDay`, `activeFaultStates`, `activeEventIds`, `missionOutcome`, and `resourceHistory` — but **does not set `decisionLog`**, despite the comment claiming "decisionLog is passed in via the result so the store always reflects the engine's accumulated log. The hook reads engine.getDecisionLog() and injects it here on every step." `SimulationResult` has no `decisionLog` field, and `useMissionControl`'s `advanceDay`/`resolveEvent`/`emergencyRation` call only `updateFromSimResult(result.value)`. The log is only populated at `endMission()`. **Net effect:** the store's `decisionLog` selector is **empty during the mission**; it only becomes correct after `endMission()`. FR-06-7 (debrief uses the log) is satisfied, but any future live UI reading `decisionLog` (Mission Control decision feed, Astro-AI context) will get `[]`. The comment is misleading and should be fixed.

### R4 — No WebGL-unavailable fallback (HIGH, blocking on 3D)
Grep across `src/**/*` for webgl/fallback/capability detection returned only the **AI** fallback and the React **ErrorBoundary** fallback — neither relates to WebGL. No capability detection, no 2D fallback. Mandatory before 3D ships (school machines are ASTRA's exact context).

### R5 — No reduced-motion support (MEDIUM, blocking on animations/3D)
Grep for `prefers-reduced-motion` → **no matches**. No animations exist yet, so this is latent; must be added before animations/3D land.

### R6 — Accessibility gaps (MEDIUM–HIGH)
Grep for `aria-`/`role=` → **no usage anywhere**. Only semantic markup is `<section>` + headings + `<button type="button">` in Debrief and the ErrorBoundary button. No skip-links, no `focus-visible` styling (only `hover:`/`transition-colors`), Recharts charts have no screen-reader text, keyboard navigation unverified. WCAG 2.1 1.4.3 (contrast), 2.5.8 (target size), 2.3.3 (animation) are unaddressed.

### R7 — Phaser-vs-3D stack/direction mismatch (CRITICAL, decision-blocking)
`package.json` has `phaser ^3.90.0`; grep across `src/**/*` for `from 'phaser'` → **no matches** (Phaser is installed but never imported; `src/game/*` empty). `three`/`@react-three` are not installed. Architecture/steering standardize on Phaser (2D). The user's confirmed direction is "a fully immersive 3D experience." **Steering conflict:** `product.md` lists "3D rendering / WebGL environments" as out-of-scope, directly contradicting the user's latest requirement. This must be reconciled before any 3D work (see §5 and Open Decisions). Right now Phaser is dead dependency weight.

### R8 — Mission non-reproducibility at the app level (LOW)
`useMissionControl.ts` seeds the engine with `seed: Date.now()` (line ~112). The simulation is deterministic *given a seed*, but the app never exposes a fixed-seed control, so a specific run cannot be reproduced. NFR-02-3 holds internally; reproducibility is not usable in practice.

### R9 — Mission duration not configurable (user requirement gap, HIGH)
`simulation-engine.ts` comment "missionDurationDays: 30 — reserved for future configurable mission lengths"; `MissionScoring` uses `daysRun`. No config field, no UI. The user explicitly wants "configurable mission duration."

### R10 — Documentation drift (scripts) (LOW)
`docs/team-workflow.md` documents `npm run typecheck`, `test:coverage`, `lint:fix`, but `package.json` only defines `dev, build, lint, preview, test, test:watch`. Playwright is referenced in docs but is not a dependency.

### R11 — "Location Selection" absent from spec and code (HIGH, spec gap)
The user's screen #3 has no route, no file, and no mention in `requirements.md`, `design.md`, or `architecture.md`. Must be added to the spec or explicitly folded into Planet Selection.

### R12 — React Router v7 future-flag warnings (NON-CRITICAL)
Test output prints warnings suggesting `v7_startTransition` and `v7_relativeSplatPath` future flags. Cosmetic; opt in during the next router pass.

### Build & test baseline (exact, from audit)
- `npm run build` → **exit 0** (`tsc -b && vite build`, zero TS errors). `✓ 678 modules transformed.` `✓ built in 5.29s`. Chunk-size warning as in R1.
- `npm run test -- --run` → **exit 0.** **14 test files passed, 91 tests passed.**

---

## 5. Proposed Architecture Improvements

### 5.1 The 3D stack decision — adopt React Three Fiber + drei + three; retire Phaser 3

**Recommendation: adopt `@react-three/fiber` (R3F) + `@react-three/drei` + `three` as the primary 3D layer, and remove Phaser 3.**

R3F is the pmndrs React renderer for three.js — it renders three.js objects as JSX and reconciles them inside the React tree ([pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber)). drei is the companion helper library — cameras, controls, loaders, `<Environment>`, `<Stars>`, `useGLTF`, `useProgress`, `Html` overlay, `Stats` ([pmndrs/drei](https://github.com/pmndrs/drei)).

**Why R3F fits ASTRA:** ASTRA is React 18 + Vite 5 + TypeScript + Zustand. R3F is purpose-built for exactly this stack — the 3D scene lives in the React tree and reads the same Zustand app store the panels already use, with no separate render-loop plumbing. Declarative JSX meshes the 3D world into the existing component/props model and the "functional components, typed props" coding standards. `@types/three` gives full TypeScript typing; the project's `strict` + `no any` rules carry over. drei avoids hand-rolling loaders, controls, environment maps, and progress UI.

**Why retire Phaser:** a repo-wide search found Phaser in exactly two places — the `package.json` dependency and the defensive guard comments ("NO Phaser imports") at the top of every `src/simulation/` and `src/ai/` file. There is **no actual `import … from 'phaser'`** in any source file. Phaser is scaffolded but never wired in; removing it is a one-line `package.json` removal plus a lockfile refresh, with **zero source impact**. Repurposing it for mini-maps/overlays is rejected: the brief warns against "unnecessary libraries and duplicated functionality," and running two GPU contexts (Phaser + three) doubles GPU/memory cost. HUD, mini-maps, and 2D overlays are better served by React DOM (optionally drei `<Html>` for in-canvas labels) and CSS.

**Alternatives rejected:** raw `three` only (more boilerplate, diverges from the React state model); Babylon.js (heavier, smaller React ecosystem); PixiJS/PlayCanvas (2D-only / editor-centric). Forcing Phaser into pseudo-3D will not satisfy the immersive directive.

### 5.2 Pin set (Path A — React 18-compatible MVP)

The latest R3F/drei lines require **React 19**; ASTRA is on React 18.3.1 (verified against npm registry peer deps — `@react-three/fiber@9.8.2` peers `react >=19 <19.4`; `@react-three/fiber@8.17.10` peers `react >=18.0`). To avoid a cross-cutting React 19 migration (which would ripple into react-router 6→7 and Recharts 2→3 — explicitly warned against for the MVP), pin to the React-18-compatible line:

| Package | Pin | Notes |
|---|---|---|
| `three` | `~0.169.0` | Satisfies drei floor and postprocessing caps (`<0.172`/`<0.175`); `three@0.169.0` verified to exist. |
| `@react-three/fiber` | `~8.17.10` | React 18 line. |
| `@react-three/drei` | `~9.122.0` | React 18 line. |
| `@react-three/postprocessing` | `~2.16.3` | Optional (bloom/atmosphere). Defer if effects are out of MVP scope. |
| `@types/three` | `~0.169.x` | dev dep. |

If bloom/atmosphere effects are deferred, the postprocessing dep can be omitted entirely and `three` can float closer to latest. The React 19 upgrade (→ R3F v9 / drei v10 / three latest) is a **future** task once the 3D experience and the rest of the app stabilize — not part of the MVP.

### 5.3 Decoupling — the simulation engine stays pure; a dedicated 3D layer + typed event bus

**Hard rule (from `.kiro/steering/coding-standards.md` + `architecture.md`): `src/simulation/` must import no React, Zustand, Phaser, or three, and must not call `Date.now()` or `Math.random()`.** The audit confirmed this holds today: ripgrep across `src/simulation/**/*` for react/zustand/phaser/three imports → **0 matches**; for `Date.now()`/`Math.random()` → only comment occurrences, zero actual calls. **The 3D work must not violate this.** The 3D layer is presentation and lives in its own folder; it never imports the simulation engine directly.

**Proposed folder: `src/game3d/`** (prefer over `src/three/`, which reads like the library itself). Add a path alias `@game3d/` alongside the existing aliases.
```
src/game3d/
  components/   # <PlanetCanvas/>, <HabitatModel/>, <EnvironmentSky/>, <ModuleMarker/>, <Fallback2DWorld/>
  scenes/       # MoonScene, MarsScene (planet-specific 3D composition)
  bus/          # event-bus.ts (typed pub/sub) + event-bus.types.ts (intent + event union)
  hooks/        # useReducedMotion, useWebGLAvailable, useSimulationView (read-only)
  adapters/     # app-to-3d adapter: subscribes app store -> readable snapshot; emits intents -> app actions
  assets/       # asset registry (GLB URLs, texture URLs, manifest) + preloaders
  performance/  # quality tiers, dpr/instancing helpers, stats toggle
```

**Typed event bus contract** (a small dependency-free `mitt`-style pub/sub written locally — avoid adding `mitt` to keep deps minimal). Two channels:
- **Intents (3D → application):** `moduleClicked`, `cameraFocusRequested`, `moduleHighlighted`, `planetReady`, `fallbackRequested`. The application layer (`useMissionControl` / app store) translates these into simulation actions or navigation. The 3D layer **never** calls `SimulationEngine.step` directly.
- **View events (application → 3D):** `resourcesChanged`, `eventTriggered`, `environmentChanged` (dust storm / eclipse), `missionPhaseChanged`, `outcomeChanged`. The application layer publishes a **read-only** `SimulationView` snapshot (a derived, frozen view of `SimulationState.resources`, active events, environment, day). The 3D layer subscribes and updates meshes imperatively inside `useFrame` (not via React re-render per tick).

**Invariant ownership (explicit):**
- Simulation state truth → owned by `SimulationEngine` (pure TS), unchanged.
- App/UI state → owned by Zustand app store (current screen, session handle, flags), unchanged.
- 3D visual state (camera, highlight, particle intensity) → owned by `src/game3d/` locally.
- Read-only contract → the 3D layer receives a `SimulationView` it must not mutate. The adapter (`src/game3d/adapters/`) is the only bridge and is part of the application layer, not the simulation layer.

This keeps the existing dependency rules intact: `presentation(game3d) → application → simulation`, with no `simulation → React/three` edge.

### 5.4 Asset loading — GLB/glTF, Draco/meshopt, KTX2, suspense progress UX
- **3D models:** glTF/GLB for habitat modules, rover, solar arrays, crew figures, terrain props. Use drei `useGLTF` (Suspense-based, caches by URL) backed by three's `GLTFLoader` ([three.js GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)).
- **Compression:** compress GLBs with **Draco** (geometry) and/or **meshopt** to cut download size; three ships `DRACOLoader`/`MeshoptDecoder` ([google/draco](https://github.com/google/draco)).
- **Textures:** planet albedo/normal/roughness, skybox/environment. Prefer **KTX2/Basis** for GPU-friendly compressed textures; keep power-of-two sizes. For the sky, use drei `<Environment>` with a NASA-inspired HDRI preset or a procedural sky + `<Stars>`.
- **Planet split:** ship two asset packs (Moon pack vs Mars pack). Only load the **selected** planet's pack (lazy `import()` / dynamic asset URLs) so initial download reflects one world.
- **Suspense + progress:** wrap the `<Canvas>` in `<Suspense>` and use drei `useProgress` (`loaded/total/progress`) to drive a branded NASA-style loading bar; drei also ships a `<Loader>` default.
- **Preload:** `useGLTF.preload(url)` the next likely asset during the loading screen.
- **Per-scene lazy mount:** mount the 3D `<Canvas>` only on screens that need it and unmount on route change to free GPU memory. Use `frameloop="demand"` on low-interaction screens (debrief) so the renderer only redraws on change.
- **Memory discipline:** R3F auto-disposes scene objects added via JSX on unmount. GLTFs loaded via `useGLTF` are cached by URL and **not** auto-disposed — call `useGLTF.clear(url)` / `.dispose()` on leaving a planet scene. Dispose textures explicitly when swapping sky/environment. Target GPU memory for the active scene < 150 MB.

### 5.5 Performance budget
- **Target frame rate:** 60 fps desktop, 30 fps low-end/mobile. Verify with drei `Stats` (off in production, on via a dev flag).
- **Render loop:** `frameloop="always"` only on live Mission Control (continuous time/weather motion). `frameloop="demand"` on mostly-static screens (debrief 3D, planet-selection globe). **Never drive 3D animation through React state** — mutate three objects imperatively inside `useFrame`. React re-renders per simulation tick should update only lightweight DOM panels.
- **Draw calls:** target **< 100 draw calls** on the 3D world on low-end. Use **instancing** (`<Instances>`/`InstancedMesh`) for repeated geometry (solar panels, regolith rocks, antennas). Merge static meshes (`BufferGeometryUtils.mergeGeometries`). Keep distinct GLB count modest (one habitat, a few props, one rover).
- **DPR & responsive:** `dpr={[1, 2]}` on `<Canvas>` to cap device pixel ratio. The `<Canvas>` resizes to its parent automatically; give the parent a sized container and let it drive layout. Use drei `<AdaptiveDpr>` / `performance` prop to lower dpr gracefully if FPS drops.
- **Device tiering:** drei depends on `detect-gpu` (verified in its dependency list) — classify devices into low/med/high at startup and pick a quality tier (shadow quality, dpr ceiling, particle density, env-map resolution). Keep the functional simulation identical across tiers; only visual fidelity changes.
- **Memory target:** < 150 MB GPU memory active scene; ≤ ~50 MB textures. Planet packs mutually exclusive.
- **Avoid React re-render churn:** 3D components read the `SimulationView` snapshot through a ref or via Zustand selectors with `shallow` equality, so a resource tick does not re-render the 3D tree. Imperative `useFrame` reads the latest snapshot from a ref and updates meshes. This is the single most important performance rule for an R3F + Zustand game loop.

### 5.6 WebGL fallback (mandatory)
- **Detection:** on app load (before mounting `<Canvas>`), run `isWebGLAvailable()` — try `getContext('webgl2')` then `'webgl'` then `'experimental-webgl'`; if all return null, WebGL is unavailable ([MDN WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)). Store the boolean once in the app store (`renderMode: '3d' | '2d'`) so every screen reads the same decision. WebGL support is near-universal ([caniuse.com/webgl](https://caniuse.com/webgl)), but the tail (old/locked-down school machines, disabled drivers, some Chromebooks) is exactly ASTRA's 8–12 school context.
- **Fallback content:** render a `<Fallback2DWorld>` — a CSS/SVG stylized 2D "mission control" backdrop with the **same data dashboards** (resources, events, Astro-AI) the 3D screen uses. Because the critical data already lives in React DOM panels, the fallback is "same panels, swap the 3D canvas for a 2D illustration." The **simulation engine is identical** — only the world view changes.
- **Behavior:** a one-time, dismissible banner: "3D mode isn't available on this device — running 2D mode." Never hard-fail; the simulation is the product, 3D is the enhancement.

### 5.7 Reduced-motion (mandatory)
- **Detection:** read `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, subscribe to changes, store `reducedMotion` in the app store. Pass into the 3D layer as a prop/context ([MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)).
- **Disable/reduce in 3D:** camera drift/auto-rotation/fly-throughs (camera stays fixed or moves only on direct user input); particle systems (dust drift, dust storms — render a static overlay or none); parallax and idle loops; bloom flicker and light pulsing. Prefer `frameloop="demand"`.
- **Data-legibility invariant:** reduced motion must **never** reduce data legibility. All numbers, gauges, event text, Astro-AI guidance stay in DOM panels and remain crisp and unchanged.

### 5.8 Accessibility for the 3D canvas
The 3D canvas is a **visual enhancement**. Every piece of critical information must **also** exist in accessible React DOM (which is already the architecture — panels around the canvas).
- Give the `<Canvas>` an `aria-label` / `role="img"` describing the current scene, or mark it `aria-hidden` if a separate text summary panel is present. Never rely on the canvas to convey a value the DOM doesn't also show.
- All decisions (event choices, Astro-AI consultation) are reachable via standard DOM `<button>`/form controls with visible focus and keyboard operability. A decision must **never** be reachable only by clicking something in the 3D canvas — provide a DOM list/buttons equivalent for every clickable 3D module.
- Color is never the sole signal: 3D color states (green/amber/red module glow) must also be represented as text/icon in the DOM panels.
- Maintain AA color contrast (4.5:1) in DOM panels; keep focus indicators visible.
- Reduced-motion + WebGL-unavailable compose: a device can hit any combination. The app must degrade gracefully in each — the simulation and data remain fully functional in all four states (3D+motion, 3D+reduced, 2D+motion, 2D+reduced).
- **Validation caveat:** full WCAG conformance requires manual testing with assistive technologies (screen readers, keyboard-only, voice control) and expert accessibility review — automated checks alone are not sufficient. Flag for QA (Phase 10).

---

## 6. New Gameplay Implementation Plan

A guiding principle: **the simulation engine is the product; gameplay features wire into it without rewriting it.** The engine already supports `advanceDay`, `resolveEvent`, `emergencyRation`, the event engine, resource models, systems, and scoring. New gameplay features add **inputs** to the engine, not a new engine.

### 6.1 Location Selection — BUILD FROM SCRATCH
**What it is:** after Planet Selection, the player chooses a landing site. Each site modifies the planet profile's environmental parameters that the simulation already consumes (solar irradiance, thermal range, dust exposure, day length).

- **Moon sites:** equatorial (max solar, extreme thermal cycling, 14-day solar cycle in full) vs polar (permanently shadowed craters, water-ice resource potential, low solar — favors battery/fuel-cell strategies). Affects solar generation and thermal load.
- **Mars sites:** Gale Crater / Jezero Crater / Olympus Mons region / Valles Marineris etc. Affect solar (latitude), dust-storm frequency, temperature range.

**How it wires in WITHOUT rewriting the engine:** the engine consumes a `PlanetProfile` (already a validated, sourced, `readonly` object). Location selection produces a **location modifier overlay** — a typed, documented delta applied to a *copy* of the planet profile before `SimulationEngine` is constructed. This keeps:
- The pure-TS simulation untouched (no React/three import).
- Scientific separation intact: each modifier is classified `OBSERVED_DATA | DERIVED_PARAMETER | EDUCATIONAL_ASSUMPTION` and documented in `docs/scientific-assumptions.md` with a source URL (per the coding-standards scientific-data rules). Location deltas that are educational assumptions must be labeled as such — we do not invent "measured" numbers.
- The engine's determinism: the modified profile is just another input.

**Classification:** screen/route = **BUILD FROM SCRATCH**; store action `selectLocation` = **BUILD FROM SCRATCH**; planet-profile modifier helper (pure TS, in `src/data/` or a new `src/simulation/planets/` helper that returns a new readonly profile) = **BUILD FROM SCRATCH**; the existing `PlanetProfile` type and validation schema = **EXISTS (reuse)**. Note: `src/simulation/planets/` currently exists but is empty.

### 6.2 Configurable Mission Duration — BUILD FROM SCRATCH
**What it is:** during Mission Configuration, the player sets the target mission length — options **30 / 60 / 90** days (Moon) or sols (Mars). Success is measured against the chosen duration.

**How it wires in WITHOUT rewriting the engine:**
- The engine has a "missionDurationDays: 30 — reserved" comment but no field. Add a small, explicit `missionDurationDays` field to the mission config passed into `SimulationEngine` (constructor/`startMission` input). This is an additive config field, not an engine rewrite.
- `MissionScoring` already uses `daysRun`; tie the score to the *target* duration (e.g., completion ratio = `daysRun / missionDurationDays`, used in the survival/efficiency component of the score). This is a scoring-parameter change inside `mission-scoring.ts` — a pure function — and must be re-validated against `docs/simulation-model.md`. It is a contained edit, not a rewrite.
- The UI (Mission Configuration screen) exposes the 30/60/90 choice and writes it to the store; the application layer passes it to the engine at mission start.

**Classification:** engine config field = **BUILD FROM SCRATCH** (additive); scoring tie-in = **NEEDS IMPROVEMENT** (existing `calculateMissionScore` extended with a target-duration ratio); UI control = **BUILD FROM SCRATCH**.

### 6.3 3D Habitat — BUILD FROM SCRATCH
**What it is:** the immersive 3D base the player manages, rendered with R3F, synced to the simulation via the event bus (§5.3). The habitat is the hero of the Mission Control screen.

**How it wires in:** the 3D layer receives a read-only `SimulationView` snapshot and renders the habitat's state (solar panel deployment, module power/emissive states, dust accumulation, crew activity) by mutating meshes in `useFrame`. Player interactions in the 3D world emit intents (`moduleClicked`, `cameraFocusRequested`) that the application layer translates into focus/navigation — never into direct engine calls. This satisfies "playable space mission, not a background behind cards."

**Classification:** 3D layer = **BUILD FROM SCRATCH** (§5). The simulation it visualizes = **EXISTS (reuse)**.

### 6.4 Existing gameplay wiring (Mission Control sub-panels) — BUILD UI FROM SCRATCH (simulation EXISTS)
The engine already supports the core loop; the screens just need to consume it:
- **Resource Management** — simulation `EXISTS`; UI **BUILD FROM SCRATCH**.
- **Environmental Events / Decision Interfaces** — simulation `EXISTS` (event engine + `RESOLVE_EVENT`); UI **BUILD FROM SCRATCH**.
- **Astro-AI integration** — service `EXISTS`; integration into Mission Control **NEEDS IMPROVEMENT** (wire `AstroAssistant` into a panel; replace debrief's static `getLearningText` with `AstroAssistant.getMissionSummary()` per the existing `// AI-007` TODO).

### 6.5 Bug fix to unblock live gameplay UI — fix R3
Before the Mission Control decision feed or Astro-AI context can read `decisionLog` live, fix R3: either have `updateFromSimResult` accept and set the log (pass `engine.getDecisionLog()` from the hook on each step), or expose a `decisionLog` selector sourced directly from the engine. This is a contained application-layer fix, not an engine change. *(NEEDS IMPROVEMENT)*

### Feature classification summary

| Gameplay feature | Simulation layer | UI / wiring |
|---|---|---|
| Location Selection | modifier helper: **BUILD FROM SCRATCH**; profile type/schema: **EXISTS** | screen + store action: **BUILD FROM SCRATCH** |
| Configurable Mission Duration | engine config field: **BUILD FROM SCRATCH** (additive); scoring tie-in: **NEEDS IMPROVEMENT** | UI control: **BUILD FROM SCRATCH** |
| 3D Habitat | **EXISTS (read-only view)** | 3D layer: **BUILD FROM SCRATCH** |
| Resource Management | **EXISTS** | UI: **BUILD FROM SCRATCH** |
| Environmental Events / Decisions | **EXISTS** | UI: **BUILD FROM SCRATCH** |
| Astro-AI integration | **EXISTS** | wiring: **NEEDS IMPROVEMENT** |
| decisionLog live injection (R3) | engine log: **EXISTS** | store/hook: **NEEDS IMPROVEMENT** |

---

## 7. Complete Visual Redesign Proposal

**Intent:** NASA-inspired mission control + premium futuristic space exploration + immersive planetary 3D — readable and inviting for ages 8–12, never a generic admin dashboard. The current "dashboard" look has a concrete root cause: `tailwind.config.js` has an empty `theme.extend` and `src/index.css` is bare — **there is no design system**. The redesign is, at its core, **authoring the design system**, then re-skinning, then introducing the 3D layer.

### 7.1 Color palette — NASA mission-control inspired
NASA flight-control rooms historically used amber phosphor CRTs on near-black; modern consoles use cyan/white readouts on deep blue-black. The premium space look layers **deep navy space + a warm "ignition" accent + cool "orbit" cyan data accent**. For 8–12 we keep the dark immersive mood but raise contrast above the minimum so young readers never strain, and we separate **brand accent from status semantics** so color is never ambiguous.

**Deep-space backgrounds (layered, blue-tinted, not flat gray):**

| Token | Hex | Use | Contrast rationale |
|---|---|---|---|
| `--space-void` | `#060912` | App background (deepest) | Near-black, blue tint; avoids the flat gray-900 feel. White text ≈ 16–19:1 (AAA). |
| `--space-deep` | `#0B1224` | Large background / vignette | One step up; separates content zones from void. |
| `--space-panel` | `#121C33` | Cards / panels (base surface) | Reads as a raised console panel, not a gray box. |
| `--space-panel-raised` | `#1B2A4A` | Elevated cards, hover, active | Subtle lift via lightness. |
| `--border-subtle` | `#243456` | Default panel borders | Low-contrast structure, visible on dark. |
| `--border-strong` | `#3A5180` | Focused / active borders | ~3:1 against panel for focus visibility (WCAG 1.4.11 non-text). |

**Accents (brand + data):**

| Token | Hex | Use | Contrast rationale |
|---|---|---|---|
| `--accent-ignition` | `#FF6B35` | Primary CTA, active/selected, brand action | Warm "thrust" orange — energetic, kid-friendly, **distinct from warning yellow**. ≈ 6:1 on void. |
| `--accent-orbit` | `#29E6F3` | Data readouts, secondary accent, links, HUD lines | Modern cyan HUD; ≈ 10:1 on void. Pairs with orange for the signature space look. |
| `--accent-starlight` | `#EAF1FA` | High-emphasis headings / primary text | Near-white cool tint; ≈ 16:1 (AAA). |

**Status semantics (color is **never** the sole signal — always paired with icon + label):**

| Token | Hex | Semantic | Note |
|---|---|---|---|
| `--status-good` | `#46E6A0` | Healthy / nominal | Mint-green; distinct from cyan. |
| `--status-warn` | `#FFC93C` | Caution / depleted soon | Warm yellow — deliberately different hue from the orange CTA. |
| `--status-crit` | `#FF5A5F` | Critical / failure | Coral red; ≈ 5.5:1 on deep. |
| `--status-info` | `#29E6F3` | Informational | Reuses orbit-cyan (info ≠ warning). |

**Text ramp:** primary `#EAF1FA` (≈16:1, AAA); secondary `#A9B8D4` (≈7:1, AAA); muted `#7E8DAB` (≥4.5:1, AA — non-essential labels only).

**Contrast principle for this audience:** for body copy 8–12-year-olds must read, **target AAA (7:1), not just AA (4.5:1)**. Verify every pairing with a contrast checker before shipping ([WCAG 1.4.3 Contrast](https://www.w3.org/TR/WCAG21/#contrast-minimum); checker: [WebAIM](https://webaim.org/resources/contrastchecker/)). Contrast ratios above are knowledge-based estimates to confirm during implementation.

**Why this is not "another gray dashboard":** (1) backgrounds are blue-tinted, layered, and luminous, not flat `gray-900`; (2) a signature orange↔cyan accent pair gives instant "space mission" identity instead of default Tailwind blue; (3) status colors never collide with the brand accent.

### 7.2 Typography
**Pairing (free, variable, on-theme):**
- **Headings/display — "Space Grotesk"** (700/600): geometric, modern, on-theme "space" identity, premium without being childish ([Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)).
- **Body/UI — "Lexend"** (400/500/600): designed to improve reading proficiency; excellent for children and low-confidence readers. Alternative: **"Nunito"** (rounded, softer) if a softer look is wanted ([Lexend](https://fonts.google.com/specimen/Lexend)).
- **Numeric readouts/telemetry — "Space Mono"** or "JetBrains Mono": mission-control HUD feel for resource numbers, counters, coordinates ([Space Mono](https://fonts.google.com/specimen/Space_Mono)).
Fallback stack: `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.

**Sizing (larger than typical web default — sized for kids):**

| Role | Size | Weight | Line-height |
|---|---|---|---|
| H1 (screen title) | 40–48px | 700 | 1.1 |
| H2 (section) | 28–32px | 600 | 1.2 |
| H3 (card title) | 22–24px | 600 | 1.3 |
| Body | **18px** (min 16px) | 400 | 1.6 |
| Large body / instructions | 20px | 500 | 1.55 |
| Button / CTA | 18px (min 16px) | 600–700 | — |
| Numeric readout | 20–28px | 600 (mono) | — |

Hierarchy from **size + weight + color + spacing together**, never color alone. Keep instructions short; chunk; avoid walls of text (readability guidance aligned with [Material type scale](https://m3.material.io/styles/typography/type-scale) and [Apple HIG typography](https://developer.apple.com/design/human-interface-guidelines/typography)).

### 7.3 Spacing & shape language
- **Spacing scale (8px base):** `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Card gap 16–24px; card padding 16–24px; section spacing 32–48px.
- **Shape — rounded but premium (sweet spot for 8–12):** cards/panels 12px (`rounded-xl`); large hero panels/modals 16px (`rounded-2xl`); buttons/tags/pills fully round 999px or 10px. **Avoid** sharp 0–4px (too admin) and ultra-round 28px+ (too toddler).
- **Touch targets (critical for kids):** min interactive target **48×48px** (prefer 56px for primary CTAs), exceeding [WCAG 2.2 2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum) (≥24×24). Min gap between adjacent interactive elements 12px. Hit areas can exceed visible size.
- **Elevation/depth:** subtle borders + low-opacity glow over heavy drop shadows — soft outer glow plus accent-tinted glow on focused/active elements. Reads as "lit console panel," not "Material card."
- **Glassmorphism for HUD panels:** translucent fills (`rgba(18,28,51,0.72)`) + `backdrop-filter: blur(12px)` over the live 3D scene. This visually **connects the UI to the 3D world** instead of floating opaque cards over a static background — a core user requirement.

### 7.4 Iconography
- **Style:** filled or duotone, rounded, expressive, consistent 2px stroke; not thin-line corporate.
- **Library:** **Phosphor Icons** (open-source MIT; `duotone`/`fill`/`bold` variants — friendly and on-theme) or **Lucide** (clean, tree-shakeable). Pick **one** and use it everywhere; mixing icon styles is a top anti-pattern ([Phosphor](https://phosphoricons.com/), [Lucide](https://lucide.dev/)).
- **Sizes:** 24px standard, 32px nav/hero, 20px inline. Stroke 2px.
- **Color:** icons inherit semantic status colors; an icon is **always paired with a text label** (color + icon + label, never color alone) — both an accessibility and a kid-comprehension rule.

### 7.5 Motion / animation principles
Motion is **meaningful** — it communicates state change, spatial relationship, cause→effect, feedback. Never decorative noise.
- **Route/screen transitions (400–600ms):** fade + slight scale/dolly so screens feel like a camera moving through a base. `AnimatePresence` (Framer Motion) keyed on route.
- **Micro-interactions (150–300ms):** button press scale `0.97`, hover lift, focus ring glow, toggle springs.
- **Data feedback (300–500ms):** resource bars animate fill on change, numbers **count up/down** (tick) instead of jumping, status color transitions.
- **Event emphasis:** incoming event card slides in with accent glow + subtle scale; critical events get a brief shake/pulse.
- **3D↔UI sync:** selecting a subsystem in the HUD flies the 3D camera to it and outlines it — the signature "playable, not background" motion.
- **Easing:** `ease-out` entrances, `ease-in` exits, gentle spring for playful feedback. Avoid `linear` for organic motion.
- **Library:** **Framer Motion** (`motion`) for orchestrated/layout/route animations; plain **CSS/Tailwind keyframes** for simple hovers ([motion.dev](https://motion.dev/)). One animation lib is justified; keep CSS for trivial cases.
- **Reduced-motion (mandatory):** respect `prefers-reduced-motion: reduce`. On reduce: disable non-essential transforms/parallax/loops, make transitions instant or cross-fade-only, **never** remove informative content. Provide a manual "reduce motion" toggle too ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [WCAG 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)).

### 7.6 Sound (optional, additive)
- Ambient space drone / hab-hum; default **off or very low**; always behind a master mute toggle; respect autoplay policies (no audio before a user gesture).
- UI feedback: short confirmations, distinct warning/critical tones, success chime. Low volume, never startle.
- Implementation: prefer **Web Audio API** procedural tones (tiny, no asset weight) over sample files. Single mute control in the HUD, persist the choice. Additive only; must degrade gracefully.

### 7.7 3D material / lighting / atmosphere direction
This is the section that most directly answers "make the 3D world feel like an actual playable space mission, not a background behind cards."

**Lighting (per-environment, physically based):**
- **Moon:** harsh directional sun (sharp, high-contrast shadows, very low ambient — no atmosphere), cold blue-white key light, a soft cool earthshine fill (the "Earth in the sky" bounce), near-black shadow craters. The 14-day solar cycle → long, sweeping shadow motion over the mission, reinforcing time passage.
- **Mars:** dimmer warm orange sun, dusty atmospheric scatter (peach/orange fog), softer shadows (thin atmosphere diffuses light), pinkish sky tint. **Dust storms dynamically raise fog density and drop light intensity** — a direct visual tie to the simulation's "solar-power reduction during storms" mechanic.

**Materials (PBR metalness/roughness):** habitat brushed metal + white thermal panels + glass canopies with subtle Fresnel reflections + emissive screen/panel inserts + foil-like insulation. PBR so lighting reads correctly across day/night and storm states. Moon regolith: fine gray powder, high roughness, subtle crater displacement/normal. Mars ground: rusty iron-oxide, rolling dust, scattered rocks; dust drift particles. (Imagery reference: [NASA Images](https://images.nasa.gov/).)

**Atmosphere & post-processing (use sparingly — premium, not gimmicky):** bloom on emissive panels, lights, stars, sun (the glow that sells the space look); subtle vignette to focus attention; very mild depth-of-field on focus shots; **no** heavy chromatic aberration or film grain (distracting for kids). Starfield: real instanced points; on the Moon, a large Earth marble in the black sky and the Sun as a bright bloom point — a strong "you are there" cue. Particle systems: drifting dust, solar-panel glints, life-support vent steam, footprint/rover puffs — small, diegetic life.

**Camera = the "playable" core:** orbit camera around the base (drag to rotate, scroll to zoom clamped, tilt limited). The base is the hero; the player moves the camera to inspect systems. **Focus dollies:** clicking a HUD subsystem smoothly flies the camera to the solar arrays and outlines them; an active event flies the camera to the affected module with a warning glow. This 1:1 HUD↔3D sync is the single most important technique to satisfy "playable space mission, not a background behind cards."

### 7.8 Scientific-accuracy guardrail
Per `docs/scientific-references.md` and `docs/scientific-assumptions.md`, **observed data / derived parameters / educational assumptions must stay separated**. The visual layer must not invent scientific values to look good:
- Lighting, atmosphere, and material choices should be *qualitatively* faithful (Moon has no atmosphere → no scatter/sharp shadows; Mars thin CO₂ → diffuse, dusty) but the **numeric** inputs the simulation consumes remain the sourced, Zod-validated profiles.
- Any location modifier (§6.1) that is an educational assumption must be labeled as such and documented — not presented as a NASA measurement. "Do not sacrifice scientific accuracy for visual effects."

---

## 8. Screen-by-Screen Redesign Recommendations

All 11 screens. For each: current state, design problems, what to redesign, interaction improvements, appropriate 3D elements, animation/transition opportunities, how it should feel.

### 8.1 Welcome / Main Menu — PLACEHOLDER → BUILD FROM SCRATCH
- **Current state:** `/` renders `PlaceholderScreen` ("Onboarding" → link to /select-planet).
- **Design problems:** no identity, no onboarding content, generic centered text on a default background.
- **What to redesign:** full title screen with the ASTRA brand, a one-line tagline ("Explore. Decide. Survive. Learn."), a short kid-friendly "what is this?" intro, and a single primary "Begin Mission" CTA. Introduce the role ("you are a mission commander").
- **3D elements:** a 3D base idle scene as a living background — slow orbit cam, twinkling stars, Earth/Sun, subtle hab glow. The 3D `<Canvas>` mounts lazily here on supported devices; `<Fallback2DWorld>` otherwise.
- **Animation/transition:** title fades/scales in, CTA gentle pulse, background slow drift; "Begin Mission" triggers a camera-dolly forward into a route transition (fade + scale).
- **How it should feel:** a game title screen, not a landing page. Inviting, premium, "I want to try this."

### 8.2 Planet Selection — PLACEHOLDER → BUILD FROM SCRATCH
- **Current state:** `/select-planet` placeholder. Store `selectPlanet` exists and is tested.
- **Design problems:** no planets shown; the choice is invisible.
- **What to redesign:** two large interactive 3D planet cards (Moon / Mars) rotating gently; selecting one flies the camera closer and tints the HUD accent. Each card shows a kid-friendly fact strip (gravity, atmosphere, day length) sourced from the validated profiles.
- **3D elements:** instanced globe per planet (Moon: gray regolith + Earth in sky; Mars: rusty + thin atmosphere), low-poly, PBR-lit.
- **Animation/transition:** planet cards rotate idle; hover lifts and brightens; select triggers a camera dolly + HUD accent shift, then transitions to Location Selection.
- **How it should feel:** spatial and tactile — choosing a destination, not a dropdown.

### 8.3 Location Selection (NEW) — BUILD FROM SCRATCH
- **Current state:** no route, no file, not in spec.
- **Design problems:** entirely absent.
- **What to redesign:** after planet, choose a landing site. Show 3–4 candidate sites on/around a stylized planet; each site card lists how it affects solar/thermal/dust (sourced/labeled). For Moon: equatorial vs polar; for Mars: Gale/Jezero/etc. Selecting a site applies the location modifier overlay (§6.1) to the planet profile.
- **3D elements:** the planet from 8.2 with selectable site markers (instanced) at the candidate locations; a soft beam/highlight on the focused site.
- **Animation/transition:** camera flies between site markers; selecting flies in and transitions to Mission Configuration.
- **How it should feel:** choosing a strategic landing site with real tradeoffs.

### 8.4 Mission Configuration (crew + duration) — PLACEHOLDER → BUILD FROM SCRATCH
- **Current state:** split into `/select-crew` (placeholder) + `/configure-base` (placeholder). `setCrewSize` (1–8) exists; duration does not.
- **Design problems:** two stubs, no sliders, no duration control.
- **What to redesign:** a single Mission Configuration flow — crew size (1–8) with role portraits, then a **duration selector (30 / 60 / 90 days/sols)**, then base/system configuration sliders. Keep the existing store actions; add the new duration action and pass it to the engine at mission start.
- **3D elements:** a small habitat preview that updates as crew size/systems change (modules light up as configured).
- **Animation/transition:** sliders animate; the habitat preview adds/removes modules with a quick scale/glow; "Start Mission" triggers a launch transition.
- **How it should feel:** preparing your mission with real, readable controls.

### 8.5 Base Preparation — PLACEHOLDER → BUILD FROM SCRATCH
- **Current state:** `/configure-base` placeholder (guarded by `RequireSetup`).
- **Design problems:** no system-config UI.
- **What to redesign:** system configuration sliders (life support, power, food, water, radiation) tied to the existing `setBaseConfig`. Show live tradeoffs (e.g., more solar = more power but more surface to dust) as educational feedback.
- **3D elements:** the habitat preview with each system module highlighting as configured; a resource-budget readout.
- **Animation/transition:** configuring a system pulses its module; budget bars animate.
- **How it should feel:** outfitting your base before launch, with consequences visible.

### 8.6 3D Mission Control — PLACEHOLDER → BUILD FROM SCRATCH (the hero screen)
- **Current state:** `/mission` placeholder (guarded). Planned as 2D Phaser, not 3D.
- **Design problems:** the centerpiece is a stub.
- **What to redesign:** the live 3D base is the stage; glass HUD panels dock to edges (resource bars, clock, day/cycle). Clicking a subsystem dollies the camera + outlines it; an active event pulses the affected module and slides an `EventCard` in from the side. Numbers count up in mono readouts. This is the screen that must **not** look like a dashboard.
- **3D elements:** the full R3F habitat scene (§5, §7.7) — solar arrays, modules, rover, crew, dust/storm particles, environment sky. Camera focus dollies on subsystem/event selection.
- **Animation/transition:** resource bars animate on tick; camera dollies on focus; event cards slide in; day/night and storm states transition lighting.
- **How it should feel:** commanding a live base — tactile, responsive, alive.

### 8.7 Resource Management — NOT STARTED → BUILD FROM SCRATCH (UI)
- **Current state:** no UI; only the debrief renders resource charts.
- **Design problems:** no live resource view during the mission.
- **What to redesign:** glass HUD resource bars (oxygen, water, food, energy, radiation) with mono readouts, status colors (good/warn/crit + icon + label), and trend sparklines. All data from the existing `currentResources` selector.
- **3D elements:** resource state mirrored on the habitat (e.g., oxygen low → life-support module dims/red glow) — color states also represented as text/icon in DOM.
- **Animation/transition:** bars animate fill; numbers tick; warn/crit states pulse subtly (disabled on reduced-motion).
- **How it should feel:** a mission-control telemetry wall that's readable for kids.

### 8.8 Environmental Events — PARTIAL → BUILD UI FROM SCRATCH
- **Current state:** simulation real (4 lunar + 4 martian events, `processEvents`); no UI.
- **Design problems:** events exist but never surface to the player.
- **What to redesign:** `EventCard` slides in from the side on trigger; shows the event (NASA-inspired icon + title + kid-friendly description) and the decision options as large buttons. Selecting calls the existing `resolveEvent`. Active event pulses the affected module and flies the camera to it.
- **3D elements:** affected module highlight/glow; dust-storm particle raise on Mars; eclipse shadow sweep on Moon.
- **Animation/transition:** card slide-in with accent glow; critical events get a brief shake/pulse; resolve triggers a camera settle + feedback chime (optional sound).
- **How it should feel:** an alert demanding a real decision, with clear consequences.

### 8.9 Decision Interfaces — NOT STARTED → BUILD UI FROM SCRATCH
- **Current state:** simulation handles `RESOLVE_EVENT`; no UI.
- **Design problems:** no decision UI.
- **What to redesign:** each event's 2 choices as large, clearly-labeled buttons with a one-line consequence hint and an "Ask Astro-AI" affordance. Confirm before commit; show immediate feedback (resource deltas animate).
- **3D elements:** camera dolly to the affected module; the chosen option's effect animates on the module.
- **Animation/transition:** button press scale, consequence deltas animate, camera settles.
- **How it should feel:** weighing a real choice and seeing it matter.

### 8.10 Astro-AI Assistant — EXISTS (service) / NOT INTEGRATED → NEEDS IMPROVEMENT
- **Current state:** `AstroAssistant` service built + 16 tests pass; not wired to any screen; debrief uses static `getLearningText` with an `// AI-007` replacement TODO.
- **Design problems:** great service, zero UI.
- **What to redesign:** a floating glass panel with a gentle cyan glow and typing indicator; answers appear word-by-word (instant on reduced-motion). Reads as a crew "comms" channel, not a chatbot widget. Consumes the existing `SimulationContext` builder; responses are Zod-validated with the existing graceful offline fallback.
- **3D elements:** an in-canvas comms beacon/antenna that glows when AI is responding (drei `<Html>` label optional).
- **Animation/transition:** panel slide/glow; typing indicator; word-by-word reveal; reduced-motion = instant.
- **How it should feel:** a knowledgeable crewmate explaining *why*, not a chatbot.

### 8.11 Mission Debrief — EXISTS (working) → RE-SKIN (+ optional 3D recap)
- **Current state:** `MissionDebriefScreen.tsx` is the only real screen (outcome banner, score breakdown, 4 Recharts charts, decision log, learning summary, Play Again). Uses default Tailwind (`bg-gray-900/800`, `bg-blue-600`) + hardcoded chart hex (`#60A5FA`, `#34D399`, `#FBBF24`, `#F87171`).
- **Design problems:** textbook generic dashboard — gray panels, default blue, hardcoded chart colors.
- **What to redesign:** replace gray panels with space-panel tokens; outcome banner uses `status-good/warn/crit` with icon + label; resource charts use shared `--status-*`/`--accent-orbit` tokens so charts share one language with the HUD. Replace the static learning summary with `AstroAssistant.getMissionSummary()` (the existing `// AI-007` TODO). Optionally add a subtle 3D "mission recap" flythrough (fallback-safe).
- **3D elements:** optional recap flythrough (fallback to a 2D recap if WebGL unavailable).
- **Animation/transition:** outcome banner reveal; charts animate in; recap flythrough (reduced-motion: skip flythrough, show static recap).
- **How it should feel:** a satisfying mission report that celebrates learning.

---

## 9. Prioritized Implementation Roadmap

Goal: a **playable, beautiful vertical slice as early as possible**, then expand — without overcomplicating the MVP. Each phase is sequenced so the simulation (already working) drives every visible layer. Effort indicators: S (~1–2 days), M (~3–5 days), L (~1–2 weeks).

### Phase R0 — Reconcile decisions & spec (BLOCKER, do first) — S
- Resolve the `product.md` "3D out-of-scope" conflict (Open Decisions).
- Add Location Selection + Configurable Mission Duration to `requirements.md`/`design.md`/`architecture.md` (R11, R9).
- Confirm the 3D stack (Path A) and Phaser retirement (Open Decisions).
*Rationale: every later phase assumes these are settled.*

### Phase R1 — Design system foundation — M
- Author tokens in `tailwind.config.js` + `src/index.css` CSS custom properties (§7.1–7.3, 7.5).
- Add fonts (Space Grotesk / Lexend / mono) via `index.html` with preconnect.
- Add global `prefers-reduced-motion` block + `focus-visible` styling.
- Pick one icon library (Phosphor or Lucide).
*Rationale: flips the project from "generic" to "designed"; unblocks all screens.*

### Phase R2 — Shared component library — M
- Build `Panel` (glass), `StatReadout`, `ResourceBar`, `StatusBadge`, `PrimaryButton`, `EventCard`, `AstroPanel`, `ScreenTransition` in `src/components/*` (all token-driven). Currently these dirs are empty.
*Rationale: one consistent language for all screens.*

### Phase R3 — Bug fix & vertical-slice wiring — M
- Fix R3 (decisionLog live injection) so the upcoming Mission Control UI + Astro-AI context get a live log.
- Build the **Mission Control vertical slice** first (the hero screen): Resource Management UI + Environmental Events/Decision UI + Astro-AI integration, all consuming the existing simulation. This is the highest-value screen and proves the loop end-to-end before 3D.
*Rationale: a fully playable mission (2D/glass) proves the core before adding 3D weight.*

### Phase R4 — 3D stack integration (decoupled) — L
- Install Path A pins; add `src/game3d/` + `@game3d/` alias + typed event bus + `useWebGLAvailable` + `useReducedMotion` + adapter.
- Build `<PlanetCanvas>` + `<Fallback2DWorld>` + WebGL detection wired into the app store.
- Code-split: lazy-load the 3D chunk on the Mission Control route; add `manualChunks` (R1).
*Rationale: the decoupling and capability detection land before any asset-heavy scene.*

### Phase R5 — 3D Mission Control scene — L
- Build MoonScene/MarsScene, habitat model, environment sky, camera focus dollies, event highlighting. Sync to `SimulationView` via the bus; mutate in `useFrame`. Honor reduced-motion + fallback.
- **BLOCKED on 3D assets** (GLB habitat/rover/props, planet textures, HDRI). User must supply or approve sourcing (Open Decisions). Start with a low-poly placeholder set so the slice is playable, then swap to final assets.
*Rationale: this is where "playable space mission, not a background" is realized.*

### Phase R6 — Front-of-mission screens — M
- Welcome/Main Menu, Planet Selection, Location Selection (NEW), Mission Configuration (crew + duration), Base Preparation — all token-driven, with 3D where it adds value (idle scene, planet globes, site markers, habitat preview).
*Rationale: complete the journey once the hero screen and 3D layer are proven.*

### Phase R7 — Debrief re-skin + optional 3D recap — S
- Re-skin `MissionDebriefScreen` with tokens; swap chart colors to `--status-*`/`--accent-orbit`; wire `AstroAssistant.getMissionSummary()` (AI-007). Optional fallback-safe recap flythrough.
*Rationale: closes the loop with the new design language.*

### Phase R8 — New gameplay features — M
- Location Selection modifier overlay (§6.1) + Configurable Mission Duration engine field + scoring tie-in (§6.2), validated against `docs/simulation-model.md`.
*Rationale: lands the two new user-required features without rewriting the engine.*

### Phase R9 — QA & accessibility — M (was Phase 10)
- Moon + Mars end-to-end tests; resource-depletion edge cases; event triggers; production build; responsive; manual AT testing (screen reader, keyboard-only); reduced-motion + WebGL-fallback matrix across all four states.
*Rationale: validates the 8–12 accessibility baseline.*

### Phase R10 — Delivery — S (was Phase 11)
- Finalize README; doc review; known limitations; remove Phaser dependency (R7) once confirmed unused; reconcile doc script drift (R10).

**MVP cut line:** after Phase R3 the game is fully playable (2D/glass). After Phase R5 it is a beautiful 3D vertical slice (Mission Control). Everything beyond is expansion and hardening. Keep the simulation untouched throughout.

---

## 10. Files and Components Expected to Change

### New files to create
**Design system & components:**
- `tailwind.config.js` — populate `theme.extend` (currently empty) with palette, fonts, radii, shadows, animation/keyframes. *(modify, but effectively authoring from blank)*
- `src/index.css` — add CSS custom properties mirroring tokens, font imports/base styles, reduced-motion block. *(modify from bare directives)*
- `index.html` — font preconnect + links. *(modify)*
- `src/components/common/Panel.tsx`, `StatReadout.tsx`, `ResourceBar.tsx`, `StatusBadge.tsx`, `PrimaryButton.tsx`
- `src/components/feedback/EventCard.tsx`, `AstroPanel.tsx`, `Toast.tsx`
- `src/components/layout/ScreenTransition.tsx`, `AppShell.tsx`
- `src/components/charts/ResourceTrendChart.tsx` (token-driven, possibly lighter than Recharts)

**3D layer (`src/game3d/`):**
- `src/game3d/components/PlanetCanvas.tsx`, `HabitatModel.tsx`, `EnvironmentSky.tsx`, `ModuleMarker.tsx`, `Fallback2DWorld.tsx`
- `src/game3d/scenes/MoonScene.tsx`, `MarsScene.tsx`
- `src/game3d/bus/event-bus.ts`, `event-bus.types.ts`
- `src/game3d/hooks/useReducedMotion.ts`, `useWebGLAvailable.ts`, `useSimulationView.ts`
- `src/game3d/adapters/sim-view-adapter.ts`
- `src/game3d/assets/asset-registry.ts`, `preloaders.ts`
- `src/game3d/performance/quality-tiers.ts`

**Feature screens (`src/features/*` — all currently empty except `mission-debrief`):**
- `src/features/onboarding/OnboardingScreen.tsx`
- `src/features/planet-selection/PlanetSelectionScreen.tsx`
- `src/features/location-selection/LocationSelectionScreen.tsx` (NEW)
- `src/features/crew-selection/CrewSelectionScreen.tsx`
- `src/features/base-configuration/BaseConfigurationScreen.tsx`
- `src/features/mission-control/MissionControlScreen.tsx` + sub-panels (`ResourcePanel.tsx`, `EnvironmentPanel.tsx`, `EventPanel.tsx`, `AstroAIPanel.tsx`)
- `src/features/events/EventPanel.tsx`, `DecisionButton.tsx`

**Config / infra:**
- `vite.config.ts` — add `@game3d/` alias + `manualChunks` (route-level lazy loading, 3D chunk split).

### Existing files to modify
- `src/app/router.tsx` — replace 5 `PlaceholderScreen` routes with real screens; add the new `/select-location` route between `/select-planet` and `/select-crew`; add route-level `lazy()` + `Suspense` for code-splitting; opt into React Router v7 future flags (R12).
- `src/store/mission-store.ts` — fix R3 (inject `decisionLog` on each step, or expose an engine-sourced selector); add `selectedLocationId` + `missionDurationDays` state/actions.
- `src/hooks/useMissionControl.ts` — pass `missionDurationDays` + location-modified profile into `SimulationEngine` at start; optionally expose a fixed-seed control (R8); wire `decisionLog` injection.
- `src/simulation/core/simulation-engine.ts` — **minimal, additive change only**: accept `missionDurationDays` in mission config. No React/three/phaser imports. The engine logic otherwise stays. *(touch with extreme care — this is the project's strength)*
- `src/simulation/core/mission-scoring.ts` — add target-duration ratio to the score (pure function); re-validate against `docs/simulation-model.md`.
- `src/simulation/planets/` (currently empty) — location modifier helper returning a new readonly `PlanetProfile` (pure TS, documented, classified).
- `src/features/mission-debrief/MissionDebriefScreen.tsx` — re-skin with tokens; swap chart hex to `--status-*`/`--accent-orbit`; wire `AstroAssistant.getMissionSummary()` (AI-007).
- `src/ai/` — wire `AstroAssistant` into the Mission Control `AstroAIPanel` (the service already exists and is tested).
- `package.json` — add Path A 3D deps; remove `phaser` (R7) once confirmed unused; add missing scripts if desired (typecheck/test:coverage/lint:fix) to fix R10.
- `docs/architecture.md`, `.kiro/steering/architecture.md`, `.kiro/steering/product.md`, `requirements.md`, `design.md`, `tasks.md` — re-scope V1 to include 3D; add Location Selection + Configurable Mission Duration.

### Existing files to KEEP AS-IS (do not touch for 3D work)
**The entire pure-TS simulation/data/AI core must not be touched by 3D work:**
- `src/simulation/core/simulation-engine.ts` (except the one additive duration field above), `prng.ts`, `simulation-clock.ts`, `mission-scoring.ts`
- `src/simulation/resources/oxygen-model.ts`, `water-model.ts`, `food-model.ts`, `energy-model.ts`
- `src/simulation/systems/*` (LifeSupportSystem, PowerSystem, RadiationProtectionSystem, AgricultureSystem)
- `src/simulation/events/lunar-events.ts`, `martian-events.ts`, `event-engine.ts`
- `src/simulation/types/index.ts`
- `src/data/nasa/moon-profile.ts`, `mars-profile.ts`, `life-support-constants.ts`
- `src/data/validation/planet-profile.schema.ts`, `simulation-state.schema.ts`
- `src/ai/astro-assistant.ts`, `knowledge-base.ts`, `astro-response.schema.ts`, `simulation-context.ts`, prompts/*, `index.ts`
- All existing tests (keep green; add new ones for new features).

**Confirmed:** these files import no React/Zustand/Phaser/three and call no `Date.now()`/`Math.random()` (audit-verified). The 3D layer will read only a derived `SimulationView` snapshot via the adapter — never importing the engine directly.

### Files to retire
- `phaser` in `package.json` (R7) — remove once confirmed unused (grep `from 'phaser'` returns nothing in source; only guard comments remain). The defensive guard comments can stay (harmless) or be trimmed to "NO React/Zustand imports."
- `src/game/` (the empty Phaser scaffold: `config/`, `entities/`, `scenes/`, `systems/`) — superseded by `src/game3d/`. Can be deleted or repurposed; it contains no real code.

---

## Open Decisions for the User

Before implementation begins, the following need user approval:

1. **3D stack.** Confirm adopting **React Three Fiber + @react-three/drei + three** (Path A, React 18-compatible pins) as the primary 3D layer. *(Recommended: yes.)*
2. **Phaser disposition.** Confirm **retiring Phaser 3** (remove the dependency; it is installed but never imported). *(Recommended: retire.)*
3. **Re-scope V1 to include 3D.** `product.md` currently lists "3D rendering / WebGL environments" as out-of-scope, which conflicts with the directive. Confirm updating `product.md`/`architecture.md` to include 3D (R3F) with a 2D fallback as in-scope for V1. *(Recommended: re-scope.)*
4. **Configurable Mission Duration options.** Confirm the target-length options: **30 / 60 / 90** days (Moon) or sols (Mars). Confirm success is measured against the chosen duration (completion ratio). *(Recommended: 30/60/90 with duration-weighted scoring.)*
5. **3D assets — supply vs source.** The 3D scene is blocked on assets (GLB habitat/rover/props, planet textures, HDRI). Confirm which assets the user can supply (e.g., from Figma/Blender) vs which must be sourced (free NASA/public-domain or low-cost packs). *(Recommended: start with a low-poly placeholder set so the slice is playable, then swap to final assets.)*
6. **Location list per planet.** Confirm the candidate landing sites: Moon — **equatorial vs polar** (and whether to add a third, e.g., a nearside mare site); Mars — confirm which craters (e.g., **Gale, Jezero**, and a third). Confirm the environmental tradeoffs each site implies (solar/thermal/dust) and that location deltas are classified and documented as `OBSERVED_DATA | DERIVED_PARAMETER | EDUCATIONAL_ASSUMPTION`. *(Recommended: 3–4 sites per planet, each with a labeled tradeoff.)*
7. **Astro-AI provider/keys.** The `AstroAssistant` service is OpenAI-compatible with a graceful offline fallback. Confirm the provider and whether API keys will be provided (env) or whether V1 ships offline-fallback-only (knowledge-base answers). *(Recommended: ship offline-fallback-only for V1 unless a key is supplied.)*
8. **Sound.** Confirm whether optional ambient/UI sound is in V1 scope or deferred. *(Recommended: defer; additive later.)*
9. **Icon library.** Confirm **Phosphor** vs **Lucide** (pick one). *(Recommended: Phosphor duotone for the kid-friendly expressive look.)*
10. **Accessibility baseline.** Confirm committing to **WCAG AA + AAA body contrast + reduced-motion + WebGL fallback** as the V1 baseline (not stretch). *(Recommended: commit.)*

---

*End of report. All 10 sections (1–10) and the Open Decisions section are present. No source, config, dependency, or git changes were made; the only file written is `docs/astra-redesign-report.md`.*
