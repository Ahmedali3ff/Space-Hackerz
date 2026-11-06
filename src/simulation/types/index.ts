// src/simulation/types/index.ts
// NO React, Zustand, or Phaser imports in this file.

// ── Primitive string literals (enums are banned per coding-standards) ──

export type PlanetId = 'moon' | 'mars'

export type ShieldingLevel = 'low' | 'medium' | 'high'

// ── Landing location ──

export interface Location {
  readonly id: string
  readonly name: string
  readonly planetId: 'moon' | 'mars'
  readonly latitude: number
  readonly solarEfficiencyModifier: number // 0.6 to 1.0
  readonly thermalSwingFactor: number // 1.0 = normal, 1.5 = extreme
  readonly dustStormProbability: number // 0.0 to 1.0 (Mars only)
  readonly description: string
}

export type MissionOutcome = 'success' | 'partial' | 'failure' | 'ongoing'

export type ResourceType = 'oxygen' | 'water' | 'food' | 'energy'

export type FaultState =
  | 'OXYGEN_DEPLETED'
  | 'WATER_DEPLETED'
  | 'FOOD_DEPLETED'
  | 'POWER_CRITICAL'
  | 'RADIATION_HIGH'
  | 'RADIATION_CRITICAL'

// ── Planet profile ──

export interface PlanetProfile {
  readonly id: PlanetId
  readonly displayName: string
  readonly timeUnitLabel: string
  readonly temperatureRange: { readonly min: number; readonly max: number }
  readonly gravity_m_s2: number
  readonly solarIrradiance_W_m2: number
  readonly solarCycleDays?: number
  readonly solarDayLength?: number
  readonly solDuration_earthDays?: number
  readonly unshieldedDailyRadiation_mSv: number
}

// ── Configuration ──

export interface BaseConfig {
  readonly solarPanelArea_m2: number
  readonly batteryCapacity_kWh: number
  readonly agricultureArea_m2: number
  readonly shieldingLevel: ShieldingLevel
  readonly lifeSupportEfficiency: number // 0–1, default 1.0
}

// ── Runtime state ──

export interface ResourceSnapshot {
  readonly oxygen_kg: number
  readonly water_kg: number
  readonly food_kg: number
  readonly energy_kWh: number
  readonly cumulativeRadiation_mSv: number
}

export interface ResourceHistoryPoint {
  readonly missionDay: number
  readonly oxygen_kg: number
  readonly water_kg: number
  readonly food_kg: number
  readonly energy_kWh: number
  readonly cumulativeRadiation_mSv: number
}

export interface SimulationState {
  readonly missionDay: number
  readonly planetId: PlanetId
  readonly crewSize: number
  readonly baseConfig: BaseConfig
  readonly resources: ResourceSnapshot
  readonly seed: number
  readonly activeEventIds: readonly string[]
  readonly faultStates: readonly FaultState[]
  readonly outcome: MissionOutcome
}

// ── Player actions ──

export type PlayerAction =
  | { readonly type: 'ADVANCE_DAY' }
  | { readonly type: 'RESOLVE_EVENT'; readonly eventId: string; readonly choiceId: string }
  | { readonly type: 'EMERGENCY_RATION' }

// ── Results ──

export interface StepExplanation {
  readonly resource: ResourceType | 'radiation'
  readonly delta: number
  readonly reason: string
  readonly scientificNote?: string
}

export interface SimulationResult {
  readonly previousState: SimulationState
  readonly nextState: SimulationState
  readonly newFaultStates: readonly FaultState[]
  readonly triggeredEventIds: readonly string[]
  readonly explanations: readonly StepExplanation[]
}

export interface DecisionLogEntry {
  readonly missionDay: number
  readonly action: PlayerAction
  readonly resultSummary: string
  readonly wasOptimal: boolean
}

export interface MissionScore {
  readonly baseScore: number
  readonly resourceStabilityBonus: number
  readonly decisionQualityBonus: number
  readonly eventsResolvedBonus: number
  readonly criticalFailurePenalty: number
  readonly durationBonus: number
  readonly finalScore: number
  readonly outcome: MissionOutcome
}

// ── Events ──

export interface EventTriggerCondition {
  readonly minDay?: number
  readonly probability: number // 0–1 per day
  readonly maxOccurrences: number
  readonly requiresActiveEvent?: string // only trigger if this event is active
  readonly requiresNoActiveEvent?: string // only trigger if this event is NOT active
}

export interface EventConsequence {
  readonly lifeSupportEfficiencyModifier?: number // additive, e.g. -0.15
  readonly solarFactorModifier?: number // multiplicative, e.g. 0.5
  readonly radiationModifier?: number // additive, e.g. +0.5
  readonly solarPanelAreaLoss_m2?: number // direct reduction
  readonly durationDays?: number // how many days the effect lasts
}

export interface EventChoice {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly consequence: EventConsequence
  readonly isOptimal: boolean
}

export interface EventDefinition {
  readonly id: string
  readonly planetId: PlanetId
  readonly title: string
  readonly description: string // age-appropriate (8–12)
  readonly scientificExplanation: string
  readonly affectedSystems: readonly ResourceType[]
  readonly triggerCondition: EventTriggerCondition
  readonly choices: readonly [EventChoice, EventChoice, ...EventChoice[]] // min 2
}

// ── Result monad ──

export interface SimulationError {
  readonly code: string
  readonly message: string
  readonly context?: Record<string, unknown>
}

export type Result<T, E = SimulationError> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E }

// ── Engine config ──

export interface SimulationEngineConfig {
  readonly planetId: PlanetId
  readonly crewSize: number
  readonly baseConfig: BaseConfig
  readonly seed: number
  readonly initialResources: ResourceSnapshot
  readonly missionDurationDays?: number
}
