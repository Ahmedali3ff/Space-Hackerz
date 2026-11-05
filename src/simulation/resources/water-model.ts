// src/simulation/resources/water-model.ts
// Pure function — same inputs → same outputs.
// NO React, Zustand, or Phaser imports.

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
 * consumption    = crewSize × 3.0 kg/person/day
 * recycled       = consumption × 0.85
 * netConsumption = consumption - recycled
 * delta          = -netConsumption  (net loss from storage)
 *
 * Resource is clamped to 0 — never goes silently negative.
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
