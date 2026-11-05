# ASTRA Redesign Implementation Plan
# Space+ Visual System + 6-Mission Progression

**Generated:** 2026-11-05  
**Baseline:** 177 tests passing, clean build  
**Worktree:** `c:\Users\HP\Desktop\NASA SPACE APPS`

---

## Context Summary

The codebase is a Vite 5 + React 18 + TypeScript strict SPA. Current theme is a deep-space dark palette (NASA mission control aesthetic). The redesign adds a lighter, more vibrant "Space+" palette suited for ages 8–12 alongside the dark theme (dark is kept for Mission Control for immersion). A 6-mission progression system is new. The simulation engine (`src/simulation/`) is read-only.

**Build command:** `npx vite build`  
**Test command:** `npx vitest run`  
**No new npm packages** (uses existing: framer-motion, @phosphor-icons/react, recharts, zustand, zod, react-router-dom)

---

## Implementation Plan

- [ ] 1. **FEAT-A: Design System Tokens** *(prerequisite for everything)*  
      Extend `tailwind.config.js` with `colors.spaceplus` (whites, teals, ambers, corals, purples for ages 8–12 audience) alongside existing dark tokens. Add CSS custom properties to `:root` in `src/index.css`. Add Nunito font to `index.html`. Add `.sp-card`, `.sp-badge-teal`, `.sp-badge-amber`, `.sp-section-label`, `.sp-star-score` utility classes. All changes are purely additive — no existing class names removed.  
      Files: `tailwind.config.js`, `src/index.css`, `index.html`  
      Verify: `npx vite build` succeeds; `npx vitest run` — still 177 passing.

- [ ] 2. **FEAT-B: Shared Components** *(depends on FEAT-A tokens)*  
      Add new components and update existing ones:  
      - `src/components/layout/TopNavBar.tsx` — NEW: step indicator + reduced-motion toggle  
      - `src/components/layout/AppShell.tsx` — UPDATE: add `variant?: 'dark' | 'light'` prop (dark = existing behavior)  
      - `src/components/common/Card.tsx` — NEW: white card with accent/selected variants  
      - `src/components/common/PrimaryButton.tsx` — UPDATE: add `'hint'` variant (teal fill)  
      - `src/components/common/ProgressBar.tsx` — NEW: 8px teal progress bar, role='progressbar'  
      - `src/components/common/SectionLabel.tsx` — NEW: uppercase 11px teal label  
      - `src/components/common/StarScore.tsx` — NEW: amber star + score number  
      - `src/components/common/UserChip.tsx` — NEW: avatar pill with name  
      - `src/components/common/TaskChecklistItem.tsx` — NEW: complete/active/locked states  
      - `src/components/common/StatusDot.tsx` — NEW: colored dot + label (never color alone)  
      - `src/components/feedback/EventAlertCard.tsx` — NEW: white card with teal left border + choice buttons  
      - `src/components/feedback/AstroAIHint.tsx` — NEW: lightbulb button + framer-motion expandable response  
      - `src/components/charts/MiniProgressBar.tsx` — NEW: inline label+bar for sidebars  
      Files: 13 files created/modified (listed above)  
      Verify: `npx vite build` succeeds; `npx vitest run` — 177 passing.

- [ ] 3. **FEAT-C: Missions Data + Progress Store** *(depends on FEAT-A only; independent of FEAT-B)*  
      Define the mission progression system:  
      - `src/data/missions/mission-definitions.ts` — 6 mission definitions (m01-m06), MissionDefinition + MissionTask + MissionTaskRule types, MISSIONS array, getMissionById()  
      - `src/data/missions/mission-progress.ts` — MissionProgress interface + MissionStatus type (pure types, no logic)  
      - `src/store/mission-progress-store.ts` — Zustand store with zustand/middleware persist (localStorage), initial state: m01 active + m02-m06 locked, actions: setCommanderName, startMission, completeTask, completeMission, getMissionStatus, getCurrentMission, resetProgress. Export INITIAL_PROGRESS_STATE.  
      - `src/services/mission-task-evaluator.ts` — pure function evaluateMissionTasks(mission, state): string[] — evaluates all 14 task rule types (survive_N_days, keep_oxygen_50pct, resolve_N_events, use_emergency_ration, configure_life_support, select_mars, keep_resources_above_critical, score_500). NO React imports.  
      Files: 4 new files  
      Verify: `npx vite build` succeeds; `npx vitest run` — 177 passing.

- [ ] 4. **FEAT-D: Screen Redesigns** *(depends on FEAT-A + FEAT-B + FEAT-C)*  
      Redesign all screens with Space+ visual language. All simulation data wiring (useMissionControl hook) is preserved unchanged — only markup and layout change. All existing aria-labels/text selectors that existing tests rely on are preserved verbatim.  
      - `OnboardingScreen.tsx` — light card, commander name input, 3 feature chips  
      - `PlanetSelectionScreen.tsx` — CSS sphere illustrations, mission count pills (Moon×3, Mars×3)  
      - `CrewSelectionScreen.tsx` — 2-column: stepper left + MiniProgressBar sidebar right  
      - `BaseConfigurationScreen.tsx` — grouped Cards + mission readiness sidebar + 30/60/90 duration selector (UI only — no sim engine change)  
      - `MissionControlScreen.tsx` — 2-col: journey map left + task checklist+StarScore+AstroAIHint right; floating resource bar; EventAlertCard overlay for events  
      - `MissionDebriefScreen.tsx` — emoji outcome heading, StarScore, stats grid, 3 learning cards, next mission CTA  
      - `src/features/missions/MissionsOverviewScreen.tsx` — NEW: 6 MissionCards (complete/active/locked states)  
      Update any test selectors that no longer match (change selectors only, never change test logic or what assertions check).  
      Files: 7 feature screen files (6 updated + 1 new)  
      Verify: `npx vite build` succeeds; `npx vitest run` — ≥170 passing.

- [ ] 5. **FEAT-E: Router Updates** *(depends on FEAT-D — needs MissionsOverviewScreen and LocationSelectionScreen)*  
      - `src/features/location-selection/LocationSelectionScreen.tsx` — NEW: placeholder with 3 location cards per planet, navigates to /select-crew on selection  
      - `src/app/router.tsx` — ADD `/select-location` route (lazy, no guard) and `/missions` route (lazy, no guard)  
      - `src/features/planet-selection/PlanetSelectionScreen.tsx` — UPDATE: navigate('/select-crew') → navigate('/select-location'), update aria-label  
      - Update PlanetSelectionScreen test: expected route '/select-crew' → '/select-location'  
      Files: 1 new + 2 updated + 1 test updated  
      Verify: `npx vite build` succeeds; `npx vitest run` — ≥170 passing.

- [ ] 6. **FEAT-F: useMissionControl Integration** *(depends on FEAT-C + FEAT-D + FEAT-E)*  
      Wire task evaluation into the hook and expose mission progress data to screens:  
      - `src/hooks/useMissionControl.ts` — ADDITIVE: import evaluateMissionTasks + useMissionProgressStore; call evaluateMissionTasks after every successful advanceDay and resolveEvent; update UseMissionControlReturn to include `commanderName: string` and `currentMissionId: string | null`  
      - `src/features/mission-control/MissionControlScreen.tsx` — use currentMissionId to look up mission tasks for task checklist  
      - `tests/unit/features/MissionControlScreen.test.tsx` — add commanderName + currentMissionId to makeControlHook mock; mock useMissionProgressStore  
      Files: 1 hook updated + 1 screen updated + 1 test updated  
      Verify: `npx vite build` succeeds; `npx vitest run` — ≥170 passing.

- [ ] 7. **FEAT-G: Tests** *(depends on all prior FEATs)*  
      Add new unit tests and fix any remaining selector failures:  
      - `tests/unit/data/missions.test.ts` — NEW: 9 tests (6 missions, getMissionById, tasks, rewards)  
      - `tests/unit/services/mission-task-evaluator.test.ts` — NEW: 18 tests (all 14 rule types)  
      - `tests/unit/store/mission-progress-store.test.ts` — NEW: 11 tests (CRUD, unlock chain, reset)  
      - Audit + fix any remaining broken selectors across all feature test files  
      Total target: ≥177 passing (new tests add ≥38, net count ≥215)  
      Files: 3 new test files + any selector fixes  
      Verify: `npx vitest run` — ≥177 passing, zero failures; `npx vite build` — clean.

---

## Preserved Test Selectors (MUST NOT CHANGE)

The following text/aria-labels are used by existing tests and must be kept verbatim in screens:

| Screen | Preserved selector |
|--------|--------------------|
| Onboarding | `'ASTRA'` text, `/Begin Mission/i` button, `/Explore/`, `/Survive/`, `/Learn/`, sr-only h1 'ASTRA Mission Control' |
| PlanetSelection | `'The Moon'`, `'Mars'`, `/select the moon/i` aria-label, `/select mars/i`, `'No atmosphere'`, `'Thin CO₂ atmosphere'`, `'1.62'` (gravity), `/back to onboarding/i` |
| CrewSelection | `/decrease crew size/i`, `/increase crew size/i`, aria-live crew size readout, `/back to planet selection/i`, `/continue to base configuration/i` |
| BaseConfig | `/start the mission/i` or `/start mission/i`, slider aria-labels with units |
| MissionControl | `/advance to next day/i`, `/end mission and view debrief/i`, `'All systems nominal'`, `/mission successful/i`, `/view mission debrief/i`, `/dismiss error/i`, `/explain situation/i`, event choice button labels |
| MissionDebrief | `'Score Breakdown'`, `'Decision Log'`, `'What Did We Learn?'`, `'Play Again'` |

---

## Key Design Decisions

1. **Additive token strategy** — Space+ tokens are added to `tailwind.config.js` as a `spaceplus` sub-key. Existing dark tokens stay intact. This avoids breaking any existing component that references dark classes.

2. **AppShell variant prop** — Light screens (onboarding → base config, debrief, missions hub) use `variant='light'` (white/surface background). Mission Control keeps `variant='dark'` for immersion. This is the simplest way to support both themes without a global context.

3. **Duration selector is UI-only** — The 30/60/90 day selector is added to BaseConfigurationScreen's draft state but not passed to `BaseConfig` (the sim engine doesn't consume it yet). It is displayed in the mission readiness card and will tie into the scoring once the sim engine is extended. This avoids touching `src/simulation/` now.

4. **Mission progress store uses persist middleware** — `zustand/middleware` `persist` is already a transitive dependency of zustand. No new package needed. localStorage key: `'astra-mission-progress'`.

5. **CSS sphere planets** — No WebGL/canvas. Pure CSS radial-gradient circles in PlanetSelectionScreen. Moon: silver-to-blue gradient. Mars: orange-to-red gradient.

6. **LocationSelectionScreen is a placeholder** — Implements the user journey insertion point (F09 Location Selection from product.md) as a passthrough screen. Full location modifiers are a Phase-2 feature.

---

## Files NOT Touched (simulation engine is read-only)

- `src/simulation/**` — all files unchanged
- `src/data/nasa/**` — all files unchanged
- `src/ai/**` — all files unchanged
- `src/hooks/useAstroContext.ts` — unchanged
- `src/hooks/useReducedMotion.ts` — unchanged
- `src/app/providers/**` — unchanged
- `src/main.tsx` — unchanged

---

## Detailed FEAT Artifacts

Full step-by-step implementation details for each FEAT are in:  
`c:\Users\HP\Desktop\NASA SPACE APPS\.agents\tasks\redesign-feats\features\FEAT-A.json` through `FEAT-G.json`

Context for each coder step: `.agents\tasks\redesign-feats\context.json`
