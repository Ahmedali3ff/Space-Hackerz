// src/store/challenge-store.ts
// Zustand store for tracking active, completed, and failed challenges.

import { create } from 'zustand'
import { CHALLENGES } from '@/game3d/challenges/challenge-definitions'

export interface ActiveChallenge {
  readonly challengeId: string
  readonly startDay: number
  readonly daysRemaining: number
  readonly isCompleted: boolean
  readonly isFailed: boolean
}

interface ChallengeStore {
  readonly activeChallenges: readonly ActiveChallenge[]
  readonly completedIds: readonly string[]
  readonly failedIds: readonly string[]
  triggerChallenge: (id: string, day: number) => void
  completeChallenge: (id: string) => void
  failChallenge: (id: string) => void
  tickDay: () => void
  clearAll: () => void
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  activeChallenges: [],
  completedIds: [],
  failedIds: [],

  triggerChallenge: (id: string, day: number): void => {
    const s = get()
    // Don't re-trigger if already active or completed
    if (s.activeChallenges.find((c) => c.challengeId === id) !== undefined) return
    if (s.completedIds.includes(id)) return
    const ch = CHALLENGES.find((c) => c.id === id)
    if (ch === undefined) return
    set((prev) => ({
      activeChallenges: [
        ...prev.activeChallenges,
        {
          challengeId: id,
          startDay: day,
          daysRemaining: ch.timeLimit,
          isCompleted: false,
          isFailed: false,
        },
      ],
    }))
  },

  completeChallenge: (id: string): void =>
    set((s) => ({
      activeChallenges: s.activeChallenges.filter((c) => c.challengeId !== id),
      completedIds: [...s.completedIds, id],
    })),

  failChallenge: (id: string): void =>
    set((s) => ({
      activeChallenges: s.activeChallenges.filter((c) => c.challengeId !== id),
      failedIds: [...s.failedIds, id],
    })),

  tickDay: (): void =>
    set((s) => ({
      activeChallenges: s.activeChallenges.map((c) => ({
        ...c,
        daysRemaining: c.daysRemaining - 1,
      })),
    })),

  clearAll: (): void =>
    set({ activeChallenges: [], completedIds: [], failedIds: [] }),
}))
