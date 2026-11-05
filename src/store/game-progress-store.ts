// src/store/game-progress-store.ts
// Zustand store (with localStorage persistence) for campaign-level game state.
// Tracks which levels are active, completed, and unlocked across the 8-level
// hybrid campaign arc. Separate from useMissionProgressStore which handles
// the Space+ progression system — this store drives the gameplay layer.
// NO simulation imports — purely application-layer state.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── State shape ───────────────────────────────────────────────────────────────

export type ActiveGameState =
  | 'idle'
  | 'cinematic'
  | 'playing'
  | 'paused'
  | 'level_complete'
  | 'game_over'

export interface GameProgressState {
  readonly currentLevelId: string | null
  readonly completedLevelIds: readonly string[]
  readonly unlockedLevelIds: readonly string[]
  readonly currentChapter: number
  readonly totalPlaytimeSecs: number
  readonly lastSavedAt: string | null
  readonly activeGameState: ActiveGameState
}

// ── Actions shape ─────────────────────────────────────────────────────────────

export interface GameProgressActions {
  setCurrentLevel: (id: string) => void
  completeLevel: (id: string) => void
  unlockLevel: (id: string) => void
  setGameState: (state: ActiveGameState) => void
  addPlaytime: (secs: number) => void
  resetCampaign: () => void
}

export type GameProgressStore = GameProgressState & GameProgressActions

// ── Initial state ─────────────────────────────────────────────────────────────

export const INITIAL_GAME_PROGRESS_STATE: GameProgressState = {
  currentLevelId: null,
  completedLevelIds: [],
  // Level 1 is always unlocked at start
  unlockedLevelIds: ['level-1'],
  currentChapter: 1,
  totalPlaytimeSecs: 0,
  lastSavedAt: null,
  activeGameState: 'idle',
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useGameProgressStore = create<GameProgressStore>()(
  persist(
    (set) => ({
      ...INITIAL_GAME_PROGRESS_STATE,

      setCurrentLevel: (id: string): void => {
        set({
          currentLevelId: id,
          lastSavedAt: new Date().toISOString(),
        })
      },

      completeLevel: (id: string): void => {
        set((state) => {
          // Avoid duplicate entries
          if (state.completedLevelIds.includes(id)) {
            return { lastSavedAt: new Date().toISOString() }
          }
          return {
            completedLevelIds: [...state.completedLevelIds, id],
            lastSavedAt: new Date().toISOString(),
          }
        })
      },

      unlockLevel: (id: string): void => {
        set((state) => {
          if (state.unlockedLevelIds.includes(id)) return state
          return {
            unlockedLevelIds: [...state.unlockedLevelIds, id],
            lastSavedAt: new Date().toISOString(),
          }
        })
      },

      setGameState: (activeGameState: ActiveGameState): void => {
        set({ activeGameState, lastSavedAt: new Date().toISOString() })
      },

      addPlaytime: (secs: number): void => {
        set((state) => ({
          totalPlaytimeSecs: state.totalPlaytimeSecs + secs,
        }))
      },

      resetCampaign: (): void => {
        set({
          ...INITIAL_GAME_PROGRESS_STATE,
          lastSavedAt: new Date().toISOString(),
        })
      },
    }),
    {
      name: 'astra-game-progress',
    },
  ),
)
