// src/simulation/resources/oxygen-model.ts
// Pure function — same inputs → same outputs.
// NO React, Zustand, or Phaser imports.

import {
  OXYGEN_PER_PERSON_PER_DAY_KG,
  CO2_RECOVERY_RATE,
} from '@data/nasa/life-support-constants'

export interface OxygenModelInput {
  readonly crewSize: number
  readonly lifeSupportEfficiency: number // 0–1
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
 * delta       = production - consumption  (will be negative — net oxygen drawdown)
 *
 * Resource is clamped to 0 — never goes silently negative.
 *
 * Reference: docs/simulation-model.md — "Oxygen Calculations"
 * Assumption classifications: ASM-LS-001, ASM-LS-005
 */
export function calculateOxygenDelta(input: OxygenModelInput): OxygenModelOutput {
  const consumption_kg = input.crewSize * OXYGEN_PER_PERSON_PER_DAY_KG
  const production_kg = consumption_kg * CO2_RECOVERY_RATE * input.lifeSupportEfficiency
  const delta_kg = production_kg - consumption_kg
  const rawNew = input.currentOxygen_kg + delta_kg
  const newLevel_kg = Math.max(rawNew, 0) // clamp — never silent negative
  return {
    consumption_kg,
    production_kg,
    delta_kg,
    newLevel_kg,
    depleted: rawNew <= 0,
  }
}
