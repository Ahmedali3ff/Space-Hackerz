# Phase 5 — Application Foundation: Implementation Plan

## Codebase Context

- **Zustand version**: 4.5.7 — `create` from `zustand`, NO Immer.
- **TypeScript**: strict mode, `noUnusedLocals`, `noUnusedParameters`, `noEmit`.
- **Build command**: `npm run build` (runs `tsc -b && vite build`).
- **Test command**: `npm run test -- --run` (Vitest with jsdom, `@testing-library/react` installed).
- **Path aliases**: `@/` → `src/`, `@simulation/` → `src/simulation/`, `@store/` → `src/store/`.
- **Existing routes**: Onboarding `/`, Planet `/select-planet`, Crew `/select-crew`, Base `/configure-base`, Mission `/mission`, Debrief `/debrief` — all placeholder screens must be preserved.
- **SimulationEngine API**: constructor takes `SimulationEngineConfig`; exposes `step(action)`, `getState()`, `getMissionScore()`, `getDecisionLog()`. `step()` returns `Result<SimulationResult>`.
- **Result type**: `{ success: true; value: T } | { success: false; error: SimulationError }` — never throws.
- **Key types** (all from `@simulation/types`): `PlanetId`, `BaseConfig`, `ResourceSnapshot`, `FaultState`, `MissionOutcome`, `DecisionLogEntry`, `MissionScore`, `SimulationResult`, `SimulationEngineConfig`.
- **Directories already scaffolded**: `src/store/`, `src/hooks/`, `src/utils/`, `src/app/providers/` — all empty.

## Dependency Order

Items are ordered so each one builds only on what precedes it. Every item must leave the project in a buildable state.

---

- [ ] 1. Create `src/store/mission-store.ts` (APP-001)

  Define `MissionStoreState` interface and `MissionStoreActions` interface. Implement with Zustand `create<MissionStoreState & MissionStoreActions>()`. No Immer — use spread syntax for state updates.

  **State fields** (all read from `@simulation/types`):
  ```ts
  selectedPlanetId: PlanetId | null       // null
  crewSize: number                         // 0
  baseConfig: BaseConfig | null            // null
  missionActive: boolean                   // false
  missionStarted: boolean                  // false
  currentResources: ResourceSnapshot | null // null
  currentMissionDay: number                // 0
  activeFaultStates: readonly FaultState[] // []
  activeEventIds: readonly string[]        // []
  missionOutcome: MissionOutcome           // 'ongoing'
  decisionLog: readonly DecisionLogEntry[] // []
  missionScore: MissionScore | null        // null
  ```

  **Actions** (all explicitly typed `() => void` or their param signatures):
  - `selectPlanet(planetId: PlanetId): void` — sets `selectedPlanetId`
  - `setCrewSize(size: number): void` — sets `crewSize`
  - `setBaseConfig(config: BaseConfig): void` — sets `baseConfig`
  - `startMission(): void` — sets `missionActive: true`, `missionStarted: true`
  - `updateFromSimResult(result: SimulationResult): void` — spreads `nextState.resources` into `currentResources`, updates `currentMissionDay`, `activeFaultStates`, `activeEventIds`, `missionOutcome`
  - `endMission(score: MissionScore): void` — sets `missionActive: false`, `missionScore: score`, `missionOutcome` to current value
  - `resetMission(): void` — resets all fields to initial values

  Export both the hook `useMissionStore` (default export of `create`) and the underlying store atom as a named export `missionStore` for direct `.getState()` / `.setState()` access in tests.

  Files: `src/store/mission-store.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 2. Create `src/store/app-store.ts` (APP-002)

  Define `AppStoreState` interface and `AppStoreActions` interface. Implement with Zustand `create`.

  **State**:
  ```ts
  isLoading: boolean        // false
  globalError: string | null // null
  astroAIPanelOpen: boolean  // false
  ```

  **Actions**:
  - `setLoading(loading: boolean): void`
  - `setGlobalError(message: string): void` — sets `globalError: message`
  - `clearError(): void` — sets `globalError: null`
  - `toggleAstroAIPanel(): void` — flips `astroAIPanelOpen`
  - `openAstroAIPanel(): void` — sets `astroAIPanelOpen: true`
  - `closeAstroAIPanel(): void` — sets `astroAIPanelOpen: false`

  Export `useAppStore`.

  Files: `src/store/app-store.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 3. Create `src/store/index.ts` (APP-007)

  Barrel re-export:
  ```ts
  export { useMissionStore } from './mission-store'
  export { useAppStore } from './app-store'
  ```

  Files: `src/store/index.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 4. Create `src/utils/default-config.ts` (APP-006)

  ```ts
  import type { BaseConfig } from '@simulation/types'

  export function getDefaultBaseConfig(crewSize: number): BaseConfig {
    return {
      solarPanelArea_m2: crewSize * 15,
      batteryCapacity_kWh: crewSize * 50,
      agricultureArea_m2: crewSize * 3,
      shieldingLevel: 'medium',
      lifeSupportEfficiency: 1.0,
    }
  }
  ```

  Files: `src/utils/default-config.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 5. Create `src/hooks/useMissionControl.ts` (APP-003)

  This is the ONLY file in the project that imports `SimulationEngine`.

  **Imports**:
  - `SimulationEngine` from `@simulation/core/simulation-engine`
  - `SimulationEngineConfig`, `ResourceSnapshot`, `FaultState`, `MissionOutcome`, `SimulationResult` from `@simulation/types`
  - `useMissionStore` from `@store` (or `@/store/mission-store`)
  - `useAppStore` from `@store` (or `@/store/app-store`)
  - `useRef` from `react`

  **Return type** — define `UseMissionControlReturn` interface explicitly:
  ```ts
  interface UseMissionControlReturn {
    currentResources: ResourceSnapshot | null
    currentMissionDay: number
    activeFaultStates: readonly FaultState[]
    activeEventIds: readonly string[]
    missionOutcome: MissionOutcome
    isLoading: boolean
    initializeMission: () => void
    advanceDay: () => void
    resolveEvent: (eventId: string, choiceId: string) => void
    emergencyRation: () => void
    endMission: () => void
  }
  ```

  **Implementation details**:
  - `engineRef = useRef<SimulationEngine | null>(null)` — persists across renders without causing re-renders.
  - Read store state with individual selectors (not one big object selector) to avoid unnecessary re-renders.

  **`initializeMission()`**:
  1. Read `selectedPlanetId`, `crewSize`, `baseConfig` from `useMissionStore.getState()` (call `.getState()` inside the function, not at hook render time, to get fresh values at call time).
  2. Guard: if `selectedPlanetId === null` or `crewSize === 0` or `baseConfig === null`, call `appStore.setGlobalError('Mission configuration is incomplete.')` and return early.
  3. Compute `initialResources`:
     ```ts
     oxygen_kg: crewSize * 0.84 * 30,
     water_kg: crewSize * 3.0 * 30,
     food_kg: crewSize * 1.8 * 30,
     energy_kWh: baseConfig.batteryCapacity_kWh * 0.8,
     cumulativeRadiation_mSv: 0,
     ```
  4. Build `SimulationEngineConfig` with `seed: Date.now()`.
  5. `engineRef.current = new SimulationEngine(config)`.
  6. Call `useMissionStore.getState().startMission()`.

  **`advanceDay()`**:
  1. Guard: if `engineRef.current === null`, return early.
  2. `const result = engineRef.current.step({ type: 'ADVANCE_DAY' })`
  3. If `result.success`, call `useMissionStore.getState().updateFromSimResult(result.value)`.
  4. If `!result.success`, call `useAppStore.getState().setGlobalError(result.error.message)`.

  **`resolveEvent(eventId, choiceId)`**:
  Same pattern as `advanceDay()` but with `{ type: 'RESOLVE_EVENT', eventId, choiceId }`.

  **`emergencyRation()`**:
  Same pattern with `{ type: 'EMERGENCY_RATION' }`.

  **`endMission()`**:
  1. Guard: if `engineRef.current === null`, return early.
  2. `const score = engineRef.current.getMissionScore()`.
  3. Call `useMissionStore.getState().endMission(score)`.

  **Return values**: All state values come from store selectors — no local duplication:
  ```ts
  const currentResources = useMissionStore((s) => s.currentResources)
  const currentMissionDay = useMissionStore((s) => s.currentMissionDay)
  // etc.
  const isLoading = useAppStore((s) => s.isLoading)
  ```

  Files: `src/hooks/useMissionControl.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 6. Create `src/app/providers/ErrorBoundary.tsx` (APP-005)

  Class component — the only valid class component in the project. The class-based API is required because React does not expose `componentDidCatch` to functional components.

  ```tsx
  interface ErrorBoundaryProps {
    readonly children: React.ReactNode
  }

  interface ErrorBoundaryState {
    readonly hasError: boolean
  }

  export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) { ... }
    static getDerivedStateFromError(_error: unknown): ErrorBoundaryState { return { hasError: true } }
    componentDidCatch(_error: unknown, _info: React.ErrorInfo): void { /* intentionally empty — no raw error surfaced */ }
    render(): React.ReactNode { ... }
  }
  ```

  Fallback UI when `hasError === true`:
  - Wrapper `div` centered on screen.
  - Text: "Something went wrong. Please refresh the page."
  - Button labeled "Reload" that calls `window.location.reload()`.
  - No raw error messages displayed.
  - Use Tailwind utility classes (no inline styles).

  Prefix unused `_error` and `_info` parameters with underscore to satisfy `noUnusedParameters`.

  Files: `src/app/providers/ErrorBoundary.tsx`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 7. Create `src/app/providers/GlobalProviders.tsx` (APP-005b)

  ```tsx
  import { ErrorBoundary } from './ErrorBoundary'

  interface GlobalProvidersProps {
    readonly children: React.ReactNode
  }

  export function GlobalProviders({ children }: GlobalProvidersProps): JSX.Element {
    return <ErrorBoundary>{children}</ErrorBoundary>
  }
  ```

  Files: `src/app/providers/GlobalProviders.tsx`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 8. Update `src/app/router.tsx` (APP-004)

  Add guard components above the `AppRouter` function. Import `Navigate` from `react-router-dom`. Import `useMissionStore` from `@/store/mission-store`.

  **`RequireSetup`** — reads `selectedPlanetId` and `crewSize` from the store:
  ```tsx
  function RequireSetup({ children }: { readonly children: React.ReactNode }): JSX.Element {
    const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
    const crewSize = useMissionStore((s) => s.crewSize)
    if (selectedPlanetId === null || crewSize === 0) {
      return <Navigate to="/" replace />
    }
    return <>{children}</>
  }
  ```

  **`RequireMission`** — reads `missionActive` from the store:
  ```tsx
  function RequireMission({ children }: { readonly children: React.ReactNode }): JSX.Element {
    const missionActive = useMissionStore((s) => s.missionActive)
    if (!missionActive) {
      return <Navigate to="/select-planet" replace />
    }
    return <>{children}</>
  }
  ```

  Apply guards in the route elements:
  - `/configure-base` → `<RequireSetup><PlaceholderScreen .../></RequireSetup>`
  - `/mission` → `<RequireSetup><RequireMission><PlaceholderScreen .../></RequireMission></RequireSetup>`
  - `/debrief` → `<RequireSetup><PlaceholderScreen .../></RequireSetup>`

  Keep all other routes and the `PlaceholderScreen` component unchanged.

  Files: `src/app/router.tsx`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 9. Update `src/App.tsx` (APP-005c)

  Wrap the existing `BrowserRouter` + `AppRouter` with `GlobalProviders`:

  ```tsx
  import { BrowserRouter } from 'react-router-dom'
  import { AppRouter } from '@/app/router'
  import { GlobalProviders } from '@/app/providers/GlobalProviders'

  export default function App(): JSX.Element {
    return (
      <GlobalProviders>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </GlobalProviders>
    )
  }
  ```

  Files: `src/App.tsx`

  Verify: `npm run build` — zero TypeScript errors and vite build completes.

---

- [ ] 10. Write store unit tests: `tests/unit/store/mission-store.test.ts`

  Test the Zustand store directly via `useMissionStore.getState()` — no `renderHook` needed.

  Before each test, call `useMissionStore.getState().resetMission()` to restore initial state.

  Tests within `describe('MissionStore')`:
  - `selectPlanet sets selectedPlanetId`: call `selectPlanet('moon')`, assert `getState().selectedPlanetId === 'moon'`.
  - `setCrewSize sets crewSize`: call `setCrewSize(4)`, assert `getState().crewSize === 4`.
  - `setBaseConfig sets baseConfig`: call `setBaseConfig(mockConfig)`, assert `getState().baseConfig` deep-equals mock.
  - `startMission sets missionActive and missionStarted to true`: call `startMission()`, assert both are `true`.
  - `resetMission returns to initial state`: set several fields, call `resetMission()`, assert `selectedPlanetId` is `null`, `crewSize` is `0`, `missionActive` is `false`.
  - `updateFromSimResult updates resources, day, events, and faults`: construct a minimal mock `SimulationResult` object (only `nextState` is needed by the action), call `updateFromSimResult`, verify `currentResources`, `currentMissionDay`, `activeEventIds`, `activeFaultStates`, `missionOutcome` all updated.
  - `endMission sets missionActive false and stores score`: call `startMission()` then `endMission(mockScore)`, assert `missionActive === false` and `missionScore` deep-equals mock.

  Import pattern: `import { useMissionStore } from '../../../src/store/mission-store'`

  Files: `tests/unit/store/mission-store.test.ts`

  Note: create the `tests/unit/store/` directory alongside the file.

  Verify: `npm run test -- --run` — all tests pass (33 existing + new store tests).

---

- [ ] 11. Write hook unit tests: `tests/unit/hooks/useMissionControl.test.ts`

  Use `renderHook` from `@testing-library/react`.

  Before each test, reset both stores:
  ```ts
  beforeEach(() => {
    useMissionStore.getState().resetMission()
    useAppStore.setState({ isLoading: false, globalError: null, astroAIPanelOpen: false })
  })
  ```

  Tests within `describe('useMissionControl')`:

  - `initializeMission with valid store state creates engine and starts mission`:
    1. Call `useMissionStore.getState().selectPlanet('moon')`, `setCrewSize(4)`, `setBaseConfig(mockConfig)`.
    2. `renderHook(() => useMissionControl())`.
    3. `act(() => { result.current.initializeMission() })`.
    4. Assert `useMissionStore.getState().missionActive === true`.

  - `advanceDay calls engine.step and updates store`:
    1. Set up valid store state, render hook, call `initializeMission()`.
    2. `act(() => { result.current.advanceDay() })`.
    3. Assert `useMissionStore.getState().currentMissionDay === 1`.

  - `resolveEvent passes correct eventId and choiceId to engine`:
    1. Set up valid state, init mission.
    2. Spy on `engineRef` — not directly accessible. Instead: call `advanceDay()` enough times until `activeEventIds` is non-empty, OR inject a known active event by setting store state directly.
    3. Alternative simpler approach: call `resolveEvent('nonexistent-id', 'choice-a')` — engine returns success (no matching event, no error), store updates. Assert `globalError` stays null.

  - `when engine step returns failure Result, globalError is set`:
    1. Init mission, then corrupt engine by calling `advanceDay` with an invalid state (force via store):
       Use `useMissionStore.setState({ currentMissionDay: -999 })` which does NOT affect engine state.
    2. Simpler: After init, call `resolveEvent` with an empty string for both params. The engine will process it (find no matching event), succeed. Assert no globalError.
    3. Best approach: After init, spy on `engineRef.current.step` via `vi.spyOn`. Cast the engine ref from the hook's closure is not possible. Instead, patch the engine by passing a mock `SimulationEngine` constructor via `vi.mock`.
    
    Implementation: Mock the `@simulation/core/simulation-engine` module:
    ```ts
    vi.mock('@simulation/core/simulation-engine', () => ({
      SimulationEngine: vi.fn().mockImplementation(() => ({
        step: vi.fn().mockReturnValue({ success: false, error: { code: 'TEST', message: 'test error', context: {} } }),
        getState: vi.fn().mockReturnValue({ activeEventIds: [], faultStates: [], outcome: 'ongoing', missionDay: 0, resources: mockResources }),
        getMissionScore: vi.fn(),
      })),
    }))
    ```
    Then init mission and call `advanceDay()`. Assert `useAppStore.getState().globalError === 'test error'`.

    Keep the mock scoped to that one test using `vi.mocked` or a `describe` block with `vi.mock` at top level and `vi.clearAllMocks()` in `afterEach`.

  Import pattern:
  ```ts
  import { renderHook, act } from '@testing-library/react'
  import { useMissionControl } from '../../../src/hooks/useMissionControl'
  import { useMissionStore } from '../../../src/store/mission-store'
  import { useAppStore } from '../../../src/store/app-store'
  ```

  Note: create the `tests/unit/hooks/` directory alongside the file.

  Files: `tests/unit/hooks/useMissionControl.test.ts`

  Verify: `npm run test -- --run` — all tests pass (33 existing + store tests + hook tests).

---

- [ ] 12. Update workflow documentation

  Two files to update once all code and tests pass:

  **`.kiro/steering/workflow.md`**:
  - Mark APP-001 through APP-005 (including APP-005b, APP-005c, APP-006, APP-007) as DONE.
  - Set Current Phase to: `PHASE 5 — Application Foundation ✅ COMPLETE` and `PHASE 6 — Visual Design Integration 🔄 BLOCKED (awaiting design)`.
  - Add note: "UI screens blocked on design. Astro-AI knowledge base (AI-001) can begin immediately."

  **`.kiro/specs/astra/tasks.md`**:
  - Mark APP-001 through APP-007 as DONE with today's date.

  Files: `.kiro/steering/workflow.md`, `.kiro/specs/astra/tasks.md`

  Verify: Files updated, `npm run build` and `npm run test -- --run` still pass.

---

## Implementation Notes

### TypeScript strict mode pitfalls to avoid

1. **`noUnusedLocals` / `noUnusedParameters`**: Prefix unused params with `_` (e.g., `_error`, `_info` in `ErrorBoundary`). Do not declare variables without using them.
2. **`readonly` arrays**: `FaultState[]` is not assignable to `readonly FaultState[]` — initialise store arrays as `[] as readonly FaultState[]` or cast with `as const`.
3. **Zustand without Immer**: All set calls must spread the entire relevant slice — `set((state) => ({ ...state, field: value }))` or just `set({ field: value })` (Zustand merges top-level automatically).
4. **`SimulationResult` mock in tests**: `SimulationResult` requires `previousState` and `nextState` (both full `SimulationState`), `newFaultStates`, `triggeredEventIds`, and `explanations`. Build a complete mock object to satisfy strict typing.
5. **`updateFromSimResult`** reads from `result.nextState` — NOT `result.value`. The store action receives a `SimulationResult` directly.
6. **`missionStore` named export**: Zustand's `create` returns the hook directly. To export both the hook and the underlying store for testing, use:
   ```ts
   export const useMissionStore = create<MissionStoreState & MissionStoreActions>()(...)
   export const missionStore = useMissionStore  // same reference; .getState() is available on it
   ```
   Or simply export only `useMissionStore` — Vitest tests can call `useMissionStore.getState()` directly because Zustand attaches `getState` to the hook.

### Import dependency order for implementation

```
@simulation/types           ← no dependencies on app layer
src/store/mission-store.ts  ← depends on @simulation/types
src/store/app-store.ts      ← no dependencies on simulation layer
src/store/index.ts          ← depends on both stores
src/utils/default-config.ts ← depends on @simulation/types
src/hooks/useMissionControl.ts ← depends on stores + @simulation/core/simulation-engine
src/app/providers/ErrorBoundary.tsx  ← depends on React only
src/app/providers/GlobalProviders.tsx ← depends on ErrorBoundary
src/app/router.tsx          ← depends on stores + react-router-dom
src/App.tsx                 ← depends on GlobalProviders + router
```

### Test file directory creation

The test runner expects files under `tests/unit/store/` and `tests/unit/hooks/`. These directories do not yet exist — create them as part of writing the test files.
