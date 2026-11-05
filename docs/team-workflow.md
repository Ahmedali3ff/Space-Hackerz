# ASTRA — Team Workflow and Setup Guide

## Prerequisites

- Node.js 20+ (project uses v24)
- npm 10+ (project uses v11)
- Git 2.x+

## Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd "NASA SPACE APPS"

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
# Edit .env with your actual values (AI API key only — no other secrets needed)
```

## Development Commands

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run test         # Run Vitest unit + integration tests
npm run test:watch   # Run Vitest in watch mode
npm run test:coverage# Run tests with coverage report
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run typecheck    # TypeScript type check (no emit)
```

## Project Structure Quick Reference

```
src/
  app/             ← React app entry, providers, router
  components/      ← Shared reusable UI components
  features/        ← Feature-specific screens and components
  game/            ← Phaser game scenes and entities
  simulation/      ← Pure TypeScript simulation engine (no React)
  data/            ← NASA data files and validation schemas
  ai/              ← Astro-AI assistant service
  store/           ← Zustand stores
  hooks/           ← Shared application hooks
  services/        ← Application services
  types/           ← Shared TypeScript types
  utils/           ← Pure utility functions

docs/              ← Technical documentation
.kiro/steering/    ← AI agent steering context
.kiro/specs/       ← Requirements, design, task tracking
tests/             ← Unit, integration, simulation tests
public/data/nasa/  ← Static NASA data assets
```

## Path Aliases

All internal imports use path aliases — never relative `../../` chains:

```ts
import { SimulationEngine } from '@simulation/core/simulation-engine';
import { useMissionStore }  from '@store/mission-store';
import { MoonProfile }      from '@data/nasa/moon-profile';
import { AstroAssistant }   from '@ai/astro-assistant';
```

## Branch Strategy

```
main              ← stable, always builds
feature/<name>    ← new features
fix/<name>        ← bug fixes
docs/<name>       ← documentation only
test/<name>       ← test additions
```

## Commit Convention (Conventional Commits)

```
feat: add CrewSelectionScreen component
fix: correct oxygen calculation for Mars mission
docs: add Mars radiation references
test: add SimulationEngine integration tests
chore: update Vite to 5.2
```

## Pull Request Process

1. Create a feature branch from `main`
2. Implement the feature
3. Run `npm run typecheck` — must pass with zero errors
4. Run `npm run test` — all tests must pass
5. Run `npm run build` — must produce a clean dist/
6. Update `tasks.md` to mark tasks DONE
7. Update `workflow.md` with next recommended action
8. Open PR with description of what changed and what was tested

## Environment Variables

```env
# .env.example — copy to .env and fill in values

# AI assistant API key (Astro-AI feature)
# The app works without this — Astro-AI falls back to static knowledge base
VITE_AI_API_KEY=your_api_key_here
VITE_AI_API_ENDPOINT=https://your-ai-endpoint/v1
VITE_AI_MODEL=your-model-id
```

Never commit `.env` with real values. `.env.example` is always committed.

## Scientific Data Policy

When adding or modifying scientific parameters:
1. Add the source to `docs/scientific-references.md`
2. Classify the value (OBSERVED_DATA / DERIVED_PARAMETER / EDUCATIONAL_ASSUMPTION)
3. If it's an EDUCATIONAL_ASSUMPTION, add it to `docs/scientific-assumptions.md`
4. Add a source comment in the code file
5. Update `docs/simulation-model.md` if the formula changes

## Testing Guide

### Unit tests (Vitest)
Located in `tests/unit/` mirroring `src/` structure.
Run in < 1 second each — no browser, no network.

```bash
npm run test -- tests/unit/simulation/   # Run only simulation tests
```

### Integration tests (Vitest)
Located in `tests/integration/`.
Test full SimulationEngine step cycles and data loading.

### E2E tests (Playwright)
Located in `tests/e2e/` (to be created in QA phase).
Test critical user flows: full Moon mission, full Mars mission.

```bash
npx playwright test                    # Run all E2E tests
npx playwright test --headed           # Run with browser visible
```

## Known Limitations (V1)

- No backend or user accounts — all state is in-memory, lost on refresh
- No real-time NASA telemetry — all data is static
- Astro-AI requires an external API key to use LLM features
- Phaser canvas is not accessible via keyboard — visual enhancement only
- Only Moon and Mars environments supported
- No save/load game state in V1
