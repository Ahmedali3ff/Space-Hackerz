// src/data/levels/level-definitions.ts
// Defines the 20-level progression system for Space+ Mission Academy.
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
  { level: 1, title: 'Space Cadet', xpRequired: 0, color: '#6B7280', badgeEmoji: '🚀', unlocksDescription: 'Your journey begins!' },
  { level: 2, title: 'Explorer', xpRequired: 60, color: '#1FC8C0', badgeEmoji: '🌙', unlocksDescription: 'Moon missions unlocked' },
  { level: 3, title: 'Star Explorer', xpRequired: 150, color: '#F5A623', badgeEmoji: '⭐', unlocksDescription: 'Advanced Moon missions' },
  { level: 4, title: 'Lunar Navigator', xpRequired: 260, color: '#38BDF8', badgeEmoji: '🧭', unlocksDescription: 'Mars missions unlocked' },
  { level: 5, title: 'Mission Expert', xpRequired: 400, color: '#8B5CF6', badgeEmoji: '🔭', unlocksDescription: 'Resource management specialist' },
  { level: 6, title: 'Flight Officer', xpRequired: 550, color: '#22C55E', badgeEmoji: '🛰️', unlocksDescription: 'Environmental emergencies' },
  { level: 7, title: 'Mars Pioneer', xpRequired: 720, color: '#EF4444', badgeEmoji: '🔴', unlocksDescription: 'Critical system repair' },
  { level: 8, title: 'Systems Engineer', xpRequired: 900, color: '#F97316', badgeEmoji: '🛠️', unlocksDescription: 'Survival command training' },
  { level: 9, title: 'Resource Hunter', xpRequired: 1090, color: '#06B6D4', badgeEmoji: '🧊', unlocksDescription: 'Polar ice and in-situ resources' },
  { level: 10, title: 'Commander', xpRequired: 1270, color: '#EF4444', badgeEmoji: '🪐', unlocksDescription: 'Greenhouse and food systems' },
  { level: 11, title: 'Senior Commander', xpRequired: 1460, color: '#A855F7', badgeEmoji: '☀️', unlocksDescription: 'Space weather protection' },
  { level: 12, title: 'Expedition Leader', xpRequired: 1650, color: '#14B8A6', badgeEmoji: '🚙', unlocksDescription: 'Long-range surface expeditions' },
  { level: 13, title: 'Signal Chief', xpRequired: 1840, color: '#3B82F6', badgeEmoji: '📡', unlocksDescription: 'Deep-space communications' },
  { level: 14, title: 'Fleet Captain', xpRequired: 2020, color: '#EAB308', badgeEmoji: '⚓', unlocksDescription: 'Planetary chemistry mastery' },
  { level: 15, title: 'Crisis Commander', xpRequired: 2200, color: '#F43F5E', badgeEmoji: '🚨', unlocksDescription: 'Emergency response authority' },
  { level: 16, title: 'Rear Admiral', xpRequired: 2380, color: '#8B5CF6', badgeEmoji: '🎖️', unlocksDescription: 'Propellant and return logistics' },
  { level: 17, title: 'Vice Admiral', xpRequired: 2550, color: '#EC4899', badgeEmoji: '🌪️', unlocksDescription: 'Storm survival doctrine' },
  { level: 18, title: 'Admiral', xpRequired: 2700, color: '#F5A623', badgeEmoji: '🌌', unlocksDescription: 'Elite explorer' },
  { level: 19, title: 'Fleet Admiral', xpRequired: 2850, color: '#FACC15', badgeEmoji: '🏅', unlocksDescription: 'Final trial unlocked' },
  { level: 20, title: 'ASTRA Legend', xpRequired: 3000, color: '#FDE047', badgeEmoji: '👑', unlocksDescription: 'Maximum rank. A Legend of Mission Control' },
]

export const MAX_LEVEL = LEVELS.length

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
