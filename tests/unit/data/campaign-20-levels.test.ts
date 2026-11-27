// Guards the 20-level campaign: ids, unlock chain, chapters, ranks, and a full playthrough of every level.
import { describe, it, expect, beforeEach } from 'vitest'
import { MISSIONS } from '@data/missions/mission-definitions'
import { MISSION_OPERATIONS, getMissionOperation } from '@data/missions/mission-operations'
import { CHAPTERS, MISSIONS_PER_CHAPTER, getChapterForMission, getNextMission } from '@data/missions/chapters'
import { LEVELS, MAX_LEVEL, getLevelForXP, getXPForMission, getProgressToNextLevel } from '@data/levels/level-definitions'
import { useMissionOperationsStore, operationCanComplete } from '@store/mission-operations-store'
import { calcStarsEarned, getMaxOperationScore, OPERATION_SECONDS } from '@/services/operation-scoring'

describe('campaign has 20 levels', () => {
  it('uses sequential ids and numbers m01..m20', () => {
    expect(MISSIONS).toHaveLength(20)
    MISSIONS.forEach((mission, index) => {
      expect(mission.id).toBe(`m${String(index + 1).padStart(2, '0')}`)
      expect(mission.number).toBe(index + 1)
      expect(mission.levelId).toBe(`level-${index + 1}`)
    })
  })

  it('chains unlockRequirement from the previous mission (no level can get stuck)', () => {
    expect(MISSIONS[0]?.unlockRequirement).toBeUndefined()
    for (let i = 1; i < MISSIONS.length; i++) expect(MISSIONS[i]?.unlockRequirement).toBe(MISSIONS[i - 1]?.id)
  })

  it('has an operation definition for every level', () => {
    expect(MISSION_OPERATIONS).toHaveLength(20)
    for (const mission of MISSIONS) expect(getMissionOperation(mission.levelId ?? '')?.missionId).toBe(mission.id)
  })

  it('splits into five chapters of four missions', () => {
    expect(CHAPTERS).toHaveLength(5)
    for (const chapter of CHAPTERS) expect(chapter.missionIds).toHaveLength(MISSIONS_PER_CHAPTER)
    expect(CHAPTERS.flatMap((c) => c.missionIds)).toEqual(MISSIONS.map((m) => m.id))
    expect(getChapterForMission('m20')?.id).toBe(5)
    expect(getNextMission('m08')?.id).toBe('m09')
    expect(getNextMission('m20')).toBeUndefined()
  })
})

describe('20 ranks', () => {
  it('has 20 strictly increasing levels', () => {
    expect(LEVELS).toHaveLength(20)
    expect(MAX_LEVEL).toBe(20)
    LEVELS.forEach((lvl, i) => {
      expect(lvl.level).toBe(i + 1)
      if (i > 0) expect(lvl.xpRequired).toBeGreaterThan(LEVELS[i - 1]?.xpRequired ?? 0)
    })
  })

  it('makes the top rank reachable with good stars', () => {
    const xpWithStars = (stars: number): number => MISSIONS.reduce((sum, m) => sum + getXPForMission(stars, m.number), 0)
    expect(getLevelForXP(xpWithStars(3)).level).toBe(20)
    expect(getLevelForXP(xpWithStars(1)).level).toBeLessThan(20)
  })

  it('reaches level 2 after one three-star first mission', () => {
    expect(getLevelForXP(getXPForMission(3, 1)).level).toBe(2)
  })

  it('reports 100% at the maximum rank', () => {
    expect(getProgressToNextLevel(99999).percent).toBe(100)
  })
})

describe('every level is winnable', () => {
  beforeEach(() => { localStorage.clear(); useMissionOperationsStore.getState().reset() })

  for (const op of MISSION_OPERATIONS) {
    it(`${op.levelId} (${op.title}) can be completed in sequence for 3 stars`, () => {
      const store = useMissionOperationsStore
      store.getState().start(op.levelId)
      for (const actionId of op.requiredSequence ?? []) store.getState().applyAction(actionId)
      for (const puzzle of op.puzzles) store.getState().answerPuzzle(puzzle.id, puzzle.correctOption)
      const state = store.getState()
      expect(state.status).toBe('active')
      expect(operationCanComplete(op.levelId, state)).toBe(true)
      expect(state.score).toBe(getMaxOperationScore(op.levelId))
      expect(calcStarsEarned(op.levelId, state.completedObjectiveIds, state.completedPuzzleIds, state.failedPuzzleIds, OPERATION_SECONDS, state.score)).toBe(3)
    })
  }
})
