// src/data/missions/chapters.ts
// Groups the 20 campaign missions into five chapters of four. Pure data + helpers.

import { MISSIONS } from './mission-definitions'
import type { MissionDefinition } from './mission-definitions'

export interface ChapterDefinition {
  readonly id: number
  readonly title: string
  readonly tagline: string
  readonly emoji: string
  readonly missionIds: readonly string[]
}

const CHAPTER_META: ReadonlyArray<Pick<ChapterDefinition, 'title' | 'tagline' | 'emoji'>> = [
  { title: 'Cadet Academy', tagline: 'Learn the basics of life support', emoji: '🎓' },
  { title: 'Frontier Operations', tagline: 'Keep a base alive on two worlds', emoji: '🛰️' },
  { title: 'Deep Surface Missions', tagline: 'Use local resources to thrive', emoji: '⛏️' },
  { title: 'Crisis Command', tagline: 'Handle failures when seconds count', emoji: '🚨' },
  { title: 'Legend of ASTRA', tagline: 'Survive the hardest missions ever flown', emoji: '👑' },
]

export const MISSIONS_PER_CHAPTER = 4

export const CHAPTERS: readonly ChapterDefinition[] = CHAPTER_META.map((meta, index) => ({
  id: index + 1,
  ...meta,
  missionIds: MISSIONS.slice(index * MISSIONS_PER_CHAPTER, (index + 1) * MISSIONS_PER_CHAPTER).map((m) => m.id),
}))

export function getChapterForMission(missionId: string): ChapterDefinition | undefined {
  return CHAPTERS.find((chapter) => chapter.missionIds.includes(missionId))
}

/** The mission that unlocks after `missionId` is completed. */
export function getNextMission(missionId: string): MissionDefinition | undefined {
  return MISSIONS.find((mission) => mission.unlockRequirement === missionId)
}
