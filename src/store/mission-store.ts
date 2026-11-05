// src/store/mission-store.ts
// Zustand store for mission-level application state.
// Simulation state lives in the SimulationEngine — this store holds
// a snapshot of the most recent step result plus setup choices.

import { createStore, useStore } from 'zustand'
import type {
  PlanetId,
  BaseConfig,
  ResourceSnapshot,
  FaultState,
  MissionOutcome,
  DecisionLogEntry,
  MissionScore,
  SimulationResult,
} from '@simulation/types'

// ── State shape ──────────────────────────────────────────────────────────────

export interface MissionState {
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
}

// ── Actions shape ────────────────────────────────────────────────────────────

export interface MissionActions {
  selectPlanet: (planetId: PlanetId) => void
  setCrewSize: (crewSize: number) => void
  setBaseConfig: (config: BaseConfig) => void
  startMission: () => void
  updateFromSimResult: (result: SimulationResult) => void
  endMission: (score: MissionScore) => void
  resetMission: () => void
}

export type MissionStore = MissionState & MissionActions

// ── Initial state ────────────────────────────────────────────────────────────

export const INITIAL_MISSION_STATE: MissionState = {
  selectedPlanetId: null,
  crewSize: 0,
  baseConfig: null,
  missionActive: false,
  missionStarted: false,
  currentResources: null,
  currentMissionDay: 0,
  activeFaultStates: [],
  activeEventIds: [],
  missionOutcome: 'ongoing',
  decisionLog: [],
  missionScore: null,
}

// ── Raw store (for tests and external resets) ────────────────────────────────

export const missionStore = createStore<MissionStore>()((set) => ({
  ...INITIAL_MISSION_STATE,

  selectPlanet: (planetId: PlanetId): void => {
    set({ selectedPlanetId: planetId })
  },

  setCrewSize: (crewSize: number): void => {
    set({ crewSize })
  },

  setBaseConfig: (config: BaseConfig): void => {
    set({ baseConfig: config })
  },

  startMission: (): void => {
    set({ missionActive: true, missionStarted: true })
  },

  updateFromSimResult: (result: SimulationResult): void => {
    set({
      currentResources: result.nextState.resources,
      currentMissionDay: result.nextState.missionDay,
      activeFaultStates: result.nextState.faultStates,
      activeEventIds: result.nextState.activeEventIds,
      missionOutcome: result.nextState.outcome,
      // The engine owns the decision log; the store snapshot is updated by
      // endMission when the hook calls it with the full log.
      decisionLog: [],
    })
  },

  endMission: (score: MissionScore): void => {
    set({ missionActive: false, missionScore: score })
  },

  resetMission: (): void => {
    set({ ...INITIAL_MISSION_STATE })
  },
}))

// ── Bound hook ───────────────────────────────────────────────────────────────

export function useMissionStore<T>(selector: (state: MissionStore) => T): T {
  return useStore(missionStore, selector)
}
