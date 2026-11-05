// tests/unit/hooks/useMissionControl.failure.test.ts
// Tests the engine failure-Result path in useMissionControl.
// Uses vi.mock to force SimulationEngine.step() to return { success: false }
// and verifies that globalError is populated via setGlobalError(result.error.message).
//
// NOTE: vi.mock is hoisted to the top of the file by Vitest, so all tests in
// this file use the mocked engine. Real-engine tests live in
// useMissionControl.test.ts.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { missionStore, INITIAL_MISSION_STATE } from '@store/mission-store'
import { useAppStore } from '@store/app-store'
import type { BaseConfig } from '@simulation/types'

// ── Module-level mock (hoisted by Vitest) ─────────────────────────────────
// All step() calls return { success: false } with a known error message.

vi.mock('@simulation/core/simulation-engine', () => ({
  SimulationEngine: vi.fn().mockImplementation(() => ({
    step: vi.fn().mockReturnValue({
      success: false,
      error: { code: 'SIM_FAILURE', message: 'simulated engine error', context: {} },
    }),
    getState: vi.fn().mockReturnValue({
      missionDay: 0,
      planetId: 'moon',
      crewSize: 4,
      baseConfig: {
        solarPanelArea_m2: 60,
        batteryCapacity_kWh: 200,
        agricultureArea_m2: 12,
        shieldingLevel: 'medium',
        lifeSupportEfficiency: 1.0,
      },
      resources: {
        oxygen_kg: 100,
        water_kg: 360,
        food_kg: 216,
        energy_kWh: 160,
        cumulativeRadiation_mSv: 0,
      },
      activeEventIds: [],
      faultStates: [],
      outcome: 'ongoing',
      seed: 0,
    }),
    getMissionScore: vi.fn().mockReturnValue({
      baseScore: 0,
      resourceStabilityBonus: 0,
      decisionQualityBonus: 0,
      eventsResolvedBonus: 0,
      criticalFailurePenalty: 0,
      finalScore: 0,
      outcome: 'failure',
    }),
  })),
}))

// ── Helpers ───────────────────────────────────────────────────────────────

const mockBaseConfig: BaseConfig = {
  solarPanelArea_m2: 60,
  batteryCapacity_kWh: 200,
  agricultureArea_m2: 12,
  shieldingLevel: 'medium',
  lifeSupportEfficiency: 1.0,
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('useMissionControl — engine failure Result path', () => {
  beforeEach(() => {
    missionStore.setState({
      ...INITIAL_MISSION_STATE,
      selectedPlanetId: 'moon',
      crewSize: 4,
      baseConfig: mockBaseConfig,
    })
    useAppStore.setState({
      isLoading: false,
      globalError: null,
      astroAIPanelOpen: false,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('advanceDay sets globalError when engine step returns failure Result', () => {
    const { result } = renderHook(() => useMissionControl())

    act(() => {
      result.current.initializeMission()
    })

    act(() => {
      result.current.advanceDay()
    })

    expect(useAppStore.getState().globalError).toBe('simulated engine error')
  })

  it('resolveEvent sets globalError when engine step returns failure Result', () => {
    const { result } = renderHook(() => useMissionControl())

    act(() => {
      result.current.initializeMission()
    })

    act(() => {
      result.current.resolveEvent('some_event', 'choice_a')
    })

    expect(useAppStore.getState().globalError).toBe('simulated engine error')
  })

  it('emergencyRation sets globalError when engine step returns failure Result', () => {
    const { result } = renderHook(() => useMissionControl())

    act(() => {
      result.current.initializeMission()
    })

    act(() => {
      result.current.emergencyRation()
    })

    expect(useAppStore.getState().globalError).toBe('simulated engine error')
  })
})
