// tests/unit/store/mission-progress-store.test.ts
// Unit tests for useMissionProgressStore — covers initial state, CRUD actions,
// mission unlock chain, and resetProgress.

import { describe, it, expect, beforeEach } from 'vitest'
import {
  useMissionProgressStore,
  INITIAL_PROGRESS_STATE,
} from '@store/mission-progress-store'
import { getMissionById } from '@data/missions/mission-definitions'

// ── Reset helper ────────────────────────────────────────────────────────────
// Clear localStorage so persist middleware does not hydrate stale state, then
// reset the in-memory Zustand state to a known initial shape.

beforeEach(() => {
  localStorage.clear()
  // Spread produces a shallow copy of the state shape; missions is replaced wholesale.
  useMissionProgressStore.setState({
    ...INITIAL_PROGRESS_STATE,
    // Rebuild missions fresh so each test starts from a clean slate
    missions: Object.fromEntries(
      Object.entries(INITIAL_PROGRESS_STATE.missions).map(([k, v]) => [k, { ...v }]),
    ),
    commanderName: '',
    totalStars: 0,
    currentMissionId: 'm01',
  })
})

// ── Initial state ───────────────────────────────────────────────────────────

describe('useMissionProgressStore — initial state', () => {
  it('initial state has m01 active', () => {
    const { getMissionStatus } = useMissionProgressStore.getState()
    expect(getMissionStatus('m01')).toBe('active')
  })

  it('initial state has m02 locked', () => {
    const { getMissionStatus } = useMissionProgressStore.getState()
    expect(getMissionStatus('m02')).toBe('locked')
  })

  it('initial state has m03 locked', () => {
    const { getMissionStatus } = useMissionProgressStore.getState()
    expect(getMissionStatus('m03')).toBe('locked')
  })

  it('initial state has m04 locked', () => {
    const { getMissionStatus } = useMissionProgressStore.getState()
    expect(getMissionStatus('m04')).toBe('locked')
  })

  it('initial state has m05 locked', () => {
    const { getMissionStatus } = useMissionProgressStore.getState()
    expect(getMissionStatus('m05')).toBe('locked')
  })

  it('initial state has m06 locked', () => {
    const { getMissionStatus } = useMissionProgressStore.getState()
    expect(getMissionStatus('m06')).toBe('locked')
  })
})

// ── setCommanderName ─────────────────────────────────────────────────────────

describe('useMissionProgressStore — setCommanderName', () => {
  it('updates commanderName', () => {
    useMissionProgressStore.getState().setCommanderName('Commander Nova')
    expect(useMissionProgressStore.getState().commanderName).toBe('Commander Nova')
  })
})

// ── completeTask ─────────────────────────────────────────────────────────────

describe('useMissionProgressStore — completeTask', () => {
  it('adds taskId to completedTaskIds for a mission', () => {
    useMissionProgressStore.getState().completeTask('m01', 'm01-t01')
    const { missions } = useMissionProgressStore.getState()
    expect(missions['m01'].completedTaskIds).toContain('m01-t01')
  })
})

// ── completeMission ──────────────────────────────────────────────────────────

describe('useMissionProgressStore — completeMission', () => {
  it('sets status to completed', () => {
    useMissionProgressStore.getState().completeMission('m01', 3)
    const { getMissionStatus } = useMissionProgressStore.getState()
    expect(getMissionStatus('m01')).toBe('completed')
  })

  it('updates totalStars', () => {
    useMissionProgressStore.getState().completeMission('m01', 3)
    expect(useMissionProgressStore.getState().totalStars).toBe(3)
  })

  it('unlocks next mission based on unlockRequirement (m01 → m02)', () => {
    useMissionProgressStore.getState().completeMission('m01', 3)
    const { getMissionStatus } = useMissionProgressStore.getState()
    expect(getMissionStatus('m02')).toBe('active')
  })
})

// ── getMissionStatus / getCurrentMission ─────────────────────────────────────

describe('useMissionProgressStore — getters', () => {
  it('getMissionStatus returns locked for m06 initially', () => {
    expect(useMissionProgressStore.getState().getMissionStatus('m06')).toBe('locked')
  })

  it('getMissionStatus returns active for m01 initially', () => {
    expect(useMissionProgressStore.getState().getMissionStatus('m01')).toBe('active')
  })

  it('getCurrentMission returns the m01 definition initially', () => {
    const current = useMissionProgressStore.getState().getCurrentMission()
    expect(current).not.toBeNull()
    expect(current?.id).toBe('m01')
    // cross-check against the definition helper
    expect(current).toEqual(getMissionById('m01'))
  })
})

// ── resetProgress ─────────────────────────────────────────────────────────────

describe('useMissionProgressStore — resetProgress', () => {
  it('restores initial state after mutations', () => {
    // Mutate the store
    useMissionProgressStore.getState().setCommanderName('Nova')
    useMissionProgressStore.getState().completeMission('m01', 3)

    // Reset
    useMissionProgressStore.getState().resetProgress()

    const state = useMissionProgressStore.getState()
    expect(state.commanderName).toBe('')
    expect(state.totalStars).toBe(0)
    expect(state.currentMissionId).toBe('m01')
    expect(state.getMissionStatus('m01')).toBe('active')
    expect(state.getMissionStatus('m02')).toBe('locked')
  })
})
