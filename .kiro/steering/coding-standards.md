# ASTRA — Coding Standards

## TypeScript Conventions

- Strict mode enabled (`"strict": true` in tsconfig).
- No `any` — use `unknown` with type guards or define a proper type.
- Prefer `interface` for object shapes that may be extended; `type` for unions and aliases.
- All function parameters and return types must be explicitly annotated.
- Use `readonly` on all data objects that must not be mutated (simulation state, planet profiles, NASA data).
- Enums are banned — use `as const` string literals instead.
- No non-null assertion operator (`!`) except in test files with a comment justifying it.

```ts
// ✅ Correct
interface CrewMember {
  readonly id: string;
  readonly name: string;
  readonly role: CrewRole;
}

type CrewRole = 'commander' | 'engineer' | 'scientist' | 'medic';

// ❌ Wrong
enum CrewRole { Commander, Engineer } // banned
const crew: any = {};                 // banned
```

## Naming Conventions

| Construct        | Convention         | Example                          |
|------------------|--------------------|----------------------------------|
| Files (components)| PascalCase        | `MissionControlScreen.tsx`       |
| Files (modules)  | kebab-case         | `simulation-engine.ts`           |
| Files (types)    | kebab-case         | `planet-profile.types.ts`        |
| React components | PascalCase         | `ResourcePanel`                  |
| Functions        | camelCase          | `calculateOxygenDelta`           |
| Variables        | camelCase          | `currentMissionDay`              |
| Constants        | SCREAMING_SNAKE    | `MAX_CREW_SIZE`                  |
| Types/Interfaces | PascalCase         | `SimulationState`                |
| Zustand stores   | camelCase + Store  | `useMissionStore`                |
| Hooks            | use + PascalCase   | `useMissionControl`              |
| Test files       | `.test.ts(x)`      | `simulation-engine.test.ts`      |

## Folder Organization Rules

- One React component per file. No "kitchen sink" files.
- Co-locate component-specific hooks, types, and styles with the component.
- Shared types go in `src/types/` or the relevant module's `types/` folder.
- No imports from `../../../` — configure path aliases in `vite.config.ts` and `tsconfig.json`.

### Path Aliases (to be configured)

```
@/           → src/
@simulation/ → src/simulation/
@data/       → src/data/
@ai/         → src/ai/
@game/       → src/game/
@store/      → src/store/
```

## Component Rules

- Functional components only — no class components.
- Props must be typed with a named `interface` directly above the component.
- Components must not import from the simulation layer directly — use application hooks.
- Maximum file length: 300 lines. Split larger components.
- No inline styles except for dynamic values that cannot be expressed in Tailwind.

```tsx
// ✅ Correct
interface ResourcePanelProps {
  readonly resources: ResourceSnapshot;
  readonly onAlert: (resource: ResourceType) => void;
}

export function ResourcePanel({ resources, onAlert }: ResourcePanelProps) {
  // ...
}
```

## Simulation Layer Rules

- **No React, no Zustand, no Phaser imports in `src/simulation/`.** 
- All simulation inputs and outputs are plain TypeScript objects.
- No `Date.now()` or `Math.random()` directly — pass clock and seed through the engine.
- All calculation functions are pure: same inputs → same outputs.
- Resource values must never go below 0 without being modeled as a fault state.

## Error Handling

- Use `Result<T, E>` pattern for operations that can fail predictably:

```ts
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };
```

- Throw only for programming errors (invariant violations), not expected failure modes.
- All external data (NASA JSON files, AI responses) must be validated with Zod before use.
- Never surface raw error objects to the user — translate to user-facing messages.

## Scientific Data Rules

- Every scientific constant must have a source comment with URL:
  ```ts
  /** Lunar surface gravity: 1.62 m/s² — Source: NASA Moon Fact Sheet
   *  https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
  export const LUNAR_SURFACE_GRAVITY = 1.62 as const;
  ```
- Values must be classified: `OBSERVED_DATA | DERIVED_PARAMETER | EDUCATIONAL_ASSUMPTION`.
- Educational assumptions must be documented in `docs/scientific-assumptions.md`.
- Never use magic numbers in simulation calculations — all constants must be named and sourced.

## Testing Requirements

- Unit tests required for all simulation calculation functions.
- Unit tests required for all Zod validation schemas.
- Integration tests required for the full SimulationEngine step cycle.
- Test file location mirrors source file location inside `tests/`.
- Tests must be deterministic — no random data without a fixed seed.
- Test names follow: `describe('SimulationEngine') > it('reduces oxygen on each step')`

## Import Order (enforced by ESLint)

1. Node built-ins
2. External packages
3. Internal path aliases (`@/`, `@simulation/`, etc.)
4. Relative imports

## Git Conventions

- Branches: `feature/`, `fix/`, `docs/`, `test/`
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`)
- Never commit `.env` files with real values
- `public/data/nasa/` files must include a `SOURCES.md` provenance file
