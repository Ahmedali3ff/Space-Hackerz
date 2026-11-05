// tests/unit/services/mission-task-evaluator.test.ts
// Unit tests for evaluateMissionTasks — verifies every task rule in isolation.
// No React or Zustand imports needed — pure function under test.

import { describe, it, expect } from 'vitest'
import { evaluateMissionTasks } from '@/services/mission-task-evaluator'
import type { MissionEvalInput } from '@/services/mission-task-evaluator'
import type { MissionDefinition } from '@data/missions/mission-definitions'
import type { ResourceHistoryPoint, DecisionLogEntry } from '@simulation/types'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeHistory(points: Partial<ResourceHistoryPoint>[]): ResourceHistoryPoint[] {
  return points.map((p, i) => ({
    missionDay: i + 1,
    oxygen_kg: 100,
    water_kg: 200,
    food_kg: 150,
    energy_kWh: 80,
    cumulativeRadiation_mSv: 2,
    ...p,
  }))
}

function makeResolveEvent(day: number): DecisionLogEntry {
  return {
    missionDay: day,
    action: { type: 'RESOLVE_EVENT', eventId: 'EV1', choiceId: 'C1' },
    resultSummary: 'Resolved',
    wasOptimal: true,
  }
}

function makeEmergencyRation(day: number): DecisionLogEntry {
  return {
    missionDay: day,
    action: { type: 'EMERGENCY_RATION' },
    resultSummary: 'Used emergency ration',
    wasOptimal: false,
  }
}

function makeState(overrides: Partial<MissionEvalInput> = {}): MissionEvalInput {
  return {
    currentMissionDay: 0,
    resourceHistory: [],
    decisionLog: [],
    missionScore: null,
    selectedPlanetId: null,
    ...overrides,
  }
}

/** Build a minimal MissionDefinition with exactly one task using the given rule */
function singleTaskMission(
  rule: MissionDefinition['tasks'][number]['rule'],
): MissionDefinition {
  return {
    id: 'test-mission',
    number: 1,
    title: 'Test',
    subtitle: 'Test',
    planet: 'moon',
    duration: 30,
    difficulty: 'beginner',
    description: 'Test mission',
    objectives: [],
    rewards: { stars: 1, badge: 'Test' },
    tasks: [
      {
        id: 'test-task',
        label: 'Test Task',
        description: 'A test task',
        rule,
      },
    ],
  }
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('evaluateMissionTasks', () => {
  it('returns empty array when no rules are satisfied', () => {
    const mission = singleTaskMission('survive_10_days')
    const result = evaluateMissionTasks(mission, makeState({ currentMissionDay: 5 }))
    expect(result).toEqual([])
  })

  it('survive_10_days: satisfied when currentMissionDay >= 10', () => {
    const mission = singleTaskMission('survive_10_days')
    const result = evaluateMissionTasks(mission, makeState({ currentMissionDay: 10 }))
    expect(result).toContain('test-task')
  })

  it('survive_10_days: not satisfied when currentMissionDay < 10', () => {
    const mission = singleTaskMission('survive_10_days')
    const result = evaluateMissionTasks(mission, makeState({ currentMissionDay: 9 }))
    expect(result).not.toContain('test-task')
  })

  it('survive_30_days: satisfied at day 30', () => {
    const mission = singleTaskMission('survive_30_days')
    const result = evaluateMissionTasks(mission, makeState({ currentMissionDay: 30 }))
    expect(result).toContain('test-task')
  })

  it('survive_lunar_night: satisfied at day 28', () => {
    const mission = singleTaskMission('survive_lunar_night')
    const result = evaluateMissionTasks(mission, makeState({ currentMissionDay: 28 }))
    expect(result).toContain('test-task')
  })

  it('keep_oxygen_50pct: satisfied when all history points have oxygen >= 50% of first', () => {
    const mission = singleTaskMission('keep_oxygen_50pct')
    const history = makeHistory([
      { oxygen_kg: 100 },
      { oxygen_kg: 60 },
      { oxygen_kg: 50 }, // exactly 50% of 100
    ])
    const result = evaluateMissionTasks(mission, makeState({ resourceHistory: history }))
    expect(result).toContain('test-task')
  })

  it('keep_oxygen_50pct: not satisfied when a point drops below 50%', () => {
    const mission = singleTaskMission('keep_oxygen_50pct')
    const history = makeHistory([
      { oxygen_kg: 100 },
      { oxygen_kg: 60 },
      { oxygen_kg: 49 }, // below 50%
    ])
    const result = evaluateMissionTasks(mission, makeState({ resourceHistory: history }))
    expect(result).not.toContain('test-task')
  })

  it('resolve_1_event: satisfied when decisionLog has 1 RESOLVE_EVENT entry', () => {
    const mission = singleTaskMission('resolve_1_event')
    const result = evaluateMissionTasks(
      mission,
      makeState({ decisionLog: [makeResolveEvent(1)] }),
    )
    expect(result).toContain('test-task')
  })

  it('resolve_2_events: not satisfied with 1 RESOLVE_EVENT', () => {
    const mission = singleTaskMission('resolve_2_events')
    const result = evaluateMissionTasks(
      mission,
      makeState({ decisionLog: [makeResolveEvent(1)] }),
    )
    expect(result).not.toContain('test-task')
  })

  it('resolve_3_events: satisfied with 3 RESOLVE_EVENT entries', () => {
    const mission = singleTaskMission('resolve_3_events')
    const result = evaluateMissionTasks(
      mission,
      makeState({
        decisionLog: [makeResolveEvent(1), makeResolveEvent(2), makeResolveEvent(3)],
      }),
    )
    expect(result).toContain('test-task')
  })

  it('use_emergency_ration: satisfied when decisionLog has EMERGENCY_RATION', () => {
    const mission = singleTaskMission('use_emergency_ration')
    const result = evaluateMissionTasks(
      mission,
      makeState({ decisionLog: [makeEmergencyRation(5)] }),
    )
    expect(result).toContain('test-task')
  })

  it('configure_life_support: always returns true', () => {
    const mission = singleTaskMission('configure_life_support')
    // Even with minimal/empty state it should be satisfied
    const result = evaluateMissionTasks(mission, makeState())
    expect(result).toContain('test-task')
  })

  it('select_mars: satisfied when selectedPlanetId is mars', () => {
    const mission = singleTaskMission('select_mars')
    const result = evaluateMissionTasks(mission, makeState({ selectedPlanetId: 'mars' }))
    expect(result).toContain('test-task')
  })

  it('select_mars: not satisfied when selectedPlanetId is moon', () => {
    const mission = singleTaskMission('select_mars')
    const result = evaluateMissionTasks(mission, makeState({ selectedPlanetId: 'moon' }))
    expect(result).not.toContain('test-task')
  })

  it('keep_resources_above_critical: satisfied when all resources > 0', () => {
    const mission = singleTaskMission('keep_resources_above_critical')
    const history = makeHistory([
      { oxygen_kg: 10, water_kg: 20, food_kg: 5 },
      { oxygen_kg: 8, water_kg: 18, food_kg: 4 },
    ])
    const result = evaluateMissionTasks(mission, makeState({ resourceHistory: history }))
    expect(result).toContain('test-task')
  })

  it('keep_resources_above_critical: not satisfied when food_kg hits 0', () => {
    const mission = singleTaskMission('keep_resources_above_critical')
    const history = makeHistory([
      { oxygen_kg: 10, water_kg: 20, food_kg: 5 },
      { oxygen_kg: 8, water_kg: 18, food_kg: 0 }, // food hits zero
    ])
    const result = evaluateMissionTasks(mission, makeState({ resourceHistory: history }))
    expect(result).not.toContain('test-task')
  })

  it('score_500: satisfied when missionScore.finalScore >= 500', () => {
    const mission = singleTaskMission('score_500')
    const score = {
      baseScore: 400,
      resourceStabilityBonus: 50,
      decisionQualityBonus: 30,
      eventsResolvedBonus: 20,
      criticalFailurePenalty: 0,
      finalScore: 500,
      outcome: 'success' as const,
    }
    const result = evaluateMissionTasks(mission, makeState({ missionScore: score }))
    expect(result).toContain('test-task')
  })

  it('score_500: not satisfied when missionScore is null', () => {
    const mission = singleTaskMission('score_500')
    const result = evaluateMissionTasks(mission, makeState({ missionScore: null }))
    expect(result).not.toContain('test-task')
  })
})
