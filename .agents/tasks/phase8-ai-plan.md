# Implementation Plan — Phase 8: Astro-AI Knowledge Base + Service Layer

## Context

- Workspace: `c:\Users\HP\Desktop\NASA SPACE APPS`
- Build command: `npm run build` (runs `tsc -b && vite build`)
- Test command: `npm run test -- --run` (runs `vitest run`)
- Path alias `@ai/` → `src/ai/` (already configured in `vite.config.ts` and used by the app)
- Zod 3 is available (`zod ^3.25.76`). No AI SDK is installed — HTTP calls are made via native `fetch`.
- The simulation layer types all live in `src/simulation/types/index.ts`. Key types used here:
  `SimulationState`, `ResourceSnapshot`, `ResourceType`, `PlanetId`, `FaultState`, `MissionOutcome`, `StepExplanation`, `SimulationResult`, `EventDefinition`.
- 4 lunar event IDs (from `lunar-events.ts`): `lunar-dust-contamination`, `lunar-night-begins`, `solar-flare-warning`, `micrometeorite-impact`
- 4 martian event IDs (from `martian-events.ts`): `regional-dust-storm`, `dust-storm-clears`, `co2-frost-formation`, `global-dust-storm`
- Existing tests: 56 total (4 prng + 5 food + 5 oxygen + 7 energy + 5 water + 12 mission-store + 7 simulation-engine + 11 useMissionControl). All must still pass after this phase.
  Note: the task brief says "33 existing tests" — that was true before Phase 5 completed. The actual current baseline is 56. The verification command is the same.
- Test file imports use relative paths (e.g. `'../../../src/simulation/...'`) OR the alias shorthand. The existing simulation tests use relative paths directly. Use `@ai/` aliases for ai tests to stay consistent with the hook tests pattern.
- No `any` types. No enums. No `!` except in tests with justifying comment. No React/Zustand/Phaser in `src/ai/`.

---

## Plan

- [ ] 1. Create `src/ai/schemas/astro-response.schema.ts` — Zod schema and inferred type.

  Define `AstroResponseSchema` as a Zod object with:
  - `explanation`: `z.string().min(10).max(500)`
  - `scienceFact`: `z.string().max(300).optional()`
  - `suggestion`: `z.string().max(200).optional()`
  - `isGrounded`: `z.boolean()`

  Export `AstroResponse` as `z.infer<typeof AstroResponseSchema>`.
  No imports from React, Zustand, or Phaser.

  Files: `src/ai/schemas/astro-response.schema.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 2. Create `src/ai/simulation-context.ts` — SimulationContext interface + buildSimulationContext builder.

  Define and export:

  ```ts
  export interface SimulationContext {
    readonly planetId: PlanetId
    readonly planetDisplayName: string
    readonly missionDay: number
    readonly timeUnitLabel: string
    readonly crewSize: number
    readonly resourceLevels: {
      readonly oxygenPercent: number        // (current/initial)*100 clamped 0–100
      readonly waterPercent: number
      readonly foodPercent: number
      readonly energyPercent: number
      readonly radiationDose_mSv: number    // absolute value (cumulative mSv)
    }
    readonly activeEventIds: readonly string[]
    readonly faultStates: readonly FaultState[]
    readonly lastStepExplanations: readonly StepExplanation[]
    readonly outcome: MissionOutcome
  }
  ```

  Implement and export `buildSimulationContext`:

  ```ts
  export function buildSimulationContext(
    state: SimulationState,
    lastResult: SimulationResult | null,
    planetDisplayName: string,
    timeUnitLabel: string,
    initialResources: ResourceSnapshot,
  ): SimulationContext
  ```

  Percentage calculation: `Math.min(100, Math.max(0, (current / initial) * 100))`.
  When `initialResources` value is `0` for a non-radiation field, clamp to `0` (avoid division by zero — treat as depleted).
  `lastStepExplanations` comes from `lastResult?.explanations ?? []`.

  No imports from React, Zustand, or Phaser. Import types from `@simulation/types`.

  Files: `src/ai/simulation-context.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 3. Create `src/ai/knowledge-base.ts` — static knowledge base with 18 entries.

  Define and export `KnowledgeEntry` interface:
  ```ts
  export interface KnowledgeEntry {
    readonly trigger: string
    readonly explanation: string
    readonly scienceFact: string
    readonly suggestion: string
  }
  ```

  Define and export `KNOWLEDGE_BASE: readonly KnowledgeEntry[]` containing **exactly** these 18 trigger keys (one entry per trigger):

  **Resource triggers (5):**
  - `'low-oxygen'` — explanation: crew air is running low, CO₂ building up, life support working hard; scienceFact: one real fact about oxygen in space habitats with `(Source: NASA)`; suggestion: actionable advice for a mission commander.
  - `'low-water'` — explanation: water supply dropping, ISS recycles ~90% of water; scienceFact with `(Source: NASA)`; suggestion.
  - `'low-food'` — explanation: food reserves low, NASA Veggie experiments on ISS; scienceFact with `(Source: NASA)`; suggestion.
  - `'low-energy'` — explanation: power dropping, batteries and solar panels are vital; scienceFact with `(Source: NASA)`; suggestion.
  - `'radiation-high'` — explanation: radiation levels elevated, your habitat shields the crew; scienceFact with `(Source: NASA)`; suggestion.

  **Lunar event triggers (4)** — use event IDs exactly as they appear in `lunar-events.ts`:
  - `'lunar-dust-contamination'`
  - `'lunar-night-begins'`
  - `'solar-flare-warning'`
  - `'micrometeorite-impact'`

  **Martian event triggers (4)** — use event IDs exactly as they appear in `martian-events.ts`:
  - `'regional-dust-storm'`
  - `'dust-storm-clears'`
  - `'co2-frost-formation'`
  - `'global-dust-storm'`

  **General triggers (4):**
  - `'mission-start-moon'`
  - `'mission-start-mars'`
  - `'mission-success'`
  - `'mission-failure'`
  - `'default'`

  That's 5 + 4 + 4 + 5 = 18 entries (including `'default'`).

  Content rules for every entry:
  - `explanation`: 2–4 sentences, age 8–12 vocabulary, first person "your crew", exciting tone, factually accurate, must NOT claim live NASA telemetry.
  - `scienceFact`: one real, verifiable fact ending with `(Source: NASA)`.
  - `suggestion`: 1 sentence, actionable, child-friendly imperative voice.

  Export `getKnowledgeEntry(trigger: string): KnowledgeEntry` — looks up by trigger, returns the `'default'` entry if not found (never returns `undefined`).

  No imports from React, Zustand, or Phaser.

  Files: `src/ai/knowledge-base.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 4. Create `src/ai/prompts/event-explanation.prompt.ts`.

  Export `buildEventExplanationPrompt(context: SimulationContext): string`.

  The returned string must:
  1. Open by establishing the AI's role: "You are Astro, an educational AI assistant for ASTRA Mission Control Academy. You help students aged 8–12 understand real space science."
  2. Format the SimulationContext as readable key/value lines — NOT raw JSON. Use human labels, e.g.:
     ```
     Planet: Moon
     Mission Day: 5
     Crew Size: 4
     Oxygen: 72%
     Water: 88%
     Food: 65%
     Energy: 54%
     Radiation dose so far: 12.4 mSv
     Active events: lunar-dust-contamination
     Faults: none
     ```
  3. Ask for an age-appropriate explanation of the active events and what they mean for the crew.
  4. Include these exact constraints in the prompt:
     - "Use simple, exciting language a 10-year-old can understand."
     - "Do NOT invent specific numbers or measurements."
     - "Do NOT claim this data comes from a live NASA feed."
     - "Refer to the crew in first person: 'your crew'."
  5. Instruct JSON output matching the AstroResponse schema:
     ```
     Respond with ONLY a JSON object matching this schema:
     { "explanation": string (10–500 chars), "scienceFact": string (optional, max 300 chars), "suggestion": string (optional, max 200 chars), "isGrounded": boolean }
     ```

  Import `SimulationContext` from `../simulation-context` (relative, not alias, to avoid circular issues).

  No imports from React, Zustand, or Phaser.

  Files: `src/ai/prompts/event-explanation.prompt.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 5. Create `src/ai/prompts/resource-change.prompt.ts`.

  Export `buildResourceChangePrompt(context: SimulationContext, resource: ResourceType): string`.

  Same structure as the event prompt:
  - Role preamble (Astro, educational AI, ages 8–12).
  - Context formatted as human-readable key/values (same format as step 4).
  - The `resource` parameter is inserted as a human label (e.g. `ResourceType 'oxygen'` → "Oxygen").
  - Ask for an explanation of why this specific resource changed and what the student can do.
  - Same four constraint lines as step 4.
  - Same JSON schema instruction.

  Import `SimulationContext` from `../simulation-context` and `ResourceType` from `@simulation/types`.

  No imports from React, Zustand, or Phaser.

  Files: `src/ai/prompts/resource-change.prompt.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 6. Create `src/ai/prompts/decision-guidance.prompt.ts`.

  Export `buildDecisionGuidancePrompt(context: SimulationContext, eventId: string): string`.

  Same structure:
  - Role preamble.
  - Context formatted as human-readable key/values.
  - Insert `eventId` as plain text: "The player must make a decision about event: [eventId]"
  - Ask for decision guidance — explain the event scientifically and help the student think through choices.
  - Same four constraint lines.
  - Same JSON schema instruction.

  Import `SimulationContext` from `../simulation-context`.

  No imports from React, Zustand, or Phaser.

  Files: `src/ai/prompts/decision-guidance.prompt.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 7. Create `src/ai/astro-assistant.ts` — AstroAssistant class.

  Define and export:

  ```ts
  export interface AstroAssistantConfig {
    readonly apiKey?: string
    readonly apiEndpoint?: string
    readonly model?: string
  }
  ```

  Default values (use inside class, do not export separately):
  - `apiEndpoint`: `'https://api.openai.com/v1/chat/completions'`
  - `model`: `'gpt-4o-mini'`

  Export class `AstroAssistant`:

  ```ts
  export class AstroAssistant {
    constructor(config: AstroAssistantConfig)
    isAvailable(): boolean                                                   // true only if apiKey is a non-empty string
    async explainEvent(context: SimulationContext): Promise<AstroResponse>   // never rejects
    async explainResourceChange(context: SimulationContext, resource: ResourceType): Promise<AstroResponse>  // never rejects
    async getDecisionGuidance(context: SimulationContext, eventId: string): Promise<AstroResponse>          // never rejects
    private async callAI(prompt: string, fallbackTrigger: string): Promise<AstroResponse>
    private getFallback(trigger: string): AstroResponse
  }
  ```

  Implementation rules:

  **`isAvailable()`**: returns `typeof this.config.apiKey === 'string' && this.config.apiKey.length > 0`

  **`getFallback(trigger)`**: calls `getKnowledgeEntry(trigger)` and maps the result to an `AstroResponse`:
  ```ts
  {
    explanation: entry.explanation,
    scienceFact: entry.scienceFact,
    suggestion: entry.suggestion,
    isGrounded: false,  // fallback content, not an AI response
  }
  ```

  **`callAI(prompt, fallbackTrigger)`**:
  1. If `!this.isAvailable()` → return `this.getFallback(fallbackTrigger)` immediately (no fetch).
  2. Create `AbortController` with 8-second timeout: `const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8000)`.
  3. Wrap the entire fetch call in `try/catch`. On any error (network, timeout, non-200 status, JSON parse failure, Zod validation failure) → `clearTimeout(timer)` and return `this.getFallback(fallbackTrigger)`.
  4. On success: `clearTimeout(timer)`, parse response JSON, extract `choices[0].message.content`, parse that string as JSON with `JSON.parse`, validate with `AstroResponseSchema.safeParse()`, return `.data` if successful, else `getFallback`.
  5. Return type is `Promise<AstroResponse>` — never `throw`, never `reject`.

  **`explainEvent(context)`**: calls `buildEventExplanationPrompt(context)`, determines `fallbackTrigger` from first active event ID or `'default'`, calls `this.callAI(prompt, trigger)`.

  **`explainResourceChange(context, resource)`**: calls `buildResourceChangePrompt(context, resource)`, uses `'low-' + resource` as fallback trigger (e.g. `'low-oxygen'`), calls `this.callAI`.

  **`getDecisionGuidance(context, eventId)`**: calls `buildDecisionGuidancePrompt(context, eventId)`, uses `eventId` as fallback trigger, calls `this.callAI`.

  Import from `./schemas/astro-response.schema`, `./simulation-context`, `./knowledge-base`, `./prompts/event-explanation.prompt`, `./prompts/resource-change.prompt`, `./prompts/decision-guidance.prompt`, and `@simulation/types`. All relative imports from within `src/ai/` use relative paths.

  No imports from React, Zustand, or Phaser. No `any`. No `!`.

  Files: `src/ai/astro-assistant.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 8. Create `src/ai/index.ts` — barrel export for the entire `@ai/` module.

  Re-export everything consumers need:

  ```ts
  // simulation-context
  export type { SimulationContext } from './simulation-context'
  export { buildSimulationContext } from './simulation-context'

  // schemas
  export { AstroResponseSchema } from './schemas/astro-response.schema'
  export type { AstroResponse } from './schemas/astro-response.schema'

  // knowledge-base
  export type { KnowledgeEntry } from './knowledge-base'
  export { KNOWLEDGE_BASE, getKnowledgeEntry } from './knowledge-base'

  // prompts
  export { buildEventExplanationPrompt } from './prompts/event-explanation.prompt'
  export { buildResourceChangePrompt } from './prompts/resource-change.prompt'
  export { buildDecisionGuidancePrompt } from './prompts/decision-guidance.prompt'

  // astro-assistant
  export type { AstroAssistantConfig } from './astro-assistant'
  export { AstroAssistant } from './astro-assistant'
  ```

  Files: `src/ai/index.ts`

  Verify: `npm run build` — zero TypeScript errors.

---

- [ ] 9. Create `tests/unit/ai/knowledge-base.test.ts` — unit tests for knowledge base.

  Import `KNOWLEDGE_BASE`, `getKnowledgeEntry` from `@ai/index` (or `@ai/knowledge-base` directly).
  Import `LUNAR_EVENTS` from `@simulation/events/lunar-events` (or relative path).
  Import `MARTIAN_EVENTS` from `@simulation/events/martian-events`.

  Test cases:
  1. All 4 lunar event IDs have knowledge entries: iterate `LUNAR_EVENTS` and assert `getKnowledgeEntry(event.id).trigger === event.id` for each (verifies dynamic coverage — if a new event is added, the test catches missing entries). Note: this test verifies the trigger field matches because `getKnowledgeEntry` returns `'default'` entry for unknowns — so check `entry.trigger !== 'default'` or that the trigger field equals the event id.
  2. All 4 martian event IDs have knowledge entries: same pattern with `MARTIAN_EVENTS`.
  3. `'default'` trigger entry exists: `getKnowledgeEntry('default').trigger` === `'default'`.
  4. All entries in `KNOWLEDGE_BASE` have non-empty `explanation`, `scienceFact`, and `suggestion` (iterate and assert `.length > 0` for each field).
  5. `getKnowledgeEntry('nonexistent-trigger-xyz')` returns the default entry (trigger is `'default'`), not `undefined`.

  Use `describe('knowledge-base')` + `it(...)` naming.

  Files: `tests/unit/ai/knowledge-base.test.ts`

  Verify: `npm run test -- --run` — all existing 33 tests pass plus these new tests.

---

- [ ] 10. Create `tests/unit/ai/astro-response.schema.test.ts` — Zod schema validation tests.

  Import `AstroResponseSchema` from `@ai/schemas/astro-response.schema` (or `@ai/index`).

  Test cases:
  1. Valid minimal response (only `explanation` + `isGrounded`) passes `.parse()` without throwing.
  2. Valid full response (`explanation`, `scienceFact`, `suggestion`, `isGrounded`) passes `.parse()`.
  3. Missing `explanation` causes `.safeParse()` to return `success: false`.
  4. `explanation` over 500 characters causes `.safeParse()` to return `success: false`.
  5. Missing `isGrounded` (boolean field) causes `.safeParse()` to return `success: false`.

  Use `describe('AstroResponseSchema')` + `it(...)` naming.

  Files: `tests/unit/ai/astro-response.schema.test.ts`

  Verify: `npm run test -- --run` — all previous tests + these 5 new tests pass.

---

- [ ] 11. Create `tests/unit/ai/astro-assistant.test.ts` — AstroAssistant behavioural tests.

  Import `AstroAssistant` from `@ai/astro-assistant` (or `@ai/index`).
  Import `AstroResponseSchema` from `@ai/schemas/astro-response.schema`.
  Import a minimal valid `SimulationContext` by constructing it inline (do not import from simulation engine — build the object literal directly with valid field values).

  Test cases (do NOT mock `fetch` for the unavailable-assistant path):
  1. `new AstroAssistant({})` → `isAvailable()` is `false`.
  2. `new AstroAssistant({ apiKey: '' })` → `isAvailable()` is `false`.
  3. `new AstroAssistant({ apiKey: 'test-key' })` → `isAvailable()` is `true`.
  4. `explainEvent()` with unavailable assistant (no apiKey) returns an `AstroResponse` object — no fetch called, no error thrown. Assert `AstroResponseSchema.safeParse(result).success === true`.
  5. `explainResourceChange(context, 'oxygen')` with unavailable assistant returns valid `AstroResponse`. Assert `AstroResponseSchema.safeParse(result).success === true`.
  6. `getDecisionGuidance(context, 'lunar-dust-contamination')` with unavailable assistant returns valid `AstroResponse`. Assert `AstroResponseSchema.safeParse(result).success === true`.

  Minimal `SimulationContext` literal for tests:
  ```ts
  const testContext: SimulationContext = {
    planetId: 'moon',
    planetDisplayName: 'Moon',
    missionDay: 1,
    timeUnitLabel: 'Day',
    crewSize: 4,
    resourceLevels: {
      oxygenPercent: 90,
      waterPercent: 85,
      foodPercent: 80,
      energyPercent: 75,
      radiationDose_mSv: 5,
    },
    activeEventIds: ['lunar-dust-contamination'],
    faultStates: [],
    lastStepExplanations: [],
    outcome: 'ongoing',
  }
  ```

  Use `describe('AstroAssistant')` + `it(...)` naming. Mark any `!` usages in tests with a comment explaining why.

  Files: `tests/unit/ai/astro-assistant.test.ts`

  Verify: `npm run test -- --run` — all previous tests + these 6 new tests pass.

---

- [ ] 12. Final verification — full build + full test suite.

  Run `npm run build` from the workspace root — must complete with zero TypeScript errors and zero Vite build errors.
  Run `npm run test -- --run` — must show all 56 existing tests passing plus the new AI tests (minimum 16 new: 5 knowledge-base + 5 schema + 6 assistant; total ≥ 72).

  If `npm run build` fails: fix TypeScript errors in the newly created `src/ai/` files. Common issues to check:
  - Circular imports (use relative imports within `src/ai/`, not `@ai/` aliases).
  - Missing `export type` vs `export` (use `export type` for interface/type, `export` for values).
  - `AstroResponse` type is both exported by value (via `AstroResponseSchema`) and as a type alias — ensure the barrel `index.ts` uses `export type { AstroResponse }`.

  If tests fail: check import paths in test files (path aliases resolve through vitest's `vite.config.ts` alias config — `@ai/` should work in tests just as `@simulation/` does).

  Files: no new files; runs existing files.

  Verify: `npm run build` exits 0; `npm run test -- --run` exits 0.
