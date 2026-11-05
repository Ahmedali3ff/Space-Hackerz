// src/ai/simulation-context.ts
// Defines the SimulationContext interface passed to Astro-AI prompts.
// NO React, Zustand, or Phaser imports.

import type {
  PlanetId,
  SimulationState,
  ResourceSnapshot,
  SimulationResult,
  FaultState,
  StepExplanation,
  MissionOutcome,
} from '@simulation/types'

export interface SimulationContext {
  readonly planetId: PlanetId
  readonly planetDisplayName: string
  readonly missionDay: number
  readonly timeUnitLabel: string
  readonly crewSize: number
  readonly resourceLevels: {
    readonly oxygenPercent: number
    readonly waterPercent: number
    readonly foodPercent: number
    readonly energyPercent: number
    readonly radiationDose_mSv: number
  }
  readonly activeEventIds: readonly string[]
  readonly faultStates: readonly FaultState[]
  readonly lastStepExplanations: readonly StepExplanation[]
  readonly outcome: MissionOutcome
}

/**
 * Computes a percentage from current and initial values, clamped to 0–100.
 * Returns 0 if the initial value is 0 (treats as depleted).
 */
function toPercent(current: number, initial: number): number {
  if (initial === 0) return 0
  return Math.min(100, Math.max(0, (current / initial) * 100))
}

/**
 * Builds a read-only SimulationContext from simulation engine state,
 * suitable for passing to Astro-AI prompt builders.
 */
export function buildSimulationContext(
  state: SimulationState,
  lastResult: SimulationResult | null,
  planetDisplayName: string,
  timeUnitLabel: string,
  initialResources: ResourceSnapshot,
): SimulationContext {
  return {
    planetId: state.planetId,
    planetDisplayName,
    missionDay: state.missionDay,
    timeUnitLabel,
    crewSize: state.crewSize,
    resourceLevels: {
      oxygenPercent: toPercent(state.resources.oxygen_kg, initialResources.oxygen_kg),
      waterPercent: toPercent(state.resources.water_kg, initialResources.water_kg),
      foodPercent: toPercent(state.resources.food_kg, initialResources.food_kg),
      energyPercent: toPercent(state.resources.energy_kWh, initialResources.energy_kWh),
      radiationDose_mSv: state.resources.cumulativeRadiation_mSv,
    },
    activeEventIds: state.activeEventIds,
    faultStates: state.faultStates,
    lastStepExplanations: lastResult?.explanations ?? [],
    outcome: state.outcome,
  }
}
