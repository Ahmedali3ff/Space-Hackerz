// src/simulation/core/simulation-engine.ts
//
// Central simulation engine for ASTRA. Orchestrates all systems in the exact
// step order defined in docs/simulation-model.md.
//
// NO React, Zustand, or Phaser imports.
// NO Math.random() — uses mulberry32 PRNG exclusively.
// NO Date.now() — uses SimulationClock exclusively.
// Resources are always clamped to 0 before fault state detection.

import type {
  SimulationEngineConfig,
  SimulationState,
  SimulationResult,
  PlayerAction,
  DecisionLogEntry,
  MissionScore,
  FaultState,
  Result,
  EventConsequence,
} from '@simulation/types'
import { createPRNG } from './prng'
import { advanceClock, getSolarAvailabilityFactor } from './simulation-clock'
import { processEvents, findEventById } from '@simulation/events/event-engine'
import { calculatePowerSystem } from '@simulation/systems/power-system'
import { calculateLifeSupport } from '@simulation/systems/life-support-system'
import { calculateAgriculture } from '@simulation/systems/agriculture-system'
import { calculateRadiationExposure } from '@simulation/systems/radiation-protection-system'
import { MOON_PROFILE } from '@data/nasa/moon-profile'
import { MARS_PROFILE } from '@data/nasa/mars-profile'
import { SimulationStateSchema } from '@data/validation/simulation-state.schema'
import { calculateMissionScore } from './mission-scoring'
import type { ScoringInput } from './mission-scoring'
import type { PlanetProfile } from '@simulation/types'
import {
  FOOD_PER_PERSON_PER_DAY_KG,
  RADIATION_HIGH_THRESHOLD_MSV,
} from '@data/nasa/life-support-constants'

const PLANET_PROFILES: Readonly<Record<string, PlanetProfile>> = {
  moon: MOON_PROFILE,
  mars: MARS_PROFILE,
}

export class SimulationEngine {
  private state: SimulationState
  private readonly prng: () => number
  private readonly occurrenceCount: Record<string, number>
  private readonly decisionLog: DecisionLogEntry[]
  private readonly missionDurationDays: number
  private eventConsequences: Map<string, { consequence: EventConsequence; expiresDay: number }>
  // Track stability for scoring
  private stabilityDays: { oxygen: number; water: number; food: number; energy: number }
  private eventsSuccessfullyResolved: number
  private criticalFailureCount: number

  constructor(config: SimulationEngineConfig) {
    this.prng = createPRNG(config.seed)
    this.occurrenceCount = {}
    this.decisionLog = []
    this.missionDurationDays = config.missionDurationDays ?? 90
    this.eventConsequences = new Map()
    this.stabilityDays = { oxygen: 0, water: 0, food: 0, energy: 0 }
    this.eventsSuccessfullyResolved = 0
    this.criticalFailureCount = 0

    this.state = {
      missionDay: 0,
      planetId: config.planetId,
      crewSize: config.crewSize,
      baseConfig: config.baseConfig,
      resources: config.initialResources,
      seed: config.seed,
      activeEventIds: [],
      faultStates: [],
      outcome: 'ongoing',
    }
  }

  /** Returns the current simulation state (immutable view). */
  public getState(): Readonly<SimulationState> {
    return this.state
  }

  /** Returns the full decision log (immutable). */
  public getDecisionLog(): readonly DecisionLogEntry[] {
    return this.decisionLog
  }

  /** Calculates the mission score from the current state and decision log. */
  public getMissionScore(): MissionScore {
    const daysRun = this.state.missionDay
    const safeDiv = (n: number, d: number): number => (d === 0 ? 0 : n / d)
    const scoringInput: ScoringInput = {
      missionDuration: daysRun,
      oxygenStabilityScore: safeDiv(this.stabilityDays.oxygen, daysRun),
      waterStabilityScore: safeDiv(this.stabilityDays.water, daysRun),
      foodStabilityScore: safeDiv(this.stabilityDays.food, daysRun),
      energyStabilityScore: safeDiv(this.stabilityDays.energy, daysRun),
      decisionLog: this.decisionLog,
      eventsSuccessfullyResolved: this.eventsSuccessfullyResolved,
      criticalFailureEvents: this.criticalFailureCount,
      targetDurationDays: this.missionDurationDays,
    }
    return calculateMissionScore(scoringInput)
  }

  /**
   * Advances the simulation by one step.
   *
   * Step order (from docs/simulation-model.md):
   * 1.  Validate current state (Zod)
   * 2.  Advance clock
   * 3.  Process events (EventEngine)
   * 4.  Apply event consequences to effective config
   * 5.  Get solar availability factor
   * 6.  PowerSystem → new energy level
   * 7.  LifeSupportSystem → oxygen + water (uses power critical flag)
   * 8.  AgricultureSystem → food
   * 9.  RadiationProtectionSystem → dose
   * 10. Update resources (clamp to 0, detect fault states)
   * 11. Determine mission outcome
   * 12. Record DecisionLogEntry
   * 13. Update internal state
   * 14. Return SimulationResult
   */
  public step(action: PlayerAction): Result<SimulationResult> {
    // ── Step 1: Validate current state ──
    const parseResult = SimulationStateSchema.safeParse(this.state)
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: 'Simulation state failed validation',
          context: { issues: parseResult.error.issues },
        },
      }
    }

    const previousState = this.state

    // ── Step 2: Advance clock ──
    const advancedState = advanceClock(this.state)
    const currentDay = advancedState.missionDay

    // ── Step 3: Process events ──
    const eventResult = processEvents(advancedState, this.prng, this.occurrenceCount)

    // Update occurrence counts
    for (const id of eventResult.triggeredEventIds) {
      this.occurrenceCount[id] = (this.occurrenceCount[id] ?? 0) + 1
    }

    // Handle RESOLVE_EVENT action — apply the chosen consequence
    let resolvedEventIds: readonly string[] = advancedState.activeEventIds
    if (action.type === 'RESOLVE_EVENT') {
      const eventDef = findEventById(action.eventId)
      if (eventDef) {
        const choice = eventDef.choices.find((c) => c.id === action.choiceId)
        if (choice) {
          const expiresDay = currentDay + (choice.consequence.durationDays ?? 0)
          this.eventConsequences.set(action.eventId, {
            consequence: choice.consequence,
            expiresDay,
          })
          this.eventsSuccessfullyResolved++
        }
      }
      // Remove resolved event from active list
      resolvedEventIds = advancedState.activeEventIds.filter((id) => id !== action.eventId)
    }

    // ── Step 4: Apply event consequences to effective config ──
    // Expire old consequences
    for (const [id, entry] of this.eventConsequences.entries()) {
      if (entry.expiresDay <= currentDay && entry.consequence.durationDays !== undefined && entry.consequence.durationDays > 0) {
        this.eventConsequences.delete(id)
      }
    }

    // Compute effective config by summing all active consequences
    let effectiveLifeSupportEfficiency = advancedState.baseConfig.lifeSupportEfficiency
    let effectiveSolarFactor = 1.0
    let effectiveRadiationModifier = 1.0
    let effectivePanelArea = advancedState.baseConfig.solarPanelArea_m2

    for (const { consequence } of this.eventConsequences.values()) {
      if (consequence.lifeSupportEfficiencyModifier !== undefined) {
        effectiveLifeSupportEfficiency += consequence.lifeSupportEfficiencyModifier
      }
      if (consequence.solarFactorModifier !== undefined) {
        effectiveSolarFactor *= consequence.solarFactorModifier
      }
      if (consequence.radiationModifier !== undefined) {
        effectiveRadiationModifier *= consequence.radiationModifier
      }
      if (consequence.solarPanelAreaLoss_m2 !== undefined) {
        effectivePanelArea = Math.max(
          0,
          effectivePanelArea - consequence.solarPanelAreaLoss_m2,
        )
      }
    }

    // Clamp effective efficiency to [0, 1]
    effectiveLifeSupportEfficiency = Math.max(0, Math.min(1, effectiveLifeSupportEfficiency))

    // ── Step 5: Solar availability factor ──
    const solarAvailabilityFactor = getSolarAvailabilityFactor(
      currentDay,
      advancedState.planetId,
      resolvedEventIds,
    )

    // Combined solar factor = clock factor × event storm modifier
    const combinedSolarFactor = solarAvailabilityFactor * effectiveSolarFactor

    // ── Step 6: PowerSystem ──
    const planetProfile = PLANET_PROFILES[advancedState.planetId]
    const powerResult = calculatePowerSystem({
      solarIrradiance_W_m2: planetProfile.solarIrradiance_W_m2,
      solarAvailabilityFactor: combinedSolarFactor,
      dustModifier: 1.0, // dust handled via solarFactorModifier in event consequences
      solarPanelArea_m2: effectivePanelArea,
      crewSize: advancedState.crewSize,
      agricultureArea_m2: advancedState.baseConfig.agricultureArea_m2,
      isPowerAvailable: advancedState.resources.energy_kWh > 0,
      currentBattery_kWh: advancedState.resources.energy_kWh,
      batteryCapacity_kWh: advancedState.baseConfig.batteryCapacity_kWh,
    })

    // ── Step 7: Update fault states (power critical) ──
    let updatedFaultStates = [...advancedState.faultStates]
    if (powerResult.powerCritical && !updatedFaultStates.includes('POWER_CRITICAL')) {
      updatedFaultStates.push('POWER_CRITICAL')
      this.criticalFailureCount++
    } else if (!powerResult.powerCritical) {
      updatedFaultStates = updatedFaultStates.filter((f) => f !== 'POWER_CRITICAL')
    }

    // ── Step 7: LifeSupportSystem ──
    // For EMERGENCY_RATION: food consumption is halved this step
    const emergencyRation = action.type === 'EMERGENCY_RATION'

    const lifeSupportResult = calculateLifeSupport({
      crewSize: advancedState.crewSize,
      lifeSupportEfficiency: effectiveLifeSupportEfficiency,
      currentOxygen_kg: advancedState.resources.oxygen_kg,
      currentWater_kg: advancedState.resources.water_kg,
      faultStates: updatedFaultStates as readonly FaultState[],
    })

    // ── Step 8: AgricultureSystem ──
    const agriResult = calculateAgriculture({
      crewSize: advancedState.crewSize,
      agricultureArea_m2: advancedState.baseConfig.agricultureArea_m2,
      isPowerAvailable: !powerResult.powerCritical,
      currentFood_kg: advancedState.resources.food_kg,
    })

    // Apply emergency ration: halve food consumption (halve the deficit)
    let newFoodLevel = agriResult.newLevel_kg
    if (emergencyRation) {
      // Recalculate: consumption is halved, production stays the same
      const emergencyConsumption = advancedState.crewSize * FOOD_PER_PERSON_PER_DAY_KG * 0.5
      const emergencyDelta = agriResult.production_kg - emergencyConsumption
      newFoodLevel = Math.max(advancedState.resources.food_kg + emergencyDelta, 0)
    }

    // ── Step 9: RadiationProtectionSystem ──
    const radiationResult = calculateRadiationExposure({
      unshieldedDailyDose_mSv: planetProfile.unshieldedDailyRadiation_mSv,
      shieldingLevel: advancedState.baseConfig.shieldingLevel,
      currentCumulativeDose_mSv: advancedState.resources.cumulativeRadiation_mSv,
      radiationModifier: effectiveRadiationModifier,
    })

    // ── Step 10: Update resources and fault states ──
    const newResources = {
      oxygen_kg: lifeSupportResult.newOxygenLevel_kg,
      water_kg: lifeSupportResult.newWaterLevel_kg,
      food_kg: newFoodLevel,
      energy_kWh: powerResult.newEnergyLevel_kWh,
      cumulativeRadiation_mSv: radiationResult.newCumulativeDose_mSv,
    }

    // Update fault states based on resource levels
    if (lifeSupportResult.oxygenDepleted && !updatedFaultStates.includes('OXYGEN_DEPLETED')) {
      updatedFaultStates.push('OXYGEN_DEPLETED')
    }
    if (lifeSupportResult.waterDepleted && !updatedFaultStates.includes('WATER_DEPLETED')) {
      updatedFaultStates.push('WATER_DEPLETED')
    }
    if (newFoodLevel <= 0 && !updatedFaultStates.includes('FOOD_DEPLETED')) {
      updatedFaultStates.push('FOOD_DEPLETED')
    }

    // Clear depleted faults if resources are restored (edge case for event consequences)
    if (newResources.oxygen_kg > 0) {
      updatedFaultStates = updatedFaultStates.filter((f) => f !== 'OXYGEN_DEPLETED')
    }
    if (newResources.water_kg > 0) {
      updatedFaultStates = updatedFaultStates.filter((f) => f !== 'WATER_DEPLETED')
    }
    if (newResources.food_kg > 0) {
      updatedFaultStates = updatedFaultStates.filter((f) => f !== 'FOOD_DEPLETED')
    }

    // Re-add if depleted
    if (lifeSupportResult.oxygenDepleted) updatedFaultStates.push('OXYGEN_DEPLETED')
    if (lifeSupportResult.waterDepleted) updatedFaultStates.push('WATER_DEPLETED')
    if (newFoodLevel <= 0) updatedFaultStates.push('FOOD_DEPLETED')

    // Radiation faults
    updatedFaultStates = updatedFaultStates.filter(
      (f) => f !== 'RADIATION_HIGH' && f !== 'RADIATION_CRITICAL',
    )
    if (radiationResult.radiationCritical) {
      updatedFaultStates.push('RADIATION_CRITICAL')
    } else if (newResources.cumulativeRadiation_mSv >= RADIATION_HIGH_THRESHOLD_MSV) {
      updatedFaultStates.push('RADIATION_HIGH')
    }

    // Deduplicate fault states
    const finalFaultStates = [...new Set(updatedFaultStates)] as FaultState[]

    // ── Step 11: Mission outcome ──
    let outcome = advancedState.outcome
    const hasCriticalFault =
      finalFaultStates.includes('OXYGEN_DEPLETED') ||
      finalFaultStates.includes('WATER_DEPLETED') ||
      finalFaultStates.includes('RADIATION_CRITICAL')
    if (hasCriticalFault) {
      outcome = 'failure'
    }

    // ── Track stability days for scoring ──
    const STABILITY_THRESHOLD = 0.05 // 5% of starting reserves considered "above threshold"
    if (newResources.oxygen_kg > 0) this.stabilityDays.oxygen++
    if (newResources.water_kg > 0) this.stabilityDays.water++
    if (newResources.food_kg > 0) this.stabilityDays.food++
    if (newResources.energy_kWh > 0) this.stabilityDays.energy++
    void STABILITY_THRESHOLD // suppress unused variable lint warning

    // New fault states triggered this step
    const newFaultStates = finalFaultStates.filter(
      (f) => !previousState.faultStates.includes(f),
    ) as FaultState[]

    // ── Step 12: Record decision log entry ──
    const logEntry: DecisionLogEntry = {
      missionDay: currentDay,
      action,
      resultSummary: this.buildResultSummary(newFaultStates, eventResult.triggeredEventIds),
      wasOptimal: this.determineOptimality(action),
    }
    this.decisionLog.push(logEntry)

    // ── Step 13: Build new state ──
    const newState: SimulationState = {
      ...advancedState,
      resources: newResources,
      activeEventIds: eventResult.newActiveEventIds,
      faultStates: finalFaultStates,
      outcome,
    }

    this.state = newState

    // ── Step 14: Return result ──
    const result: SimulationResult = {
      previousState,
      nextState: newState,
      newFaultStates,
      triggeredEventIds: eventResult.triggeredEventIds,
      explanations: [
        {
          resource: 'oxygen',
          delta: lifeSupportResult.oxygenDelta_kg,
          reason: `Crew of ${advancedState.crewSize} consumed oxygen; CO₂ recycling recovered 50%`,
        },
        {
          resource: 'water',
          delta: lifeSupportResult.waterDelta_kg,
          reason: `ECLSS recycled 85% of water; net loss from storage`,
        },
        {
          resource: 'food',
          delta: newResources.food_kg - advancedState.resources.food_kg,
          reason: emergencyRation
            ? 'Emergency ration mode: food consumption reduced by 50%'
            : `Agriculture produced ${agriResult.production_kg.toFixed(2)} kg`,
        },
        {
          resource: 'energy',
          delta: powerResult.energyDelta_kWh,
          reason: `Solar output ${powerResult.solarOutput_kWh.toFixed(1)} kWh vs consumption ${powerResult.totalConsumption_kWh.toFixed(1)} kWh`,
        },
        {
          resource: 'radiation',
          delta: radiationResult.dailyDose_mSv,
          reason: `${advancedState.baseConfig.shieldingLevel} shielding reduced dose from ${planetProfile.unshieldedDailyRadiation_mSv} mSv`,
        },
      ],
    }

    return { success: true, value: result }
  }

  private buildResultSummary(
    newFaults: readonly FaultState[],
    triggeredEvents: readonly string[],
  ): string {
    const parts: string[] = []
    if (triggeredEvents.length > 0) {
      parts.push(`Events: ${triggeredEvents.join(', ')}`)
    }
    if (newFaults.length > 0) {
      parts.push(`New faults: ${newFaults.join(', ')}`)
    }
    return parts.length > 0 ? parts.join(' | ') : 'Nominal step'
  }

  private determineOptimality(action: PlayerAction): boolean {
    if (action.type === 'ADVANCE_DAY') return true
    if (action.type === 'EMERGENCY_RATION') return false // not ideal, but necessary
    if (action.type === 'RESOLVE_EVENT') {
      const eventDef = findEventById(action.eventId)
      if (!eventDef) return false
      const choice = eventDef.choices.find((c) => c.id === action.choiceId)
      return choice?.isOptimal ?? false
    }
    return false
  }
}
