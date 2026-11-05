// src/simulation/resources/food-model.ts
// Pure function — same inputs → same outputs.
// NO React, Zustand, or Phaser imports.

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
 * Agriculture production is zero when power is unavailable (ASM-AGR-002).
 * Resource is clamped to 0 — never goes silently negative.
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
