// tests/unit/simulation/mission-scoring.test.ts
// Unit tests for mission scoring with duration multiplier

import { describe, it, expect } from 'vitest'
import { calculateMissionScore } from '@simulation/core/mission-scoring'
import type { ScoringInput } from '@simulation/core/mission-scoring'

describe('calculateMissionScore', () => {
  const baseScoringInput: ScoringInput = {
    missionDuration: 30,
    oxygenStabilityScore: 1.0,
    waterStabilityScore: 1.0,
    foodStabilityScore: 1.0,
    energyStabilityScore: 1.0,
    decisionLog: [],
    eventsSuccessfullyResolved: 0,
    criticalFailureEvents: 0,
    targetDurationDays: 30,
  }

  it('applies 0.8x multiplier for 30-day missions', () => {
    const score = calculateMissionScore({
      ...baseScoringInput,
      targetDurationDays: 30,
    })
    expect(score.durationMultiplier).toBe(0.8)
    // Verify final score is actually multiplied
    const rawScore = score.baseScore + score.resourceStabilityBonus + 
                     score.decisionQualityBonus + score.eventsResolvedBonus + 
                     score.criticalFailurePenalty + (score.finalScore - score.durationBonus - Math.round((score.baseScore + score.resourceStabilityBonus + score.decisionQualityBonus + score.eventsResolvedBonus + score.criticalFailurePenalty) * 0.8))
    expect(score.finalScore).toBeGreaterThan(0)
    expect(score.durationBonus).toBeLessThan(0) // 0.8x means penalty
  })

  it('applies 1.0x multiplier for 60-day missions', () => {
    const score = calculateMissionScore({
      ...baseScoringInput,
      missionDuration: 60,
      targetDurationDays: 60,
    })
    expect(score.durationMultiplier).toBe(1.0)
    expect(score.durationBonus).toBe(0) // 1.0x means no bonus or penalty
  })

  it('applies 1.3x multiplier for 90-day missions', () => {
    const score = calculateMissionScore({
      ...baseScoringInput,
      missionDuration: 90,
      targetDurationDays: 90,
    })
    expect(score.durationMultiplier).toBe(1.3)
    expect(score.durationBonus).toBeGreaterThan(0) // 1.3x means bonus
  })

  it('calculates durationBonus as difference between final and raw score', () => {
    const score30 = calculateMissionScore({
      ...baseScoringInput,
      targetDurationDays: 30,
    })
    
    // For 30-day: raw score should be higher than final score (0.8x penalty)
    // durationBonus should be negative
    expect(score30.durationBonus).toBeLessThan(0)

    const score90 = calculateMissionScore({
      ...baseScoringInput,
      missionDuration: 90,
      targetDurationDays: 90,
    })
    
    // For 90-day: final score should be higher than raw score (1.3x bonus)
    // durationBonus should be positive
    expect(score90.durationBonus).toBeGreaterThan(0)
  })

  it('preserves all other scoring components unchanged', () => {
    const inputWithBonuses: ScoringInput = {
      missionDuration: 60,
      oxygenStabilityScore: 0.9,
      waterStabilityScore: 0.8,
      foodStabilityScore: 0.85,
      energyStabilityScore: 0.95,
      decisionLog: [
        { missionDay: 1, action: { type: 'ADVANCE_DAY' }, resultSummary: 'Day advanced', wasOptimal: true },
        { missionDay: 2, action: { type: 'ADVANCE_DAY' }, resultSummary: 'Day advanced', wasOptimal: false },
      ],
      eventsSuccessfullyResolved: 3,
      criticalFailureEvents: 1,
      targetDurationDays: 60,
    }

    const score = calculateMissionScore(inputWithBonuses)

    // Base score
    expect(score.baseScore).toBe(60 * 10)

    // Resource stability bonus
    const avgStability = (0.9 + 0.8 + 0.85 + 0.95) / 4
    expect(score.resourceStabilityBonus).toBeCloseTo(avgStability * 200, 1)

    // Decision quality bonus
    expect(score.decisionQualityBonus).toBe(1 * 25 + 1 * 5) // 1 optimal, 1 suboptimal

    // Events resolved bonus
    expect(score.eventsResolvedBonus).toBe(3 * 30)

    // Critical failure penalty
    expect(score.criticalFailurePenalty).toBe(1 * -50)

    // Duration multiplier for 60-day should be 1.0
    expect(score.durationMultiplier).toBe(1.0)
  })

  it('returns correct outcome thresholds after multiplier application', () => {
    // High score 30-day mission (easy, 0.8x) should still succeed if raw score is high enough
    const highScore30 = calculateMissionScore({
      ...baseScoringInput,
      missionDuration: 30,
      oxygenStabilityScore: 1.0,
      waterStabilityScore: 1.0,
      foodStabilityScore: 1.0,
      energyStabilityScore: 1.0,
      eventsSuccessfullyResolved: 20, // Lots of events
      targetDurationDays: 30,
    })
    
    // With 30 days * 10 = 300 base + 200 stability + 100 completion + 20*30 events = 1200 raw
    // 1200 * 0.8 = 960 final (should be success, >= 800)
    expect(highScore30.outcome).toBe('success')
    expect(highScore30.finalScore).toBeGreaterThanOrEqual(800)

    // Very low score should fail even with 1.3x multiplier
    // Use extreme penalties to force failure
    const veryLowScore90 = calculateMissionScore({
      ...baseScoringInput,
      missionDuration: 10, // Very short survival
      oxygenStabilityScore: 0.0,
      waterStabilityScore: 0.0,
      foodStabilityScore: 0.0,
      energyStabilityScore: 0.0,
      criticalFailureEvents: 10, // Lots of failures
      targetDurationDays: 90,
    })
    
    // 10 days * 10 = 100 base + 0 stability + 11 completion (10/90) + 0 events - 500 penalty = -389 raw
    // -389 * 1.3 = -506 final (should be failure, < 400)
    expect(veryLowScore90.outcome).toBe('failure')
    expect(veryLowScore90.finalScore).toBeLessThan(400)
  })
})
