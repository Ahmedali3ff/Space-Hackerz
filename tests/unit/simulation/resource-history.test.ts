// tests/unit/simulation/resource-history.test.ts
// Unit tests for ResourceHistoryPoint tracking in the mission store.

import { describe, it, expect, beforeEach } from 'vitest'
import { missionStore, INITIAL_MISSION_STATE } from '@store/mission-store'
import type { BaseConfig, ResourceSnapshot, SimulationResult, SimulationState } from '@simulation/types'

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
    missionDay: 1,
    planetId: 'moon',
    crewSize: 4,
    baseConfig: mockBaseConfig,
    resources: mockResources,
    seed: 42,
    activeEventIds: [],
    faultStates: [],
    outcome: 'ongoing',
  }
  return { ...base, ...overrides }
}

function buildMockSimResult(day: number, resources: ResourceSnapshot = mockResources): SimulationResult {
  return {
    previousState: buildMockSimState({ missionDay: day - 1 }),
    nextState: buildMockSimState({ missionDay: day, resources }),
    newFaultStates: [],
    triggeredEventIds: [],
    explanations: [],
  }
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('resourceHistory in missionStore', () => {
  beforeEach(() => {
    missionStore.setState({ ...INITIAL_MISSION_STATE })
  })

  it('resourceHistory starts empty in INITIAL_MISSION_STATE', () => {
    expect(INITIAL_MISSION_STATE.resourceHistory).toEqual([])
    expect(INITIAL_MISSION_STATE.resourceHistory.length).toBe(0)
  })

  it('each updateFromSimResult call appends one entry', () => {
    missionStore.getState().updateFromSimResult(buildMockSimResult(1))
    expect(missionStore.getState().resourceHistory.length).toBe(1)
    missionStore.getState().updateFromSimResult(buildMockSimResult(2))
    expect(missionStore.getState().resourceHistory.length).toBe(2)
  })

  it('calling updateFromSimResult three times yields length 3', () => {
    missionStore.getState().updateFromSimResult(buildMockSimResult(1))
    missionStore.getState().updateFromSimResult(buildMockSimResult(2))
    missionStore.getState().updateFromSimResult(buildMockSimResult(3))
    expect(missionStore.getState().resourceHistory.length).toBe(3)
  })

  it('entries preserve missionDay order [1, 2, 3]', () => {
    missionStore.getState().updateFromSimResult(buildMockSimResult(1))
    missionStore.getState().updateFromSimResult(buildMockSimResult(2))
    missionStore.getState().updateFromSimResult(buildMockSimResult(3))
    const days = missionStore.getState().resourceHistory.map((p) => p.missionDay)
    expect(days).toEqual([1, 2, 3])
  })

  it('entry values match nextState resources exactly', () => {
    const specificResources: ResourceSnapshot = {
      oxygen_kg: 88.5,
      water_kg: 320.0,
      food_kg: 180.0,
      energy_kWh: 140.5,
      cumulativeRadiation_mSv: 5.2,
    }
    missionStore.getState().updateFromSimResult(buildMockSimResult(1, specificResources))
    const entry = missionStore.getState().resourceHistory[0]
    expect(entry.missionDay).toBe(1)
    expect(entry.oxygen_kg).toBe(specificResources.oxygen_kg)
    expect(entry.water_kg).toBe(specificResources.water_kg)
    expect(entry.food_kg).toBe(specificResources.food_kg)
    expect(entry.energy_kWh).toBe(specificResources.energy_kWh)
    expect(entry.cumulativeRadiation_mSv).toBe(specificResources.cumulativeRadiation_mSv)
  })

  it('resetMission empties resourceHistory', () => {
    missionStore.getState().updateFromSimResult(buildMockSimResult(1))
    missionStore.getState().updateFromSimResult(buildMockSimResult(2))
    missionStore.getState().updateFromSimResult(buildMockSimResult(3))
    expect(missionStore.getState().resourceHistory.length).toBe(3)
    missionStore.getState().resetMission()
    expect(missionStore.getState().resourceHistory).toEqual([])
  })
})
