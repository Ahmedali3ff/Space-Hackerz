# Implementation Plan — ASTRA Hybrid Campaign

**Task:** Hybrid 8-level campaign with game design tokens, campaign data, audio manager, 7 new game screens, router integration, and tests.

**Decomposition:** This work has been decomposed into FEAT artifacts under `.agents/tasks/hybrid-campaign-feats/`. The workflow tail has been replaced with per-FEAT coder steps followed by a convergence loop. See `task.json` for ordering.

---

## Summary of work (12 steps → 3 FEATs)

### FEAT-001 — Design tokens + Campaign data + Audio manager (Steps 1–3)
- Add `game.*` color tokens to `tailwind.config.js` (additive — keep all existing `spaceplus.*`)
- Add game CSS utilities to `src/index.css` (additive — append after existing)
- Extend `MissionDefinition` interface with optional campaign fields
- Update 6 existing missions + add missions 7 & 8
- Create `src/store/game-progress-store.ts` (Zustand + persist)
- Create `src/services/audio-manager.ts`

### FEAT-002 — 7 new game screens (Steps 4–10)
- `src/features/game/CampaignMapScreen.tsx` — 8-level branching mission map with game dark theme
- `src/features/game/CinematicIntroScreen.tsx` — story intro with typewriter text + planet CSS orb
- `src/features/game/GameplayScreen.tsx` — 2.5D interactive room view with character, objects, events
- `src/features/game/GameEventModal.tsx` — full-screen decision modal with consequences
- `src/features/game/PauseMenuOverlay.tsx` — ESC/pause with resume/settings/quit
- `src/features/game/LevelCompleteScreen.tsx` — star rating + XP + story-advance panel
- `src/features/game/GameOverScreen.tsx` — failure state with reason + retry

### FEAT-003 — Router integration + tests (Steps 11–12)
- Add 7 new lazy routes to `src/app/router.tsx` (additive — no existing routes touched)
- Add `RequireGameActive` guard
- Tests: `tests/unit/game/` and `tests/unit/services/audio-manager.test.ts`

---

## Hard constraints (enforced in every FEAT)
1. `src/simulation/` — zero changes
2. No new npm packages
3. All 219 existing tests keep passing
4. No `any` types
5. Existing routes and screens untouched — only ADD

---

## Verification
`npm run build` — must exit 0  
`npx vitest run` — must show ≥ 219 tests passing (new tests add to total)
