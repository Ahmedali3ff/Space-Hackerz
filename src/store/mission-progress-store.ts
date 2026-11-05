// src/store/mission-progress-store.ts
// Zustand store (with localStorage persistence) for mission progress across
// the 6-mission Space+ story arc. Tracks which missions are active/locked/completed
// and which tasks within each mission have been satisfied.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MISSIONS, getMissionById } from '@data/missions/mission-definitions'
import type { MissionDefinition } from '@data/missions/mission-definitions'
import type { MissionProgress, MissionStatus } from '@data/missions/mission-progress'
import { getLevelForXP, getXPForMission } from '@data/levels/level-definitions'

// ── State shape ───────────────────────────────────────────────────────────────

export interface MissionProgressState {
  readonly missions: Record<string, MissionProgress>
  readonly totalStars: number
  readonly totalXP: number
  readonly currentLevel: number
  readonly commanderTitle: string
  readonly currentMissionId: string | null
  readonly commanderName: string
}

// ── Actions shape ─────────────────────────────────────────────────────────────

export interface MissionProgressActions {
  setCommanderName: (name: string) => void
  startMission: (missionId: string) => void
  completeTask: (missionId: string, taskId: string) => void
  completeMission: (missionId: string, earnedStars: number) => void
  awardXP: (amount: number) => void
  getMissionStatus: (missionId: string) => MissionStatus
  getCurrentMission: () => MissionDefinition | null
  resetProgress: () => void
}

export type MissionProgressStore = MissionProgressState & MissionProgressActions

// ── Initial state ─────────────────────────────────────────────────────────────

function buildInitialMissions(): Record<string, MissionProgress> {
  const record: Record<string, MissionProgress> = {}
  MISSIONS.forEach((mission, index) => {
    record[mission.id] = {
      missionId: mission.id,
      // m01 starts active; all others are locked
      status: index === 0 ? 'active' : 'locked',
      completedTaskIds: [],
      earnedStars: 0,
    }
  })
  return record
}

const INITIAL_STATE: MissionProgressState = {
  missions: buildInitialMissions(),
  totalStars: 0,
  totalXP: 0,
  currentLevel: 1,
  commanderTitle: 'Space Cadet',
  currentMissionId: 'm01',
  commanderName: '',
}

/** Exported for test resets — use useMissionProgressStore.setState({ ...INITIAL_PROGRESS_STATE }) in beforeEach */
export const INITIAL_PROGRESS_STATE: MissionProgressState = INITIAL_STATE

// ── Store ─────────────────────────────────────────────────────────────────────

export const useMissionProgressStore = create<MissionProgressStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setCommanderName: (name: string): void => {
        set({ commanderName: name })
      },

      startMission: (missionId: string): void => {
        set((state) => ({
          currentMissionId: missionId,
          missions: {
            ...state.missions,
            [missionId]: {
              ...state.missions[missionId],
              missionId,
              status: 'active' as MissionStatus,
              completedTaskIds: state.missions[missionId]?.completedTaskIds ?? [],
              earnedStars: state.missions[missionId]?.earnedStars ?? 0,
            },
          },
        }))
      },

      completeTask: (missionId: string, taskId: string): void => {
        set((state) => {
          const existing = state.missions[missionId]
          if (!existing) return state
          // Avoid duplicates
          if (existing.completedTaskIds.includes(taskId)) return state
          return {
            missions: {
              ...state.missions,
              [missionId]: {
                ...existing,
                completedTaskIds: [...existing.completedTaskIds, taskId],
              },
            },
          }
        })
      },

      completeMission: (missionId: string, earnedStars: number): void => {
        set((state) => {
          const existing = state.missions[missionId]
          if (!existing) return state

          // Mark this mission completed
          const updated: Record<string, MissionProgress> = {
            ...state.missions,
            [missionId]: {
              ...existing,
              status: 'completed' as MissionStatus,
              earnedStars,
              completedAt: new Date().toISOString(),
            },
          }

          // Unlock the next mission in the chain (unlockRequirement === missionId)
          const nextMission = MISSIONS.find(
            (m) => m.unlockRequirement === missionId,
          )
          if (nextMission && updated[nextMission.id]?.status === 'locked') {
            updated[nextMission.id] = {
              ...updated[nextMission.id],
              status: 'active' as MissionStatus,
            }
          }

          // Recalculate totalStars
          const totalStars = Object.values(updated).reduce(
            (sum, p) => sum + (p.status === 'completed' ? p.earnedStars : 0),
            0,
          )

          // Advance currentMissionId to the newly unlocked mission (or keep it)
          const newCurrentId = nextMission?.id ?? state.currentMissionId

          // Award XP for this mission
          const missionDef = MISSIONS.find((m) => m.id === missionId)
          const missionNumber = missionDef?.number ?? 1
          const xpEarned = getXPForMission(earnedStars, missionNumber)
          const newTotalXP = state.totalXP + xpEarned
          const levelDef = getLevelForXP(newTotalXP)

          return {
            missions: updated,
            totalStars,
            totalXP: newTotalXP,
            currentLevel: levelDef.level,
            commanderTitle: levelDef.title,
            currentMissionId: newCurrentId,
          }
        })
      },

      awardXP: (amount: number): void => {
        set((state) => {
          const newTotalXP = state.totalXP + amount
          const levelDef = getLevelForXP(newTotalXP)
          return {
            totalXP: newTotalXP,
            currentLevel: levelDef.level,
            commanderTitle: levelDef.title,
          }
        })
      },

      getMissionStatus: (missionId: string): MissionStatus => {
        return get().missions[missionId]?.status ?? 'locked'
      },

      getCurrentMission: (): MissionDefinition | null => {
        const { currentMissionId } = get()
        if (!currentMissionId) return null
        return getMissionById(currentMissionId) ?? null
      },

      resetProgress: (): void => {
        set({ ...INITIAL_STATE, missions: buildInitialMissions() })
      },
    }),
    {
      name: 'spaceplus-mission-progress',
    },
  ),
)
