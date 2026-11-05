# ASTRA — Playable 2D/Glass Vertical Slice — Implementation Plan

Build the playable presentation layer on top of the (untouched) pure-TS simulation engine so the game is playable end-to-end. 3D (React Three Fiber) is a LATER phase — do NOT install three/R3F or build any 3D here. This is pure presentation: React + Tailwind + Framer Motion + Phosphor icons.

## Ground rules (apply to every item)

- NEVER edit any file under `src/simulation/`. The engine already supports `advanceDay`, `resolveEvent`, `emergencyRation`, the event engine, `getDecisionLog()`, `getMissionScore()`. Verify with `git diff --name-only` that no `src/simulation/` path changed.
- No `any`. Functional components only. Typed props via a named `interface` directly above each component. Max ~300 lines/file; split larger.
- Accessibility: every interactive element keyboard-reachable; visible `focus-visible`; color NEVER the sole signal (always icon + label); min 48×48px targets (56px primary CTAs); aria-labels on icon-only buttons; charts need sr-only text. WCAG AA, target AAA body contrast.
- Reduced motion: respect `prefers-reduced-motion: reduce` globally; add a manual "Reduce Motion" HUD toggle persisted to localStorage.
- All resource/event/score data comes from the simulation via `useMissionControl` — never hardcoded. Only design tokens and the consumption rates from `life-support-constants.ts` (for the crew-screen projected readout) are constants in UI.
- Build/test commands: `npm run build` (`tsc -b && vite build`, must exit 0), `npm run test -- --run` (vitest, all green). Baseline: 91 tests, build clean. Target 120+.
- Install ONLY: `framer-motion@11.18.2` and `@phosphor-icons/react@2.1.10` (both React-18 compatible, verified peerDeps). Pin exact. Add to `dependencies`.

## Dependency order & decomposition

This work decomposes into 5 separable features (FEAT-001..005), executed strictly sequentially (one worktree, each FEAT builds+tests+commits). Dependency chain:

```
FEAT-001 (design system + shared components)  ── foundation for all UI
FEAT-002 (foundation fixes: decisionLog live, initialResources, getMissionSummary, useAstroContext)  ── independent of 001; lands the data/AI substrate
FEAT-003 (setup screens + router wiring, eager)  ── depends on 001
FEAT-004 (Mission Control hero + Astro-AI + event-registry)  ── depends on 001, 002, 003
FEAT-005 (debrief re-skin + code-split + v7 flags + final verify + docs)  ── depends on all
```

Note on ordering vs. the original prose list: the decisionLog live-fix (FEAT-002) is placed BEFORE Mission Control (FEAT-004), not after debrief, because the redesign report §6.5 states R3 must be fixed before the live Mission Control decision feed / Astro-AI context can read `decisionLog`. `getMissionSummary` is added in FEAT-002 so FEAT-005's debrief can consume it.

---

## FEAT-001 — Design system + shared component library (R1 + R2)

- [ ] 1. Install runtime deps: `npm install framer-motion@11.18.2 @phosphor-icons/react@2.1.10` (saves to `dependencies`; both verified React-18 peers).
      Files: `package.json`, `package-lock.json`
      Verify: `npm ls framer-motion @phosphor-icons/react` lists both; `npm run build` exits 0 (no usage yet).

- [ ] 2. Populate `tailwind.config.js` `theme.extend` with EXACT tokens from report §7.1–7.3,7.5. Nested color scales: `colors.space.{void:#060912, deep:#0B1224, panel:#121C33, panelRaised:#1B2A4A}`, `colors.border.{subtle:#243456, strong:#3A5180}`, `colors.accent.{ignition:#FF6B35, orbit:#29E6F3, starlight:#EAF1FA}`, `colors.status.{good:#46E6A0, warn:#FFC93C, crit:#FF5A5F, info:#29E6F3}`, `colors.text.{primary:#EAF1FA, secondary:#A9B8D4, muted:#7E8DAB}`. `fontFamily.display:['Space Grotesk',...]`, `body:['Lexend',...]`, `mono:['Space Mono',...]` (sans/mono fallback stacks). `borderRadius:{xl:'12px','2xl':'16px'}`. `boxShadow` glow variants (`glow.ignition`, `glow.orbit` low-opacity colored shadows) + soft `panel`. `keyframes`/`animation`: `fade-in`, `slide-in-right`, `pulse-warn`, `count-up`.
      Files: `tailwind.config.js`
      Verify: `npm run build` exits 0 (Tailwind compiles tokens).

- [ ] 3. Add Google Fonts to `index.html` with preconnect: Space Grotesk (600;700), Lexend (400;500;600), Space Mono (400;600) via `fonts.googleapis.com/css2` with `&display=swap`. Keep existing title/meta.
      Files: `index.html`
      Verify: `npm run build` exits 0.

- [ ] 4. Author `src/index.css` (keep `@tailwind base/components/utilities`). Add `:root` CSS custom properties mirroring every token above (`--space-void` etc.). Base body styles: `font-family` Lexend, `background` space.void, `color` text.primary, `font-size` 18px, `line-height` 1.6, `-webkit-font-smoothing` antialiased. `*:focus-visible` outline using `--accent-orbit` (visible focus ring, never removed). `@media (prefers-reduced-motion: reduce)` block: set `animation-duration:0.01ms`, `transition-duration:0.01ms`, disable non-essential transforms (never hide content). Utility `.glass-panel` (glassmorphism: `background:rgba(18,28,51,0.72); backdrop-filter:blur(12px); border:1px solid #243456; border-radius:12px`). Utility `.hud-mono` (Space Mono readouts).
      Files: `src/index.css`
      Verify: `npm run build` exits 0.

- [ ] 5. Add `reducedMotion` to `app-store.ts`: state `reducedMotion: boolean` (init `false`) + `setReducedMotion(value: boolean)`. Do NOT call `window.matchMedia` at module load (jsdom has no matchMedia) — the hook (item 6) handles detection on mount. Keep all existing app-store actions.
      Files: `src/store/app-store.ts`
      Verify: `npm run build` + existing tests pass (partial `useAppStore.setState({...})` in tests still merges fine).

- [ ] 6. Create `useReducedMotion` hook: returns `{ reducedMotion: boolean; toggleReducedMotion: () => void }`. On mount (guard `typeof window !== 'undefined'`): read localStorage `astra-reduce-motion`; if unset, read `window.matchMedia('(prefers-reduced-motion: reduce)').matches` (guard undefined); set store + persist. Toggle flips store + localStorage + applies `document.documentElement.dataset.reduceMotion = 'true'|''`. SSR/jsdom-safe.
      Files: `src/hooks/useReducedMotion.ts`
      Verify: `npm run build` exits 0.

- [ ] 7. Common components (one per file, typed props, token-driven, accessible):
      - `src/components/common/Panel.tsx` — props `{ as?: ElementType; className?: string; children: ReactNode; accent?: 'ignition'|'orbit'|'none'; title?: string }`. Glass-panel wrapper; optional accent glow.
      - `src/components/common/PrimaryButton.tsx` — props `{ children; onClick?; to?: string; variant?: 'primary'|'secondary'|'ghost'='primary'; size?: 'md'|'lg'='md'; disabled?; type?='button'; ariaLabel?; className? }`. 56px min-height for `lg`; accent.ignition bg for primary; framer-motion press scale 0.97; hover lift; `focus-visible` ring. If `to` provided, render as react-router `Link` wrapping the motion button.
      - `src/components/common/StatusBadge.tsx` — props `{ status: 'good'|'warn'|'crit'|'info'; label: string; icon?: PhosphorIconType }`. Pill with icon + label (NEVER color alone). Maps status→token color.
      - `src/components/common/StatReadout.tsx` — props `{ label; value: string|number; unit?: string; status?: 'good'|'warn'|'crit'|'info'; trend?: 'up'|'down'|'flat' }`. Space Mono numeric; trend arrow icon.
      Files: 4 files above
      Verify: `npm run build` + new component tests pass.

- [ ] 8. `src/components/charts/ResourceBar.tsx` — props `{ label; value: number; max: number; unit?: string; status: 'good'|'warn'|'crit'; icon?: PhosphorIconType; valueLabel?: string }`. Animated fill via framer-motion `width` (instant when reduced-motion via `useReducedMotion`). Color from `status` token. Has an sr-only text node with `label value/max unit`.
      Files: `src/components/charts/ResourceBar.tsx`
      Verify: `npm run build` + test.

- [ ] 9. `src/components/feedback/EventCard.tsx` — props `{ event: EventDefinition; onResolve: (choiceId: string) => void; accent?: 'ignition'|'orbit' }`. Slides in from right (framer-motion; instant on reduced-motion). Phosphor event icon + `event.title` + `event.description` (age 8–12) + one button per `event.choices` (PrimaryButton; secondary variant for non-first). aria-label per choice includes title.
      Files: `src/components/feedback/EventCard.tsx`
      Verify: `npm run build` + test.

- [ ] 10. `src/components/feedback/AstroPanel.tsx` — props `{ messages: readonly AstroResponse[]; isLoading: boolean; onAsk: (promptKind: AstroAskKind) => void; reducedMotion: boolean }` where `AstroAskKind = 'situation'|'oxygen'|'water'|'food'|'energy'`. Floating glass "comms" panel, cyan glow. Renders messages; word-by-word reveal via state interval (instant when `reducedMotion`). "typing" indicator when `isLoading`. Each message shows `explanation`, `scienceFact` (if present), `suggestion` (if present). Buttons call `onAsk`.
      Files: `src/components/feedback/AstroPanel.tsx`
      Verify: `npm run build` + test.

- [ ] 11. `src/components/layout/AppShell.tsx` — props `{ children: ReactNode; hudSlot?: ReactNode; title?: string }`. CSS starfield background (layered radial-gradient stars + animated drift; static when reduced-motion). Top HUD bar renders `hudSlot` + the Reduce-Motion toggle (uses `useReducedMotion`). Provides the framed main content area. Renders a visually-hidden `<h1>` from `title` for screen readers.
      Files: `src/components/layout/AppShell.tsx`
      Verify: `npm run build` + test.

- [ ] 12. `src/components/layout/ScreenTransition.tsx` — props `{ children: ReactNode; routeKey: string }`. framer-motion `AnimatePresence` keyed on `routeKey`: fade + slight scale/dolly (instant/cross-fade on reduced-motion). Used to wrap each routed screen.
      Files: `src/components/layout/ScreenTransition.tsx`
      Verify: `npm run build` + test.

- [ ] 13. Component tests — render + props + a11y (keyboard focus reaches the element; icon + label both present; 48px+ targets). One file per component under `tests/unit/components/`: `Panel`, `PrimaryButton`, `StatusBadge`, `StatReadout`, `ResourceBar`, `EventCard`, `AstroPanel`, `AppShell`, `ScreenTransition`.
      Files: `tests/unit/components/*.test.tsx`
      Verify: `npm run test -- --run` — 91 existing + new component tests pass.

---

## FEAT-002 — Foundation fixes: decisionLog live, initialResources, getMissionSummary, useAstroContext

- [ ] 14. Extend `mission-store.ts`: add `initialResources: ResourceSnapshot | null` to `MissionState` + `INITIAL_MISSION_STATE` (null). Add action `setInitialResources(resources: ResourceSnapshot): void`. Extend `updateFromSimResult(result, decisionLog?: readonly DecisionLogEntry[])` to set `decisionLog` when provided (replace the misleading comment with one that says the hook passes `engine.getDecisionLog()` on each step). `resetMission` already spreads `INITIAL_MISSION_STATE` so it clears `initialResources`.
      Files: `src/store/mission-store.ts`
      Verify: `npm run build` + `npm run test -- --run` (mission-store tests, after update in item 18).

- [ ] 15. Wire `useMissionControl.ts`: in `initializeMission`, after computing `initialResources`, call `missionStore.getState().setInitialResources(initialResources)` before `startMission()`. In each of `advanceDay`/`resolveEvent`/`emergencyRation` success branches, pass `engineRef.current!.getDecisionLog()` (non-null asserted with a comment, since we just null-checked `engineRef.current`) as the second arg to `updateFromSimResult(result.value, log)`. (NO `src/simulation/` change — only the hook calls the existing engine method.)
      Files: `src/hooks/useMissionControl.ts`
      Verify: `npm run build` + hook tests (item 18).

- [ ] 16. Add `getMissionSummary` to `AstroAssistant` (`src/ai/astro-assistant.ts`): `async getMissionSummary(context: SimulationContext): Promise<AstroResponse>`. Map `context.outcome` → fallback trigger: `'success'→'mission-success'`, `'failure'→'mission-failure'`, `'partial'→'mission-partial'`, else `'default'`. Build prompt via new `buildMissionSummaryPrompt(context)`; return `this.callAI(prompt, trigger)`. Never throws (callAI falls back to KB). Reuses existing `callAI`/`getFallback`.
      Files: `src/ai/astro-assistant.ts`
      Verify: `npm run build` + AI test (item 18).

- [ ] 17. Add mission-summary prompt + KB entry + barrel export: `src/ai/prompts/mission-summary.prompt.ts` exporting `buildMissionSummaryPrompt(context)` (age-appropriate, no invented numbers, JSON-schema instruction — follow the pattern of `event-explanation.prompt.ts`). Add a `'mission-partial'` entry to `KNOWLEDGE_BASE` in `src/ai/knowledge-base.ts` (good-effort tone for partial). Export `buildMissionSummaryPrompt` from `src/ai/index.ts`.
      Files: `src/ai/prompts/mission-summary.prompt.ts`, `src/ai/knowledge-base.ts`, `src/ai/index.ts`
      Verify: `npm run build` + AI test (item 18).

- [ ] 18. Create `useAstroContext` hook returning `SimulationContext | null`: reads `useMissionControl` selectors (`selectedPlanetId`, `crewSize`, `baseConfig`, `currentResources`, `currentMissionDay`, `activeEventIds`, `activeFaultStates`, `missionOutcome`) + `initialResources` from the store; looks up the planet profile (`selectedPlanetId === 'moon' ? MOON_PROFILE : MARS_PROFILE`) for `displayName`/`timeUnitLabel`; reconstructs a `SimulationState` (`seed: 0`, not used by the context) and calls `buildSimulationContext(state, null, displayName, timeUnitLabel, initialResources)`. Returns `null` if mission not active or any required datum missing. (Importing the profile objects is a read-only data access, allowed; importing `buildSimulationContext` from `@ai` is allowed.)
      Files: `src/hooks/useAstroContext.ts`
      Verify: `npm run build` + a small test asserting it returns null before mission start and a context after (optional; covered by screen tests).

- [ ] 19. Update tests for the bug fix + new AI method:
      - `tests/unit/store/mission-store.test.ts`: assert `updateFromSimResult(result, log)` sets `decisionLog`; assert `setInitialResources` sets it; assert `resetMission` clears `initialResources`.
      - `tests/unit/hooks/useMissionControl.test.ts`: assert `decisionLog` is non-empty after `advanceDay` (not only after `endMission`); assert `initialResources` is set after `initializeMission`.
      - `tests/unit/ai/astro-assistant.test.ts`: add `getMissionSummary` cases for `success`/`failure`/`partial` outcomes — each returns a Zod-valid `AstroResponse` (offline fallback).
      Files: 3 test files above
      Verify: `npm run test -- --run` — all pass.

---

## FEAT-003 — Setup screens + router wiring (eager imports)

- [ ] 20. `OnboardingScreen` (route `/`): `AppShell` + `ScreenTransition`. ASTRA title (Space Grotesk display), tagline "Explore. Decide. Survive. Learn.", a 2–3 sentence kid-friendly "you are a mission commander" intro, single "Begin Mission" `PrimaryButton` → `useNavigate('/select-planet')`. CSS starfield from AppShell. Inviting, premium.
      Files: `src/features/onboarding/OnboardingScreen.tsx`
      Verify: `npm run build` + test (item 25).

- [ ] 21. `PlanetSelectionScreen` (route `/select-planet`): two large interactive cards (Moon/Mars) each showing facts from `MOON_PROFILE`/`MARS_PROFILE` (gravity `gravity_m_s2`, temperature range `temperatureRange.min/max`, atmosphere note, day length `timeUnitLabel`, radiation `unshieldedDailyRadiation_mSv`). Phosphor icons (Moon/Planet). `onClick` calls `selectPlanet(id)`; selected card gets accent glow + aria-pressed. "Continue" `PrimaryButton` (disabled until `selectedPlanetId !== null`) → `/select-crew`. "Back" → `/`.
      Files: `src/features/planet-selection/PlanetSelectionScreen.tsx`
      Verify: `npm run build` + test (item 25).

- [ ] 22. `CrewSelectionScreen` (route `/select-crew`): crew-size stepper 1–8 (large +/- buttons; Phosphor astronaut icons scaling with count). LIVE projected daily-consumption readout using `life-support-constants` constants: `OXYGEN_PER_PERSON_PER_DAY_KG × crew`, `WATER_PER_PERSON_PER_DAY_KG × crew`, `FOOD_PER_PERSON_PER_DAY_KG × crew`, `POWER_PER_CREW_MEMBER_KW × crew` — shown as `StatReadout`s. `setCrewSize(n)` on change. "Continue" (disabled until `crewSize ≥ 1`) → `/configure-base`. "Back" → `/select-planet`.
      Files: `src/features/crew-selection/CrewSelectionScreen.tsx`
      Verify: `npm run build` + test (item 25).

- [ ] 23. `BaseConfigurationScreen` (route `/configure-base`): controls seeded from `getDefaultBaseConfig(crewSize)` for the `BaseConfig` fields — `solarPanelArea_m2` (slider 0–200), `batteryCapacity_kWh` (slider 0–500), `agricultureArea_m2` (slider 0–50), `shieldingLevel` (low/medium/high segmented control), `lifeSupportEfficiency` (slider 0.5–1.0). Each control has a kid-friendly label + micro-copy + tradeoff hint (e.g. "more solar = more power but more dust exposure"). Local state holds the draft config. "Start Mission" `PrimaryButton`: `setBaseConfig(draft)` then `initializeMission()` then `useNavigate('/mission')`. Inline validation requiring planet + crew (guards already enforce; show a message if missing). "Back" → `/select-crew`.
      Files: `src/features/base-configuration/BaseConfigurationScreen.tsx`
      Verify: `npm run build` + test (item 25).

- [ ] 24. Wire the 4 setup routes in `src/app/router.tsx` with EAGER imports (lazy loading comes in FEAT-005). Replace the 4 `PlaceholderScreen` routes (`/`, `/select-planet`, `/select-crew`, `/configure-base`) with the real screens, each wrapped in `<ScreenTransition routeKey={path}>`. Keep `RequireSetup` on `/configure-base`. Leave `/mission` as the existing `PlaceholderScreen` (replaced in FEAT-004) and `/debrief` as `MissionDebriefScreen` (re-skinned in FEAT-005). Guards unchanged.
      Files: `src/app/router.tsx`
      Verify: `npm run build` + tests pass; the 4 setup screens render on their routes.

- [ ] 25. Screen tests (`MemoryRouter` + real store reset between tests): `OnboardingScreen` (Begin Mission navigates to `/select-planet`); `PlanetSelectionScreen` (clicking a card calls `selectPlanet`, Continue disabled until selected, then navigates); `CrewSelectionScreen` (stepper changes `crewSize` and projected readout updates); `BaseConfigurationScreen` (Start Mission calls `setBaseConfig` + `initializeMission` + navigates to `/mission`).
      Files: `tests/unit/features/OnboardingScreen.test.tsx`, `PlanetSelectionScreen.test.tsx`, `CrewSelectionScreen.test.tsx`, `BaseConfigurationScreen.test.tsx`
      Verify: `npm run test -- --run` — all pass.

---

## FEAT-004 — Mission Control hero + sub-panels + Astro-AI wiring + event-registry

- [ ] 26. `event-registry` lookup: import `LUNAR_EVENTS` from `@simulation/events/lunar-events` and `MARTIAN_EVENTS` from `@simulation/events/martian-events`, build a `Map<string, EventDefinition>`. Export `getEventDefinition(eventId: string): EventDefinition | undefined` and `getEventsForPlanet(planetId: PlanetId): readonly EventDefinition[]`. (Re-exporting the event arrays for presentation lookup is allowed; this file does NOT import the engine.)
      Files: `src/features/events/event-registry.ts`
      Verify: `npm run build` exits 0.

- [ ] 27. `ResourcePanel`: reads `currentResources`, `initialResources` (store, FEAT-002) and `resourceHistory` from `useMissionControl`. One `ResourceBar` each for oxygen/water/food/energy with status by threshold (crit < 10% of `initialResources` for oxygen/water/food; energy crit < 15%). Radiation dose `StatReadout` + status (warn ≥ `RADIATION_HIGH_THRESHOLD_MSv`, crit ≥ `RADIATION_CRITICAL_THRESHOLD_MSv` — import thresholds from `@data/nasa/life-support-constants`). Crew status line. If `resourceHistory.length ≥ 2`, render a small inline SVG sparkline per resource (no Recharts here — keep it light). All data from selectors.
      Files: `src/features/mission-control/ResourcePanel.tsx`
      Verify: `npm run build` + test (item 32).

- [ ] 28. `EnvironmentPanel`: reads `selectedPlanetId` → profile `displayName` + `timeUnitLabel`; `currentMissionDay`; environmental conditions as `StatusBadge`s. Derive solar status for presentation from data only (do NOT import `SimulationClock`/`getSolarAvailabilityFactor` — that's simulation layer): for Moon use `profile.solarCycleDays`/`solarDayLength` (`(missionDay % solarCycleDays) < solarDayLength` → "Lunar Day" else "Lunar Night"); for Mars show "Sol cycle" nominal. Show temperature range from `profile.temperatureRange`. Show active `faultStates` as `StatusBadge`s (icon + label). Crew count.
      Files: `src/features/mission-control/EnvironmentPanel.tsx`
      Verify: `npm run build` + test (item 32).

- [ ] 29. `EventPanel`: reads `activeEventIds`; for each id, `getEventDefinition(id)` → render an `EventCard` passing its `choices`; `onResolve(choiceId)` calls `resolveEvent(eventId, choiceId)` from `useMissionControl`. If an id has no definition, skip gracefully. If `activeEventIds` is empty, show an "All systems nominal" `Panel`.
      Files: `src/features/mission-control/EventPanel.tsx`
      Verify: `npm run build` + test (item 32).

- [ ] 30. `AstroAIPanel`: instantiate `AstroAssistant` once via `useMemo`/`useRef` reading `import.meta.env.VITE_AI_API_KEY`/`VITE_AI_API_ENDPOINT`/`VITE_AI_MODEL` (cast to `string | undefined`). Use `useAstroContext()` (FEAT-002). Render the `AstroPanel` component; buttons "Explain current situation" (`explainEvent`) and per-resource "Why is X changing?" (`explainResourceChange` for oxygen/water/food/energy). Maintain a `messages: AstroResponse[]` + `isLoading` state; on click, push the awaited (Zod-validated) response. Reduced-motion via `useReducedMotion`. If context is null (mission not active), disable buttons.
      Files: `src/features/mission-control/AstroAIPanel.tsx`
      Verify: `npm run build` + test (item 32).

- [ ] 31. `MissionControlScreen` (the hero): `AppShell` with a central CSS "base" backdrop (AppShell starfield + a stylized habitat illustration via inline SVG/Phosphor — NOT 3D). Dock glass HUD panels around it: `ResourcePanel`, `EnvironmentPanel`, `EventPanel`, `AstroAIPanel`. Top HUD: mission-day counter, planet name, crew count, "Advance Day" `PrimaryButton` (`advanceDay()`), "End Mission" button (`endMission()` then `useNavigate('/debrief')`), reduce-motion toggle (AppShell). If `globalError` set → inline error `Panel` with dismiss (`clearError`). If `missionOutcome !== 'ongoing'` → surface a banner + "View Debrief" `PrimaryButton` → `/debrief`. Keep under ~300 lines (sub-panels are separate files).
      Files: `src/features/mission-control/MissionControlScreen.tsx`
      Verify: `npm run build` + test (item 32).

- [ ] 32. Wire `/mission` route: replace the `PlaceholderScreen` for `/mission` with `MissionControlScreen` (eager) inside the existing `RequireSetup` + `RequireMission` guards, wrapped in `ScreenTransition`. Screen tests: `MissionControlScreen.test.tsx` using the real store (setup valid state + `initializeMission` + a couple `advanceDay`) — assert "Advance Day" calls `advanceDay` (day increments), an `EventCard` choice calls `resolveEvent`, "End Mission" sets `missionActive=false` and navigates to `/debrief`, `AstroAIPanel` renders. Add sub-panel tests as needed.
      Files: `src/app/router.tsx`, `tests/unit/features/MissionControlScreen.test.tsx`
      Verify: `npm run build` + `npm run test -- --run` — all pass.

---

## FEAT-005 — Debrief re-skin + code-split + v7 flags + final verification + docs

- [ ] 33. Shared chart-colors constant: export `CHART_COLORS = { oxygen: '#29E6F3', water: '#46E6A0', food: '#FFC93C', energy: '#FF5A5F' }` matching `accent.orbit`/`status.*` tokens (also export the same hex for axis/grid/tooltip styling).
      Files: `src/components/charts/chart-colors.ts`
      Verify: `npm run build`.

- [ ] 34. `LoadingScreen`: branded Suspense fallback — ASTRA wordmark, animated starfield (reduced-motion safe), sr-only "Loading…". ~small.
      Files: `src/components/common/LoadingScreen.tsx`
      Verify: `npm run build`.

- [ ] 35. Re-skin `MissionDebriefScreen`: replace `bg-gray-900/800`, `bg-blue-600`, `text-gray-*`, `border-gray-*` with space-panel/glass + `text.*`/`border.*` tokens. Outcome banner: `status.good/warn/crit` background + Phosphor icon + label (never color alone). `ResourceChart` colors via `CHART_COLORS`; axis/grid/tooltip styled with token hex. Replace the static `getLearningText` with `AstroAssistant.getMissionSummary()` called in a `useEffect` via `useAstroContext()`; show a loading state then the summary text (keep a sensible fallback while loading). Wrap in `AppShell` + `ScreenTransition`. Keep all 7 existing sections + "Play Again" (`resetMission` + navigate `/`).
      Files: `src/features/mission-debrief/MissionDebriefScreen.tsx`
      Verify: `npm run build` + debrief tests (item 38).

- [ ] 36. Router code-split: wrap all 6 screens in `React.lazy(() => import(...))` and render each inside `<Suspense fallback={<LoadingScreen />}>` (FEAT-005 item 34). Keep all guards — wrap the guarded element so the guard still runs (e.g. `<RequireSetup><Suspense><Lazy/></Suspense></RequireSetup>`). This starts splitting the bundle (report risk R1).
      Files: `src/app/router.tsx`
      Verify: `npm run build` exits 0; note the new (multiple) chunk sizes in build output (smaller per-route than the 653 KB baseline).

- [ ] 37. React Router v7 future flags: add `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` to `<BrowserRouter>` in `src/App.tsx` (report risk R12). Tests use `MemoryRouter` (unaffected).
      Files: `src/App.tsx`
      Verify: `npm run build` + `npm run test -- --run` (no v7 future-flag warnings).

- [ ] 38. Update debrief tests: keep all 7 existing assertions passing (outcome banner /success|failure/i, score rows incl. final "435", "No mission data recorded", "Nominal step", "No decisions recorded."). Update any class-name-based assertions; add a check that no `bg-gray-900` class is present; handle the async learning summary (`waitFor`/`findByText` or assert the loading placeholder). The outcome banner text ("Mission Success!" etc.) still satisfies the /success|failure/i assertions independent of the async summary.
      Files: `tests/unit/features/MissionDebriefScreen.test.tsx`
      Verify: `npm run test -- --run` — all pass.

- [ ] 39. Doc updates (light): update `.kiro/steering/workflow.md` — mark R1, R2, R3 (playable slice) progress; set current phase to "Playful 2D/Glass slice — playable end-to-end". Lightly update `.kiro/specs/astra/tasks.md` if it has the relevant rows. Do NOT edit `product.md`/`requirements.md`.
      Files: `.kiro/steering/workflow.md`, `.kiro/specs/astra/tasks.md`
      Verify: files updated.

- [ ] 40. Final verification (must all pass before done):
      1. `npm run build` exits 0, zero TS errors; note bundle size (expect smaller per-route chunks via lazy loading).
      2. `npm run test -- --run` — all pass (91 existing + new; target 120+).
      3. `git -C "c:\Users\HP\Desktop\NASA SPACE APPS" diff --name-only` shows NO `src/simulation/` path.
      4. Manual flow reasoning: Onboarding → Planet → Crew → Config → Start Mission → Mission Control (Advance Day, resolve an event, ask Astro-AI) → End Mission → Debrief — every step works with real simulation data.
      5. Reduced-motion toggle works; focus-visible rings visible; no color-only signals.
      Verify: all green.

---

## Cross-cutting notes called out explicitly

- **(a) AstroAssistant.getMissionSummary** — added in FEAT-002 item 16 (`src/ai/astro-assistant.ts`) + prompt (item 17) + KB entry + unit test (item 18); consumed by FEAT-005 debrief (item 35). NOT a simulation change.
- **(b) event-registry lookup** — `src/features/events/event-registry.ts` (FEAT-004 item 26) imports the `LUNAR_EVENTS`/`MARTIAN_EVENTS` arrays and builds an id→definition map; `EventPanel` uses `getEventDefinition`. Avoids importing the engine; reuses the existing exported event arrays.
- **(c) decisionLog live-fix** — `mission-store.updateFromSimResult` accepts an optional `decisionLog` (FEAT-002 item 14); the hook passes `engine.getDecisionLog()` after each successful step (item 15). NO simulation change.
- **(d) React.lazy + Suspense code-split** — FEAT-005 item 36; v7 future flags in `App.tsx` (item 37).
