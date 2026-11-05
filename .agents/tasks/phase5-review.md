# Phase 5 — Application Foundation

This change delivers the Zustand stores, `useMissionControl` hook, route guards, error boundary, and global providers that form the application layer between the React presentation layer and the simulation engine completed in Phase 4. The implementation follows a snapshot model: simulation state lives in the engine; stores hold only the last step result plus setup choices. The engine boundary is respected — only `useMissionControl.ts` imports `SimulationEngine`. Build produced zero TypeScript errors; all 75 tests pass.

**Watch for:** The `updateFromSimResult` action always resets `decisionLog` to `[]` on every step (confirmed). The hook's `UseMissionControlReturn` interface exposes fields beyond what the plan specified, which is fine, but `globalError` surface from the hook means component authors have two redundant ways to read the same value (possible redundancy, not a defect).

**Verdict**: APPROVED

## High-level view

The layering contract is intact. `mission-store.ts` and `app-store.ts` import only from `@simulation/types` (pure types, no engine code). The `useMissionStore`/`missionStore` dual-export pattern — exporting the same Zustand hook reference under two names — gives test files direct `.getState()`/`.setState()` access without a separate test utility, which is clean.

The `useMissionControl` hook places the engine in a `useRef`, reads all reactive state from store selectors, and calls `useAppStore.getState().setGlobalError()` instead of throwing on failure. Every action guards against a null engine ref before delegating to the engine. The `Result<T>` contract from the simulation layer is fully handled — there are no unhandled failure branches.

Route guards `RequireSetup` and `RequireMission` read from store selectors and return `<>{children}</>` (not raw `children`), satisfying the `ReactNode` return contract. The `/debrief` route is guarded only by `RequireSetup`, not `RequireMission`, which means a user can navigate to debrief without an active mission if they've selected a planet and crew — this is consistent with the debrief being a post-mission destination, but worth confirming the intent once debrief is implemented.

The `ErrorBoundary` is a class component as required. `getDerivedStateFromError` returns the new state; `componentDidCatch` is intentionally empty (confirmed by build evidence). No raw error messages are surfaced in the fallback UI.

The `decisionLog` field in the store is zeroed on every `updateFromSimResult` call with a comment noting the engine owns the log. This means the store never accumulates a log during play — only `endMission` would be the right place to populate it, but `endMission` in the store currently only sets `missionActive` and `missionScore`, not the log. This is a known gap documented in the code.

<details>
<summary>Issues (2)</summary>

1. **`decisionLog` always wiped on step** — `updateFromSimResult` unconditionally sets `decisionLog: []` on every engine step. When the Debrief screen (Phase 9) needs the decision log, either `endMission` in the hook must pull `engine.getDecisionLog()` and pass it to the store action, or `updateFromSimResult` must propagate it. The store action signature currently takes only `SimulationResult`, which does not carry the log. Plan for this before implementing the debrief.

2. **`/debrief` guarded only by `RequireSetup`, not `RequireMission`** — a user who has selected a planet and crew but never started a mission can navigate directly to `/debrief`. Whether this is intentional depends on debrief screen design. Confirm before implementing the screen.

</details>

<details>
<summary>Details</summary>

### Architecture compliance — engine isolation

`mission-store.ts` imports only from `@simulation/types`. `app-store.ts` has no simulation imports at all. `useMissionControl.ts` is the sole file importing `SimulationEngine` from `@simulation/core/simulation-engine` (confirmed by reading both store files in full). The store barrel `index.ts` re-exports only store hooks, not engine internals.

### Zustand store patterns

Both stores use `create<T>()()` with the double-call syntax required by Zustand 4.x for TypeScript inference. `mission-store.ts` uses spread syntax for all `set()` calls (`set({ field: value })`), relying on Zustand's shallow-merge semantics correctly — no full state spread needed at the top level for partial updates. `app-store.ts` uses `get()` inside `toggleAstroAIPanel` to read current state before flipping, which is the correct pattern when the new value depends on the current value (as opposed to capturing a stale closure value).

The `INITIAL_MISSION_STATE` constant is exported and typed as `MissionState` (not `MissionStore`), so it only contains state fields — actions are excluded. Tests use this constant directly for `.setState()` resets, which is clean and avoids manually reconstructing the shape.

### `updateFromSimResult` and the decision log gap

The action reads `result.nextState.resources`, `.missionDay`, `.faultStates`, `.activeEventIds`, and `.outcome` — all from `SimulationResult.nextState`. It then sets `decisionLog: []`. The comment in the code says "The engine owns the decision log; the store snapshot is updated by endMission when the hook calls it with the full log." But the `endMission` store action signature is `endMission(score: MissionScore): void` — it does not accept a log. The hook's `endMission()` calls `engine.getMissionScore()` and passes that to the store; it never calls `engine.getDecisionLog()`. This gap is confirmed — the decision log will be empty when the debrief screen needs it (confirmed).

### Route guards

`RequireSetup` checks `selectedPlanetId === null || crewSize === 0` and redirects to `/`. `RequireMission` checks `!missionActive` and redirects to `/select-planet`. Both return `<>{children}</>` to satisfy the `ReactNode` → `JSX.Element` contract (confirmed fixed per build evidence Finding 5).

Applied coverage: `/configure-base` has `RequireSetup`; `/mission` has `RequireSetup` + `RequireMission`; `/debrief` has `RequireSetup` only. The `/select-crew` route has no guard, meaning a user can reach crew selection without a planet — this is intentional given the linear flow of placeholder screens, but may need a guard once those screens are real.

### ErrorBoundary lifecycle

`getDerivedStateFromError` is a `static` method returning `{ hasError: true }`. The `_error` and `_info` parameters are prefixed with underscore. The `override` keyword is present on both instance methods, which is correct with `noImplicitOverride` would be enforced (and harmless without it). The fallback renders "Something went wrong. Please refresh the page." and a "Reload" button — no stack traces or raw error objects reach the DOM (confirmed).

### `useMissionControl` hook — engine lifecycle and error handling

The engine is stored in `useRef<SimulationEngine | null>(null)`. Because `useRef` is not in the dependency array of any callback (there are no `useCallback` wrappers), the functions are recreated each render, but the ref value persists. This is not a bug — the cost is minimal for functions of this shape.

Every action function checks `engineRef.current === null` before delegating and calls `setGlobalError` on the null path instead of throwing. The `Result<SimulationResult>` from `engine.step()` is fully destructured: success path calls `updateFromSimResult(result.value)`, failure path calls `setGlobalError(result.error.message)`. No unhandled branches (confirmed).

`initializeMission` reads store state via `missionStore.getState()` (imperative read at call time, not a stale selector closure). This is the correct pattern when the function must observe the freshest store state regardless of when it was rendered.

### Test coverage

The store test file covers all seven actions with 13 cases. `beforeEach` resets via `missionStore.setState({ ...INITIAL_MISSION_STATE })`, which is a direct shallow-merge reset — correct for restoring all state fields. The `buildMockSimResult` helper builds a full `SimulationResult` shape including `previousState`, `nextState`, `newFaultStates`, `triggeredEventIds`, and `explanations`, satisfying strict typing.

The hook test file uses `renderHook` + `act` for all interactions. Store resets in `beforeEach` cover both `missionStore` (via `setState`) and `useAppStore` (via `setState`). The failure-path tests for `advanceDay`, `resolveEvent`, and `emergencyRation` with a mocked engine (mentioned in build evidence as a separate `useMissionControl.failure.test.ts` file) are confirmed passing in the 75-test count.

One gap in the visible hook test file: `initializeMission` with valid state asserts `result.current.missionActive === true` (reading from the hook's selector), which verifies the store-to-hook feedback loop. The `endMission` test calls `advanceDay()` first "so the engine has something to score" — this is valid but the comment makes the dependency on at least one step implicit.

</details>

## File map

<details>
<summary>Changed files</summary>

| File | Change |
|------|--------|
| `src/store/mission-store.ts` | New — Zustand mission store with snapshot state and seven actions |
| `src/store/app-store.ts` | New — Zustand app store for loading, error, and panel state |
| `src/store/index.ts` | New — barrel re-export of both stores |
| `src/hooks/useMissionControl.ts` | New — only SimulationEngine importer; bridges engine to React |
| `src/utils/default-config.ts` | New — `getDefaultBaseConfig` helper scaled by crew size |
| `src/app/providers/ErrorBoundary.tsx` | New — class error boundary with safe fallback UI |
| `src/app/providers/GlobalProviders.tsx` | New — thin provider wrapper composing ErrorBoundary |
| `src/app/router.tsx` | Updated — added RequireSetup, RequireMission guards and applied to routes |
| `src/App.tsx` | Updated — wrapped BrowserRouter + AppRouter with GlobalProviders |
| `tests/unit/store/mission-store.test.ts` | New — 13 store action tests |
| `tests/unit/hooks/useMissionControl.test.ts` | New — hook lifecycle tests using renderHook |

</details>
