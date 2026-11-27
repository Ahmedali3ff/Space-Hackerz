// server/lib/levels.ts
// Server copy of the rank table in src/data/levels/level-definitions.ts.
// tests/unit/server/levels-sync.test.ts fails if the two drift apart.

export interface LevelDef { level: number; title: string; minXP: number }

export const LEVEL_DEFS: readonly LevelDef[] = [
  { level: 1, title: 'Space Cadet', minXP: 0 },
  { level: 2, title: 'Explorer', minXP: 60 },
  { level: 3, title: 'Star Explorer', minXP: 150 },
  { level: 4, title: 'Lunar Navigator', minXP: 260 },
  { level: 5, title: 'Mission Expert', minXP: 400 },
  { level: 6, title: 'Flight Officer', minXP: 550 },
  { level: 7, title: 'Mars Pioneer', minXP: 720 },
  { level: 8, title: 'Systems Engineer', minXP: 900 },
  { level: 9, title: 'Resource Hunter', minXP: 1090 },
  { level: 10, title: 'Commander', minXP: 1270 },
  { level: 11, title: 'Senior Commander', minXP: 1460 },
  { level: 12, title: 'Expedition Leader', minXP: 1650 },
  { level: 13, title: 'Signal Chief', minXP: 1840 },
  { level: 14, title: 'Fleet Captain', minXP: 2020 },
  { level: 15, title: 'Crisis Commander', minXP: 2200 },
  { level: 16, title: 'Rear Admiral', minXP: 2380 },
  { level: 17, title: 'Vice Admiral', minXP: 2550 },
  { level: 18, title: 'Admiral', minXP: 2700 },
  { level: 19, title: 'Fleet Admiral', minXP: 2850 },
  { level: 20, title: 'ASTRA Legend', minXP: 3000 },
]

// Highest XP one award can grant: 3 stars x 20 + mission 20 x 10 = 260.
export const MAX_XP_PER_AWARD = 300

export function getLevelForXP(xp: number): LevelDef {
  let result = LEVEL_DEFS[0] as LevelDef
  for (const def of LEVEL_DEFS) {
    if (xp >= def.minXP) result = def
  }
  return result
}
