// src/hooks/useLearningProfile.ts
// Keeps the player's learning profile in this browser (localStorage). Storage errors never break the screen.
import { useCallback, useState } from 'react'
import { parseProfile, recordMission } from '@/ai/learning/learning-profile'
import type { LearningProfile } from '@/ai/learning/learning-profile'
import type { ErrorItem } from '@/ai/errors/error-center'

export const PROFILE_STORAGE_KEY = 'astra.learning.v1'

function read(): LearningProfile {
  try {
    return parseProfile(window.localStorage.getItem(PROFILE_STORAGE_KEY))
  } catch {
    return parseProfile(null)
  }
}

function write(profile: LearningProfile): void {
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Storage is full or blocked: the profile still works for this visit.
  }
}

export function useLearningProfile(): {
  profile: LearningProfile
  recordFinishedMission: (key: string, items: readonly ErrorItem[], decisions: number, optimal: number) => void
} {
  const [profile, setProfile] = useState<LearningProfile>(read)

  const recordFinishedMission = useCallback((key: string, items: readonly ErrorItem[], decisions: number, optimal: number) => {
    setProfile((current) => {
      const next = recordMission(current, key, items, decisions, optimal)
      if (next !== current) write(next)
      return next
    })
  }, [])

  return { profile, recordFinishedMission }
}
