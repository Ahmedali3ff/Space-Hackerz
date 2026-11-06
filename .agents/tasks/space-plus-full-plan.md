# Space+ Mission Academy — Full Implementation Plan

**Workspace:** `c:\Users\HP\Desktop\NASA SPACE APPS`
**Build command:** `npm run build` (tsc -b && vite build)
**Test command:** `npm test` (vitest run)
**Current passing tests:** 219
**Decomposed into:** 5 FEAT artifacts under `.agents/tasks/space-plus-feats/features/`

---

## Exploration Findings

### ASTRA → Space+ rebrand scope
Every "ASTRA" occurrence in source files is either:
- A comment header (no user-visible impact — low priority)
- A visible text node in a component (must change)
- An `aria-label` string (must change)
- A localStorage key (`astra-mission-progress`, `astra-reduce-motion`)
- An AI prompt system message string

Files with **visible** ASTRA text that users see:
| File | Line | Current text |
|------|------|--------------|
| `index.html` | title + meta | `ASTRA — Mission Control Academy` |
| `src/components/common/LoadingScreen.tsx` | ~L39 | `ASTRA` wordmark |
| `src/components/layout/TopNavBar.tsx` | ~L68 | `{title ?? 'ASTRA'}` default |
| `src/features/onboarding/OnboardingScreen.tsx` | ~L56 | `ASTRA` h2 |
| `src/features/base-configuration/BaseConfigurationScreen.tsx` | AppShell title | `ASTRA — Configure Your Base` |
| `src/features/crew-selection/CrewSelectionScreen.tsx` | AppShell title | `ASTRA — Select Your Crew` |
| `src/features/location-selection/LocationSelectionScreen.tsx` | AppShell title | `ASTRA — Choose Your Landing Site` |
| `src/features/planet-selection/PlanetSelectionScreen.tsx` | AppShell title | `ASTRA — Choose Your Destination` |
| `src/features/missions/MissionsOverviewScreen.tsx` | AppShell title | `Mission Control Academy` |

### Invisible buttons root cause
`PrimaryButton.tsx` uses Tailwind custom tokens like `bg-spaceplus-accent-teal` but these only resolve if `tailwind.config.ts` defines them. The `secondary` variant uses `bg-white text-spaceplus-text-heading border border-spaceplus-border-light` — if the border token resolves to white or near-white, the button appears invisible against a white Card. Fix: replace all Tailwind tokens in VARIANT_CLASSES with literal hex values.

### Simulation layer constraints (respected)
Only these files in `src/simulation/` may change:
1. `types/index.ts` — add `missionDurationDays?` to `SimulationEngineConfig`, add `durationBonus` to `MissionScore`
2. `core/simulation-engine.ts` — store `missionDurationDays`, pass to scoring, add `setBaselineSolarFactor()`
3. `core/mission-scoring.ts` — add `targetDurationDays` param, compute `durationBonus`
4. `planets/location-modifier.ts` — NEW file (pure, additive)

### Backend design decision
Express + better-sqlite3 server in `server/` directory. DB file at `./space-plus.db` (gitignored). Player ID is hardcoded to 1 for V1 (single-player, no auth). All API calls from the frontend are fire-and-forget — the app works fully offline.

### Level system design
6 levels defined in `src/data/levels/level-definitions.ts`. XP is awarded per mission via `getXPForMission(stars, missionNumber) = (stars × 20) + (missionNumber × 10)`. Level computed deterministically from total XP. No server persistence required for XP in V1 (localStorage via Zustand persist).

---

## Implementation Plan

- [ ] 1. **Rebrand to Space+ + Fix Buttons + Level System** *(FEAT-001)*
      Files to create: `src/data/levels/level-definitions.ts`
      Files to modify: `index.html`, `package.json`, `src/components/common/LoadingScreen.tsx`,
      `src/components/common/PrimaryButton.tsx`, `src/components/common/Card.tsx` (verify sp-card CSS),
      `src/components/common/UserChip.tsx`, `src/components/layout/TopNavBar.tsx`,
      `src/features/onboarding/OnboardingScreen.tsx`,
      `src/features/base-configuration/BaseConfigurationScreen.tsx`,
      `src/features/crew-selection/CrewSelectionScreen.tsx`,
      `src/features/location-selection/LocationSelectionScreen.tsx`,
      `src/features/planet-selection/PlanetSelectionScreen.tsx`,
      `src/features/missions/MissionsOverviewScreen.tsx`,
      `src/features/mission-control/MissionControlScreen.tsx`,
      `src/ai/prompts/decision-guidance.prompt.ts`,
      `src/ai/prompts/event-explanation.prompt.ts`,
      `src/ai/prompts/mission-summary.prompt.ts`,
      `src/ai/prompts/resource-change.prompt.ts`,
      `src/store/mission-progress-store.ts` (add totalXP + awardXP),
      `src/hooks/useReducedMotion.ts` (storage key rename)
      Verify: `npm run build` (0 errors) + `npm test` (219+ pass)

- [ ] 2. **Complete Gameplay Loop + Location Selection + Mission Duration** *(FEAT-002)*
      Depends on: FEAT-001 (level types exist, XP award exists)
      Files to create: `src/simulation/planets/location-modifier.ts`,
      `src/data/locations/moon-locations.ts`, `src/data/locations/mars-locations.ts`
      Files to modify: `src/simulation/types/index.ts` (missionDurationDays, durationBonus),
      `src/simulation/core/simulation-engine.ts` (missionDurationDays field + setBaselineSolarFactor),
      `src/simulation/core/mission-scoring.ts` (durationBonus calculation),
      `src/store/mission-store.ts` (selectedLocationId, selectedMissionDurationDays, setters),
      `src/hooks/useMissionControl.ts` (read location + duration, apply modifier, pass to engine),
      `src/features/mission-control/ResourcePanel.tsx` (color-coded bars, critical banner, delta),
      `src/features/mission-control/EventPanel.tsx` (urgency visual, choice buttons, result toast),
      `src/features/mission-control/MissionControlScreen.tsx` (day summary, outcome overlays, task toast),
      `src/features/base-configuration/BaseConfigurationScreen.tsx` (30/60/90 duration selector),
      `src/components/charts/ResourceBar.tsx` (verify transition-all duration-500 on fill)
      Verify: `npm run build` (0 errors) + `npm test` (all pass, update scoring tests for durationBonus)

- [ ] 3. **Express + SQLite Backend + API Client** *(FEAT-003)*
      Depends on: FEAT-001 (XP types), FEAT-002 (mission duration field in store)
      Files to create: `server/types/api.types.ts`, `server/db.ts`,
      `server/routes/players.ts`, `server/routes/missions.ts`, `server/routes/scores.ts`,
      `server/index.ts`, `src/services/api-client.ts`
      Files to modify: `package.json` (add server/dev:full scripts + new dependencies),
      `src/store/mission-progress-store.ts` (fire-and-forget API calls in setCommanderName + completeMission),
      `src/features/mission-debrief/MissionDebriefScreen.tsx` (saveMissionRun on mount),
      `.env.example` (add VITE_API_URL)
      Verify: `npm run build` (0 errors) + `npm test` (all pass) + `npx tsx server/index.ts` starts

- [ ] 4. **New Screens (Discoveries, Star Map, Spaceship, Explorers) + Router + Nav Tabs** *(FEAT-004)*
      Depends on: FEAT-001 (level system), FEAT-003 (api-client for leaderboard)
      Files to create: `src/features/discoveries/MyDiscoveriesScreen.tsx`,
      `src/features/star-map/StarMapScreen.tsx`,
      `src/features/spaceship/MySpaceshipScreen.tsx`,
      `src/features/explorers/ExplorersScreen.tsx`
      Files to modify: `src/app/router.tsx` (add /discoveries, /star-map, /spaceship, /explorers routes),
      `src/components/layout/TopNavBar.tsx` (4 nav tabs + active state),
      `src/components/layout/AppShell.tsx` (use TopNavBar as header),
      `src/features/missions/MissionsOverviewScreen.tsx` (add 'View Star Map' button + mission reset)
      Verify: `npm run build` (0 errors) + `npm test` (all pass) + manual check all 4 routes render

- [ ] 5. **Final Integration Fixes** *(FEAT-005)*
      Depends on: all previous FEATs complete
      Files to modify: `src/features/mission-control/AstroAIPanel.tsx` (loading state, hint button text, offline badge),
      `src/components/feedback/AstroPanel.tsx` (italic science fact, teal suggestion box),
      `src/features/mission-control/MissionControlScreen.tsx` (personalized heading, YOU ARE HERE position, star rating from store),
      `tailwind.config.ts` (verify #1FC8C0 exactly),
      `src/index.css` (verify sp-card, fix any non-#1FC8C0 teal),
      All simulation comment files (remove remaining ASTRA text in comments),
      Any failing tests from FEAT-002 type changes (add durationBonus to MissionScore fixtures)
      Verify: `npm run build` (0 errors) + `npm test` (all 219+ pass) + full E2E walkthrough

---

## Part-by-Part Reference

### PART 1 — Rebrand to Space+
→ FEAT-001, Steps 1–8

### PART 2 — Fix Invisible Buttons + Card
→ FEAT-001, Steps 9–10

### PART 3 — Level System
→ FEAT-001, Steps 11–14

### PART 4 — Complete Gameplay Loop
→ FEAT-002, Steps 9–14

### PART 5 — Backend (Express + SQLite)
→ FEAT-003, Steps 1–14

### PART 6 — Location Selection Wired to Simulation
→ FEAT-002, Steps 1–8

### PART 7 — Mission Duration Wired to Scoring
→ FEAT-002, Steps 1–3 + Step 15

### PART 8 — My Discoveries + Star Map Screens
→ FEAT-004, Steps 1–2

### PART 9 — My Spaceship Screen
→ FEAT-004, Step 3

### PART 10 — Astro-AI Hint Button
→ FEAT-005, Step 1

### PART 11 — Explorers Screen
→ FEAT-004, Step 4

### PART 12 — Complete TopNavBar with 4 Tabs
→ FEAT-004, Steps 5–8 + FEAT-001, Steps 3 and 14

### PART 13 — Fix All Remaining Issues
→ FEAT-005, Steps 2–11

---

## Simulation Layer Changes Summary (Constraint-Checked)

| File | Change | Permitted |
|------|--------|-----------|
| `src/simulation/types/index.ts` | Add `missionDurationDays?` to `SimulationEngineConfig`; add `durationBonus` to `MissionScore` | ✅ |
| `src/simulation/core/simulation-engine.ts` | Store `missionDurationDays`, pass to scoring; add `setBaselineSolarFactor()` | ✅ |
| `src/simulation/core/mission-scoring.ts` | Add `targetDurationDays` param, compute `durationBonus` | ✅ |
| `src/simulation/planets/location-modifier.ts` | NEW pure function file | ✅ |
| All other `src/simulation/` files | NO changes | ✅ |

---

## Test Impact Assessment

Tests most likely to need updating after FEAT-002 type changes:
- `tests/simulation/mission-scoring.test.ts` — `calculateMissionScore` return object now includes `durationBonus`. Update expected objects to include `durationBonus: expect.any(Number)` or the exact computed value.
- `tests/simulation/simulation-engine.test.ts` — `getMissionScore()` return now includes `durationBonus`. Same fix.
- No tests should be deleted. No test logic should change — only the expected result shape.

---

## File Creation Summary

### New source files
```
src/data/levels/level-definitions.ts
src/data/locations/moon-locations.ts
src/data/locations/mars-locations.ts
src/simulation/planets/location-modifier.ts
src/features/discoveries/MyDiscoveriesScreen.tsx
src/features/star-map/StarMapScreen.tsx
src/features/spaceship/MySpaceshipScreen.tsx
src/features/explorers/ExplorersScreen.tsx
src/services/api-client.ts
server/types/api.types.ts
server/db.ts
server/routes/players.ts
server/routes/missions.ts
server/routes/scores.ts
server/index.ts
```

### Modified source files
```
index.html
package.json
.env.example
src/simulation/types/index.ts
src/simulation/core/simulation-engine.ts
src/simulation/core/mission-scoring.ts
src/store/mission-store.ts
src/store/mission-progress-store.ts
src/hooks/useMissionControl.ts
src/hooks/useReducedMotion.ts
src/components/common/PrimaryButton.tsx
src/components/common/Card.tsx (verify sp-card CSS)
src/components/common/UserChip.tsx
src/components/common/LoadingScreen.tsx
src/components/layout/TopNavBar.tsx
src/components/layout/AppShell.tsx
src/components/charts/ResourceBar.tsx
src/components/feedback/AstroPanel.tsx
src/features/onboarding/OnboardingScreen.tsx
src/features/base-configuration/BaseConfigurationScreen.tsx
src/features/crew-selection/CrewSelectionScreen.tsx
src/features/location-selection/LocationSelectionScreen.tsx
src/features/planet-selection/PlanetSelectionScreen.tsx
src/features/missions/MissionsOverviewScreen.tsx
src/features/mission-control/MissionControlScreen.tsx
src/features/mission-control/ResourcePanel.tsx
src/features/mission-control/EventPanel.tsx
src/features/mission-control/AstroAIPanel.tsx
src/features/mission-debrief/MissionDebriefScreen.tsx
src/app/router.tsx
src/ai/prompts/decision-guidance.prompt.ts
src/ai/prompts/event-explanation.prompt.ts
src/ai/prompts/mission-summary.prompt.ts
src/ai/prompts/resource-change.prompt.ts
tailwind.config.ts (verify token values)
src/index.css (verify sp-card)
```
