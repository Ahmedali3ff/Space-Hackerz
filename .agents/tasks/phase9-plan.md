# Implementation Plan — Phase 9: Mission Debrief

## Context

- **Workspace:** `c:\Users\HP\Desktop\NASA SPACE APPS`
- **Build command:** `npm run build` (runs `tsc -b && vite build`)
- **Test command:** `npm run test -- --run` (runs `vitest run`)
- **Current baseline:** 75 tests pass, build is clean.
- **Path aliases:** `@/` → `src/`, `@simulation/` → `src/simulation/`, `@store/` → `src/store/`, `@ai/` → `src/ai/`
- **TypeScript scope:** `tsconfig.app.json` includes only `src/`. Test files in `tests/` are transpiled by Vite/Vitest but NOT checked by `tsc -b`. This means TypeScript errors in `tests/` do not fail the build — but we still write correct TypeScript in tests.
- **Recharts:** `^2.15.4` (React 18 compatible). `LineChart`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `Line` from `recharts`.
- **React Router:** `^6.30.6`. Route guards via wrapper components in `src/app/router.tsx`.

---

## Pre-exploration Findings

### DEB-001 — Decision log recording: ✅ Already correct
`endMission()` in `useMissionControl.ts` correctly calls `engine.getMissionScore()` and `engine.getDecisionLog()`, then passes both to `missionStore.getState().endMission(score, log)`. The store `endMission` sets `decisionLog: log`. No fix needed for the data flow.

**One issue found:** `tests/unit/store/mission-store.test.ts` line 153 calls `missionStore.getState().endMission(score)` with only one argument (missing `log`). This passes at runtime because test files are outside `tsconfig.app.json`'s include scope. When we add `resourceHistory` to the store and update `INITIAL_MISSION_STATE`, we must update this test to pass the missing `log` argument and verify `decisionLog` is set correctly.

### DEB-002 — Mission scoring: ✅ Already matches spec
`src/simulation/core/mission-scoring.ts` implements the formula from `docs/simulation-model.md` exactly:
- `baseScore = missionDuration × 10` ✅
- `resourceStabilityBonus = avgStability × 200` ✅
- `decisionQualityBonus = optimal × 25 + suboptimal × 5` ✅
- `eventsResolvedBonus = eventsSuccessfullyResolved × 30` ✅
- `criticalFailurePenalty = criticalFailureEvents × -50` ✅
- `finalScore >= 800 → success`, `>= 400 → partial`, `< 400 → failure` ✅

**V1 simplifications to document inline:** (1) `eventsSuccessfullyResolved` counts any RESOLVE_EVENT action where a matching choice was found — not whether that choice was "scientifically optimal". (2) `criticalFailureEvents` counts `POWER_CRITICAL` fault triggers only; other fault events (OXYGEN_DEPLETED, WATER_DEPLETED, RADIATION_CRITICAL) cause direct `outcome = 'failure'` and end the mission rather than incrementing the penalty counter. No code changes needed — add a comment block in the file.

### DEB-003 — Resource history: ❌ Missing
`ResourceHistoryPoint` type does not exist in `src/simulation/types/index.ts`. The `MissionState` interface has no `resourceHistory` field. `INITIAL_MISSION_STATE` has no `resourceHistory`. `updateFromSimResult` replaces state but does not append to a history array. `UseMissionControlReturn` does not expose `resourceHistory`.

### DEB-004 — MissionDebriefScreen: ❌ Not implemented
`src/features/mission-debrief/` directory exists but is empty.

### DEB-005 — Router update: ❌ Placeholder in use
`/debrief` route renders `<PlaceholderScreen>`. Also, the guard needs updating: the debrief screen should require `missionStarted === true` (not `missionActive`, which is false once `endMission` is called). Currently it only uses `RequireSetup` which checks planet + crew.

---

## Implementation Plan

- [ ] 1. Add `ResourceHistoryPoint` type and update the mission store.

  **What:** Add `ResourceHistoryPoint` interface to `src/simulation/types/index.ts`. Add `resourceHistory: readonly ResourceHistoryPoint[]` to `MissionState` in `src/store/mission-store.ts`. Add it to `INITIAL_MISSION_STATE` as `[]`. Update `updateFromSimResult` to append the new snapshot (using array spread — never mutate) rather than replace.

  `ResourceHistoryPoint` shape:
  ```ts
  export interface ResourceHistoryPoint {
    readonly missionDay: number
    readonly oxygen_kg: number
    readonly water_kg: number
    readonly food_kg: number
    readonly energy_kWh: number
    readonly cumulativeRadiation_mSv: number
  }
  ```

  `updateFromSimResult` update — append to existing `resourceHistory`, not replace:
  ```ts
  updateFromSimResult: (result: SimulationResult): void => {
    set((state) => ({
      currentResources: result.nextState.resources,
      currentMissionDay: result.nextState.missionDay,
      activeFaultStates: result.nextState.faultStates,
      activeEventIds: result.nextState.activeEventIds,
      missionOutcome: result.nextState.outcome,
      resourceHistory: [
        ...state.resourceHistory,
        {
          missionDay: result.nextState.missionDay,
          ...result.nextState.resources,
        },
      ],
    }))
  },
  ```

  Also update `MissionActions.endMission` signature: make `log` optional (`log?: readonly DecisionLogEntry[]`) and default to `[]` in the implementation: `set({ missionActive: false, missionScore: score, decisionLog: log ?? [] })`. This preserves backward compatibility with the existing mission-store test that calls `endMission(score)` with no second arg.

  Also update `resetMission` to include `resourceHistory: []` in the spread. Since `INITIAL_MISSION_STATE` already contains `resourceHistory: []`, the spread `set({ ...INITIAL_MISSION_STATE })` will cover it automatically — no extra change needed beyond adding it to `INITIAL_MISSION_STATE`.

  **Files:**
  - `src/simulation/types/index.ts` — add `ResourceHistoryPoint` interface after `ResourceSnapshot`
  - `src/store/mission-store.ts` — add field to `MissionState`, `INITIAL_MISSION_STATE`, update `updateFromSimResult` and `endMission`

  **Verify:** `npm run build` — zero TypeScript errors.

---

- [ ] 2. Expose `resourceHistory` in `useMissionControl`.

  **What:** Add `resourceHistory: readonly ResourceHistoryPoint[]` to `UseMissionControlReturn` interface in `src/hooks/useMissionControl.ts`. Read it from the store in the hook body. Return it in the return object.

  ```ts
  // In UseMissionControlReturn:
  readonly resourceHistory: readonly ResourceHistoryPoint[]

  // In hook body:
  const resourceHistory = useMissionStore((s) => s.resourceHistory)

  // In return:
  resourceHistory,
  ```

  Import `ResourceHistoryPoint` from `@simulation/types`.

  **Files:**
  - `src/hooks/useMissionControl.ts`

  **Verify:** `npm run build` — zero TypeScript errors.

---

- [ ] 3. Add V1 simplification comments to `mission-scoring.ts`.

  **What:** Add a JSDoc comment block at the top of `calculateMissionScore` documenting two V1 simplifications, so they are discoverable and not later mistaken for bugs:

  ```ts
  /**
   * V1 simplifications (documented in docs/scientific-assumptions.md):
   * 1. eventsSuccessfullyResolved counts any RESOLVE_EVENT action where a
   *    matching choice was found — not specifically the "optimal" choice.
   *    Optimal choices are scored via decisionQualityBonus instead.
   * 2. criticalFailureEvents counts POWER_CRITICAL fault triggers only.
   *    OXYGEN_DEPLETED / WATER_DEPLETED / RADIATION_CRITICAL faults cause
   *    immediate outcome = 'failure' and end the mission before scoring.
   */
  ```

  **Files:**
  - `src/simulation/core/mission-scoring.ts`

  **Verify:** `npm run build` — zero TypeScript errors.

---

- [ ] 4. Implement `MissionDebriefScreen`.

  **What:** Create `src/features/mission-debrief/MissionDebriefScreen.tsx` with all 6 sections. The component reads data from `useMissionControl()` — it does NOT import simulation or store directly (per architecture rules).

  **Section 1 — Mission Outcome Banner**
  - Displays outcome (`success` / `partial` / `failure`) with a colour-coded banner and age-appropriate message.
  - Shows mission day count and planet name.
  - Outcome → colour: `success` = green, `partial` = yellow, `failure` = red.

  **Section 2 — Final Score Breakdown**
  - Shows each score component as a labelled row: Base Score, Resource Stability Bonus, Decision Quality Bonus, Events Resolved Bonus, Critical Failure Penalty, Final Score.
  - Uses `missionScore` from the hook; renders a loading placeholder if `missionScore` is null.

  **Section 3 — Resource History Charts**
  - Renders four `LineChart` components (one per resource: oxygen, water, food, energy) using `recharts`.
  - Data source: `resourceHistory` array from the hook.
  - Each chart has `XAxis` keyed by `missionDay`, `YAxis`, `Tooltip`, and a single `Line`.
  - If `resourceHistory` is empty, show a "No mission data recorded" message instead.

  **Section 4 — Decision Log**
  - Renders `decisionLog` from the hook as a scrollable list.
  - Each entry shows: Day, Action type, Result summary, and an "Optimal" badge (green) or "Suboptimal" badge (grey).
  - If `decisionLog` is empty, show "No decisions recorded."

  **Section 5 — What Did We Learn? (Astro-AI Summary)**
  - Static placeholder section titled "What Did We Learn?".
  - Shows a short educational note derived from `missionOutcome`:
    - `success`: "Outstanding mission commander! Every resource was managed with precision."
    - `partial`: "Good effort! Your crew survived but some systems were under stress."
    - `failure`: "Space is unforgiving — but every mission teaches us something new."
  - Labelled `{/* AI-007: Replace with AstroAssistant.getMissionSummary() in Phase 8 integration */}` comment.

  **Section 6 — Navigation Controls**
  - "Play Again" button: calls `resetMission()` from the store (accessed via `useMissionStore`) and navigates to `/`.
  - Uses `useNavigate()` from `react-router-dom`.

  **Component skeleton:**
  ```tsx
  import { useNavigate } from 'react-router-dom'
  import { LineChart, ... } from 'recharts'
  import { useMissionControl } from '@/hooks/useMissionControl'
  import { useMissionStore } from '@store/mission-store'

  export function MissionDebriefScreen(): JSX.Element {
    const navigate = useNavigate()
    const {
      missionOutcome, missionScore, missionDay: currentMissionDay,
      resourceHistory, decisionLog, selectedPlanetId,
    } = useMissionControl()
    const resetMission = useMissionStore((s) => s.resetMission)
    // ...
  }
  ```

  **Constraints:**
  - Functional component only. Props interface above component (none needed here — all data from hook).
  - Maximum 300 lines — split helper components into same file if needed (ResourceChart, ScoreRow, DecisionLogItem), each labelled with an interface if they take props.
  - No inline styles except for dynamic Tailwind-incompatible values (chart colours can be hex strings as recharts `stroke` prop — that is acceptable).
  - No `any`. No `!` outside tests. No enum.
  - The screen must render without crashing if `missionScore` is null or `resourceHistory` is empty.

  **Files:**
  - `src/features/mission-debrief/MissionDebriefScreen.tsx` (create)

  **Verify:** `npm run build` — zero TypeScript errors and zero Vite build errors.

---

- [ ] 5. Update the router to use `MissionDebriefScreen`.

  **What:** Replace the `/debrief` placeholder route in `src/app/router.tsx`:
  1. Import `MissionDebriefScreen` from `@/features/mission-debrief/MissionDebriefScreen`.
  2. Add a `RequireMissionStarted` guard (new component in the router file) that reads `missionStarted` from the store. If `missionStarted === false`, redirect to `/`. This guard uses `missionStarted` (not `missionActive`) so it stays true even after `endMission()` sets `missionActive: false`.
  3. Wrap the `/debrief` route with `<RequireSetup>` + `<RequireMissionStarted>` and render `<MissionDebriefScreen />`.

  ```tsx
  function RequireMissionStarted({ children }: { readonly children: ReactNode }): JSX.Element {
    const missionStarted = useMissionStore((s) => s.missionStarted)
    if (!missionStarted) {
      return <Navigate to="/" replace />
    }
    return <>{children}</>
  }

  // Route:
  <Route
    path="/debrief"
    element={
      <RequireSetup>
        <RequireMissionStarted>
          <MissionDebriefScreen />
        </RequireMissionStarted>
      </RequireSetup>
    }
  />
  ```

  **Files:**
  - `src/app/router.tsx`

  **Verify:** `npm run build` — zero TypeScript errors.

---

- [ ] 6. Update `tests/unit/store/mission-store.test.ts` to fix the `endMission` call signature and add `resourceHistory` tests.

  **What:** The existing test at line 153 calls `missionStore.getState().endMission(score)` without the second `log` argument. Since we made `log` optional (step 1), this continues to work at runtime — but the test should be complete. Update it and add new resource history tests.

  **Changes:**
  1. Update the `endMission` test to pass a `log` argument and assert `decisionLog` is set:
     ```ts
     missionStore.getState().endMission(score, [])
     expect(missionStore.getState().decisionLog).toEqual([])
     ```
  2. Add test: `INITIAL_MISSION_STATE has empty resourceHistory array`.
  3. Add test: `updateFromSimResult appends to resourceHistory` — call `updateFromSimResult` twice with results for missionDay 1 and 2, assert `resourceHistory.length === 2` and that `resourceHistory[0].missionDay === 1` and `resourceHistory[1].missionDay === 2`.
  4. Add test: `resetMission clears resourceHistory` — after setting some state and calling `resetMission`, assert `resourceHistory` equals `[]`. (The existing `resetMission` test already asserts many fields — just add `resourceHistory` to it, or add a new focused test.)

  **Files:**
  - `tests/unit/store/mission-store.test.ts`

  **Gotcha:** The `buildMockSimResult` helper in the test file returns a `SimulationResult` with `nextState.resources` using `mockResources`. The `resourceHistory` append in `updateFromSimResult` uses `result.nextState.resources` and `result.nextState.missionDay` — so the test assertions must match those values.

  **Verify:** `npm run test -- --run` — all 75 existing tests still pass plus the new resource history tests (minimum 3 new, so ≥ 78 total).

---

- [ ] 7. Create `tests/unit/simulation/resource-history.test.ts`.

  **What:** Unit tests specifically for the `ResourceHistoryPoint` type and the `updateFromSimResult` append behaviour, exercising the store in isolation.

  **Test cases:**
  1. `ResourceHistoryPoint shape is correct` — construct a `ResourceHistoryPoint` object literal and assert all 6 fields are present with the correct types (use `typeof` checks or TypeScript compile-time assertions via `satisfies`).
  2. `resourceHistory starts empty` — fresh store state has `resourceHistory.length === 0`.
  3. `each updateFromSimResult call appends one entry` — call 3 times, assert length is 3.
  4. `history entries preserve missionDay order` — call with missionDay 1, 2, 3; assert `resourceHistory.map(p => p.missionDay)` equals `[1, 2, 3]`.
  5. `history entry matches nextState resources exactly` — after one `updateFromSimResult`, assert the single entry's `oxygen_kg`, `water_kg`, `food_kg`, `energy_kWh`, `cumulativeRadiation_mSv` match the mock resources object.
  6. `resetMission empties resourceHistory` — after 3 entries, call `resetMission`, assert length 0.

  Use `describe('resourceHistory in missionStore')` + `it(...)`.

  **Files:**
  - `tests/unit/simulation/resource-history.test.ts`

  **Verify:** `npm run test -- --run` — ≥ 6 new tests pass, total ≥ 84.

---

- [ ] 8. Create `tests/unit/features/MissionDebriefScreen.test.tsx`.

  **What:** React component tests for `MissionDebriefScreen`. Uses `@testing-library/react` (already installed — used by the hook tests).

  **Setup:** Use `missionStore.setState(...)` to inject state before rendering. Reset in `beforeEach`. Because the component uses `useMissionControl`, which reads from `useMissionStore` and `useAppStore`, no mocking is needed — just set up state directly.

  **Helper state setup:**
  ```ts
  const mockScore: MissionScore = {
    baseScore: 200,
    resourceStabilityBonus: 150,
    decisionQualityBonus: 75,
    eventsResolvedBonus: 60,
    criticalFailurePenalty: -50,
    finalScore: 435,
    outcome: 'partial',
  }
  const mockHistory: ResourceHistoryPoint[] = [
    { missionDay: 1, oxygen_kg: 100, water_kg: 360, food_kg: 216, energy_kWh: 160, cumulativeRadiation_mSv: 1 },
    { missionDay: 2, oxygen_kg: 95, water_kg: 354, food_kg: 210, energy_kWh: 155, cumulativeRadiation_mSv: 2 },
  ]
  ```

  **Test cases (7 minimum):**
  1. `renders without crashing when missionScore is null` — render with default state (score null, history empty), assert no thrown errors.
  2. `displays outcome banner for success outcome` — set `missionOutcome: 'success'`, assert screen contains "success" text (case-insensitive).
  3. `displays outcome banner for failure outcome` — set `missionOutcome: 'failure'`, assert screen contains "failure" text.
  4. `displays all score breakdown rows when missionScore is set` — set `missionScore: mockScore`, assert "Base Score" label appears in the document, assert "435" (finalScore) appears somewhere.
  5. `shows no mission data message when resourceHistory is empty` — assert "No mission data recorded" text is present when `resourceHistory` is `[]`.
  6. `shows decision log entries when decisionLog is set` — set a `decisionLog` with 1 entry (`missionDay: 1, action: { type: 'ADVANCE_DAY' }, resultSummary: 'Nominal step', wasOptimal: true`), assert "Nominal step" appears in the document.
  7. `shows no decisions recorded message when decisionLog is empty` — assert "No decisions recorded" text present with empty log.

  **Gotcha:** `useNavigate` is called inside the component. Wrap the render in a `MemoryRouter` from `react-router-dom`:
  ```tsx
  import { MemoryRouter } from 'react-router-dom'
  render(<MemoryRouter><MissionDebriefScreen /></MemoryRouter>)
  ```

  **Files:**
  - `tests/unit/features/MissionDebriefScreen.test.tsx` (create new directory `tests/unit/features/`)

  **Verify:** `npm run test -- --run` — all existing tests pass plus ≥ 7 new component tests, total ≥ 91.

---

- [ ] 9. Final verification — full build + full test suite.

  Run `npm run build` from the workspace root — must complete with zero TypeScript errors and zero Vite build errors.

  Run `npm run test -- --run` — must show all existing 75 tests passing plus ≥ 16 new tests (3 store + 6 resource-history + 7 component = 16), total ≥ 91.

  **Common issues to watch for:**
  - Recharts imports: use named imports from `'recharts'` — `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`. The library is already installed.
  - `useNavigate` in tests requires `MemoryRouter` wrapper.
  - `resourceHistory` spread in `updateFromSimResult` must use Zustand's `set((state) => ...)` callback form (not `set({})` direct form) so we can read current state.
  - The `endMission` signature change (making `log` optional) must not accidentally widen the existing store test expectations — the store test only checks `missionScore`, so it is fine.
  - `MissionDebriefScreen` accesses `useMissionControl().currentMissionDay` for display but the return type now reads `currentMissionDay` from the mission store — ensure the hook exposes it (it does, already in the return object).

  **Files:** No new files — runs all existing and newly created files.

  **Verify:** `npm run build` exits 0. `npm run test -- --run` exits 0.

---

## File Summary

| Step | File | Create or Modify |
|------|------|------------------|
| 1 | `src/simulation/types/index.ts` | Modify — add `ResourceHistoryPoint` interface |
| 1 | `src/store/mission-store.ts` | Modify — add `resourceHistory` field, update `updateFromSimResult`, make `log` optional in `endMission` |
| 2 | `src/hooks/useMissionControl.ts` | Modify — add `resourceHistory` to return type and body |
| 3 | `src/simulation/core/mission-scoring.ts` | Modify — add V1 simplification comment block |
| 4 | `src/features/mission-debrief/MissionDebriefScreen.tsx` | Create |
| 5 | `src/app/router.tsx` | Modify — add `RequireMissionStarted` guard, replace `/debrief` placeholder |
| 6 | `tests/unit/store/mission-store.test.ts` | Modify — fix `endMission` call, add `resourceHistory` tests |
| 7 | `tests/unit/simulation/resource-history.test.ts` | Create |
| 8 | `tests/unit/features/MissionDebriefScreen.test.tsx` | Create |

---

## Dependency Order

Steps must be executed in this order. Each step leaves the codebase buildable:

```
Step 1 (types + store)
  └── Step 2 (hook — depends on store having resourceHistory)
        └── Step 3 (scoring comment — independent, can go here or earlier)
              └── Step 4 (screen — depends on hook returning resourceHistory)
                    └── Step 5 (router — depends on screen existing)
                          └── Step 6 (store test — depends on store changes)
                                └── Step 7 (resource-history test — depends on store changes)
                                      └── Step 8 (screen test — depends on screen existing)
                                            └── Step 9 (final verification)
```

Steps 3 and 6 have no strict dependency on each other — but following the order above keeps each step verifiable independently.
