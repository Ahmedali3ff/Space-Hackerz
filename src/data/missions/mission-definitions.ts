// src/data/missions/mission-definitions.ts
// Defines the 20-mission progression arc for ASTRA — Mission Control Academy.
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
  unlockRequirement: 'm03',
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


// ── Levels 9–20 ──────────────────────────────────────────────────────────────

type TaskSpec = readonly [label: string, description: string, rule: MissionTaskRule]

interface MissionSpec {
  readonly n: number
  readonly title: string
  readonly kind: string
  readonly planet: 'moon' | 'mars'
  readonly duration: 30 | 60 | 90
  readonly difficulty: 'intermediate' | 'advanced'
  readonly label: string
  readonly concept: string
  readonly intro: string
  readonly outro: string
  readonly description: string
  readonly objectives: readonly string[]
  readonly badge: string
  readonly stars: number
  readonly tasks: readonly TaskSpec[]
}

function buildMission(spec: MissionSpec): MissionDefinition {
  const num = String(spec.n).padStart(2, '0')
  return {
    id: `m${num}`,
    number: spec.n,
    title: spec.title,
    subtitle: `${spec.kind} — ${spec.label}`,
    planet: spec.planet,
    duration: spec.duration,
    difficulty: spec.difficulty,
    levelId: `level-${spec.n}`,
    bgTheme: spec.planet,
    conceptTaught: spec.concept,
    difficultyLabel: spec.label,
    storyIntro: spec.intro,
    storyOutro: spec.outro,
    description: spec.description,
    objectives: spec.objectives,
    rewards: { stars: spec.stars, badge: spec.badge },
    tasks: spec.tasks.map(([label, description, rule], i) => ({
      id: `m${num}-t${String(i + 1).padStart(2, '0')}`,
      label,
      description,
      rule,
    })),
    unlockRequirement: `m${String(spec.n - 1).padStart(2, '0')}`,
  }
}

const S30: TaskSpec = ['Survive 30 Days', 'Keep the crew alive for 30 days.', 'survive_30_days']
const S60: TaskSpec = ['Survive 60 Days', 'Keep the crew alive for 60 days.', 'survive_60_days']
const S90: TaskSpec = ['Survive 90 Days', 'Keep the crew alive for 90 days.', 'survive_90_days']
const OXY: TaskSpec = ['Protect Oxygen Reserves', 'Keep oxygen above 50% of starting levels.', 'keep_oxygen_50pct']
const CRIT: TaskSpec = ['Stay Above Critical', 'Keep all resources out of the critical zone.', 'keep_resources_above_critical']
const SC500: TaskSpec = ['Score 500+', 'Earn a final score of 500 or higher.', 'score_500']
const E1: TaskSpec = ['Resolve 1 Event', 'Handle one unexpected event.', 'resolve_1_event']
const E2: TaskSpec = ['Resolve 2 Events', 'Handle two unexpected events.', 'resolve_2_events']
const E3: TaskSpec = ['Resolve 3 Events', 'Handle three unexpected events.', 'resolve_3_events']

const EXTENDED_MISSION_SPECS: readonly MissionSpec[] = [
  { n: 9, title: 'Polar Ice Prospecting', kind: 'Lunar Resources', planet: 'moon', duration: 60, difficulty: 'intermediate', label: 'Specialist', concept: 'Water Ice and In-Situ Resources',
    intro: 'Permanently shadowed craters near the lunar south pole hold water ice. Your crew must mine it and turn it into drinking water and oxygen.',
    outro: 'Ice from the crater is now drinking water and breathable air. Every litre made on the Moon is one that never has to be launched from Earth.',
    description: 'Survey a shadowed crater, extract ice and purify it while keeping the habitat running.',
    objectives: ['Keep oxygen above 50% while you mine', 'Survive 30 days', 'Resolve two events during extraction'], badge: 'Ice Prospector', stars: 3, tasks: [OXY, S30, E2] },
  { n: 10, title: 'Martian Greenhouse', kind: 'Mars Agriculture', planet: 'mars', duration: 60, difficulty: 'intermediate', label: 'Specialist', concept: 'Closed-Loop Food Production',
    intro: 'Resupply from Earth takes months. The crew must grow its own food under glass while Mars keeps trying to freeze the plants.',
    outro: 'Green leaves under a red sky. The greenhouse is feeding the crew and recycling their air at the same time.',
    description: 'Run a pressurised greenhouse: balance light, water and CO2 so crops survive the Martian cold.',
    objectives: ['Survive 30 sols', 'Keep every resource above its alarm level', 'Resolve one greenhouse event'], badge: 'Greenhouse Keeper', stars: 3, tasks: [S30, CRIT, E1] },
  { n: 11, title: 'Solar Storm Shelter', kind: 'Space Weather', planet: 'moon', duration: 30, difficulty: 'intermediate', label: 'Specialist', concept: 'Radiation Shielding',
    intro: 'A solar particle event is heading for the Moon. With no atmosphere or magnetic field, the crew has hours to reach shelter.',
    outro: 'The storm passed and the dose stayed low. Shelter, shielding and time are the three tools of radiation safety.',
    description: 'Get the crew into the storm shelter, reconfigure the habitat and ride out a radiation spike.',
    objectives: ['Survive 30 days', 'Resolve the radiation event', 'Keep resources above critical levels'], badge: 'Storm Warden', stars: 3, tasks: [S30, E1, CRIT] },
  { n: 12, title: 'Rover Expedition', kind: 'Surface Exploration', planet: 'mars', duration: 60, difficulty: 'intermediate', label: 'Specialist', concept: 'EVA Planning and Margins',
    intro: 'Scientists want rock samples from a canyon 40 km away. Plan the route, check the suits, and be back before the oxygen runs out.',
    outro: 'Samples secured and the whole crew back inside. Good EVA planning is mostly about margins.',
    description: 'Plan and run a long rover excursion with strict oxygen and power margins.',
    objectives: ['Survive 30 sols', 'Keep oxygen above 50%', 'Resolve two events on the road'], badge: 'Trailblazer', stars: 3, tasks: [S30, E2, OXY] },
  { n: 13, title: 'Far Side Blackout', kind: 'Communications', planet: 'moon', duration: 60, difficulty: 'advanced', label: 'Expert', concept: 'Communication Relays',
    intro: 'On the far side of the Moon, radio waves cannot reach Earth. When the relay fails, the crew is on its own.',
    outro: 'The link is back. Without a relay in orbit the far side is silent, so redundancy is not optional.',
    description: 'Restore the relay link while managing the habitat without help from Mission Control.',
    objectives: ['Survive 60 days', 'Resolve two events without Earth support', 'Reach a score of 500'], badge: 'Signal Keeper', stars: 4, tasks: [S60, E2, SC500] },
  { n: 14, title: 'Regolith Processing', kind: 'Mars Chemistry', planet: 'mars', duration: 60, difficulty: 'advanced', label: 'Expert', concept: 'Toxic Soil and Perchlorates',
    intro: 'Martian soil contains perchlorates that are toxic to humans and plants. Before it becomes farmland, it has to be washed.',
    outro: 'The soil is clean and the beds are planted. Chemistry turned a hazard into a harvest.',
    description: 'Process toxic regolith safely and feed the greenhouse without contaminating the habitat.',
    objectives: ['Survive 60 sols', 'Keep resources above critical levels', 'Resolve two contamination events'], badge: 'Soil Chemist', stars: 4, tasks: [S60, CRIT, E2] },
  { n: 15, title: 'Hull Breach', kind: 'Habitat Emergency', planet: 'moon', duration: 30, difficulty: 'advanced', label: 'Expert', concept: 'Pressure Loss Response',
    intro: 'A micrometeoroid has punched through the hull. Air is leaking and the crew has minutes, not hours.',
    outro: 'Sealed, repressurised and verified. In a breach, isolating the damaged module comes before everything else.',
    description: 'Isolate the leaking module, patch the hull and bring the habitat back to full pressure.',
    objectives: ['Keep oxygen above 50%', 'Resolve the breach event', 'Survive 30 days'], badge: 'Breach Responder', stars: 4, tasks: [OXY, E1, S30] },
  { n: 16, title: 'Propellant Depot', kind: 'Mars Industry', planet: 'mars', duration: 90, difficulty: 'advanced', label: 'Expert', concept: 'Making Fuel from Martian CO2',
    intro: 'The ride home needs fuel, and Mars has the ingredients: carbon dioxide in the air and water in the ground.',
    outro: 'The tanks are filling. Making methane on Mars turns a one-way trip into a round trip.',
    description: 'Build a propellant depot using the Sabatier reaction while keeping the crew supplied.',
    objectives: ['Survive 60 sols', 'Reach a score of 500', 'Resolve three events'], badge: 'Fuel Maker', stars: 4, tasks: [S60, SC500, E3] },
  { n: 17, title: 'Global Dust Storm', kind: 'Mars Survival', planet: 'mars', duration: 90, difficulty: 'advanced', label: 'Master', concept: 'Power Budgeting Under Blackout',
    intro: 'A planet-wide dust storm has blotted out the Sun. Solar panels are producing almost nothing and the storm could last for weeks.',
    outro: 'The sky is clearing. You rationed power like a commander and the crew never lost life support.',
    description: 'Survive weeks of near-zero solar power by cutting loads and protecting life support first.',
    objectives: ['Survive 90 sols', 'Use an emergency ration if needed', 'Keep resources above critical levels'], badge: 'Storm Survivor', stars: 5,
    tasks: [S90, ['Use Emergency Rations', 'Use an emergency ration to stretch supplies.', 'use_emergency_ration'], CRIT] },
  { n: 18, title: 'The Long Lunar Night', kind: 'Lunar Survival', planet: 'moon', duration: 90, difficulty: 'advanced', label: 'Master', concept: 'Surviving 14 Days of Darkness',
    intro: 'For two weeks the Sun will not rise. Temperatures plunge, solar power is gone and batteries are all you have.',
    outro: 'Dawn breaks over the ridge. You carried the crew through the longest night in the Solar System.',
    description: 'Endure a full lunar night on stored energy, heaters and careful power discipline.',
    objectives: ['Survive the lunar night', 'Keep oxygen above 50%', 'Reach a score of 500'], badge: 'Night Walker', stars: 5,
    tasks: [['Survive the Lunar Night', 'Make it through the full lunar night.', 'survive_lunar_night'], OXY, SC500] },
  { n: 19, title: 'Medical Emergency', kind: 'Crew Health', planet: 'mars', duration: 90, difficulty: 'advanced', label: 'Master', concept: 'Remote Medicine',
    intro: 'A crew member is injured and Earth is twenty light-minutes away. Help will not come from Mission Control. You are the help.',
    outro: 'Your crewmate is stable and recovering. Autonomy is the real test of a deep-space mission.',
    description: 'Treat an injured astronaut with limited supplies while the base keeps running.',
    objectives: ['Survive 90 sols', 'Resolve three events', 'Keep resources above critical levels'], badge: 'Crew Guardian', stars: 5, tasks: [S90, E3, CRIT] },
  { n: 20, title: "Commander's Final Trial", kind: 'Legend Challenge', planet: 'mars', duration: 90, difficulty: 'advanced', label: 'Legend', concept: 'Everything, All at Once',
    intro: 'Dust storm, failing power, a sick crewmate and a closing launch window. This is the mission every commander is measured against.',
    outro: 'ASTRA has never seen anything like it. You are a Legend of Mission Control.',
    description: 'The ultimate test: a cascade of failures that needs every skill you have learned across 19 missions.',
    objectives: ['Survive 90 sols', 'Reach a score of 500', 'Resolve three events', 'Keep resources above critical levels'], badge: 'ASTRA Legend', stars: 5, tasks: [S90, SC500, E3, CRIT] },
]

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
  ...EXTENDED_MISSION_SPECS.map(buildMission),
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
