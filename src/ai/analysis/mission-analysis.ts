// src/ai/analysis/mission-analysis.ts
// Deterministic mission analysis. Every finding comes from simulation facts (fault states, resource
// percentages, the engine's step explanations). No language model is involved, so nothing here can be invented.
// NO React, Zustand, or Phaser imports.

import type { SimulationContext } from '../simulation-context'
import type { FaultState, ResourceType } from '@simulation/types'

export type RiskLevel = 'stable' | 'low' | 'critical'

/**
 * Analysis threshold (not an engine rule): a resource below this share of its starting level is "low".
 * Depletion and critical faults always come from the engine itself.
 */
export const LOW_RESOURCE_PERCENT = 25

const RESOURCE_FAULT: Readonly<Record<ResourceType, FaultState>> = {
  oxygen: 'OXYGEN_DEPLETED',
  water: 'WATER_DEPLETED',
  food: 'FOOD_DEPLETED',
  energy: 'POWER_CRITICAL',
}

export interface ResourceStatus {
  readonly resource: ResourceType
  readonly percent: number
  readonly status: RiskLevel
}

export interface Problem {
  readonly id: string
  readonly severity: RiskLevel
  readonly title: string
  readonly detail: string
  readonly source: 'engine-fault' | 'engine-explanation' | 'analysis-threshold'
}

export interface Recommendation {
  readonly problemId: string
  readonly action: string
}

export interface MissionAnalysis {
  readonly overallRisk: RiskLevel
  readonly resources: readonly ResourceStatus[]
  readonly problems: readonly Problem[]
  readonly recommendations: readonly Recommendation[]
  readonly criticalCount: number
  readonly warningCount: number
  /** Time-to-depletion needs a consumption history; the analysis does not guess it. */
  readonly forecast: { readonly available: false; readonly reason: string }
}

const RESOURCE_LABEL: Readonly<Record<ResourceType, string>> = {
  oxygen: 'Oxygen',
  water: 'Water',
  food: 'Food',
  energy: 'Energy',
}

const RECOMMENDATION_FOR_FAULT: Readonly<Record<FaultState, string>> = {
  OXYGEN_DEPLETED: 'Restore oxygen production or reduce crew activity until the reserve recovers.',
  WATER_DEPLETED: 'Increase water recovery or cut non-essential water use immediately.',
  FOOD_DEPLETED: 'Ration food and plan a resupply or a higher-yield crop cycle.',
  POWER_CRITICAL: 'Shed non-essential loads and protect life support first.',
  RADIATION_HIGH: 'Move the crew to the best-shielded area and limit surface time.',
  RADIATION_CRITICAL: 'Shelter the crew now and postpone all surface operations.',
}

const FAULT_TITLE: Readonly<Record<FaultState, string>> = {
  OXYGEN_DEPLETED: 'Oxygen reserve depleted',
  WATER_DEPLETED: 'Water reserve depleted',
  FOOD_DEPLETED: 'Food reserve depleted',
  POWER_CRITICAL: 'Power critically low',
  RADIATION_HIGH: 'Radiation dose high',
  RADIATION_CRITICAL: 'Radiation dose critical',
}

const CRITICAL_FAULTS: ReadonlySet<FaultState> = new Set<FaultState>([
  'OXYGEN_DEPLETED', 'WATER_DEPLETED', 'FOOD_DEPLETED', 'POWER_CRITICAL', 'RADIATION_CRITICAL',
])

function riskOf(percent: number, depleted: boolean): RiskLevel {
  if (depleted || percent <= 0) return 'critical'
  if (percent < LOW_RESOURCE_PERCENT) return 'low'
  return 'stable'
}

export function analyzeMission(ctx: SimulationContext): MissionAnalysis {
  const levels: Readonly<Record<ResourceType, number>> = {
    oxygen: ctx.resourceLevels.oxygenPercent,
    water: ctx.resourceLevels.waterPercent,
    food: ctx.resourceLevels.foodPercent,
    energy: ctx.resourceLevels.energyPercent,
  }
  const faults = new Set(ctx.faultStates)

  const resources: ResourceStatus[] = (Object.keys(levels) as ResourceType[]).map((resource) => ({
    resource,
    percent: Math.round(levels[resource]),
    status: riskOf(levels[resource], faults.has(RESOURCE_FAULT[resource])),
  }))

  const problems: Problem[] = []

  // 1. Engine faults are the authoritative source of critical problems.
  for (const fault of ctx.faultStates) {
    problems.push({
      id: `fault:${fault}`,
      severity: CRITICAL_FAULTS.has(fault) ? 'critical' : 'low',
      title: FAULT_TITLE[fault],
      detail: `The simulation reports ${fault}.`,
      source: 'engine-fault',
    })
  }

  // 2. Resources that are low but have not failed yet (analysis threshold, labelled as such).
  for (const r of resources) {
    if (r.status === 'low') {
      problems.push({
        id: `low:${r.resource}`,
        severity: 'low',
        title: `${RESOURCE_LABEL[r.resource]} is low`,
        detail: `${RESOURCE_LABEL[r.resource]} is at ${r.percent}% of its starting level (analysis threshold ${LOW_RESOURCE_PERCENT}%).`,
        source: 'analysis-threshold',
      })
    }
  }

  // 3. Engine step explanations that describe a loss, so the player sees the reason behind the trend.
  for (const step of ctx.lastStepExplanations) {
    if (step.delta < 0 && step.reason.trim().length > 0) {
      problems.push({
        id: `step:${step.resource}:${step.reason}`,
        severity: 'low',
        title: `${step.resource === 'radiation' ? 'Radiation' : RESOURCE_LABEL[step.resource]} consumption`,
        detail: step.reason,
        source: 'engine-explanation',
      })
    }
  }

  const rank: Readonly<Record<RiskLevel, number>> = { critical: 2, low: 1, stable: 0 }
  problems.sort((a, b) => rank[b.severity] - rank[a.severity])

  const recommendations: Recommendation[] = []
  for (const fault of ctx.faultStates) {
    recommendations.push({ problemId: `fault:${fault}`, action: RECOMMENDATION_FOR_FAULT[fault] })
  }
  for (const r of resources) {
    if (r.status === 'low') {
      recommendations.push({
        problemId: `low:${r.resource}`,
        action: `Raise ${RESOURCE_LABEL[r.resource].toLowerCase()} use reviews before the reserve reaches zero.`,
      })
    }
  }

  const criticalCount = problems.filter((p) => p.severity === 'critical').length
  const warningCount = problems.filter((p) => p.severity === 'low').length
  const overallRisk: RiskLevel = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'low' : 'stable'

  return {
    overallRisk,
    resources,
    problems,
    recommendations,
    criticalCount,
    warningCount,
    forecast: { available: false, reason: 'Not enough simulation history to estimate when a resource will run out.' },
  }
}
