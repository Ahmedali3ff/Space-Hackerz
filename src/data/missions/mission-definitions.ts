// src/data/missions/mission-definitions.ts
// Defines the 8-mission progression arc for ASTRA — Mission Control Academy.
// Moon missions (m01–m03, m07) and Mars missions (m04–m06, m08) form one
// continuous story: Level → Learn → Play → Decision → Consequence → Next Level.
// NO React, Zustand, or Phaser imports in this file.

// ── Task rule literals ───────────────────────────────────────────────────────

export type MissionTaskRule =
  | 'survive_10_days'
  | 'survive_30_days'
  | 'survive_60_days'
  | 'survive_90_days'
  | 'survive_lunar_night'
  | 'keep_oxygen_50pct'
  | 'resolve_1_event'
  | 'resolve_2_events'
  | 'resolve_3_events'
  | 'use_emergency_ration'
  | 'configure_life_support'
  | 'select_mars'
  | 'keep_resources_above_critical'
  | 'score_500'

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface MissionTask {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly rule: MissionTaskRule
}

export interface MissionRewards {
  readonly stars: number
  readonly badge: string
}

export interface MissionDefinition {
  readonly id: string
  readonly number: number
  readonly title: string
  readonly subtitle: string
  readonly planet: 'moon' | 'mars'
  readonly duration: 30 | 60 | 90
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced'
  readonly description: string
  readonly objectives: readonly string[]
  readonly rewards: MissionRewards
  readonly tasks: readonly MissionTask[]
  readonly unlockRequirement?: string
  // ── Campaign / hybrid gameplay fields (optional, additive) ──
  readonly levelId?: string
  readonly storyIntro?: string
  readonly storyOutro?: string
  readonly location?: string
  readonly bgTheme?: 'moon' | 'mars' | 'earth'
  readonly conceptTaught?: string
  readonly difficultyLabel?: string
  readonly interactiveRooms?: readonly string[]
}

// ── Mission definitions ──────────────────────────────────────────────────────

const MISSION_01: MissionDefinition = {
  id: 'm01',
  number: 1,
  title: 'First Steps on the Moon',
  subtitle: 'Lunar Exploration — Beginner',
  planet: 'moon',
  duration: 30,
  difficulty: 'beginner',
  levelId: 'level-1',
  bgTheme: 'moon',
  conceptTaught: 'Life Support Systems',
  difficultyLabel: 'Beginner',
  storyIntro: 'You have just landed on the Moon for the very first time. Mission Control is counting on you to set up the habitat and keep your crew safe!',
  storyOutro: 'Incredible work, Commander! You survived your first lunar adventure and proved you have what it takes to lead a crew in space.',
  description:
    'Begin your lunar adventure! Set up your life-support systems, survive your first 10 days on the Moon, and handle your first unexpected event.',
  objectives: [
    'Configure your habitat life-support systems',
    'Survive 10 days on the lunar surface',
    'Successfully resolve an environmental event',
  ],
  rewards: { stars: 3, badge: 'Lunar Pioneer' },
  tasks: [
    {
      id: 'm01-t01',
      label: 'Configure Life Support',
      description: 'Set up your habitat\'s oxygen, water, and power systems before launch.',
      rule: 'configure_life_support',
    },
    {
      id: 'm01-t02',
      label: 'Survive 10 Days',
      description: 'Keep your crew alive through the first 10 days on the Moon.',
      rule: 'survive_10_days',
    },
    {
      id: 'm01-t03',
      label: 'Handle an Event',
      description: 'Respond to one unexpected environmental challenge.',
      rule: 'resolve_1_event',
    },
  ],
}

const MISSION_02: MissionDefinition = {
  id: 'm02',
  number: 2,
  title: 'Lunar Long-Stay',
  subtitle: 'Lunar Exploration — Beginner',
  planet: 'moon',
  duration: 60,
  difficulty: 'beginner',
  levelId: 'level-2',
  bgTheme: 'moon',
  conceptTaught: 'Oxygen Management',
  difficultyLabel: 'Explorer',
  storyIntro: 'You are back on the Moon, but this time the mission lasts a full month. Can you keep the oxygen flowing and handle everything the Moon throws at you?',
  storyOutro: 'You managed oxygen like a true expert! The crew is healthy, and ASTRA HQ is proud of your 30-day achievement.',
  description:
    'Push further! Maintain healthy oxygen levels and survive a full 30 days while managing multiple unexpected events.',
  objectives: [
    'Keep oxygen levels above 50% throughout the mission',
    'Survive 30 days on the lunar surface',
    'Successfully resolve two environmental events',
  ],
  rewards: { stars: 3, badge: 'Oxygen Guardian' },
  tasks: [
    {
      id: 'm02-t01',
      label: 'Maintain Oxygen Levels',
      description: 'Keep oxygen above 50% of starting levels at all times.',
      rule: 'keep_oxygen_50pct',
    },
    {
      id: 'm02-t02',
      label: 'Survive 30 Days',
      description: 'Keep your crew alive for a full 30-day lunar mission.',
      rule: 'survive_30_days',
    },
    {
      id: 'm02-t03',
      label: 'Handle Two Events',
      description: 'Respond to two unexpected environmental challenges.',
      rule: 'resolve_2_events',
    },
  ],
  unlockRequirement: 'm01',
}

const MISSION_03: MissionDefinition = {
  id: 'm03',
  number: 3,
  title: 'Lunar Night Survival',
  subtitle: 'Lunar Exploration — Intermediate',
  planet: 'moon',
  duration: 30,
  difficulty: 'intermediate',
  levelId: 'level-3',
  bgTheme: 'moon',
  conceptTaught: 'Power & Lunar Night',
  difficultyLabel: 'Challenger',
  storyIntro: 'The sky goes dark and the temperature plummets — the lunar night has begun. Every watt of power counts. Your crew is depending on you!',
  storyOutro: 'You guided your crew through 14 days of total darkness! That is the mark of a real mission commander.',
  description:
    'The lunar night is coming — 14 days of total darkness. Keep all critical resources above zero and use emergency rations to survive.',
  objectives: [
    'Survive through a full lunar night (28 days)',
    'Keep all critical resources above zero',
    'Use emergency rations when needed',
  ],
  rewards: { stars: 4, badge: 'Night Survivor' },
  tasks: [
    {
      id: 'm03-t01',
      label: 'Survive the Lunar Night',
      description: 'Endure 28 days on the Moon, including the 14-day period of darkness.',
      rule: 'survive_lunar_night',
    },
    {
      id: 'm03-t02',
      label: 'Keep Resources Above Critical',
      description: 'Maintain oxygen, water, and food above zero at all times.',
      rule: 'keep_resources_above_critical',
    },
    {
      id: 'm03-t03',
      label: 'Use Emergency Rations',
      description: 'Deploy emergency food rations at least once during the mission.',
      rule: 'use_emergency_ration',
    },
  ],
  unlockRequirement: 'm02',
}

const MISSION_04: MissionDefinition = {
  id: 'm04',
  number: 4,
  title: 'First Steps on Mars',
  subtitle: 'Martian Exploration — Intermediate',
  planet: 'mars',
  duration: 30,
  difficulty: 'intermediate',
  levelId: 'level-4',
  bgTheme: 'mars',
  conceptTaught: 'Mars Environment',
  difficultyLabel: 'Pioneer',
  storyIntro: 'The red planet awaits! You are the first ASTRA commander to set foot on Mars. The thin atmosphere and reddish sky feel very different from the Moon.',
  storyOutro: 'Welcome to the Mars Club! You survived your first sols on the red planet and opened the door for every future Martian explorer.',
  description:
    'Take humanity\'s next giant leap — land on Mars! Navigate the thin atmosphere, handle dust storms, and keep your crew safe for 10 Martian sols.',
  objectives: [
    'Choose Mars as your mission destination',
    'Survive 10 Martian sols',
    'Respond to a Martian environmental event',
  ],
  rewards: { stars: 4, badge: 'Mars Trailblazer' },
  tasks: [
    {
      id: 'm04-t01',
      label: 'Choose Mars',
      description: 'Select Mars as your mission destination in the planet selection screen.',
      rule: 'select_mars',
    },
    {
      id: 'm04-t02',
      label: 'Survive 10 Sols',
      description: 'Keep your crew alive for the first 10 Martian sols.',
      rule: 'survive_10_days',
    },
    {
      id: 'm04-t03',
      label: 'Handle a Martian Event',
      description: 'Respond to one Martian environmental challenge (dust storm, cold snap, etc.).',
      rule: 'resolve_1_event',
    },
  ],
  unlockRequirement: 'm02',
}

const MISSION_05: MissionDefinition = {
  id: 'm05',
  number: 5,
  title: 'Martian Long-Stay',
  subtitle: 'Martian Exploration — Advanced',
  planet: 'mars',
  duration: 60,
  difficulty: 'advanced',
  levelId: 'level-5',
  bgTheme: 'mars',
  conceptTaught: 'Dust Storm Management',
  difficultyLabel: 'Expert',
  storyIntro: 'A giant dust storm is sweeping across Mars, blocking the Sun for weeks. You need every system running perfectly — one wrong call and the mission is over.',
  storyOutro: 'You weathered the storm and kept your crew alive through 60 challenging sols. You are a true Martian Veteran!',
  description:
    'An extended Martian mission puts your skills to the ultimate test. Survive 60 sols, resolve three major events, and keep all critical systems running.',
  objectives: [
    'Survive 60 Martian sols',
    'Resolve three major environmental events',
    'Keep all critical resources above zero',
  ],
  rewards: { stars: 5, badge: 'Martian Veteran' },
  tasks: [
    {
      id: 'm05-t01',
      label: 'Survive 60 Sols',
      description: 'Keep your crew alive through 60 Martian sols.',
      rule: 'survive_60_days',
    },
    {
      id: 'm05-t02',
      label: 'Resolve Three Events',
      description: 'Successfully handle three major environmental challenges.',
      rule: 'resolve_3_events',
    },
    {
      id: 'm05-t03',
      label: 'Maintain Critical Resources',
      description: 'Never allow oxygen, water, or food to reach zero.',
      rule: 'keep_resources_above_critical',
    },
  ],
  unlockRequirement: 'm04',
}

const MISSION_06: MissionDefinition = {
  id: 'm06',
  number: 6,
  title: 'Mars 90-Day Challenge',
  subtitle: 'Martian Exploration — Advanced',
  planet: 'mars',
  duration: 90,
  difficulty: 'advanced',
  levelId: 'level-6',
  bgTheme: 'mars',
  conceptTaught: 'Long-Duration Mission',
  difficultyLabel: 'Master',
  storyIntro: 'Ninety sols. Every resource checked. Every decision counts. This is the longest and hardest mission ASTRA has ever attempted on Mars.',
  storyOutro: 'You did it — 90 sols on Mars with a score of 500+! The Mars Pioneer badge is yours. The whole world is watching and cheering!',
  description:
    'The ultimate challenge: 90 sols on Mars. Achieve a score of 500+, survive through constant Martian threats, and earn the legendary Mars Pioneer badge.',
  objectives: [
    'Survive 90 Martian sols — the full mission',
    'Achieve a mission score of 500 or higher',
    'Resolve three major environmental events',
  ],
  rewards: { stars: 5, badge: 'Mars Pioneer' },
  tasks: [
    {
      id: 'm06-t01',
      label: 'Survive 90 Sols',
      description: 'Complete the full 90-sol Mars mission with your crew intact.',
      rule: 'survive_90_days',
    },
    {
      id: 'm06-t02',
      label: 'Score 500 Points',
      description: 'Earn a final mission score of 500 or higher.',
      rule: 'score_500',
    },
    {
      id: 'm06-t03',
      label: 'Resolve Three Events',
      description: 'Handle three major environmental challenges during the mission.',
      rule: 'resolve_3_events',
    },
  ],
  unlockRequirement: 'm05',
}

const MISSION_07: MissionDefinition = {
  id: 'm07',
  number: 7,
  title: 'Return to the Moon',
  subtitle: 'Advanced Lunar — Expert',
  planet: 'moon',
  duration: 60,
  difficulty: 'advanced',
  levelId: 'level-7',
  bgTheme: 'moon',
  conceptTaught: 'Radiation Management',
  difficultyLabel: 'Expert',
  storyIntro: 'Mission Control calls you back to the Moon — but this time, solar flares and micrometeorite impacts make every single day dangerous.',
  storyOutro: 'You mastered the radiation challenge! Your crew walked away healthy and ASTRA now has the knowledge to protect future missions.',
  description:
    'The Moon is calling again — but this time, solar flares and micrometeorite impacts make every day dangerous. Master radiation management to protect your crew.',
  objectives: [
    'Survive 60 days under elevated radiation threat',
    'Resolve 3 solar flare events',
    'Keep cumulative radiation below critical levels',
  ],
  rewards: { stars: 5, badge: 'Radiation Shield' },
  tasks: [
    {
      id: 'm07-t01',
      label: 'Survive 60 Days',
      description: 'Keep crew alive for 60 days.',
      rule: 'survive_60_days',
    },
    {
      id: 'm07-t02',
      label: 'Resolve 3 Events',
      description: 'Handle 3 radiation/impact events.',
      rule: 'resolve_3_events',
    },
    {
      id: 'm07-t03',
      label: 'Maintain Resources',
      description: 'Keep all resources above zero.',
      rule: 'keep_resources_above_critical',
    },
  ],
  unlockRequirement: 'm06',
}

const MISSION_08: MissionDefinition = {
  id: 'm08',
  number: 8,
  title: 'The Grand Mars Expedition',
  subtitle: 'Ultimate Challenge — Master',
  planet: 'mars',
  duration: 90,
  difficulty: 'advanced',
  levelId: 'level-8',
  bgTheme: 'mars',
  conceptTaught: 'Full Mission Management',
  difficultyLabel: 'Master',
  storyIntro: 'The toughest mission in ASTRA history begins now. Ninety sols on Mars during a global dust storm cycle. Every resource matters. Every decision counts.',
  storyOutro: 'You are the greatest Mission Commander ASTRA has ever seen! Your legend will inspire generations of space explorers.',
  description:
    'The ultimate ASTRA challenge: 90 sols on Mars during a global dust storm cycle. Every resource matters. Every decision counts. This is what Mission Commanders are made of.',
  objectives: [
    'Complete the full 90-sol Mars mission',
    'Achieve a score of 500+',
    'Survive a global dust storm',
  ],
  rewards: { stars: 5, badge: 'Grand Explorer' },
  tasks: [
    {
      id: 'm08-t01',
      label: 'Complete 90 Sols',
      description: 'Survive the full 90-sol mission.',
      rule: 'survive_90_days',
    },
    {
      id: 'm08-t02',
      label: 'Score 500+',
      description: 'Earn a final score of 500 or higher.',
      rule: 'score_500',
    },
    {
      id: 'm08-t03',
      label: 'Resolve 3 Events',
      description: 'Handle 3 major environmental events.',
      rule: 'resolve_3_events',
    },
  ],
  unlockRequirement: 'm07',
}

// ── Public exports ────────────────────────────────────────────────────────────

export const MISSIONS: readonly MissionDefinition[] = [
  MISSION_01,
  MISSION_02,
  MISSION_03,
  MISSION_04,
  MISSION_05,
  MISSION_06,
  MISSION_07,
  MISSION_08,
]

export function getMissionById(id: string): MissionDefinition | undefined {
  try {
    return MISSIONS.find((m) => m.id === id)
  } catch (error) {
    // Log error but don't crash — return undefined to allow caller to handle
    console.error('[mission-definitions] Error loading mission:', id, error)
    return undefined
  }
}

// Validate missions array on module load to catch configuration errors early
if (MISSIONS.length === 0) {
  throw new Error('[mission-definitions] MISSIONS array is empty — check mission configuration')
}

// Validate all mission IDs are unique
const idSet = new Set<string>()
for (const mission of MISSIONS) {
  if (idSet.has(mission.id)) {
    throw new Error(`[mission-definitions] Duplicate mission ID found: ${mission.id}`)
  }
  idSet.add(mission.id)
}
