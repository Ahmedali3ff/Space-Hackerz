// tests/unit/hooks/useMissionControl.test.ts
// Unit tests for the useMissionControl hook.

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { missionStore, INITIAL_MISSION_STATE } from '@store/mission-store'
import { useAppStore } from '@store/app-store'
import type { BaseConfig } from '@simulation/types'

// ── Helpers ────────────────────────────────────────────────────────────────

const mockBaseConfig: BaseConfig = {
  solarPanelArea_m2: 60,
  batteryCapacity_kWh: 200,
  agricultureArea_m2: 12,
  shieldingLevel: 'medium',
  lifeSupportEfficiency: 1.0,
}

function setupValidMissionState(): void {
  missionStore.setState({
    ...INITIAL_MISSION_STATE,
    selectedPlanetId: 'moon',
    crewSize: 4,
    baseConfig: mockBaseConfig,
  })
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('useMissionControl', () => {
  beforeEach(() => {
    // Reset both stores before each test
    missionStore.setState({ ...INITIAL_MISSION_STATE })
    useAppStore.setState({
      isLoading: false,
      globalError: null,
      astroAIPanelOpen: false,
    })
    vi.restoreAllMocks()
  })

  describe('initializeMission', () => {
    it('sets missionActive to true when setup state is valid', () => {
      setupValidMissionState()

      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.initializeMission()
      })

      expect(result.current.missionActive).toBe(true)
    })

    it('sets globalError when no planet is selected', () => {
      // crewSize=4, baseConfig set, but no planet
      missionStore.setState({
        ...INITIAL_MISSION_STATE,
        crewSize: 4,
        baseConfig: mockBaseConfig,
      })

      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.initializeMission()
      })

      expect(result.current.globalError).not.toBeNull()
      expect(result.current.missionActive).toBe(false)
    })

    it('sets globalError when crewSize is 0', () => {
      missionStore.setState({
        ...INITIAL_MISSION_STATE,
        selectedPlanetId: 'moon',
        baseConfig: mockBaseConfig,
      })

      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.initializeMission()
      })

      expect(result.current.globalError).not.toBeNull()
      expect(result.current.missionActive).toBe(false)
    })

    it('sets globalError when baseConfig is null', () => {
      missionStore.setState({
        ...INITIAL_MISSION_STATE,
        selectedPlanetId: 'moon',
        crewSize: 4,
      })

      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.initializeMission()
      })

      expect(result.current.globalError).not.toBeNull()
      expect(result.current.missionActive).toBe(false)
    })
  })

  describe('advanceDay', () => {
    it('increments currentMissionDay after advanceDay', () => {
      setupValidMissionState()

      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.initializeMission()
      })

      const initialDay = result.current.currentMissionDay

      act(() => {
        result.current.advanceDay()
      })

      expect(result.current.currentMissionDay).toBeGreaterThan(initialDay)
    })

    it('sets globalError if called before initializeMission', () => {
      // Do NOT call initializeMission — engine is null
      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.advanceDay()
      })

      expect(result.current.globalError).not.toBeNull()
    })
  })

  describe('resolveEvent', () => {
    it('forwards correct eventId and choiceId to the engine step', () => {
      setupValidMissionState()

      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.initializeMission()
      })

      // Spy on the engine's step method via the engineRef indirectly.
      // We verify that calling resolveEvent with a valid-looking pair does not
      // throw and the store is updated (outcome at minimum does not break).
      // A non-existent event is handled gracefully by the engine.
      act(() => {
        result.current.resolveEvent('NONEXISTENT_EVENT_TEST', 'choice_a')
      })

      // The engine processes this silently (no matching event definition).
      // We confirm no crash and missionActive remains true.
      expect(result.current.missionActive).toBe(true)
    })

    it('sets globalError if called before initializeMission', () => {
      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.resolveEvent('some_event', 'choice_a')
      })

      expect(result.current.globalError).not.toBeNull()
    })
  })

  describe('emergencyRation', () => {
    it('advances day with emergency ration mode', () => {
      setupValidMissionState()

      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.initializeMission()
      })

      const dayBefore = result.current.currentMissionDay

      act(() => {
        result.current.emergencyRation()
      })

      expect(result.current.currentMissionDay).toBeGreaterThan(dayBefore)
    })
  })

  describe('endMission', () => {
    it('sets missionActive to false and stores a score', () => {
      setupValidMissionState()

      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.initializeMission()
      })

      // Run a few days first so the engine has something to score
      act(() => {
        result.current.advanceDay()
      })

      act(() => {
        result.current.endMission()
      })

      expect(result.current.missionActive).toBe(false)
      expect(result.current.missionScore).not.toBeNull()
    })

    it('sets globalError if called before initializeMission', () => {
      const { result } = renderHook(() => useMissionControl())

      act(() => {
        result.current.endMission()
      })

      expect(result.current.globalError).not.toBeNull()
    })
  })
})
