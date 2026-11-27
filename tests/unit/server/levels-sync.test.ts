// The server keeps its own copy of the rank table (it cannot import from src/). Fail on drift.
import { describe, it, expect } from 'vitest'
import { LEVELS, getXPForMission } from '@data/levels/level-definitions'
import { LEVEL_DEFS, MAX_XP_PER_AWARD, getLevelForXP } from '../../../server/lib/levels'
import { MISSIONS } from '@data/missions/mission-definitions'

describe('server rank table', () => {
  it('matches the client rank table exactly', () => {
    expect(LEVEL_DEFS.map((d) => [d.level, d.title, d.minXP])).toEqual(LEVELS.map((l) => [l.level, l.title, l.xpRequired]))
  })
  it('resolves levels like the client', () => {
    expect(getLevelForXP(0).level).toBe(1)
    expect(getLevelForXP(3000).level).toBe(20)
  })
  it('allows the largest legitimate single award', () => {
    expect(Math.max(...MISSIONS.map((m) => getXPForMission(3, m.number)))).toBeLessThanOrEqual(MAX_XP_PER_AWARD)
  })
})
