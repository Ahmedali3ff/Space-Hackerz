// tests/unit/game/game-progress-store.test.ts
// Unit tests for useGameProgressStore — covers initial state, actions,
// and resetCampaign.

import { describe, it, expect, beforeEach } from 'vitest'
import {
  useGameProgressStore,
  INITIAL_GAME_PROGRESS_STATE,
} from '@store/game-progress-store'

// ── Reset helper ─────────────────────────────────────────────────────────────
// Clear localStorage so persist middleware does not hydrate stale state, then
// reset the in-memory Zustand state to the known initial shape.

beforeEach(() => {
  localStorage.clear()
  useGameProgressStore.setState({ ...INITIAL_GAME_PROGRESS_STATE })
})

// ── Initial state ─────────────────────────────────────────────────────────────

describe('useGameProgressStore — initial state', () => {
  it('initial state has currentLevelId null', () => {
    const { currentLevelId } = useGameProgressStore.getState()
    expect(currentLevelId).toBeNull()
  })

  it('initial state has activeGameState idle', () => {
    const { activeGameState } = useGameProgressStore.getState()
    expect(activeGameState).toBe('idle')
  })
})

// ── setCurrentLevel ───────────────────────────────────────────────────────────

describe('useGameProgressStore — setCurrentLevel', () => {
  it('setCurrentLevel updates currentLevelId', () => {
    useGameProgressStore.getState().setCurrentLevel('level-2')
    expect(useGameProgressStore.getState().currentLevelId).toBe('level-2')
  })
})

// ── completeLevel ─────────────────────────────────────────────────────────────

describe('useGameProgressStore — completeLevel', () => {
  it('completeLevel adds to completedLevelIds', () => {
    useGameProgressStore.getState().completeLevel('level-1')
    expect(useGameProgressStore.getState().completedLevelIds).toContain('level-1')
  })

  it('completeLevel does not add duplicates', () => {
    useGameProgressStore.getState().completeLevel('level-1')
    useGameProgressStore.getState().completeLevel('level-1')
    const { completedLevelIds } = useGameProgressStore.getState()
    expect(completedLevelIds.filter((id) => id === 'level-1').length).toBe(1)
  })
})

// ── unlockLevel ───────────────────────────────────────────────────────────────

describe('useGameProgressStore — unlockLevel', () => {
  it('unlockLevel adds to unlockedLevelIds', () => {
    useGameProgressStore.getState().unlockLevel('level-2')
    expect(useGameProgressStore.getState().unlockedLevelIds).toContain('level-2')
  })
})

// ── setGameState ──────────────────────────────────────────────────────────────

describe('useGameProgressStore — setGameState', () => {
  it('setGameState updates activeGameState', () => {
    useGameProgressStore.getState().setGameState('playing')
    expect(useGameProgressStore.getState().activeGameState).toBe('playing')
  })
})

// ── addPlaytime ───────────────────────────────────────────────────────────────

describe('useGameProgressStore — addPlaytime', () => {
  it('addPlaytime increments totalPlaytimeSecs', () => {
    useGameProgressStore.getState().addPlaytime(120)
    expect(useGameProgressStore.getState().totalPlaytimeSecs).toBe(120)
  })
})

// ── resetCampaign ─────────────────────────────────────────────────────────────

describe('useGameProgressStore — resetCampaign', () => {
  it('resetCampaign restores initial state after mutations', () => {
    // Mutate the store
    useGameProgressStore.getState().setCurrentLevel('level-5')
    useGameProgressStore.getState().completeLevel('level-1')
    useGameProgressStore.getState().setGameState('game_over')
    useGameProgressStore.getState().addPlaytime(300)

    // Reset
    useGameProgressStore.getState().resetCampaign()

    const state = useGameProgressStore.getState()
    expect(state.currentLevelId).toBeNull()
    expect(state.completedLevelIds).toHaveLength(0)
    expect(state.activeGameState).toBe('idle')
    expect(state.totalPlaytimeSecs).toBe(0)
  })
})
