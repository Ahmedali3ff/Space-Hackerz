// src/data/levels/level-definitions.ts
// Defines the 6-level progression system for Space+ Mission Academy.
// XP is earned per completed mission; levels unlock content and grant titles.
// NO React, Zustand, or Phaser imports.

export interface LevelDefinition {
  readonly level: number
  readonly title: string
  readonly xpRequired: number
  readonly color: string
  readonly badgeEmoji: string
  readonly unlocksDescription: string
}

export const LEVELS: readonly LevelDefinition[] = [
  { level: 1, title: 'Space Cadet',    xpRequired: 0,    color: '#6B7280', badgeEmoji: '🚀', unlocksDescription: 'Your journey begins!' },
  { level: 2, title: 'Explorer',       xpRequired: 100,  color: '#1FC8C0', badgeEmoji: '🌙', unlocksDescription: 'Moon missions unlocked' },
  { level: 3, title: 'Star Explorer',  xpRequired: 300,  color: '#F5A623', badgeEmoji: '⭐', unlocksDescription: 'Advanced Moon missions' },
  { level: 4, title: 'Mission Expert', xpRequired: 600,  color: '#8B5CF6', badgeEmoji: '🔭', unlocksDescription: 'Mars missions unlocked' },
  { level: 5, title: 'Commander',      xpRequired: 1000, color: '#EF4444', badgeEmoji: '🪐', unlocksDescription: 'All missions available' },
  { level: 6, title: 'Admiral',        xpRequired: 1500, color: '#F5A623', badgeEmoji: '🌌', unlocksDescription: 'Elite explorer' },
]

export function getLevelForXP(xp: number): LevelDefinition {
  let result = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) result = lvl
  }
  return result
}

export function getXPForMission(starsEarned: number, missionNumber: number): number {
  return (starsEarned * 20) + (missionNumber * 10)
}

export function getProgressToNextLevel(xp: number): { current: number; required: number; percent: number } {
  const current = getLevelForXP(xp)
  const nextIndex = LEVELS.findIndex(l => l.level === current.level) + 1
  if (nextIndex >= LEVELS.length) return { current: xp - current.xpRequired, required: 0, percent: 100 }
  const next = LEVELS[nextIndex]
  const progressXP = xp - current.xpRequired
  const needed = next.xpRequired - current.xpRequired
  return { current: progressXP, required: needed, percent: Math.round((progressXP / needed) * 100) }
}
