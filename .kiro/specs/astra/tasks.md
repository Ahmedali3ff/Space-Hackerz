# ASTRA — Implementation Task Checklist

Every task has a unique ID, description, dependencies, acceptance criteria, and status.
Status values: NOT_STARTED | IN_PROGRESS | BLOCKED | DONE

---

## PHASE 1 — Requirements and Architecture

### TASK-DOC-005
- **Description:** Create .kiro/specs/astra/requirements.md with all functional and non-functional requirements
- **Dependencies:** None
- **Acceptance Criteria:** All 8 feature areas have FRs with unique IDs. NFRs cover performance, reliability, scientific integrity, accessibility, maintainability.
- **Status:** DONE

### TASK-DOC-006
- **Description:** Create .kiro/specs/astra/design.md with screen inventory and component mapping
- **Dependencies:** None (placeholder until design assets arrive)
- **Acceptance Criteria:** All 6 screens documented with required UI regions. Design token section present. Handoff checklist present.
- **Status:** DONE

### TASK-DOC-007
- **Description:** Create .kiro/specs/astra/tasks.md (this file)
- **Dependencies:** requirements.md, design.md
- **Acceptance Criteria:** All phases have ordered tasks. Every task has ID, description, deps, acceptance criteria, status.
- **Status:** IN_PROGRESS

### TASK-DOC-008
- **Description:** Create docs/architecture.md (detailed technical architecture for contributors)
- **Dependencies:** architecture steering file
- **Acceptance Criteria:** Module boundaries documented. Data flow diagrams present. Dependency rules stated.
- **Status:** NOT_STARTED

### TASK-DOC-009
- **Description:** Create docs/scientific-references.md
- **Dependencies:** None (can be populated incrementally)
- **Acceptance Criteria:** Reference table structure created. At least 3 NASA source entries added for Moon, 3 for Mars.
- **Status:** NOT_STARTED

### TASK-DOC-010
- **Description:** Create docs/scientific-assumptions.md
- **Dependencies:** None
- **Acceptance Criteria:** Every simulation parameter that is an educational assumption is listed with classification, value, unit, and justification.
- **Status:** NOT_STARTED

### TASK-DOC-011
- **Description:** Create docs/simulation-model.md
- **Dependencies:** TASK-DOC-008, TASK-DOC-010
- **Acceptance Criteria:** Simulation step algorithm documented. All resource formulas documented. Planet-specific modifiers documented.
- **Status:** NOT_STARTED

### TASK-DOC-012
- **Description:** Create docs/team-workflow.md
- **Dependencies:** None
- **Acceptance Criteria:** Setup instructions, dev commands, branch strategy, and contribution flow documented.
- **Status:** NOT_STARTED

---

## PHASE 2 — Project Scaffold

### TASK-SCAF-001
- **Description:** Initialize Vite + React + TypeScript project in workspace root
- **Dependencies:** None
- **Acceptance Criteria:** `npm run dev` starts without errors. `npm run build` succeeds. TypeScript strict mode enabled. Project uses ESM.
- **Status:** DONE

### TASK-SCAF-002
- **Description:** Install and configure Tailwind CSS v3
- **Dependencies:** TASK-SCAF-001
- **Acceptance Criteria:** Tailwind classes apply correctly in a test component. `tailwind.config.ts` present with correct content paths.
- **Status:** DONE

### TASK-SCAF-003
- **Description:** Install Zustand, Zod, Recharts
- **Dependencies:** TASK-SCAF-001
- **Acceptance Criteria:** All three packages importable without TypeScript errors. Versions pinned in package.json.
- **Status:** DONE

### TASK-SCAF-004
- **Description:** Install Phaser 3 and verify canvas renders
- **Dependencies:** TASK-SCAF-001
- **Acceptance Criteria:** A minimal Phaser scene renders inside a React component without console errors. No conflicts with React rendering.
- **Status:** DONE

### TASK-SCAF-005
- **Description:** Install Vitest and configure test runner
- **Dependencies:** TASK-SCAF-001
- **Acceptance Criteria:** `npm run test` executes a sample test successfully. Coverage reporting configured.
- **Status:** DONE

### TASK-SCAF-006
- **Description:** Configure TypeScript path aliases
- **Dependencies:** TASK-SCAF-001
- **Acceptance Criteria:** `@/`, `@simulation/`, `@data/`, `@ai/`, `@game/`, `@store/` all resolve correctly at compile time and in Vite.
- **Status:** DONE

### TASK-SCAF-007
- **Description:** Configure ESLint with TypeScript rules and import order plugin
- **Dependencies:** TASK-SCAF-001
- **Acceptance Criteria:** `npm run lint` runs cleanly on scaffolded files. Import order violations are flagged. `any` usage is flagged.
- **Status:** DONE

### TASK-SCAF-008
- **Description:** Configure React Router v6 with all 6 application routes
- **Dependencies:** TASK-SCAF-001, TASK-SCAF-003
- **Acceptance Criteria:** All 6 routes render placeholder components. Browser back/forward navigation works. Routes are typed.
- **Status:** DONE

### TASK-SCAF-009
- **Description:** Verify full dev environment (dev server + build + tests)
- **Dependencies:** TASK-SCAF-001 through TASK-SCAF-008
- **Acceptance Criteria:** `npm run dev` runs. `npm run build` produces dist/. `npm run test` passes. No TypeScript errors.
- **Status:** DONE

---

## PHASE 3 — Scientific Foundation

### TASK-SCI-001
- **Description:** Research and document Moon environmental parameters with NASA sources
- **Dependencies:** None
- **Acceptance Criteria:** Surface temperature range, solar irradiance, day/night cycle duration, gravity, radiation environment documented in docs/scientific-references.md with source URLs.
- **Status:** DONE

### TASK-SCI-002
- **Description:** Research and document Mars environmental parameters with NASA sources
- **Dependencies:** None
- **Acceptance Criteria:** Surface temperature range, solar irradiance, sol duration, gravity, atmospheric pressure, dust storm frequency documented with source URLs.
- **Status:** DONE

### TASK-SCI-003
- **Description:** Document life support resource consumption rates as educational assumptions
- **Dependencies:** None
- **Acceptance Criteria:** Oxygen consumption per person per day, water consumption, food consumption, power baseline documented in docs/scientific-assumptions.md with classification EDUCATIONAL_ASSUMPTION.
- **Status:** DONE

### TASK-SCI-004
- **Description:** Create MoonProfile static data file (JSON + TypeScript)
- **Dependencies:** TASK-SCI-001, TASK-SCAF-006
- **Acceptance Criteria:** File at `src/data/nasa/moon-profile.ts`. All values have source comments. Zod schema validates the shape.
- **Status:** DONE

### TASK-SCI-005
- **Description:** Create MarsProfile static data file (JSON + TypeScript)
- **Dependencies:** TASK-SCI-002, TASK-SCAF-006
- **Acceptance Criteria:** File at `src/data/nasa/mars-profile.ts`. All values have source comments. Zod schema validates the shape.
- **Status:** DONE

### TASK-SCI-006
- **Description:** Create Zod schemas for PlanetProfile, ResourceProfile, EnvironmentProfile
- **Dependencies:** TASK-SCAF-003
- **Acceptance Criteria:** Schemas in `src/data/validation/`. Invalid data throws a typed validation error. Unit tests pass for valid and invalid inputs.
- **Status:** DONE

### TASK-SCI-007
- **Description:** Validate Moon and Mars profile data against schemas on module load
- **Dependencies:** TASK-SCI-004, TASK-SCI-005, TASK-SCI-006
- **Acceptance Criteria:** Application fails fast with a clear error if any profile data violates its schema. Successful load is silent.
- **Status:** DONE

---

## PHASE 4 — Simulation Core

### TASK-SIM-001
- **Description:** Define all simulation TypeScript types in `src/simulation/types/`
- **Dependencies:** TASK-SCAF-006
- **Acceptance Criteria:** SimulationState, SimulationConfig, SimulationResult, ResourceSnapshot, PlanetProfile, EventDefinition, DecisionOption, MissionOutcome all typed and exported.
- **Status:** DONE

### TASK-SIM-002
- **Description:** Implement OxygenModel
- **Dependencies:** TASK-SIM-001, TASK-SCI-003
- **Acceptance Criteria:** Pure function. Calculates oxygen delta per step based on crew size, life support capacity, and planet atmosphere. Unit tests: normal operation, depletion, overproduction.
- **Status:** DONE

### TASK-SIM-003
- **Description:** Implement WaterModel
- **Dependencies:** TASK-SIM-001, TASK-SCI-003
- **Acceptance Criteria:** Pure function. Calculates water delta based on crew consumption and recycling efficiency. Unit tests pass.
- **Status:** DONE

### TASK-SIM-004
- **Description:** Implement FoodModel
- **Dependencies:** TASK-SIM-001, TASK-SCI-003
- **Acceptance Criteria:** Pure function. Calculates food delta based on crew consumption and agricultural production rate. Unit tests pass.
- **Status:** DONE

### TASK-SIM-005
- **Description:** Implement EnergyModel
- **Dependencies:** TASK-SIM-001, TASK-SCI-001, TASK-SCI-002
- **Acceptance Criteria:** Pure function. Calculates energy production (solar panels × irradiance × efficiency) and consumption. Planet-specific solar irradiance applied. Unit tests: normal, dust storm reduction, night cycle.
- **Status:** DONE

### TASK-SIM-006
- **Description:** Implement LifeSupportSystem
- **Dependencies:** TASK-SIM-002, TASK-SIM-003
- **Acceptance Criteria:** Orchestrates oxygen and water models. Returns system health status. Unit tests pass.
- **Status:** DONE

### TASK-SIM-007
- **Description:** Implement PowerSystem
- **Dependencies:** TASK-SIM-005
- **Acceptance Criteria:** Manages energy production, consumption, and storage. Handles battery charge/discharge. Unit tests pass.
- **Status:** DONE

### TASK-SIM-008
- **Description:** Implement RadiationProtectionSystem
- **Dependencies:** TASK-SIM-001
- **Acceptance Criteria:** Calculates radiation exposure based on planet profile and shielding level. Returns crew radiation dose. Unit tests pass.
- **Status:** DONE

### TASK-SIM-009
- **Description:** Implement AgricultureSystem
- **Dependencies:** TASK-SIM-004
- **Acceptance Criteria:** Calculates food production based on configured agriculture capacity and available power. Unit tests pass.
- **Status:** DONE

### TASK-SIM-010
- **Description:** Implement SimulationClock
- **Dependencies:** TASK-SIM-001
- **Acceptance Criteria:** Tracks mission day/sol. Supports deterministic advancement. No `Date.now()` dependency. Unit tests pass.
- **Status:** DONE

### TASK-SIM-011
- **Description:** Implement SimulationEngine (main orchestrator)
- **Dependencies:** TASK-SIM-002 through TASK-SIM-010
- **Acceptance Criteria:** `engine.step(action)` validates state → processes events → calculates all resources → applies environmental effects → validates constraints → records transition → returns SimulationResult. Same inputs always produce same output. Integration tests pass.
- **Status:** DONE

### TASK-SIM-012
- **Description:** Implement EventEngine with LunarEvents and MartianEvents
- **Dependencies:** TASK-SIM-001, TASK-SCI-001, TASK-SCI-002
- **Acceptance Criteria:** At least 3 lunar events and 3 Martian events defined. Trigger conditions documented. Decision outcomes affect simulation state deterministically. Events use seeded random for ordering.
- **Status:** DONE

### TASK-SIM-013
- **Description:** Implement MissionScoring
- **Dependencies:** TASK-SIM-001, TASK-SIM-011
- **Acceptance Criteria:** Score calculation documented in docs/simulation-model.md. Inputs: mission duration, resource stability history, decisions made, events survived. Output: typed MissionScore object.
- **Status:** DONE

### TASK-SIM-014
- **Description:** Write unit tests for all resource models (SIM-002 through SIM-009)
- **Dependencies:** TASK-SIM-002 through TASK-SIM-009, TASK-SCAF-005
- **Acceptance Criteria:** Each model has tests for: normal operation, depletion edge case, planet-specific behavior (Moon vs Mars), invalid input handling.
- **Status:** DONE

### TASK-SIM-015
- **Description:** Write integration tests for SimulationEngine full step cycle
- **Dependencies:** TASK-SIM-011, TASK-SIM-012
- **Acceptance Criteria:** Tests cover: Moon mission 10-day run, Mars mission 10-sol run with dust storm event, resource depletion triggering mission failure, deterministic reproducibility with seed.
- **Status:** DONE

---

## PHASE 5 — Application Foundation

### TASK-APP-001
- **Description:** Implement Zustand mission store
- **Dependencies:** TASK-SCAF-003, TASK-SIM-001
- **Acceptance Criteria:** Store holds: selectedPlanet, crewSize, baseConfig, missionSession (current sim state snapshot), decisionLog. All actions typed. No simulation logic in the store.
- **Status:** DONE

### TASK-APP-002
- **Description:** Implement Zustand app store (navigation / UI state)
- **Dependencies:** TASK-SCAF-003
- **Acceptance Criteria:** Store holds: currentScreen, isLoading, errorMessage. Typed selectors exported.
- **Status:** DONE

### TASK-APP-003
- **Description:** Implement useMissionControl hook
- **Dependencies:** TASK-APP-001, TASK-SIM-011
- **Acceptance Criteria:** Hook initializes SimulationEngine with config from store. Exposes `advanceDay()`, `makeDecision(option)`, `currentState`, `activeEvents`. Components never import SimulationEngine directly.
- **Status:** DONE

### TASK-APP-004
- **Description:** Implement application router with all 6 routes
- **Dependencies:** TASK-SCAF-008, TASK-APP-001, TASK-APP-002
- **Acceptance Criteria:** All routes render. Route guards prevent accessing /mission without completing setup. Browser navigation works.
- **Status:** DONE

### TASK-APP-005
- **Description:** Implement GlobalProviders wrapper (Zustand, ErrorBoundary)
- **Dependencies:** TASK-APP-001, TASK-APP-002
- **Acceptance Criteria:** All providers wrap the router. ErrorBoundary catches and displays a user-friendly message for unexpected errors. Providers do not cause re-render storms.
- **Status:** DONE

---

## PHASE 6 — Visual Design Integration

### TASK-VIS-001
- **Description:** Receive and analyze user-supplied design references
- **Dependencies:** User provides design assets
- **Acceptance Criteria:** All screens identified in design. All states (normal, warning, error) identified. Asset list compiled.
- **Status:** BLOCKED (BLK-001: awaiting user design)

### TASK-VIS-002
- **Description:** Extract design tokens and configure Tailwind theme
- **Dependencies:** TASK-VIS-001
- **Acceptance Criteria:** tailwind.config.ts extended with exact design colors, fonts, and spacing. Design tokens match reference.
- **Status:** BLOCKED

### TASK-VIS-003
- **Description:** Build common component library
- **Dependencies:** TASK-VIS-002
- **Acceptance Criteria:** Button, Card, Badge, ProgressBar, Modal, Alert components built and visually match design. All components typed and accessible.
- **Status:** BLOCKED

### TASK-VIS-004
- **Description:** Implement all 6 feature screens
- **Dependencies:** TASK-VIS-003, TASK-APP-003, TASK-APP-004
- **Acceptance Criteria:** Each screen renders correctly. Matches design references. Connected to simulation data. No fake interactions.
- **Status:** BLOCKED

### TASK-VIS-005
- **Description:** Validate visual fidelity against design references
- **Dependencies:** TASK-VIS-004
- **Acceptance Criteria:** Side-by-side comparison of running app vs design. All deviations documented and resolved or explicitly approved by user.
- **Status:** BLOCKED

---

## PHASE 7 — Gameplay (depends on Phase 5 + 6)

### TASK-GAME-001 through TASK-GAME-007
- **Status:** BLOCKED (depends on TASK-VIS-004 and TASK-APP-003)
- See workflow.md for full task list

---

## PHASE 8 — Astro-AI (depends on Phase 5)

### TASK-AI-001 through TASK-AI-006
- **Status:** NOT_STARTED (can begin knowledge base + schemas without design)
- See workflow.md for full task list

---

## PHASE 9 — Mission Debrief (depends on Phase 4 + 5)

### TASK-DEB-001
- **Description:** Implement decision log recording
- **Dependencies:** TASK-APP-001, TASK-SIM-011
- **Acceptance Criteria:** Every player decision recorded in the mission store with day, event ID, option chosen, and outcome. endMission pulls the engine log.
- **Status:** DONE

### TASK-DEB-002
- **Description:** Implement mission scoring algorithm
- **Dependencies:** TASK-SIM-013
- **Acceptance Criteria:** calculateMissionScore verified against docs/simulation-model.md. Score covers duration, resource stability, decisions, and events survived.
- **Status:** DONE

### TASK-DEB-003
- **Description:** Implement ResourceHistoryPoint type + store tracking + tests
- **Dependencies:** TASK-APP-001, TASK-SIM-001
- **Acceptance Criteria:** ResourceHistoryPoint typed, store appends snapshot each step, unit tests pass (6 tests).
- **Status:** DONE

### TASK-DEB-004
- **Description:** Implement MissionDebriefScreen with 6 sections and Recharts
- **Dependencies:** TASK-DEB-001, TASK-DEB-002, TASK-DEB-003
- **Acceptance Criteria:** Screen renders mission outcome, score breakdown, resource history charts (Recharts), decision log, and learning summary. Component tests pass (7 tests).
- **Status:** DONE

### TASK-DEB-005
- **Description:** Router update — wire /debrief route to MissionDebriefScreen with RequireMissionStarted guard
- **Dependencies:** TASK-DEB-004, TASK-APP-004
- **Acceptance Criteria:** /debrief renders MissionDebriefScreen. RequireMissionStarted guard (not missionActive) keeps the route accessible after endMission(). Redirects to "/" if mission was never started.
- **Status:** DONE

---

## Summary

| Phase | Total Tasks | DONE | IN_PROGRESS | BLOCKED | NOT_STARTED |
|-------|-------------|------|-------------|---------|-------------|
| 1     | 8           | 6    | 1           | 0       | 1           |
| 2     | 9           | 9    | 0           | 0       | 0           |
| 3     | 7           | 7    | 0           | 0       | 0           |
| 4     | 15          | 15   | 0           | 0       | 0           |
| 5     | 5           | 5    | 0           | 0       | 0           |
| 6     | 5           | 0    | 0           | 5       | 0           |
| 7–8   | 13          | 0    | 0           | 7       | 6           |
| 9     | 5           | 5    | 0           | 0       | 0           |
