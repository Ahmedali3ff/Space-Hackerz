// src/simulation/core/mission-scoring.ts
// Pure function — same inputs → same outputs.
// NO React, Zustand, or Phaser imports.

import type { MissionScore, MissionOutcome, DecisionLogEntry } from '@simulation/types'

// Configurable thresholds — educational design choices (not scientific values)
const SUCCESS_THRESHOLD = 800 as const
const PARTIAL_THRESHOLD = 400 as const

export interface ScoringInput {
  readonly missionDuration: number
  readonly oxygenStabilityScore: number // 0–1 (fraction of days above threshold)
  readonly waterStabilityScore: number
  readonly foodStabilityScore: number
  readonly energyStabilityScore: number
  readonly decisionLog: readonly DecisionLogEntry[]
  readonly eventsSuccessfullyResolved: number
  readonly criticalFailureEvents: number
  readonly targetDurationDays?: number // optional, defaults to 90
}

/**
 * Calculates the final mission score.
 *
 * baseScore                = missionDuration × 10
 * resourceStabilityBonus   = average stability × 200
 * decisionQualityBonus     = optimalDecisions × 25 + suboptimalDecisions × 5
 * eventsResolvedBonus      = eventsSuccessfullyResolved × 30
 * criticalFailurePenalty   = criticalFailureEvents × -50
 * rawScore                 = sum of above
 * durationMultiplier       = 0.8 (≤30d), 1.0 (≤60d), 1.3 (>60d)
 * finalScore               = Math.round(rawScore × durationMultiplier)
 *
 * Outcomes:
 *   finalScore ≥ 800 → success
 *   finalScore ≥ 400 → partial
 *   finalScore < 400 → failure
 *
 * Reference: docs/simulation-model.md — "Mission Scoring"
 *
 * V1 SIMPLIFICATIONS:
 * (1) eventsSuccessfullyResolved counts any RESOLVE_EVENT action where a
 *     matching choice was found, not specifically the optimal choice. Optimal
 *     vs. suboptimal distinction is captured in decisionQualityBonus instead.
 * (2) criticalFailureEvents counts POWER_CRITICAL fault triggers only — other
 *     critical faults (OXYGEN_DEPLETED, WATER_DEPLETED, RADIATION_CRITICAL)
 *     cause outcome=failure directly before scoring runs, so they are not
 *     counted here as penalty events.
 */
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

  const targetDays = input.targetDurationDays ?? 90
  const daysRun = input.missionDuration
  const completionRatio = Math.min(daysRun / targetDays, 1.0)
  const completionBonus = Math.round(completionRatio * 100)

  // Calculate duration multiplier based on mission length
  const durationMultiplier =
    targetDays <= 30 ? 0.8 : targetDays <= 60 ? 1.0 : 1.3

  const rawScore =
    baseScore + resourceStabilityBonus + decisionQualityBonus + eventsResolvedBonus + criticalFailurePenalty + completionBonus

  const finalScore = Math.round(rawScore * durationMultiplier)
  const durationBonus = finalScore - rawScore

  const outcome: MissionOutcome =
    finalScore >= SUCCESS_THRESHOLD ? 'success' : finalScore >= PARTIAL_THRESHOLD ? 'partial' : 'failure'

  return {
    baseScore,
    resourceStabilityBonus,
    decisionQualityBonus,
    eventsResolvedBonus,
    criticalFailurePenalty,
    durationBonus,
    durationMultiplier,
    finalScore,
    outcome,
  }
}
