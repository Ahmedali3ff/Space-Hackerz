// src/services/operation-scoring.ts
// Pure star-rating rules for hands-on mission operations. No React, Zustand or router imports.

import { getMissionOperation } from '@data/missions/mission-operations'

/** Seconds per operation. Must match OPERATION_TIME_LIMIT_SECONDS in the operations store. */
export const OPERATION_SECONDS = 180

const POINTS_PER_OBJECTIVE = 25

/** Highest score a flawless run of this operation can reach. */
export function getMaxOperationScore(levelId: string): number {
  const operation = getMissionOperation(levelId)
  if (!operation) return 0
  const objectiveCount = new Set(operation.actions.map((action) => action.objectiveId)).size
  const puzzlePoints = operation.puzzles.reduce((sum, puzzle) => sum + puzzle.correctPoints, 0)
  return objectiveCount * POINTS_PER_OBJECTIVE + puzzlePoints
}

/**
 * 1 star: finished. 2 stars: every objective and puzzle done with no puzzle mistakes.
 * 3 stars: as 2 stars, with half the time left and at least 80% of the maximum score.
 */
export function calcStarsEarned(
  missionId: string,
  completedObjectiveIds: readonly string[],
  completedPuzzleIds: readonly string[],
  failedPuzzleIds: readonly string[],
  timeRemainingSeconds: number,
  score: number,
): 1 | 2 | 3 {
  const operation = getMissionOperation(missionId)
  if (!operation) return 1
  const objectiveIds = new Set(operation.actions.map((action) => action.objectiveId))
  const doneObjectives = completedObjectiveIds.filter((id) => objectiveIds.has(id)).length
  const objectiveRatio = objectiveIds.size === 0 ? 0 : doneObjectives / objectiveIds.size
  const puzzleRatio = operation.puzzles.length === 0 ? 1 : completedPuzzleIds.filter((id) => !failedPuzzleIds.includes(id)).length / operation.puzzles.length
  const allDone = objectiveRatio === 1 && puzzleRatio === 1 && failedPuzzleIds.length === 0
  if (!allDone) return 1
  const fastFinish = timeRemainingSeconds >= OPERATION_SECONDS * 0.5
  const strongScore = score >= getMaxOperationScore(operation.levelId) * 0.8
  return fastFinish && strongScore ? 3 : 2
}
