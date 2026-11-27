// src/ai/debrief/mission-debrief.ts
// Builds the mission debrief from recorded decisions and the final simulation state. Pure logic, no model.
// Every mistake and good decision comes from the decision log the engine recorded.
// NO React, Zustand, or Phaser imports.

import type { DecisionLogEntry, FaultState, MissionOutcome, PlayerAction } from '@simulation/types'
import { analyzeMission } from '../analysis/mission-analysis'
import type { SimulationContext } from '../simulation-context'

export interface DecisionFinding {
  readonly day: number
  readonly action: string
  readonly what: string
  readonly why: string
  readonly better: string
}

export interface MissionDebrief {
  readonly outcome: MissionOutcome
  readonly daysSurvived: number
  readonly totalDecisions: number
  readonly optimalDecisions: number
  readonly mistakes: readonly DecisionFinding[]
  readonly goodDecisions: readonly DecisionFinding[]
  readonly remainingFaults: readonly FaultState[]
  readonly lessons: readonly string[]
}

export function actionLabel(action: PlayerAction): string {
  switch (action.type) {
    case 'ADVANCE_DAY': return 'Advanced the day'
    case 'RESOLVE_EVENT': return `Resolved event ${action.eventId}`
    case 'EMERGENCY_RATION': return 'Used emergency rations'
  }
}

/** The lesson for a mistake is tied to the kind of action, so it always matches what the player did. */
function betterFor(action: PlayerAction): string {
  switch (action.type) {
    case 'EMERGENCY_RATION':
      return 'Use emergency rations only when food is actually critical; earlier rationing would have kept reserves for later days.'
    case 'RESOLVE_EVENT':
      return 'Compare the choices of this event: the option that protects life support first is usually the safer one.'
    case 'ADVANCE_DAY':
      return 'Before advancing, check the critical resources and faults; act on them first.'
  }
}

function whyFor(entry: DecisionLogEntry): string {
  return entry.resultSummary.trim().length > 0
    ? entry.resultSummary
    : 'The engine did not record a detailed reason for this decision.'
}

export function buildMissionDebrief(
  decisionLog: readonly DecisionLogEntry[],
  finalContext: SimulationContext,
): MissionDebrief {
  const analysis = analyzeMission(finalContext)

  const findings = decisionLog.map((entry) => ({ entry, finding: {
    day: entry.missionDay,
    action: actionLabel(entry.action),
    what: entry.resultSummary,
    why: whyFor(entry),
    better: betterFor(entry.action),
  } as DecisionFinding }))

  const mistakes = findings.filter((f) => !f.entry.wasOptimal).map((f) => f.finding)
  const goodDecisions = findings.filter((f) => f.entry.wasOptimal).map((f) => f.finding)
  const optimalDecisions = goodDecisions.length

  const lessons: string[] = []
  if (analysis.problems.some((p) => p.id === 'fault:OXYGEN_DEPLETED')) {
    lessons.push('Oxygen ran out. Check the oxygen reserve before any other decision.')
  }
  if (analysis.problems.some((p) => p.id === 'fault:WATER_DEPLETED')) {
    lessons.push('Water ran out. Water recovery decisions protect the crew from dehydration first.')
  }
  if (mistakes.some((m) => m.action === actionLabel({ type: 'EMERGENCY_RATION' }))) {
    lessons.push('Emergency rations were used. Plan food earlier so rations are a last resort.')
  }
  if (lessons.length === 0 && mistakes.length === 0) {
    lessons.push('No recorded mistakes. Keep the same habit of checking resources before each day.')
  }

  return {
    outcome: finalContext.outcome,
    daysSurvived: finalContext.missionDay,
    totalDecisions: decisionLog.length,
    optimalDecisions,
    mistakes,
    goodDecisions,
    remainingFaults: finalContext.faultStates,
    lessons,
  }
}
