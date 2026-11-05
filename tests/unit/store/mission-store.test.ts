// tests/unit/store/mission-store.test.ts
// Unit tests for the Zustand mission store.

import { describe, it, expect, beforeEach } from 'vitest'
import { missionStore, INITIAL_MISSION_STATE } from '@store/mission-store'
import type { BaseConfig, SimulationResult, SimulationState, ResourceSnapshot } from '@simulation/types'

// ── Helpers ────────────────────────────────────────────────────────────────

const mockBaseConfig: BaseConfig = {
  solarPanelArea_m2: 60,
  batteryCapacity_kWh: 200,
  agricultureArea_m2: 12,
  shieldingLevel: 'medium',
  lifeSupportEfficiency: 1.0,
}

const mockResources: ResourceSnapshot = {
  oxygen_kg: 100,
  water_kg: 360,
  food_kg: 216,
  energy_kWh: 160,
  cumulativeRadiation_mSv: 2,
}

function buildMockSimState(overrides: Partial<SimulationState> = {}): SimulationState {
  const base: SimulationState = {
    missionDay: 3,
    planetId: 'moon',
    crewSize: 4,
    baseConfig: mockBaseConfig,
    resources: mockResources,
    seed: 12345,
    activeEventIds: ['LUNAR_DUST_STORM'],
    faultStates: [],
    outcome: 'ongoing',
  }
  return { ...base, ...overrides }
}

function buildMockSimResult(overrides: Partial<SimulationState> = {}): SimulationResult {
  const nextState = buildMockSimState(overrides)
  return {
    previousState: buildMockSimState({ missionDay: 2 }),
    nextState,
    newFaultStates: [],
    triggeredEventIds: [],
    explanations: [],
  }
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('missionStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    missionStore.setState({ ...INITIAL_MISSION_STATE })
  })

  it('selectPlanet sets selectedPlanetId', () => {
    missionStore.getState().selectPlanet('moon')
    expect(missionStore.getState().selectedPlanetId).toBe('moon')
  })

  it('selectPlanet can be updated to mars', () => {
    missionStore.getState().selectPlanet('moon')
    missionStore.getState().selectPlanet('mars')
    expect(missionStore.getState().selectedPlanetId).toBe('mars')
  })

  it('setCrewSize sets crewSize', () => {
    missionStore.getState().setCrewSize(4)
    expect(missionStore.getState().crewSize).toBe(4)
  })

  it('setBaseConfig sets baseConfig correctly', () => {
    missionStore.getState().setBaseConfig(mockBaseConfig)
    expect(missionStore.getState().baseConfig).toEqual(mockBaseConfig)
  })

  it('startMission sets missionActive and missionStarted to true', () => {
    missionStore.getState().startMission()
    expect(missionStore.getState().missionActive).toBe(true)
    expect(missionStore.getState().missionStarted).toBe(true)
  })

  it('resetMission restores all fields to initial values', () => {
    // Set up some state first
    missionStore.getState().selectPlanet('mars')
    missionStore.getState().setCrewSize(6)
    missionStore.getState().setBaseConfig(mockBaseConfig)
    missionStore.getState().startMission()
    missionStore.getState().setInitialResources(mockResources)
    missionStore.getState().updateFromSimResult(buildMockSimResult())

    // Reset
    missionStore.getState().resetMission()

    const state = missionStore.getState()
    expect(state.selectedPlanetId).toBeNull()
    expect(state.crewSize).toBe(0)
    expect(state.baseConfig).toBeNull()
    expect(state.missionActive).toBe(false)
    expect(state.missionStarted).toBe(false)
    expect(state.initialResources).toBeNull()
    expect(state.currentResources).toBeNull()
    expect(state.currentMissionDay).toBe(0)
    expect(state.activeFaultStates).toEqual([])
    expect(state.activeEventIds).toEqual([])
    expect(state.missionOutcome).toBe('ongoing')
    expect(state.decisionLog).toEqual([])
    expect(state.missionScore).toBeNull()
    expect(state.resourceHistory).toEqual([])
  })

  it('updateFromSimResult updates currentResources', () => {
    const mockResult = buildMockSimResult()
    missionStore.getState().updateFromSimResult(mockResult)
    expect(missionStore.getState().currentResources).toEqual(mockResources)
  })

  it('updateFromSimResult updates currentMissionDay', () => {
    const mockResult = buildMockSimResult({ missionDay: 7 })
    missionStore.getState().updateFromSimResult(mockResult)
    expect(missionStore.getState().currentMissionDay).toBe(7)
  })

  it('updateFromSimResult updates activeFaultStates', () => {
    const mockResult = buildMockSimResult({ faultStates: ['POWER_CRITICAL'] })
    missionStore.getState().updateFromSimResult(mockResult)
    expect(missionStore.getState().activeFaultStates).toEqual(['POWER_CRITICAL'])
  })

  it('updateFromSimResult updates activeEventIds', () => {
    const mockResult = buildMockSimResult({ activeEventIds: ['LUNAR_DUST_STORM'] })
    missionStore.getState().updateFromSimResult(mockResult)
    expect(missionStore.getState().activeEventIds).toEqual(['LUNAR_DUST_STORM'])
  })

  it('updateFromSimResult updates missionOutcome', () => {
    const mockResult = buildMockSimResult({ outcome: 'failure' })
    missionStore.getState().updateFromSimResult(mockResult)
    expect(missionStore.getState().missionOutcome).toBe('failure')
  })

  it('endMission sets missionActive to false and stores score', () => {
    missionStore.getState().startMission()
    const score = {
      baseScore: 500,
      resourceStabilityBonus: 100,
      decisionQualityBonus: 50,
      eventsResolvedBonus: 75,
      criticalFailurePenalty: 0,
      finalScore: 725,
      outcome: 'success' as const,
    }
    missionStore.getState().endMission(score, [])
    expect(missionStore.getState().missionActive).toBe(false)
    expect(missionStore.getState().missionScore).toEqual(score)
    expect(missionStore.getState().decisionLog).toEqual([])
  })

  it('INITIAL_MISSION_STATE has empty resourceHistory array', () => {
    expect(INITIAL_MISSION_STATE.resourceHistory).toEqual([])
  })

  it('updateFromSimResult appends to resourceHistory', () => {
    const result1 = buildMockSimResult({ missionDay: 1 })
    const result2 = buildMockSimResult({ missionDay: 2 })
    missionStore.getState().updateFromSimResult(result1)
    missionStore.getState().updateFromSimResult(result2)
    const { resourceHistory } = missionStore.getState()
    expect(resourceHistory.length).toBe(2)
    expect(resourceHistory[0].missionDay).toBe(1)
    expect(resourceHistory[1].missionDay).toBe(2)
  })

  it('updateFromSimResult with decisionLog sets decisionLog on state', () => {
    const mockLog = [
      {
        missionDay: 1,
        action: { type: 'ADVANCE_DAY' as const },
        resultSummary: 'Day advanced normally.',
        wasOptimal: true,
      },
    ]
    const mockResult = buildMockSimResult()
    missionStore.getState().updateFromSimResult(mockResult, mockLog)
    expect(missionStore.getState().decisionLog).toEqual(mockLog)
  })

  it('updateFromSimResult without decisionLog does not clear existing decisionLog', () => {
    const mockLog = [
      {
        missionDay: 1,
        action: { type: 'ADVANCE_DAY' as const },
        resultSummary: 'Day advanced normally.',
        wasOptimal: true,
      },
    ]
    // First call with log to populate it
    missionStore.getState().updateFromSimResult(buildMockSimResult(), mockLog)
    expect(missionStore.getState().decisionLog).toHaveLength(1)
    // Second call without log — should NOT clear decisionLog
    missionStore.getState().updateFromSimResult(buildMockSimResult({ missionDay: 4 }))
    expect(missionStore.getState().decisionLog).toHaveLength(1)
  })

  it('setInitialResources sets initialResources on state', () => {
    missionStore.getState().setInitialResources(mockResources)
    expect(missionStore.getState().initialResources).toEqual(mockResources)
  })

  it('resetMission clears initialResources to null', () => {
    missionStore.getState().setInitialResources(mockResources)
    expect(missionStore.getState().initialResources).not.toBeNull()
    missionStore.getState().resetMission()
    expect(missionStore.getState().initialResources).toBeNull()
  })
})
