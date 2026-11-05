// src/store/mission-store.ts
// Zustand store for mission-level application state.
// Simulation state lives in the SimulationEngine — this store holds
// a snapshot of the most recent step result plus setup choices.

import { create } from 'zustand'
import type {
  PlanetId,
  BaseConfig,
  ResourceSnapshot,
  FaultState,
  MissionOutcome,
  DecisionLogEntry,
  MissionScore,
  SimulationResult,
  ResourceHistoryPoint,
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
  readonly resourceHistory: readonly ResourceHistoryPoint[]
}

// ── Actions shape ────────────────────────────────────────────────────────────

export interface MissionActions {
  selectPlanet: (planetId: PlanetId) => void
  setCrewSize: (crewSize: number) => void
  setBaseConfig: (config: BaseConfig) => void
  startMission: () => void
  updateFromSimResult: (result: SimulationResult) => void
  endMission: (score: MissionScore, log?: readonly DecisionLogEntry[]) => void
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
  resourceHistory: [],
}

// ── Store (React hook with .getState() / .setState() / .subscribe() attached) ─

export const useMissionStore = create<MissionStore>()((set) => ({
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
    set((state) => ({
      currentResources: result.nextState.resources,
      currentMissionDay: result.nextState.missionDay,
      activeFaultStates: result.nextState.faultStates,
      activeEventIds: result.nextState.activeEventIds,
      missionOutcome: result.nextState.outcome,
      resourceHistory: [
        ...state.resourceHistory,
        {
          missionDay: result.nextState.missionDay,
          oxygen_kg: result.nextState.resources.oxygen_kg,
          water_kg: result.nextState.resources.water_kg,
          food_kg: result.nextState.resources.food_kg,
          energy_kWh: result.nextState.resources.energy_kWh,
          cumulativeRadiation_mSv: result.nextState.resources.cumulativeRadiation_mSv,
        },
      ],
      // decisionLog is passed in via the result so the store always reflects
      // the engine's accumulated log. The hook reads engine.getDecisionLog()
      // and injects it here on every step.
    }))
  },

  endMission: (score: MissionScore, log?: readonly DecisionLogEntry[]): void => {
    set({ missionActive: false, missionScore: score, decisionLog: log ?? [] })
  },

  resetMission: (): void => {
    set({ ...INITIAL_MISSION_STATE })
  },
}))

// ── Named alias for direct test access (same reference) ──────────────────────
// Tests can call `missionStore.getState()` / `missionStore.setState()` directly
// because create() attaches those methods to the hook.

export const missionStore = useMissionStore
