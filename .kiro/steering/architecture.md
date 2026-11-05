# ASTRA — Architecture Reference

## Stack

| Layer         | Technology                   | Rationale                                    |
|---------------|------------------------------|----------------------------------------------|
| UI Framework  | React 18 + TypeScript        | Component model, typing, ecosystem           |
| Build Tool    | Vite 5                       | Fast HMR, ESM-native, simple config          |
| Styling       | Tailwind CSS 3               | Utility-first, no runtime overhead           |
| Game Engine   | Phaser 3                     | 2D scene management, animations              |
| State         | Zustand                      | Minimal global state for app-level concerns  |
| Validation    | Zod                          | Runtime schema validation for sim/AI data    |
| Charts        | Recharts                     | React-native data visualization              |
| Unit Tests    | Vitest                       | Vite-integrated, fast, TypeScript-native     |
| E2E Tests     | Playwright                   | Critical user workflows                      |

## Architectural Layers

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (React + Phaser)                    │
│  App.tsx · Router · Feature screens · Phaser canvas     │
├─────────────────────────────────────────────────────────┤
│  APPLICATION LAYER                                       │
│  Mission orchestration · Game state · Event dispatch    │
├─────────────────────────────────────────────────────────┤
│  DOMAIN / SIMULATION LAYER                              │
│  SimulationEngine · Resource models · Planet profiles   │
│  Environmental events · Scoring                         │
├─────────────────────────────────────────────────────────┤
│  DATA LAYER                                             │
│  NASA datasets · Validation schemas · Repositories      │
├─────────────────────────────────────────────────────────┤
│  AI LAYER                                               │
│  Astro-AI · Prompts · Knowledge base · Response schemas │
├─────────────────────────────────────────────────────────┤
│  REPORTING LAYER                                        │
│  Mission history · Decision log · Performance metrics   │
└─────────────────────────────────────────────────────────┘
```

## Module Boundaries and Contracts

### simulation/
- **No React imports.** Pure TypeScript domain logic.
- **No side effects** outside of the SimulationEngine step function.
- All inputs and outputs are typed via `simulation/types/`.
- Deterministic: same inputs always produce same outputs.
- Testable in isolation with Vitest.

### data/
- Owns all raw scientific data files.
- Validates data with Zod schemas on load.
- Exposes typed repositories — never raw JSON.
- Records provenance (source URL, instrument, date) for every dataset.

### ai/
- Receives structured `SimulationContext` objects from the application layer.
- Must NOT modify simulation state.
- Must NOT invent scientific values.
- Must degrade gracefully when the external AI service is unavailable.
- Responses validated by Zod before display.

### game/
- Phaser scenes are isolated inside `src/game/`.
- Communicates with the application layer via a typed event bus.
- Does NOT directly import simulation engine — application layer mediates.

### store/
- Zustand stores hold application-level state only (current screen, mission session).
- Simulation state lives in the simulation engine, not in Zustand.
- Stores expose typed selectors and actions.

## Data Flow

```
User Action
  → Application Layer (useMissionControl hook)
    → SimulationEngine.step(action)
      → Validate state
      → Process events
      → Calculate resources
      → Apply environmental effects
      → Validate constraints
      → Record transition
      → Return SimulationResult
    → Update Zustand store (app state only)
    → Astro-AI receives SimulationContext (read-only)
    → React re-renders from store
```

## Component Architecture

```
App.tsx
  ├── Router
  │   ├── /                   → OnboardingScreen
  │   ├── /select-planet      → PlanetSelectionScreen
  │   ├── /select-crew        → CrewSelectionScreen
  │   ├── /configure-base     → BaseConfigurationScreen
  │   ├── /mission            → MissionControlScreen
  │   │     ├── ResourcePanel
  │   │     ├── EnvironmentPanel
  │   │     ├── EventPanel
  │   │     ├── AstroAIPanel
  │   │     └── PhaserCanvas (game scene)
  │   └── /debrief            → MissionDebriefScreen
  └── GlobalProviders
```

## Key Architectural Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Simulation engine isolation | Pure TS, no React | Testability, portability |
| No backend required | Local-first | Reduces complexity for V1, NASA datasets are static |
| Phaser integration | Canvas inside React div | Standard approach, avoids conflicts |
| State management | Zustand only for app state | Simulation state is owned by engine |
| AI fallback | Graceful degradation | App must work offline |
| Scientific data | Static JSON with provenance | No live telemetry in V1 |

## Dependency Rules (enforced by convention, future ESLint config)

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
