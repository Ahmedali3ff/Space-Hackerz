// src/simulation/systems/agriculture-system.ts
// Thin wrapper around food model for consistent step-order orchestration.
// NO React, Zustand, or Phaser imports.

import { calculateFoodDelta } from '@simulation/resources/food-model'
import type { FoodModelOutput } from '@simulation/resources/food-model'

export interface AgricultureInput {
  readonly crewSize: number
  readonly agricultureArea_m2: number
  readonly isPowerAvailable: boolean
  readonly currentFood_kg: number
}

export type AgricultureOutput = FoodModelOutput

/**
 * Calculates food production and consumption for one simulation step.
 * Thin wrapper around calculateFoodDelta.
 * Exists as a named system so the engine calls it uniformly with other systems.
 *
 * Reference: docs/simulation-model.md — "Agriculture System"
 */
export function calculateAgriculture(input: AgricultureInput): AgricultureOutput {
  return calculateFoodDelta({
    crewSize: input.crewSize,
    agricultureArea_m2: input.agricultureArea_m2,
    isPowerAvailable: input.isPowerAvailable,
    currentFood_kg: input.currentFood_kg,
  })
}
