# ASTRA — Implementation Plan: Phases 2, 3, and 4

**Workspace root:** `c:\Users\HP\Desktop\NASA SPACE APPS`
**Plan covers:** SCAF-001–010, SCI-001–007, SIM-001–015
**Generated:** 2026-11-04

---

## Critical Rules (apply to every item)

- NO React, Zustand, or Phaser imports anywhere in `src/simulation/`
- All scientific constants MUST have source comments with URL
- Resources must never silently go negative — clamp to 0 and set fault state
- PRNG is mulberry32 — no `Math.random()` anywhere in the simulation layer
- All resource model functions are PURE: same inputs → same outputs
- Use `Result<T, E>` for all operations that can fail predictably
- Strict TypeScript throughout — no `any`, no `!` non-null assertions outside tests

---

## Phase 2 — Project Scaffold

- [ ] 1. **SCAF-001: Initialize Vite + React + TypeScript project.**
      Run `npm create vite@latest . -- --template react-ts` in the workspace root.
      This overwrites any default `src/` files created by Vite but keeps the existing
      directory structure (docs, .kiro, tests, etc.) because Vite only creates files
      that don't exist. Accept the overwrite prompt for any conflicting stubs.
      Files created by Vite: `package.json`, `tsconfig.json`, `tsconfig.app.json`,
      `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`,
      `src/App.tsx`, `src/App.css`, `src/index.css`, `src/vite-env.d.ts`.
      Verify: `npm install && npm run build` — must produce zero TypeScript errors and
      a `dist/` directory.

- [ ] 2. **SCAF-002: Install runtime and dev dependencies at exact versions.**
      Run in workspace root:
      ```
      npm install react-router-dom@6 zustand@4 zod@3 recharts@2 phaser@3
      npm install -D tailwindcss@3 postcss autoprefixer @types/node vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
      ```
      Verify: `npm run build` still passes zero TS errors. `node_modules/phaser`,
      `node_modules/zustand`, `node_modules/zod`, `node_modules/recharts` all present.

- [ ] 3. **SCAF-003: Configure Tailwind CSS.**
      Run `npx tailwindcss init -p` to generate `tailwind.config.js` and `postcss.config.js`.
      Update `tailwind.config.js` content paths:
      ```js
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}']
      ```
      Replace entire `src/index.css` with:
      ```css
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
      ```
      Files: `tailwind.config.js`, `postcss.config.js`, `src/index.css`
      Verify: `npm run build` produces zero errors. Add `class="text-blue-500"` to
      `src/App.tsx` temporarily, run build, confirm no CSS errors, then remove it.

- [ ] 4. **SCAF-004: Update `vite.config.ts` with path aliases and Vitest config.**
      Replace `vite.config.ts` entirely with:
      ```ts
      import { defineConfig } from 'vite'
      import react from '@vitejs/plugin-react'
      import path from 'path'

      export default defineConfig({
        plugins: [react()],
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
            '@simulation': path.resolve(__dirname, './src/simulation'),
            '@data': path.resolve(__dirname, './src/data'),
            '@ai': path.resolve(__dirname, './src/ai'),
            '@game': path.resolve(__dirname, './src/game'),
            '@store': path.resolve(__dirname, './src/store'),
          },
        },
        test: {
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
        },
      })
      ```
      Files: `vite.config.ts`
      Verify: `npm run build` passes.

- [ ] 5. **SCAF-005: Update `tsconfig.json` and `tsconfig.app.json` with path mappings.**
      In `tsconfig.app.json` (the one Vite's template creates for src files), add
      under `compilerOptions`:
      ```json
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"],
        "@simulation/*": ["./src/simulation/*"],
        "@data/*": ["./src/data/*"],
        "@ai/*": ["./src/ai/*"],
        "@game/*": ["./src/game/*"],
        "@store/*": ["./src/store/*"]
      }
      ```
      Confirm `"strict": true` is already present (Vite react-ts template sets it);
      if not, add it. Do not touch `tsconfig.node.json`.
      Files: `tsconfig.app.json`
      Verify: `npm run build` — zero TS errors. TypeScript resolves `@/` imports.

- [ ] 6. **SCAF-006: Create `tests/setup.ts`.**
      Create `tests/setup.ts` with exactly:
      ```ts
      import '@testing-library/jest-dom'
      ```
      Files: `tests/setup.ts`
      Verify: `npx vitest run` executes without "setupFiles not found" error.
      (No tests exist yet so it may output "no test files found" — that is acceptable.)

- [ ] 7. **SCAF-007: Replace `src/App.tsx` with placeholder router shell.**
      Delete `src/App.css`. Replace `src/App.tsx` with a `BrowserRouter`-wrapped
      component that imports from `src/app/router.tsx`. Keep `src/App.tsx` minimal:
      ```tsx
      import { BrowserRouter } from 'react-router-dom'
      import { AppRouter } from '@/app/router'

      export default function App(): JSX.Element {
        return (
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        )
      }
      ```
      Files: `src/App.tsx` (modified), `src/App.css` (deleted)
      Verify: References `src/app/router.tsx` which is created in SCAF-008.
      Do not run build until SCAF-008 is done.

- [ ] 8. **SCAF-008: Create `src/app/router.tsx` with 6 placeholder routes.**
      Create `src/app/router.tsx`:
      ```tsx
      import { Routes, Route, Link } from 'react-router-dom'

      function PlaceholderScreen({ name }: { name: string }): JSX.Element {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-sm text-gray-500 border border-dashed px-2 py-1">
              PLACEHOLDER — not yet implemented
            </p>
            <Link to="/" className="text-blue-500 underline">Back to start</Link>
          </div>
        )
      }

      export function AppRouter(): JSX.Element {
        return (
          <Routes>
            <Route path="/" element={<PlaceholderScreen name="Onboarding" />} />
            <Route path="/select-planet" element={<PlaceholderScreen name="Planet Selection" />} />
            <Route path="/select-crew" element={<PlaceholderScreen name="Crew Selection" />} />
            <Route path="/configure-base" element={<PlaceholderScreen name="Base Configuration" />} />
            <Route path="/mission" element={<PlaceholderScreen name="Mission Control" />} />
            <Route path="/debrief" element={<PlaceholderScreen name="Mission Debrief" />} />
          </Routes>
        )
      }
      ```
      Files: `src/app/router.tsx`
      Verify: `npm run build` — zero TypeScript errors. All 6 routes compile.

- [ ] 9. **SCAF-009: Create/update `.gitignore`.**
      Write (or replace) `.gitignore` at workspace root:
      ```
      node_modules/
      dist/
      .env
      coverage/
      *.local
      .DS_Store
      ```
      Files: `.gitignore`
      Verify: `git status` shows `node_modules/` and `dist/` as ignored (if git is
      initialized). No build verification needed for this step alone.

- [ ] 10. **SCAF-010: Final scaffold verification.**
       Run `npm run build` in workspace root. Must produce zero TypeScript errors and
       a `dist/` directory. This validates all of SCAF-001 through SCAF-009 together.
       Files: none
       Verify: `npm run build` exits with code 0 and `dist/index.html` exists.

---

## Phase 3 — Scientific Foundation

- [ ] 11. **SCI-001 / SCI-002: Create `src/data/nasa/moon-profile.ts`.**
       Create the Moon planet profile with ALL values source-commented.
       Every constant must include a JSDoc comment with classification tag and source URL.
       Use `as const` on the exported object so it is deeply readonly at the type level.

       ```ts
       // src/data/nasa/moon-profile.ts

       /**
        * Moon planet profile for ASTRA simulation.
        * All values sourced from NASA public datasets — see docs/scientific-references.md
        */

       /** Lunar surface temperature extremes (equatorial)
        *  Classification: OBSERVED_DATA — NASA Moon Fact Sheet / LRO Diviner
        *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
       const TEMPERATURE_RANGE_C = { min: -173, max: 127 } as const

       /** Lunar surface gravity
        *  Classification: OBSERVED_DATA — NASA Moon Fact Sheet
        *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
       const GRAVITY_M_S2 = 1.62 as const

       /** Solar irradiance at 1 AU (Moon is ~1 AU from Sun)
        *  Classification: OBSERVED_DATA — NASA Earth Fact Sheet (solar constant)
        *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html */
       const SOLAR_IRRADIANCE_W_M2 = 1361 as const

       /** Lunar synodic period (full cycle: new moon to new moon)
        *  Classification: OBSERVED_DATA — NASA Moon Fact Sheet
        *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
       const SOLAR_CYCLE_DAYS = 28 as const

       /** Duration of continuous sunlight per lunar cycle (days 1–14)
        *  Classification: OBSERVED_DATA — NASA Moon Fact Sheet / LRO mission overview
        *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
       const SOLAR_DAY_LENGTH = 14 as const

       /** Average unshielded daily radiation dose on lunar surface.
        *  Derived: 380 mSv/year ÷ 365 days = 1.04 mSv/day
        *  Classification: DERIVED_PARAMETER — LRO CRaTER instrument
        *  Source: https://crater.sr.unh.edu/ */
       const UNSHIELDED_DAILY_RADIATION_MSV = 1.04 as const

       export const MOON_PROFILE = {
         id: 'moon' as const,
         displayName: 'The Moon',
         timeUnitLabel: 'Day',
         temperatureRange: TEMPERATURE_RANGE_C,
         gravity_m_s2: GRAVITY_M_S2,
         solarIrradiance_W_m2: SOLAR_IRRADIANCE_W_M2,
         solarCycleDays: SOLAR_CYCLE_DAYS,
         solarDayLength: SOLAR_DAY_LENGTH,
         unshieldedDailyRadiation_mSv: UNSHIELDED_DAILY_RADIATION_MSV,
       } as const
       ```
       Files: `src/data/nasa/moon-profile.ts`
       Verify: `npm run build` — zero TS errors.

- [ ] 12. **SCI-002: Create `src/data/nasa/mars-profile.ts`.**
       Same pattern as moon-profile.ts:

       ```ts
       // src/data/nasa/mars-profile.ts

       /** Mars surface temperature extremes
        *  Classification: OBSERVED_DATA — NASA Mars Fact Sheet / MGS TES, MRO MCS
        *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html */
       const TEMPERATURE_RANGE_C = { min: -125, max: 20 } as const

       /** Mars surface gravity
        *  Classification: OBSERVED_DATA — NASA Mars Fact Sheet
        *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html */
       const GRAVITY_M_S2 = 3.72 as const

       /** Solar irradiance at Mars (~1.524 AU from Sun).
        *  Derivation: 1361 W/m² × (1 AU / 1.524 AU)² ≈ 586 W/m²
        *  Classification: DERIVED_PARAMETER — NASA Mars Fact Sheet (orbital data)
        *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html */
       const SOLAR_IRRADIANCE_W_M2 = 586 as const

       /** Martian sol duration relative to Earth days.
        *  1 sol = 24 h 39 m 35 s ≈ 1.027 Earth days.
        *  Classification: OBSERVED_DATA — NASA Mars Fact Sheet
        *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html */
       const SOL_DURATION_EARTH_DAYS = 1.027 as const

       /** Average unshielded daily radiation dose on Mars surface (Curiosity RAD).
        *  Classification: OBSERVED_DATA — MSL Curiosity RAD instrument
        *  Source: https://www.nasa.gov/mission_pages/msl/news/msl20130930.html */
       const UNSHIELDED_DAILY_RADIATION_MSV = 0.64 as const

       export const MARS_PROFILE = {
         id: 'mars' as const,
         displayName: 'Mars',
         timeUnitLabel: 'Sol',
         temperatureRange: TEMPERATURE_RANGE_C,
         gravity_m_s2: GRAVITY_M_S2,
         solarIrradiance_W_m2: SOLAR_IRRADIANCE_W_M2,
         solDuration_earthDays: SOL_DURATION_EARTH_DAYS,
         unshieldedDailyRadiation_mSv: UNSHIELDED_DAILY_RADIATION_MSV,
       } as const
       ```
       Files: `src/data/nasa/mars-profile.ts`
       Verify: `npm run build` — zero TS errors.

- [ ] 13. **SCI-003: Create `src/data/validation/planet-profile.schema.ts`.**
       Define a Zod schema that validates both planet profiles and call `.parse()` at
       module load so bad data fails fast:

       ```ts
       import { z } from 'zod'
       import { MOON_PROFILE } from '@data/nasa/moon-profile'
       import { MARS_PROFILE } from '@data/nasa/mars-profile'

       export const PlanetProfileSchema = z.object({
         id: z.enum(['moon', 'mars']),
         displayName: z.string().min(1),
         timeUnitLabel: z.string().min(1),
         temperatureRange: z.object({
           min: z.number(),
           max: z.number(),
         }),
         gravity_m_s2: z.number().positive(),
         solarIrradiance_W_m2: z.number().positive(),
         unshieldedDailyRadiation_mSv: z.number().positive(),
       })

       // Moon has additional solar cycle fields; Mars has sol duration.
       // Validate the shared base on both profiles.
       PlanetProfileSchema.parse(MOON_PROFILE)
       PlanetProfileSchema.parse(MARS_PROFILE)

       export type PlanetProfileBase = z.infer<typeof PlanetProfileSchema>
       ```
       The `.parse()` calls execute at import time — if either profile is malformed,
       the application throws immediately with a descriptive Zod error.
       Files: `src/data/validation/planet-profile.schema.ts`
       Verify: `npm run build` — zero errors. No runtime throw on fresh `npm run dev`.

- [ ] 14. **SCI-004: Create `src/data/nasa/life-support-constants.ts`.**
       All constants sourced from `docs/scientific-assumptions.md`. Every constant
       has a JSDoc with classification tag and reference ID:

       ```ts
       // src/data/nasa/life-support-constants.ts

       /** Oxygen consumption per person per day.
        *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-001)
        *  Reference: NASA HIDH / NASA SP-2010-3407
        *  Source: https://humanresearchroadmap.nasa.gov/ */
       export const OXYGEN_PER_PERSON_PER_DAY_KG = 0.84 as const

       /** Water consumption per person per day (drinking + hygiene).
        *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-002)
        *  Reference: ISS life support baseline (simplified from ~3.6 kg) */
       export const WATER_PER_PERSON_PER_DAY_KG = 3.0 as const

       /** Food consumption per person per day (net food mass, no packaging).
        *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-003)
        *  Reference: ISS food logistics approximate */
       export const FOOD_PER_PERSON_PER_DAY_KG = 1.8 as const

       /** Fraction of consumed water recovered by recycling system.
        *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-004)
        *  Reference: ISS ECLSS (~90–93% actual; 85% used as educational baseline) */
       export const WATER_RECYCLING_EFFICIENCY = 0.85 as const

       /** Fraction of exhaled CO₂ converted back to O₂ by life support.
        *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-005)
        *  Reference: ISS Sabatier reactor concept (simplified fixed rate) */
       export const CO2_RECOVERY_RATE = 0.50 as const

       /** Solar panel photovoltaic conversion efficiency.
        *  Classification: EDUCATIONAL_ASSUMPTION (ASM-EN-001)
        *  Reference: Typical modern PV range 15–22%; 20% used as midpoint */
       export const SOLAR_PANEL_EFFICIENCY = 0.20 as const

       /** Battery round-trip charge/discharge efficiency.
        *  Classification: EDUCATIONAL_ASSUMPTION (ASM-EN-003)
        *  Reference: Modern Li-ion range 85–95%; 90% used */
       export const BATTERY_ROUND_TRIP_EFFICIENCY = 0.90 as const

       /** Continuous power draw per crew member (habitat + life support baseline).
        *  Classification: EDUCATIONAL_ASSUMPTION (ASM-EN-002)
        *  Reference: Gameplay balance — ISS uses ~75–90 kW for 6–7 crew */
       export const POWER_PER_CREW_MEMBER_KW = 2.0 as const

       /** Additional power load for agriculture systems per unit.
        *  Classification: EDUCATIONAL_ASSUMPTION (ASM-AGR-002)
        *  Reference: Simulation design decision */
       export const AGRICULTURE_POWER_LOAD_KW = 0.5 as const

       /** Food yield per square metre of agriculture area per day.
        *  Classification: EDUCATIONAL_ASSUMPTION (ASM-AGR-001)
        *  Reference: NASA Veggie system on ISS: ~0.1–0.5 kg/m²/day; 0.3 used */
       export const FOOD_YIELD_PER_M2_PER_DAY_KG = 0.3 as const
       ```
       Files: `src/data/nasa/life-support-constants.ts`
       Verify: `npm run build` — zero TS errors.

---

## Phase 4 — Simulation Core

### Types

- [ ] 15. **SIM-001: Create `src/simulation/types/index.ts` with all simulation types.**
       This is the single source of truth for all types consumed by the simulation layer.
       No React, Zustand, or Phaser imports. Create the file with all of the following:

       ```ts
       // src/simulation/types/index.ts

       // ── Primitive string literals (enums are banned per coding-standards) ──

       export type PlanetId = 'moon' | 'mars'

       export type ShieldingLevel = 'low' | 'medium' | 'high'

       export type MissionOutcome = 'success' | 'partial' | 'failure' | 'ongoing'

       export type ResourceType = 'oxygen' | 'water' | 'food' | 'energy'

       export type FaultState =
         | 'OXYGEN_DEPLETED'
         | 'WATER_DEPLETED'
         | 'FOOD_DEPLETED'
         | 'POWER_CRITICAL'
         | 'RADIATION_HIGH'
         | 'RADIATION_CRITICAL'

       // ── Configuration ──

       export interface BaseConfig {
         readonly solarPanelArea_m2: number
         readonly batteryCapacity_kWh: number
         readonly agricultureArea_m2: number
         readonly shieldingLevel: ShieldingLevel
         readonly lifeSupportEfficiency: number  // 0–1, default 1.0
       }

       // ── Runtime state ──

       export interface ResourceSnapshot {
         readonly oxygen_kg: number
         readonly water_kg: number
         readonly food_kg: number
         readonly energy_kWh: number
         readonly cumulativeRadiation_mSv: number
       }

       export interface SimulationState {
         readonly missionDay: number
         readonly planetId: PlanetId
         readonly crewSize: number
         readonly baseConfig: BaseConfig
         readonly resources: ResourceSnapshot
         readonly seed: number
         readonly activeEventIds: readonly string[]
         readonly faultStates: readonly FaultState[]
         readonly outcome: MissionOutcome
       }

       // ── Player actions ──

       export type PlayerAction =
         | { readonly type: 'ADVANCE_DAY' }
         | { readonly type: 'RESOLVE_EVENT'; readonly eventId: string; readonly choiceId: string }
         | { readonly type: 'EMERGENCY_RATION' }

       // ── Results ──

       export interface StepExplanation {
         readonly resource: ResourceType | 'radiation'
         readonly delta: number
         readonly reason: string
         readonly scientificNote?: string
       }

       export interface SimulationResult {
         readonly previousState: SimulationState
         readonly nextState: SimulationState
         readonly newFaultStates: readonly FaultState[]
         readonly triggeredEventIds: readonly string[]
         readonly explanations: readonly StepExplanation[]
       }

       export interface DecisionLogEntry {
         readonly missionDay: number
         readonly action: PlayerAction
         readonly resultSummary: string
         readonly wasOptimal: boolean
       }

       export interface MissionScore {
         readonly baseScore: number
         readonly resourceStabilityBonus: number
         readonly decisionQualityBonus: number
         readonly eventsResolvedBonus: number
         readonly criticalFailurePenalty: number
         readonly finalScore: number
         readonly outcome: MissionOutcome
       }

       // ── Events ──

       export interface EventTriggerCondition {
         readonly minDay?: number
         readonly probability: number            // 0–1 per day
         readonly maxOccurrences: number
         readonly requiresActiveEvent?: string   // only trigger if this event is active
         readonly requiresNoActiveEvent?: string // only trigger if this event is NOT active
       }

       export interface EventConsequence {
         readonly lifeSupportEfficiencyModifier?: number   // additive, e.g. -0.15
         readonly solarFactorModifier?: number             // multiplicative, e.g. 0.5
         readonly radiationModifier?: number               // additive, e.g. +0.5
         readonly solarPanelAreaLoss_m2?: number           // direct reduction
         readonly durationDays?: number                    // how many days the effect lasts
       }

       export interface EventChoice {
         readonly id: string
         readonly label: string
         readonly description: string
         readonly consequence: EventConsequence
         readonly isOptimal: boolean
       }

       export interface EventDefinition {
         readonly id: string
         readonly planetId: PlanetId
         readonly title: string
         readonly description: string             // age-appropriate (8–12)
         readonly scientificExplanation: string
         readonly affectedSystems: readonly ResourceType[]
         readonly triggerCondition: EventTriggerCondition
         readonly choices: readonly [EventChoice, EventChoice, ...EventChoice[]] // min 2
       }

       // ── Result monad ──

       export interface SimulationError {
         readonly code: string
         readonly message: string
         readonly context?: Record<string, unknown>
       }

       export type Result<T, E = SimulationError> =
         | { readonly success: true; readonly value: T }
         | { readonly success: false; readonly error: E }

       // ── Engine config ──

       export interface SimulationEngineConfig {
         readonly planetId: PlanetId
         readonly crewSize: number
         readonly baseConfig: BaseConfig
         readonly seed: number
         readonly initialResources: ResourceSnapshot
       }
       ```
       Files: `src/simulation/types/index.ts`
       Verify: `npm run build` — zero TS errors.

### PRNG

- [ ] 16. **SIM-002: Create `src/simulation/core/prng.ts` — mulberry32 PRNG.**
       The mulberry32 algorithm produces a deterministic sequence given a seed.
       Must be a pure function factory — no side effects, no `Math.random()`.

       ```ts
       // src/simulation/core/prng.ts
       // mulberry32 pseudo-random number generator.
       // Algorithm: Tommy Ettinger — public domain.
       // Returns values uniformly distributed in [0, 1).

       export function createPRNG(seed: number): () => number {
         let state = seed >>> 0  // coerce to unsigned 32-bit integer

         return function nextFloat(): number {
           state += 0x6d2b79f5 | 0
           let z = state
           z = Math.imul(z ^ (z >>> 15), z | 1)
           z ^= z + Math.imul(z ^ (z >>> 7), z | 61)
           return ((z ^ (z >>> 14)) >>> 0) / 4294967296
         }
       }
       ```
       Files: `src/simulation/core/prng.ts`
       Verify: `npm run build` — zero TS errors.

### SimulationClock

- [ ] 17. **SIM-003: Create `src/simulation/core/simulation-clock.ts`.**
       All functions are pure — no side effects, no `Date.now()`.

       ```ts
       // src/simulation/core/simulation-clock.ts
       import type { SimulationState, PlanetId } from '@simulation/types'

       /** Returns the position within the 28-day lunar cycle (1–28).
        *  Day 1–14 = lunar day (solar available). Day 15–28 = lunar night. */
       export function getLunarCycleDay(missionDay: number): number {
         return ((missionDay - 1) % 28) + 1
       }

       /** Returns true if solar power is available for the given day and planet. */
       export function isSolarAvailable(missionDay: number, planetId: PlanetId): boolean {
         if (planetId === 'mars') return true   // Mars: always available (storms are events)
         return getLunarCycleDay(missionDay) <= 14
       }

       /** Returns the base solar availability factor (0–1) before event modifiers.
        *  Moon: 1.0 days 1–14, 0.0 days 15–28 (ASM-EN-005).
        *  Mars: 1.0 normally (dust storm events apply their own modifier). */
       export function getSolarAvailabilityFactor(
         missionDay: number,
         planetId: PlanetId,
         activeEventIds: readonly string[]
       ): number {
         if (planetId === 'moon') {
           return getLunarCycleDay(missionDay) <= 14 ? 1.0 : 0.0
         }
         // Mars: dust storm events override this via EventEngine modifiers
         if (activeEventIds.includes('global-dust-storm')) return 0.01
         if (activeEventIds.includes('regional-dust-storm')) return 0.5
         return 1.0
       }

       /** Returns the next simulation state with missionDay incremented. */
       export function advanceClock(state: SimulationState): SimulationState {
         return { ...state, missionDay: state.missionDay + 1 }
       }
       ```
       Files: `src/simulation/core/simulation-clock.ts`
       Verify: `npm run build` — zero TS errors.

### Resource Models

- [ ] 18. **SIM-004: Create `src/simulation/resources/oxygen-model.ts`.**
       Pure function — same inputs → same outputs. No imports from React/Zustand/Phaser.

       ```ts
       // src/simulation/resources/oxygen-model.ts
       import {
         OXYGEN_PER_PERSON_PER_DAY_KG,
         CO2_RECOVERY_RATE,
       } from '@data/nasa/life-support-constants'

       export interface OxygenModelInput {
         readonly crewSize: number
         readonly lifeSupportEfficiency: number  // 0–1
         readonly currentOxygen_kg: number
       }

       export interface OxygenModelOutput {
         readonly consumption_kg: number
         readonly production_kg: number
         readonly delta_kg: number
         readonly newLevel_kg: number
         readonly depleted: boolean
       }

       /**
        * Calculates oxygen production and consumption for one simulation step.
        *
        * consumption = crewSize × 0.84 kg/person/day
        * production  = consumption × CO2_RECOVERY_RATE (0.50) × lifeSupportEfficiency
        * delta       = production - consumption
        *
        * Reference: docs/simulation-model.md — "Oxygen Calculations"
        * Assumption classifications: ASM-LS-001, ASM-LS-005
        */
       export function calculateOxygenDelta(input: OxygenModelInput): OxygenModelOutput {
         const consumption_kg = input.crewSize * OXYGEN_PER_PERSON_PER_DAY_KG
         const production_kg = consumption_kg * CO2_RECOVERY_RATE * input.lifeSupportEfficiency
         const delta_kg = production_kg - consumption_kg
         const rawNew = input.currentOxygen_kg + delta_kg
         const newLevel_kg = Math.max(rawNew, 0)  // clamp — never silent negative
         return {
           consumption_kg,
           production_kg,
           delta_kg,
           newLevel_kg,
           depleted: rawNew <= 0,
         }
       }
       ```
       Files: `src/simulation/resources/oxygen-model.ts`
       Verify: `npm run build` — zero TS errors.

- [ ] 19. **SIM-005: Create `src/simulation/resources/water-model.ts`.**
       Pure function following water formula from `docs/simulation-model.md`.

       ```ts
       // src/simulation/resources/water-model.ts
       import {
         WATER_PER_PERSON_PER_DAY_KG,
         WATER_RECYCLING_EFFICIENCY,
       } from '@data/nasa/life-support-constants'

       export interface WaterModelInput {
         readonly crewSize: number
         readonly currentWater_kg: number
       }

       export interface WaterModelOutput {
         readonly consumption_kg: number
         readonly recycled_kg: number
         readonly netConsumption_kg: number
         readonly delta_kg: number
         readonly newLevel_kg: number
         readonly depleted: boolean
       }

       /**
        * Calculates water balance for one simulation step.
        *
        * consumption     = crewSize × 3.0 kg/person/day
        * recycled        = consumption × 0.85
        * netConsumption  = consumption - recycled
        * delta           = -netConsumption  (net loss from storage)
        *
        * Reference: docs/simulation-model.md — "Water Calculations"
        * Assumption classifications: ASM-LS-002, ASM-LS-004
        */
       export function calculateWaterDelta(input: WaterModelInput): WaterModelOutput {
         const consumption_kg = input.crewSize * WATER_PER_PERSON_PER_DAY_KG
         const recycled_kg = consumption_kg * WATER_RECYCLING_EFFICIENCY
         const netConsumption_kg = consumption_kg - recycled_kg
         const delta_kg = -netConsumption_kg
         const rawNew = input.currentWater_kg + delta_kg
         const newLevel_kg = Math.max(rawNew, 0)
         return {
           consumption_kg,
           recycled_kg,
           netConsumption_kg,
           delta_kg,
           newLevel_kg,
           depleted: rawNew <= 0,
         }
       }
       ```
       Files: `src/simulation/resources/water-model.ts`
       Verify: `npm run build` — zero TS errors.

- [ ] 20. **SIM-006: Create `src/simulation/resources/food-model.ts`.**
       Pure function. Agriculture production is zero if power is unavailable (ASM-AGR-002).

       ```ts
       // src/simulation/resources/food-model.ts
       import {
         FOOD_PER_PERSON_PER_DAY_KG,
         FOOD_YIELD_PER_M2_PER_DAY_KG,
       } from '@data/nasa/life-support-constants'

       export interface FoodModelInput {
         readonly crewSize: number
         readonly agricultureArea_m2: number
         readonly isPowerAvailable: boolean
         readonly currentFood_kg: number
       }

       export interface FoodModelOutput {
         readonly consumption_kg: number
         readonly production_kg: number
         readonly delta_kg: number
         readonly newLevel_kg: number
         readonly depleted: boolean
       }

       /**
        * Calculates food balance for one simulation step.
        *
        * consumption = crewSize × 1.8 kg/person/day
        * production  = agricultureArea × 0.3 × (isPowerAvailable ? 1 : 0)
        * delta       = production - consumption
        *
        * Reference: docs/simulation-model.md — "Food Calculations"
        * Assumption classifications: ASM-LS-003, ASM-AGR-001, ASM-AGR-002
        */
       export function calculateFoodDelta(input: FoodModelInput): FoodModelOutput {
         const consumption_kg = input.crewSize * FOOD_PER_PERSON_PER_DAY_KG
         const agriculturePowerFactor = input.isPowerAvailable ? 1.0 : 0.0
         const production_kg =
           input.agricultureArea_m2 * FOOD_YIELD_PER_M2_PER_DAY_KG * agriculturePowerFactor
         const delta_kg = production_kg - consumption_kg
         const rawNew = input.currentFood_kg + delta_kg
         const newLevel_kg = Math.max(rawNew, 0)
         return {
           consumption_kg,
           production_kg,
           delta_kg,
           newLevel_kg,
           depleted: rawNew <= 0,
         }
       }
       ```
       Files: `src/simulation/resources/food-model.ts`
       Verify: `npm run build` — zero TS errors.

- [ ] 21. **SIM-007: Create `src/simulation/resources/energy-model.ts`.**
       Exact formulas from `docs/simulation-model.md` — Solar Production and Battery Balance.
       The `hoursOfLight` parameter is always 24 (one full day modeled as continuous);
       the solar availability factor already accounts for day/night by being 0 or 1.

       ```ts
       // src/simulation/resources/energy-model.ts
       import {
         SOLAR_PANEL_EFFICIENCY,
         BATTERY_ROUND_TRIP_EFFICIENCY,
         POWER_PER_CREW_MEMBER_KW,
         AGRICULTURE_POWER_LOAD_KW,
       } from '@data/nasa/life-support-constants'

       export interface EnergyModelInput {
         readonly solarIrradiance_W_m2: number         // planet base value
         readonly solarAvailabilityFactor: number      // 0–1 from SimulationClock
         readonly dustModifier: number                 // 1.0 normally, 0.5/0.01 during storms
         readonly solarPanelArea_m2: number
         readonly crewSize: number
         readonly agricultureArea_m2: number           // used to calculate agri load
         readonly isPowerAvailable: boolean            // agri only runs if power available
         readonly currentBattery_kWh: number
         readonly batteryCapacity_kWh: number
         readonly lifeSupportLoad_kWh?: number         // optional additional system load
       }

       export interface EnergyModelOutput {
         readonly solarOutput_kWh: number
         readonly totalConsumption_kWh: number
         readonly energyDelta_kWh: number
         readonly newBatteryLevel_kWh: number
         readonly powerCritical: boolean
       }

       /**
        * Calculates energy production, consumption, and battery balance for one step.
        *
        * Solar production:
        *   solarOutput_kW  = irradiance × solarFactor × dustModifier × panelArea × 0.20 / 1000
        *   solarOutput_kWh = solarOutput_kW × 24
        *
        * Energy consumption:
        *   baseConsumption  = crewSize × 2.0 kW × 24 h
        *   agriConsumption  = 0.5 kW × 24 h (if power available)
        *   totalConsumption = baseConsumption + agriConsumption + optional system loads
        *
        * Battery balance:
        *   delta > 0 → stored = min(battery + delta × 0.90, capacity)
        *   delta ≤ 0 → stored = max(battery + delta, 0)
        *   stored == 0 && delta < 0 → powerCritical = true
        *
        * Reference: docs/simulation-model.md — "Energy Calculations"
        * Assumption classifications: ASM-EN-001, ASM-EN-002, ASM-EN-003
        */
       export function calculateEnergyDelta(input: EnergyModelInput): EnergyModelOutput {
         // Solar production
         const effectiveIrradiance =
           input.solarIrradiance_W_m2 * input.solarAvailabilityFactor * input.dustModifier
         const solarOutput_kW = (effectiveIrradiance * input.solarPanelArea_m2 * SOLAR_PANEL_EFFICIENCY) / 1000
         const solarOutput_kWh = solarOutput_kW * 24

         // Energy consumption
         const baseConsumption_kWh = input.crewSize * POWER_PER_CREW_MEMBER_KW * 24
         const agriLoad_kWh = input.isPowerAvailable ? AGRICULTURE_POWER_LOAD_KW * 24 : 0
         const extraLoad_kWh = input.lifeSupportLoad_kWh ?? 0
         const totalConsumption_kWh = baseConsumption_kWh + agriLoad_kWh + extraLoad_kWh

         // Battery balance
         const energyDelta_kWh = solarOutput_kWh - totalConsumption_kWh
         let newBatteryLevel_kWh: number
         if (energyDelta_kWh > 0) {
           newBatteryLevel_kWh = Math.min(
             input.currentBattery_kWh + energyDelta_kWh * BATTERY_ROUND_TRIP_EFFICIENCY,
             input.batteryCapacity_kWh
           )
         } else {
           newBatteryLevel_kWh = Math.max(input.currentBattery_kWh + energyDelta_kWh, 0)
         }

         const powerCritical = newBatteryLevel_kWh === 0 && energyDelta_kWh < 0

         return {
           solarOutput_kWh,
           totalConsumption_kWh,
           energyDelta_kWh,
           newBatteryLevel_kWh,
           powerCritical,
         }
       }
       ```
       Files: `src/simulation/resources/energy-model.ts`
       Verify: `npm run build` — zero TS errors.

### Systems

- [ ] 22. **SIM-008: Create system orchestrators in `src/simulation/systems/`.**
       Four files, one per system. Each orchestrates the relevant resource model(s)
       and returns a typed result. No React/Zustand/Phaser imports.

       **`src/simulation/systems/life-support-system.ts`:**
       Calls `calculateOxygenDelta` and `calculateWaterDelta`. Applies a -0.30
       efficiency modifier to oxygen production when power is critical (POWER_CRITICAL
       fault state is active), as specified in `docs/simulation-model.md`.

       **`src/simulation/systems/power-system.ts`:**
       Calls `calculateEnergyDelta`. Returns `{ newEnergyLevel_kWh, powerCritical }`.
       The caller (SimulationEngine) uses `powerCritical` to set the POWER_CRITICAL
       fault state before passing it to LifeSupportSystem.

       **`src/simulation/systems/radiation-protection-system.ts`:**
       Implements the radiation formula from `docs/simulation-model.md`:
       ```
       shieldingReduction = low → 0.30 | medium → 0.60 | high → 0.85
       dailyDose_mSv = unshieldedDailyDose × (1 - shieldingReduction)
       ```
       Returns `{ dailyDose_mSv, newCumulativeDose_mSv, radiationHigh, radiationCritical }`.

       **`src/simulation/systems/agriculture-system.ts`:**
       Thin wrapper around `calculateFoodDelta`. Exists as a system so the engine
       can call it in the same step-order pattern as the other systems.

       Files:
       - `src/simulation/systems/life-support-system.ts`
       - `src/simulation/systems/power-system.ts`
       - `src/simulation/systems/radiation-protection-system.ts`
       - `src/simulation/systems/agriculture-system.ts`

       Verify: `npm run build` — zero TS errors across all four files.

### Events

- [ ] 23. **SIM-009: Create `src/simulation/events/lunar-events.ts` with 4 events.**
       All fields required by `EventDefinition` must be populated. Descriptions must
       be age-appropriate (8–12). Each event has at minimum 2 choices; the optimal
       choice is marked `isOptimal: true`.

       Events:
       1. **`lunar-dust-contamination`** — Trigger: minDay=1, probability=0.08/day,
          maxOccurrences=3. Ignoring reduces lifeSupportEfficiency by -0.15 for 3 days.
          Choice A (optimal): "Deploy dust mitigation team" — no efficiency loss.
          Choice B: "Continue operations" — consequence: lifeSupportEfficiencyModifier: -0.15.

       2. **`lunar-night-begins`** — Trigger: fires when `getLunarCycleDay(missionDay) === 15`,
          probability=1.0 (deterministic), maxOccurrences per cycle handled by engine.
          solarFactor drops to 0 (already modeled by SimulationClock; this event is the
          *notification* to the player). Two choices for how to manage power reserves.

       3. **`solar-flare-warning`** — Trigger: minDay=5, probability=0.04/day,
          maxOccurrences=2. Consequence: radiationModifier: +0.5 (50% extra for 3 days).
          Choice A (optimal): "Shelter in radiation-hardened module" — +0.20 extra shielding.
          Choice B: "Continue operations" — full extra radiation applies.

       4. **`micrometeorite-impact`** — Trigger: minDay=3, probability=0.03/day,
          maxOccurrences=2. Consequence: solarPanelAreaLoss_m2: 10.
          Choice A (optimal): "Dispatch repair team" — partial restoration (area loss: 5).
          Choice B: "Defer repair" — full panel area loss persists.

       Files: `src/simulation/events/lunar-events.ts`
       Verify: `npm run build` — zero TS errors. All 4 events satisfy EventDefinition type.

- [ ] 24. **SIM-010: Create `src/simulation/events/martian-events.ts` with 4 events.**
       Events:
       1. **`regional-dust-storm`** — Trigger: minDay=10, probability=0.05/day,
          maxOccurrences=3. solarFactorModifier: 0.5, durationDays: 5–7
          (use fixed 6 to keep determinism — no random duration).
          Choice A (optimal): "Switch to battery reserves and reduce power usage".
          Choice B: "Maintain normal operations" — power critical risk.

       2. **`dust-storm-clears`** — Counterpart event. Trigger: only fires when
          `regional-dust-storm` is in activeEventIds, probability=1.0 after 6 days.
          Restores solarFactorModifier to 1.0.

       3. **`co2-frost-formation`** — Trigger: minDay=5, probability=0.03/day,
          maxOccurrences=2. Consequence: lifeSupportEfficiencyModifier: -0.10 for 2 days.
          Choice A (optimal): "Heat the thermal panels and clear frost".
          Choice B: "Wait for sunlight to clear frost naturally" — 2-day delay.

       4. **`global-dust-storm`** — Trigger: minDay=30, probability=0.01/day,
          maxOccurrences=1. solarFactorModifier: 0.01, durationDays: 14.
          Choice A (optimal): "Enter emergency power conservation mode".
          Choice B: "Continue full operations" — rapid battery depletion.

       Files: `src/simulation/events/martian-events.ts`
       Verify: `npm run build` — zero TS errors. All 4 events satisfy EventDefinition type.

### EventEngine

- [ ] 25. **SIM-011: Create `src/simulation/events/event-engine.ts`.**
       The engine determines which events trigger each step. Uses the seeded PRNG —
       never `Math.random()`. Must respect `maxOccurrences` by tracking a count map
       that is passed in (stored in SimulationState via `activeEventIds` cross-reference).

       ```ts
       // src/simulation/events/event-engine.ts
       import type { SimulationState, EventDefinition } from '@simulation/types'
       import { LUNAR_EVENTS } from './lunar-events'
       import { MARTIAN_EVENTS } from './martian-events'

       const ALL_EVENTS: readonly EventDefinition[] = [...LUNAR_EVENTS, ...MARTIAN_EVENTS]

       export interface EventEngineResult {
         readonly newActiveEventIds: readonly string[]
         readonly triggeredEventIds: readonly string[]
       }

       /**
        * Determines which events trigger this step.
        * - Filters events to the active planet.
        * - Skips events already active (activeEventIds).
        * - Checks minDay constraint.
        * - Checks maxOccurrences via occurrenceCount parameter.
        * - Uses seeded prng for probability check.
        * - Does NOT call Math.random().
        */
       export function processEvents(
         state: SimulationState,
         prng: () => number,
         occurrenceCount: Readonly<Record<string, number>>
       ): EventEngineResult {
         const planetEvents = ALL_EVENTS.filter((e) => e.planetId === state.planetId)
         const triggered: string[] = []

         for (const event of planetEvents) {
           if (state.activeEventIds.includes(event.id)) continue
           const { minDay = 0, probability, maxOccurrences } = event.triggerCondition
           if (state.missionDay < minDay) continue
           const count = occurrenceCount[event.id] ?? 0
           if (count >= maxOccurrences) continue
           if (prng() < probability) {
             triggered.push(event.id)
           }
         }

         const newActiveEventIds = [...state.activeEventIds, ...triggered]
         return { newActiveEventIds, triggeredEventIds: triggered }
       }
       ```
       Files: `src/simulation/events/event-engine.ts`
       Verify: `npm run build` — zero TS errors.

### SimulationEngine

- [ ] 26. **SIM-012: Create `src/simulation/core/simulation-engine.ts`.**
       Class `SimulationEngine`. Owns the PRNG instance, occurrence count map, and
       decision log. Implements `step(action)` in the EXACT 15-step order from
       `docs/simulation-model.md`.

       Constructor signature:
       ```ts
       constructor(config: SimulationEngineConfig)
       ```

       Public methods:
       ```ts
       step(action: PlayerAction): Result<SimulationResult>
       getState(): Readonly<SimulationState>
       getDecisionLog(): readonly DecisionLogEntry[]
       getMissionScore(): MissionScore
       ```

       Step order (must match simulation-model.md exactly):
       1. Validate current state with Zod (import the SimulationState schema — create a
          minimal Zod schema for SimulationState in `src/data/validation/simulation-state.schema.ts`
          if needed; validation failure returns `Result` with success:false, does not throw)
       2. Advance clock via `advanceClock(state)`
       3. Process events via `processEvents(state, this.prng, this.occurrenceCount)`
       4. Apply event modifiers (compute effective lifeSupportEfficiency and solarFactor
          by summing modifiers from all active events)
       5. Calculate solar availability via `getSolarAvailabilityFactor`
       6. PowerSystem → compute new energy level
       7. LifeSupportSystem → compute oxygen + water (power critical flag from step 6)
       8. AgricultureSystem → compute food (uses `isPowerAvailable` from step 6)
       9. RadiationProtectionSystem → compute daily + cumulative dose
       10. Check constraints: if any resource ≤ 0, add to faultStates
       11. Determine mission outcome (OXYGEN_DEPLETED/WATER_DEPLETED = failure immediately)
       12. Record DecisionLogEntry
       13. Update internal state
       14. Return `{ success: true, value: SimulationResult }`

       Never call `Math.random()` or `Date.now()` anywhere in this file.
       Import only from `@simulation/`, `@data/`, and the Zod library.

       Files:
       - `src/simulation/core/simulation-engine.ts`
       - `src/data/validation/simulation-state.schema.ts` (Zod schema for SimulationState)

       Verify: `npm run build` — zero TS errors.

### MissionScoring

- [ ] 27. **SIM-013: Create `src/simulation/core/mission-scoring.ts`.**
       Pure function. Implements the scoring formula from `docs/simulation-model.md`.

       ```ts
       // src/simulation/core/mission-scoring.ts
       import type { MissionScore, MissionOutcome, DecisionLogEntry } from '@simulation/types'

       // Configurable thresholds — educational design choices (not scientific values)
       const SUCCESS_THRESHOLD = 800 as const
       const PARTIAL_THRESHOLD = 400 as const

       export interface ScoringInput {
         readonly missionDuration: number
         readonly oxygenStabilityScore: number    // 0–1 (fraction of days above threshold)
         readonly waterStabilityScore: number
         readonly foodStabilityScore: number
         readonly energyStabilityScore: number
         readonly decisionLog: readonly DecisionLogEntry[]
         readonly eventsSuccessfullyResolved: number
         readonly criticalFailureEvents: number
       }

       export function calculateMissionScore(input: ScoringInput): MissionScore {
         const baseScore = input.missionDuration * 10

         const avgStability =
           (input.oxygenStabilityScore +
             input.waterStabilityScore +
             input.foodStabilityScore +
             input.energyStabilityScore) /
           4
         const resourceStabilityBonus = avgStability * 200

         const optimalDecisions = input.decisionLog.filter((d) => d.wasOptimal).length
         const suboptimalDecisions = input.decisionLog.filter((d) => !d.wasOptimal).length
         const decisionQualityBonus = optimalDecisions * 25 + suboptimalDecisions * 5

         const eventsResolvedBonus = input.eventsSuccessfullyResolved * 30

         const criticalFailurePenalty = input.criticalFailureEvents * -50

         const finalScore =
           baseScore +
           resourceStabilityBonus +
           decisionQualityBonus +
           eventsResolvedBonus +
           criticalFailurePenalty

         const outcome: MissionOutcome =
           finalScore >= SUCCESS_THRESHOLD
             ? 'success'
             : finalScore >= PARTIAL_THRESHOLD
             ? 'partial'
             : 'failure'

         return {
           baseScore,
           resourceStabilityBonus,
           decisionQualityBonus,
           eventsResolvedBonus,
           criticalFailurePenalty,
           finalScore,
           outcome,
         }
       }
       ```
       Files: `src/simulation/core/mission-scoring.ts`
       Verify: `npm run build` — zero TS errors.

### Tests

- [ ] 28. **SIM-014: Write unit tests for resource models.**
       Create the following test files. All tests are deterministic — no random data
       without a fixed seed. Follow naming: `describe('OxygenModel') > it('reduces ...')`.

       **`tests/unit/simulation/oxygen-model.test.ts`:**
       - Normal step: 4 crew, full efficiency → delta is -50% of consumption (CO₂ recovery)
       - Depletion: currentOxygen=0.1 → `depleted: true`, `newLevel_kg: 0`
       - Reduced efficiency: lifeSupportEfficiency=0.5 → production halved

       **`tests/unit/simulation/water-model.test.ts`:**
       - Normal step: 4 crew → netConsumption = 4 × 3.0 × 0.15 = 1.8 kg/day, delta = -1.8
       - Depletion: currentWater=0.5 → `depleted: true`, `newLevel_kg: 0`

       **`tests/unit/simulation/food-model.test.ts`:**
       - Power available, adequate agriculture: `production_kg > 0`
       - Power unavailable: `production_kg === 0`
       - Depletion: small agriculture, high crew count → `depleted: true`

       **`tests/unit/simulation/energy-model.test.ts`:**
       - Normal (Moon day): solarFactor=1.0, dustModifier=1.0 → positive delta
       - Dust storm (Mars, regional): dustModifier=0.5 → reduced output
       - Lunar night: solarFactor=0.0 → solarOutput_kWh=0, battery drains
       - Battery caps at capacity (excess charging)

       **`tests/unit/simulation/prng.test.ts`:**
       - Same seed → same sequence for 100 calls
       - Different seeds → different first value
       - All returned values are in [0, 1)

       Files:
       - `tests/unit/simulation/oxygen-model.test.ts`
       - `tests/unit/simulation/water-model.test.ts`
       - `tests/unit/simulation/food-model.test.ts`
       - `tests/unit/simulation/energy-model.test.ts`
       - `tests/unit/simulation/prng.test.ts`

       Verify: `npx vitest run tests/unit/simulation` — all tests pass, zero failures.

- [ ] 29. **SIM-015: Write integration tests for `SimulationEngine`.**
       Create `tests/integration/simulation/simulation-engine.test.ts`.

       Test cases:
       1. **10-day Moon mission runs without throw:**
          Initialize engine with Moon config, 4 crew, seed=42. Call `step({ type: 'ADVANCE_DAY' })`
          10 times. All calls return `success: true`. `getState().missionDay === 11`.
       2. **10-sol Mars mission with event:**
          Initialize engine with Mars config, seed=1. Step 10 times. At least one step
          returns a result with `triggeredEventIds` non-empty OR `faultStates` non-empty.
          (Event occurrence depends on seed — use a seed that produces at least one event.)
          Adjust seed during authoring until one event triggers in 10 steps.
       3. **Resource depletion → OXYGEN_DEPLETED fault state:**
          Initialize with tiny oxygen reserves (e.g. oxygen_kg=1.0), no CO₂ recovery
          (lifeSupportEfficiency=0). Step until `OXYGEN_DEPLETED` appears in `faultStates`.
          Must appear within 2 steps for 4-crew configuration.
       4. **Determinism: same seed + same actions → identical results:**
          Run same 10-step sequence twice with seed=99. Both sequences produce identical
          `SimulationState` after each step.
       5. **Invalid state returns Result with success:false:**
          Pass a state with `crewSize: -1` (or another obviously invalid value).
          `step()` returns `{ success: false }` and does NOT throw.

       Files: `tests/integration/simulation/simulation-engine.test.ts`
       Verify: `npx vitest run tests/integration/simulation` — all 5 test cases pass.

---

## Final Steps

- [ ] 30. **Update `c:\Users\HP\Desktop\NASA SPACE APPS\.kiro\steering\workflow.md`.**
       Mark all completed tasks as DONE and advance the current phase to PHASE 5:

       Changes to make:
       - Current Phase: change to `PHASE 5 — Application Foundation 🔄 READY TO BEGIN`
       - Mark SCAF-001 through SCAF-009 as `[x]` (done) in the Pending Tasks list
       - Mark SCI-001 through SCI-007 as `[x]` (done)
       - Mark SIM-001 through SIM-015 as `[x]` (done)
       - Move all of the above from "Pending Tasks" to the "Completed Tasks" table with date 2026-11-04
       - Update "Next Recommended Action" to: Phase 5 — Application Foundation (Zustand stores + useMissionControl hook)

       Files: `.kiro/steering/workflow.md`
       Verify: file saves without error.

- [ ] 31. **Update `c:\Users\HP\Desktop\NASA SPACE APPS\.kiro\specs\astra\tasks.md`.**
       Mark all completed tasks as DONE:

       - TASK-SCAF-001 through TASK-SCAF-009: Status → DONE
       - TASK-SCI-001 through TASK-SCI-007: Status → DONE
       - TASK-SIM-001 through TASK-SIM-015: Status → DONE
       - Update the Phase 2, 3, and 4 rows in the Summary table to reflect new DONE counts

       Files: `.kiro/specs/astra/tasks.md`
       Verify: file saves without error.

---

## Build and Test Commands Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install all dependencies |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run dev` | Start Vite dev server |
| `npx vitest run` | Run all tests once |
| `npx vitest run tests/unit/simulation` | Run unit tests only |
| `npx vitest run tests/integration/simulation` | Run integration tests only |

---

## Dependency Order Summary

```
SCAF-001 → SCAF-002 → SCAF-003 → SCAF-004 → SCAF-005 → SCAF-006
         ↘                                              ↗
           SCAF-007 → SCAF-008 → SCAF-010
                              ↘
                               SCAF-009 (independent)

SCI-001 (moon-profile) ─────────────────────────────────────────┐
SCI-002 (mars-profile) ─────────────────────────────────────────┤→ SCI-003 (Zod schema)
SCI-004 (life-support-constants) ───────────────────────────────┘

SIM-001 (types) ─────────────────────────────────────────────────┐
SCI-004 (life-support-constants) ────────────────────────────────┤
                                                                  ↓
SIM-002 (PRNG) ──────────────────────────────────────────────────┤
SIM-003 (clock) ─────────────────────────────────────────────────┤→ SIM-004–SIM-007 (resource models)
                                                                  ↓
SIM-004–SIM-007 → SIM-008 (systems) ─────────────────────────────┤
SIM-001 → SIM-009/SIM-010 (events) ──────────────────────────────┤→ SIM-012 (engine)
SIM-002 (PRNG) ──────────────────────────────────────────────────┘
                                                                  ↓
SIM-011 (event engine) ──────────────────────────────────────────→ SIM-012 (engine)
SIM-013 (scoring) — independent, parallel with SIM-012

SIM-014 (unit tests) — requires SIM-004–SIM-007 + SIM-002
SIM-015 (integration tests) — requires SIM-012
```
