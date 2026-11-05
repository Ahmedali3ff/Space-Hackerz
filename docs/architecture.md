# ASTRA — Technical Architecture

## Overview

ASTRA is a local-first, client-side React application. There is no backend server in V1.
All simulation logic runs in the browser. NASA data is bundled as validated static assets.

## Technology Stack

| Concern        | Tool                    | Version (target) |
|----------------|-------------------------|------------------|
| UI             | React                   | 18.x             |
| Language       | TypeScript              | 5.x              |
| Build          | Vite                    | 5.x              |
| Styling        | Tailwind CSS            | 3.x              |
| Game Engine    | Phaser                  | 3.x              |
| Global State   | Zustand                 | 4.x              |
| Validation     | Zod                     | 3.x              |
| Charts         | Recharts                | 2.x              |
| Unit Tests     | Vitest                  | 1.x              |
| E2E Tests      | Playwright              | 1.x              |
| Router         | React Router            | 6.x              |

## Layer Descriptions

### Presentation Layer (`src/app/`, `src/features/`, `src/components/`)

Responsible for rendering the UI and collecting user input.

- React functional components, typed props.
- Feature folders each contain the screen component, local hooks, and local types.
- Components read state via application hooks — never directly from the simulation engine.
- Phaser canvas is mounted as a React component in `src/game/`.

### Application Layer (`src/hooks/`, `src/services/`, `src/store/`)

Responsible for coordinating between the UI, simulation engine, and AI layer.

Key pieces:
- `useMissionControl` — primary hook used by MissionControlScreen. Owns the SimulationEngine instance. Exposes typed actions and state snapshots.
- `useMissionSetup` — hook managing the onboarding → planet → crew → config flow.
- `useMissionStore` — Zustand store for mission session state (planet, crew, config, decision log).
- `useAppStore` — Zustand store for app-level state (current route, loading, error).

The application layer is the only layer allowed to instantiate SimulationEngine.

### Domain / Simulation Layer (`src/simulation/`)

The scientific and mathematical core of ASTRA.

Rules:
- Zero React imports.
- Zero Zustand imports.
- Zero Phaser imports.
- All functions are pure or contained within SimulationEngine.
- Deterministic: same inputs → same outputs.

Sub-modules:

```
simulation/
  core/
    simulation-engine.ts     ← orchestrates one time step
    simulation-state.ts      ← state shape and validation
    simulation-clock.ts      ← time advancement, day/sol tracking
  resources/
    oxygen-model.ts
    water-model.ts
    food-model.ts
    energy-model.ts
  planets/
    moon-profile.ts          ← static environmental parameters
    mars-profile.ts
    planet-profile.types.ts
  systems/
    life-support-system.ts
    power-system.ts
    radiation-protection-system.ts
    agriculture-system.ts
  events/
    event-engine.ts
    lunar-events.ts
    martian-events.ts
  calculations/
    resource-balance.ts
    simulation-formulas.ts
  types/
    index.ts                 ← all exported simulation types
```

### Data Layer (`src/data/`)

Responsible for loading, validating, and exposing scientific data.

```
data/
  nasa/
    moon-profile.ts          ← typed constants with source comments
    mars-profile.ts
  repositories/
    planet-repository.ts     ← repository interface + implementation
  validation/
    planet-profile.schema.ts ← Zod schemas
    resource-profile.schema.ts
```

All NASA data files must include:
- Source URL in code comment
- Instrument/mission name
- Classification tag: OBSERVED_DATA | DERIVED_PARAMETER | EDUCATIONAL_ASSUMPTION

### AI Layer (`src/ai/`)

Responsible for generating educational explanations.

```
ai/
  prompts/
    event-explanation.prompt.ts
    resource-change.prompt.ts
    decision-guidance.prompt.ts
  schemas/
    astro-response.schema.ts    ← Zod validation for AI responses
  astro-assistant.ts            ← main service class
  knowledge-base.ts             ← static scientific knowledge (fallback)
```

Contract:
- Receives `SimulationContext` (read-only snapshot).
- Returns `AstroResponse` validated by Zod.
- Never modifies simulation state.
- Falls back to `knowledge-base.ts` static content when AI service is unavailable.

### Reporting Layer (`src/features/mission-debrief/`)

Responsible for generating the post-mission report.

- Reads from the decision log recorded during the mission.
- Computes `MissionScore` via `MissionScoring` service.
- Renders charts via Recharts.
- No simulation calculations — reads from recorded history only.

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  User clicks "Advance Day"                                  │
│                      ↓                                      │
│  useMissionControl.advanceDay()                             │
│    ↓                                                        │
│  SimulationEngine.step(currentState, playerAction)          │
│    ├── validateState(currentState)                          │
│    ├── EventEngine.processEvents(state, clock, seed)        │
│    ├── calculateResources(state, planetProfile)             │
│    │     ├── OxygenModel.calculate(...)                     │
│    │     ├── WaterModel.calculate(...)                      │
│    │     ├── FoodModel.calculate(...)                       │
│    │     └── EnergyModel.calculate(...)                     │
│    ├── applyEnvironmentalEffects(state, planetProfile)      │
│    ├── validateConstraints(newState)                        │
│    ├── recordTransition(state → newState, action)           │
│    └── return SimulationResult                              │
│                      ↓                                      │
│  useMissionControl updates local state                      │
│  missionStore.updateSession(result)                         │
│                      ↓                                      │
│  React re-renders MissionControlScreen                      │
│    ├── ResourcePanel reads new resource values              │
│    ├── EventPanel shows new/resolved events                 │
│    └── AstroAIPanel receives new SimulationContext          │
└─────────────────────────────────────────────────────────────┘
```

## Phaser Integration Pattern

Phaser renders inside a `<div ref={gameContainerRef}>` in MissionControlScreen.
The Phaser game instance is created once on mount and destroyed on unmount.
Communication is via a typed EventBus (pub/sub pattern):

```ts
// Application layer publishes
EventBus.emit('resource-critical', { resource: 'oxygen', level: 0.12 });

// Phaser scene subscribes
EventBus.on('resource-critical', (data) => {
  this.showWarningAnimation(data.resource);
});
```

Phaser never imports React. React never imports Phaser game objects directly.

## Error Handling Strategy

| Scenario                       | Handling                                          |
|--------------------------------|---------------------------------------------------|
| Invalid simulation input       | Zod validation → Result error → logged + surfaced |
| AI service unavailable         | Catch → use knowledge-base.ts fallback content    |
| Invalid NASA data on load      | Zod validation → fail fast with clear error       |
| Unexpected React error         | ErrorBoundary → user-friendly error screen        |
| Resource below zero            | Treated as fault state → mission failure event    |

## Security Notes

- No backend, no auth, no user PII stored.
- AI API key stored in `.env` only, never bundled.
- `.env.example` committed with variable names, not values.
- No external network requests except to configured AI endpoint.
