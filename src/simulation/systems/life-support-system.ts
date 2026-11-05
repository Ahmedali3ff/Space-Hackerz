// src/simulation/systems/life-support-system.ts
// Orchestrates oxygen and water resource models.
// Applies power-critical efficiency penalty per docs/simulation-model.md.
// NO React, Zustand, or Phaser imports.

import { calculateOxygenDelta } from '@simulation/resources/oxygen-model'
import { calculateWaterDelta } from '@simulation/resources/water-model'
import { POWER_CRITICAL_LIFE_SUPPORT_PENALTY } from '@data/nasa/life-support-constants'
import type { FaultState } from '@simulation/types'

export interface LifeSupportInput {
  readonly crewSize: number
  readonly lifeSupportEfficiency: number // 0–1, from baseConfig
  readonly currentOxygen_kg: number
  readonly currentWater_kg: number
  readonly faultStates: readonly FaultState[]
}

export interface LifeSupportOutput {
  readonly oxygenDelta_kg: number
  readonly newOxygenLevel_kg: number
  readonly oxygenDepleted: boolean
  readonly waterDelta_kg: number
  readonly newWaterLevel_kg: number
  readonly waterDepleted: boolean
  readonly effectiveEfficiency: number
}

/**
 * Calculates life support (oxygen + water) for one simulation step.
 *
 * If POWER_CRITICAL is in faultStates, reduces effective life support efficiency
 * by 30% (POWER_CRITICAL_LIFE_SUPPORT_PENALTY) per docs/simulation-model.md.
 *
 * Reference: docs/simulation-model.md — "Life Support System"
 */
export function calculateLifeSupport(input: LifeSupportInput): LifeSupportOutput {
  // Apply power-critical penalty to effective efficiency
  const isPowerCritical = input.faultStates.includes('POWER_CRITICAL')
  const effectiveEfficiency = isPowerCritical
    ? input.lifeSupportEfficiency * (1 - POWER_CRITICAL_LIFE_SUPPORT_PENALTY)
    : input.lifeSupportEfficiency

  const oxygenResult = calculateOxygenDelta({
    crewSize: input.crewSize,
    lifeSupportEfficiency: effectiveEfficiency,
    currentOxygen_kg: input.currentOxygen_kg,
  })

  const waterResult = calculateWaterDelta({
    crewSize: input.crewSize,
    currentWater_kg: input.currentWater_kg,
  })

  return {
    oxygenDelta_kg: oxygenResult.delta_kg,
    newOxygenLevel_kg: oxygenResult.newLevel_kg,
    oxygenDepleted: oxygenResult.depleted,
    waterDelta_kg: waterResult.delta_kg,
    newWaterLevel_kg: waterResult.newLevel_kg,
    waterDepleted: waterResult.depleted,
    effectiveEfficiency,
  }
}
