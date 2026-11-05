// src/data/validation/simulation-state.schema.ts
// Zod schema for SimulationState.
// Used by SimulationEngine to validate state before each step.

import { z } from 'zod'

const ResourceSnapshotSchema = z.object({
  oxygen_kg: z.number().nonnegative(),
  water_kg: z.number().nonnegative(),
  food_kg: z.number().nonnegative(),
  energy_kWh: z.number().nonnegative(),
  cumulativeRadiation_mSv: z.number().nonnegative(),
})

const ShieldingLevelSchema = z.enum(['low', 'medium', 'high'])

const BaseConfigSchema = z.object({
  solarPanelArea_m2: z.number().positive(),
  batteryCapacity_kWh: z.number().positive(),
  agricultureArea_m2: z.number().nonnegative(),
  shieldingLevel: ShieldingLevelSchema,
  lifeSupportEfficiency: z.number().min(0).max(1),
})

const FaultStateSchema = z.enum([
  'OXYGEN_DEPLETED',
  'WATER_DEPLETED',
  'FOOD_DEPLETED',
  'POWER_CRITICAL',
  'RADIATION_HIGH',
  'RADIATION_CRITICAL',
])

const MissionOutcomeSchema = z.enum(['success', 'partial', 'failure', 'ongoing'])

export const SimulationStateSchema = z.object({
  missionDay: z.number().int().nonnegative(),
  planetId: z.enum(['moon', 'mars']),
  crewSize: z.number().int().positive(),
  baseConfig: BaseConfigSchema,
  resources: ResourceSnapshotSchema,
  seed: z.number(),
  activeEventIds: z.array(z.string()),
  faultStates: z.array(FaultStateSchema),
  outcome: MissionOutcomeSchema,
})

export type ValidatedSimulationState = z.infer<typeof SimulationStateSchema>
