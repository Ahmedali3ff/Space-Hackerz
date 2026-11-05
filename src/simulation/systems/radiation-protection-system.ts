// src/simulation/systems/radiation-protection-system.ts
// Calculates radiation dose based on planet profile and shielding level.
// NO React, Zustand, or Phaser imports.

import {
  SHIELDING_REDUCTION,
  RADIATION_HIGH_THRESHOLD_MSV,
  RADIATION_CRITICAL_THRESHOLD_MSV,
} from '@data/nasa/life-support-constants'
import type { ShieldingLevel } from '@simulation/types'

export interface RadiationInput {
  readonly unshieldedDailyDose_mSv: number // from planet profile
  readonly shieldingLevel: ShieldingLevel
  readonly currentCumulativeDose_mSv: number
  readonly radiationModifier: number // 1.0 normally; events may increase this
}

export interface RadiationOutput {
  readonly dailyDose_mSv: number
  readonly newCumulativeDose_mSv: number
  readonly radiationHigh: boolean
  readonly radiationCritical: boolean
}

/**
 * Calculates radiation exposure for one simulation step.
 *
 * Formula:
 *   shieldingReduction = SHIELDING_REDUCTION[shieldingLevel] (0.30 | 0.60 | 0.85)
 *   dailyDose_mSv = unshieldedDailyDose × (1 - shieldingReduction) × radiationModifier
 *   newCumulative = currentCumulative + dailyDose
 *
 * Classification: EDUCATIONAL_ASSUMPTION (ASM-RAD-003)
 * Reference: docs/simulation-model.md — "Radiation Protection System"
 */
export function calculateRadiationExposure(input: RadiationInput): RadiationOutput {
  const shieldingReduction = SHIELDING_REDUCTION[input.shieldingLevel]
  const dailyDose_mSv =
    input.unshieldedDailyDose_mSv * (1 - shieldingReduction) * input.radiationModifier
  const newCumulativeDose_mSv = input.currentCumulativeDose_mSv + dailyDose_mSv

  return {
    dailyDose_mSv,
    newCumulativeDose_mSv,
    radiationHigh:
      newCumulativeDose_mSv >= RADIATION_HIGH_THRESHOLD_MSV &&
      newCumulativeDose_mSv < RADIATION_CRITICAL_THRESHOLD_MSV,
    radiationCritical: newCumulativeDose_mSv >= RADIATION_CRITICAL_THRESHOLD_MSV,
  }
}
