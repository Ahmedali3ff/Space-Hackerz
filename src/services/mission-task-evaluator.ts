// src/services/mission-task-evaluator.ts
// Pure function that evaluates which mission tasks have been newly satisfied.
// NO React imports. NO Zustand imports. Pure TypeScript domain logic.
// Caller is responsible for filtering against already-completed task IDs.

import type { MissionDefinition } from '@data/missions/mission-definitions'
import type {
  ResourceHistoryPoint,
  DecisionLogEntry,
  MissionScore,
  PlanetId,
} from '@simulation/types'

// ── Input type ────────────────────────────────────────────────────────────────

export interface MissionEvalInput {
  readonly currentMissionDay: number
  readonly resourceHistory: readonly ResourceHistoryPoint[]
  readonly decisionLog: readonly DecisionLogEntry[]
  readonly missionScore: MissionScore | null
  readonly selectedPlanetId: PlanetId | null
}

// ── Evaluator ─────────────────────────────────────────────────────────────────

/**
 * Evaluates which tasks in `mission` are currently satisfied given the
 * simulation state described by `state`. Returns ONLY the task IDs that
 * are now complete — the caller should filter against already-completed IDs
 * to detect newly completed tasks.
 */
export function evaluateMissionTasks(
  mission: MissionDefinition,
  state: MissionEvalInput,
): string[] {
  const satisfied: string[] = []

  for (const task of mission.tasks) {
    if (isTaskSatisfied(task.rule, state)) {
      satisfied.push(task.id)
    }
  }

  return satisfied
}

// ── Per-rule logic ────────────────────────────────────────────────────────────

function isTaskSatisfied(
  rule: MissionDefinition['tasks'][number]['rule'],
  state: MissionEvalInput,
): boolean {
  const {
    currentMissionDay,
    resourceHistory,
    decisionLog,
    missionScore,
    selectedPlanetId,
  } = state

  switch (rule) {
    case 'survive_10_days':
      return currentMissionDay >= 10

    case 'survive_30_days':
      return currentMissionDay >= 30

    case 'survive_60_days':
      return currentMissionDay >= 60

    case 'survive_90_days':
      return currentMissionDay >= 90

    case 'survive_lunar_night':
      // A lunar night cycle completes at day 28 (14-day lunar night + buffer)
      return currentMissionDay >= 28

    case 'keep_oxygen_50pct': {
      if (resourceHistory.length < 2) return false
      const initialOxygen = resourceHistory[0].oxygen_kg
      return resourceHistory.every(
        (point) => point.oxygen_kg >= 0.5 * initialOxygen,
      )
    }

    case 'resolve_1_event':
      return (
        decisionLog.filter((e) => e.action.type === 'RESOLVE_EVENT').length >= 1
      )

    case 'resolve_2_events':
      return (
        decisionLog.filter((e) => e.action.type === 'RESOLVE_EVENT').length >= 2
      )

    case 'resolve_3_events':
      return (
        decisionLog.filter((e) => e.action.type === 'RESOLVE_EVENT').length >= 3
      )

    case 'use_emergency_ration':
      return decisionLog.some((e) => e.action.type === 'EMERGENCY_RATION')

    case 'configure_life_support':
      // This task is always considered satisfied once the mission is configured and started
      return true

    case 'select_mars':
      return selectedPlanetId === 'mars'

    case 'keep_resources_above_critical': {
      if (resourceHistory.length === 0) return false
      return resourceHistory.every(
        (point) =>
          point.oxygen_kg > 0 && point.water_kg > 0 && point.food_kg > 0,
      )
    }

    case 'score_500':
      return missionScore !== null && missionScore.finalScore >= 500

    default: {
      // Exhaustive check — TS narrows 'rule' to never; the void call satisfies the read requirement
      void (rule as never)
      return false
    }
  }
}
