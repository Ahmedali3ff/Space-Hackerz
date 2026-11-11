import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getMissionOperation } from '@data/missions/mission-operations'

export interface OperationResources { readonly oxygen: number; readonly water: number; readonly food: number; readonly energy: number }
export interface OperationFeedback { readonly message: string; readonly tone: 'positive' | 'warning' | 'negative' }
export type OperationStatus = 'active' | 'won' | 'lost'

interface OperationState {
  readonly activeLevelId: string | null
  readonly resources: OperationResources
  readonly completedObjectiveIds: readonly string[]
  readonly completedPuzzleIds: readonly string[]
  readonly score: number
  readonly missionTimeSeconds: number
  readonly decisionsMade: number
  readonly actionHistory: readonly string[]
  readonly feedback: OperationFeedback | null
  readonly status: OperationStatus
  readonly lossCause: string | null
  start: (levelId: string) => void
  applyAction: (actionId: string) => void
  answerPuzzle: (puzzleId: string, option: string) => void
  tick: (seconds?: number) => void
  clearFeedback: () => void
  markWon: () => void
  reset: () => void
}

const INITIAL_RESOURCES: OperationResources = { oxygen: 100, water: 100, food: 100, energy: 100 }
const clamp = (value: number): number => Math.max(0, Math.min(100, Math.round(value)))
const emptyState = { activeLevelId: null, resources: INITIAL_RESOURCES, completedObjectiveIds: [], completedPuzzleIds: [], score: 0, missionTimeSeconds: 0, decisionsMade: 0, actionHistory: [], feedback: null, status: 'active' as OperationStatus, lossCause: null }

export const useMissionOperationsStore = create<OperationState>()(persist((set, get) => ({
  ...emptyState,
  start: (levelId) => set({ ...emptyState, activeLevelId: levelId }),
  applyAction: (actionId) => {
    const state = get(); const mission = state.activeLevelId ? getMissionOperation(state.activeLevelId) : undefined
    const action = mission?.actions.find((candidate) => candidate.id === actionId)
    if (!mission || !action) return
    const sequence = mission.requiredSequence
    if (sequence) {
      const nextRequired = sequence[state.actionHistory.filter((id) => sequence.includes(id)).length]
      if (nextRequired !== actionId) {
        set({ score: Math.max(0, state.score - 20), decisionsMade: state.decisionsMade + 1, resources: { ...state.resources, energy: clamp(state.resources.energy - 5) }, feedback: { message: `Wrong sequence. The next safe step is ${mission.actions.find((candidate) => candidate.id === nextRequired)?.label ?? 'the next diagnostic step'}.`, tone: 'negative' } })
        return
      }
    }
    const previousObjectiveCount = state.completedObjectiveIds.length
    const resources = { ...state.resources }
    for (const key of Object.keys(action.resourceDelta ?? {}) as Array<keyof OperationResources>) resources[key] = clamp(resources[key] + (action.resourceDelta?.[key] ?? 0))
    const completedObjectiveIds = state.completedObjectiveIds.includes(action.objectiveId) ? state.completedObjectiveIds : [...state.completedObjectiveIds, action.objectiveId]
    const positive = completedObjectiveIds.length > previousObjectiveCount
    const depleted = (Object.keys(resources) as Array<keyof OperationResources>).find((key) => resources[key] <= 0)
    set({ resources, completedObjectiveIds, score: state.score + (positive ? 25 : 5), decisionsMade: state.decisionsMade + 1, actionHistory: [...state.actionHistory, actionId], status: depleted ? 'lost' : 'active', lossCause: depleted ? `${depleted[0].toUpperCase()}${depleted.slice(1)} depleted` : null, feedback: depleted ? { message: `MISSION FAILED — ${depleted} reached zero.`, tone: 'negative' } : { message: `${action.label}: ${action.description}`, tone: positive ? 'positive' : 'warning' } })
  },
  answerPuzzle: (puzzleId, option) => {
    const state = get(); const mission = state.activeLevelId ? getMissionOperation(state.activeLevelId) : undefined; const puzzle = mission?.puzzles.find((candidate) => candidate.id === puzzleId)
    if (!puzzle || state.completedPuzzleIds.includes(puzzleId)) return
    const correct = option === puzzle.correctOption
    set({ completedPuzzleIds: [...state.completedPuzzleIds, puzzleId], score: Math.max(0, state.score + (correct ? puzzle.correctPoints : puzzle.wrongPoints)), decisionsMade: state.decisionsMade + 1, feedback: { message: correct ? puzzle.correctFeedback : puzzle.wrongFeedback, tone: correct ? 'positive' : 'negative' } })
  },
  tick: (seconds = 10) => set((state) => ({ missionTimeSeconds: state.missionTimeSeconds + seconds, feedback: null })),
  clearFeedback: () => set({ feedback: null }),
  markWon: () => set({ status: 'won', feedback: { message: 'Mission complete — all objectives secured.', tone: 'positive' } }),
  reset: () => set(emptyState),
}), { name: 'space-hackerz-mission-operations' }))

export function operationCanComplete(levelId: string, state: Pick<OperationState, 'resources' | 'completedObjectiveIds' | 'completedPuzzleIds'>): boolean {
  const mission = getMissionOperation(levelId); if (!mission) return false
  const objectiveIds = [...new Set(mission.actions.map((action) => action.objectiveId))]
  const objectivesComplete = objectiveIds.every((objectiveId) => state.completedObjectiveIds.includes(objectiveId))
  const puzzlesComplete = mission.puzzles.every((puzzle) => state.completedPuzzleIds.includes(puzzle.id))
  const resourcesSafe = Object.entries(mission.minimumResources).every(([key, minimum]) => state.resources[key as keyof OperationResources] >= (minimum ?? 0))
  return objectivesComplete && puzzlesComplete && resourcesSafe
}
