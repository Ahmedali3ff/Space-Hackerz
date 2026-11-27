// Gameplay state guards: no winning without requirements, no actions after the mission ends.
import { describe, it, expect, beforeEach } from 'vitest'
import { useMissionOperationsStore } from '@store/mission-operations-store'
import { MISSION_OPERATIONS } from '@data/missions/mission-operations'

const op = MISSION_OPERATIONS[0]!

describe('operation state guards', () => {
  beforeEach(() => { localStorage.clear(); useMissionOperationsStore.getState().start(op.levelId) })

  it('refuses to mark a mission won before it is complete', () => {
    useMissionOperationsStore.getState().markWon()
    expect(useMissionOperationsStore.getState().status).toBe('active')
  })

  it('ignores actions once the mission is lost', () => {
    useMissionOperationsStore.setState({ status: 'lost' })
    const before = useMissionOperationsStore.getState().actionHistory.length
    useMissionOperationsStore.getState().applyAction(op.actions[0]!.id)
    expect(useMissionOperationsStore.getState().actionHistory.length).toBe(before)
  })

  it('rejects invalid timer inputs', () => {
    const t0 = useMissionOperationsStore.getState().timeRemainingSeconds
    for (const bad of [0, -5, Number.NaN, Infinity, 1000]) useMissionOperationsStore.getState().tick(bad)
    expect(useMissionOperationsStore.getState().timeRemainingSeconds).toBe(t0)
  })

  it('does not tick after the mission has ended', () => {
    useMissionOperationsStore.setState({ status: 'won' })
    const t0 = useMissionOperationsStore.getState().timeRemainingSeconds
    useMissionOperationsStore.getState().tick(5)
    expect(useMissionOperationsStore.getState().timeRemainingSeconds).toBe(t0)
  })
})
