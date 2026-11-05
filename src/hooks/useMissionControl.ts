// src/hooks/useMissionControl.ts
// Primary bridge between the React presentation layer and the SimulationEngine.
// All simulation calls flow through this hook.

import { useRef } from 'react'
import { SimulationEngine } from '@simulation/core/simulation-engine'
import { missionStore, useMissionStore } from '@store/mission-store'
import { useAppStore } from '@store/app-store'
import type {
  PlanetId,
  BaseConfig,
  ResourceSnapshot,
  FaultState,
  MissionOutcome,
  DecisionLogEntry,
  MissionScore,
  ResourceHistoryPoint,
} from '@simulation/types'

// ── Return type ───────────────────────────────────────────────────────────────

export interface UseMissionControlReturn {
  // State derived from stores
  readonly selectedPlanetId: PlanetId | null
  readonly crewSize: number
  readonly baseConfig: BaseConfig | null
  readonly missionActive: boolean
  readonly missionStarted: boolean
  readonly currentResources: ResourceSnapshot | null
  readonly currentMissionDay: number
  readonly activeFaultStates: readonly FaultState[]
  readonly activeEventIds: readonly string[]
  readonly missionOutcome: MissionOutcome
  readonly decisionLog: readonly DecisionLogEntry[]
  readonly missionScore: MissionScore | null
  readonly resourceHistory: readonly ResourceHistoryPoint[]
  readonly isLoading: boolean
  readonly globalError: string | null

  // Actions
  initializeMission: () => void
  advanceDay: () => void
  resolveEvent: (eventId: string, choiceId: string) => void
  emergencyRation: () => void
  endMission: () => void
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useMissionControl(): UseMissionControlReturn {
  const engineRef = useRef<SimulationEngine | null>(null)

  // Store state selectors
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const crewSize = useMissionStore((s) => s.crewSize)
  const baseConfig = useMissionStore((s) => s.baseConfig)
  const missionActive = useMissionStore((s) => s.missionActive)
  const missionStarted = useMissionStore((s) => s.missionStarted)
  const currentResources = useMissionStore((s) => s.currentResources)
  const currentMissionDay = useMissionStore((s) => s.currentMissionDay)
  const activeFaultStates = useMissionStore((s) => s.activeFaultStates)
  const activeEventIds = useMissionStore((s) => s.activeEventIds)
  const missionOutcome = useMissionStore((s) => s.missionOutcome)
  const decisionLog = useMissionStore((s) => s.decisionLog)
  const missionScore = useMissionStore((s) => s.missionScore)
  const resourceHistory = useMissionStore((s) => s.resourceHistory)

  const isLoading = useAppStore((s) => s.isLoading)
  const globalError = useAppStore((s) => s.globalError)

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Validates store setup state, creates a new SimulationEngine, and starts
   * the mission. Must be called before advanceDay or resolveEvent.
   */
  function initializeMission(): void {
    const { selectedPlanetId: planet, crewSize: crew, baseConfig: config } =
      missionStore.getState()

    if (planet === null) {
      useAppStore.getState().setGlobalError('No planet selected. Please choose a destination.')
      return
    }
    if (crew === 0) {
      useAppStore.getState().setGlobalError('Crew size must be at least 1.')
      return
    }
    if (config === null) {
      useAppStore.getState().setGlobalError('Base configuration is missing.')
      return
    }

    // Calculate initial resources scaled to crew size and battery capacity
    const initialResources: ResourceSnapshot = {
      oxygen_kg: crew * 0.84 * 30,
      water_kg: crew * 3.0 * 30,
      food_kg: crew * 1.8 * 30,
      energy_kWh: config.batteryCapacity_kWh * 0.8,
      cumulativeRadiation_mSv: 0,
    }

    engineRef.current = new SimulationEngine({
      planetId: planet,
      crewSize: crew,
      baseConfig: config,
      seed: Date.now(),
      initialResources,
    })

    missionStore.getState().startMission()
  }

  /**
   * Advances the simulation by one day. Requires an initialized engine.
   */
  function advanceDay(): void {
    if (engineRef.current === null) {
      useAppStore.getState().setGlobalError('Mission not initialized. Please start the mission first.')
      return
    }

    const result = engineRef.current.step({ type: 'ADVANCE_DAY' })

    if (result.success) {
      missionStore.getState().updateFromSimResult(result.value)
    } else {
      useAppStore.getState().setGlobalError(result.error.message)
    }
  }

  /**
   * Resolves an active event by applying the chosen consequence.
   */
  function resolveEvent(eventId: string, choiceId: string): void {
    if (engineRef.current === null) {
      useAppStore.getState().setGlobalError('Mission not initialized. Please start the mission first.')
      return
    }

    const result = engineRef.current.step({ type: 'RESOLVE_EVENT', eventId, choiceId })

    if (result.success) {
      missionStore.getState().updateFromSimResult(result.value)
    } else {
      useAppStore.getState().setGlobalError(result.error.message)
    }
  }

  /**
   * Applies emergency ration mode for one day (halves food consumption).
   */
  function emergencyRation(): void {
    if (engineRef.current === null) {
      useAppStore.getState().setGlobalError('Mission not initialized. Please start the mission first.')
      return
    }

    const result = engineRef.current.step({ type: 'EMERGENCY_RATION' })

    if (result.success) {
      missionStore.getState().updateFromSimResult(result.value)
    } else {
      useAppStore.getState().setGlobalError(result.error.message)
    }
  }

  /**
   * Ends the mission, calculates the final score, and updates the store
   * with both the score and the full accumulated decision log.
   */
  function endMission(): void {
    if (engineRef.current === null) {
      useAppStore.getState().setGlobalError('Mission not initialized.')
      return
    }

    const score = engineRef.current.getMissionScore()
    const log = engineRef.current.getDecisionLog()
    missionStore.getState().endMission(score, log)
  }

  return {
    selectedPlanetId,
    crewSize,
    baseConfig,
    missionActive,
    missionStarted,
    currentResources,
    currentMissionDay,
    activeFaultStates,
    activeEventIds,
    missionOutcome,
    decisionLog,
    missionScore,
    resourceHistory,
    isLoading,
    globalError,
    initializeMission,
    advanceDay,
    resolveEvent,
    emergencyRation,
    endMission,
  }
}
