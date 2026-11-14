import { describe, expect, beforeEach, it } from 'vitest'
import { useMissionOperationsStore } from '@/store/mission-operations-store'

describe('mission operations', () => {
  beforeEach(() => useMissionOperationsStore.getState().reset())

  it('solves the level one oxygen calculation and tracks resources', () => {
    const store = useMissionOperationsStore.getState()
    store.start('level-1')
    store.applyAction('select-moon')
    store.applyAction('check-food')
    store.applyAction('check-water')
    store.applyAction('check-oxygen')
    store.applyAction('check-energy')
    store.answerPuzzle('oxygen-plan', '160')

    expect(useMissionOperationsStore.getState().completedPuzzleIds).toContain('oxygen-plan')
    expect(useMissionOperationsStore.getState().score).toBe(225)
  })

  it('penalizes an unsafe landing sequence without completing the objective', () => {
    const store = useMissionOperationsStore.getState()
    store.start('level-2')
    store.applyAction('activate-life-support')

    const state = useMissionOperationsStore.getState()
    expect(state.completedObjectiveIds).not.toContain('life-support')
    expect(state.score).toBe(0)
    expect(state.feedback?.tone).toBe('negative')
  })

  it('loses every operation when its three minute timer expires', () => {
    const store = useMissionOperationsStore.getState()
    store.start('level-8')
    store.tick(180)

    const state = useMissionOperationsStore.getState()
    expect(state.timeRemainingSeconds).toBe(0)
    expect(state.status).toBe('lost')
    expect(state.lossCause).toBe('Mission timer expired')
  })
})
