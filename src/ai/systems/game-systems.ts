// src/ai/systems/game-systems.ts
// Explanations of the game systems. Behaviour statements come from the engine's fault names and actions.
// Real-world notes cite only the Lumi reference sources (ids checked against the team's data).
// NO React, Zustand, or Phaser imports.

export interface GameSystem {
  readonly id: string
  readonly name: string
  readonly summary: string
  /** How the system behaves in ASTRA's simulation. */
  readonly inGame: string
  /** Real-world context. Mark simplifications clearly. */
  readonly realWorld: string
  /** Why it matters for the crew. */
  readonly importance: string
  /** Lumi source ids that back the real-world note. */
  readonly sourceIds: readonly string[]
}

export const GAME_SYSTEMS: readonly GameSystem[] = [
  {
    id: 'oxygen',
    name: 'Oxygen',
    summary: 'Breathable air for the crew.',
    inGame: 'The oxygen reserve falls every day with crew breathing. When it reaches zero the engine sets OXYGEN_DEPLETED, which is a critical failure.',
    realWorld: 'Crews breathe about 0.72 to 0.82 kg of oxygen a day, depending on activity. ASTRA uses this scale as a simplified reference.',
    importance: 'Without oxygen the crew cannot survive for more than a few minutes, so oxygen is always the first resource to protect.',
    sourceIds: ['NASA-OCHMO-TB-004', 'NASA-ICES-2024-101'],
  },
  {
    id: 'water',
    name: 'Water',
    summary: 'Drinking water, food preparation and hygiene.',
    inGame: 'Water is used every day. Recovery adds water back. When the reserve reaches zero the engine sets WATER_DEPLETED.',
    realWorld: 'Crews need about 2.5 litres a day for hydration. Real stations recycle most of their water, and the ISS reached 98% recovery.',
    importance: 'Water is needed for drinking, food and hygiene, so a shortage hits health quickly.',
    sourceIds: ['NASA-WATER-01', 'NASA-ISS-WR-98'],
  },
  {
    id: 'food',
    name: 'Food',
    summary: 'Crew nutrition and long-term supplies.',
    inGame: 'Food is consumed daily. Emergency rations stretch food when it is low. When food reaches zero the engine sets FOOD_DEPLETED.',
    realWorld: 'The daily provision is about 3,035 kcal per person, and food shelf life depends on the packaging and processing type.',
    importance: 'A food shortage weakens the crew over time, so supplies must be planned well ahead.',
    sourceIds: ['NASA-STD-3001', 'NASA-OCHMO-TB-013'],
  },
  {
    id: 'energy',
    name: 'Energy',
    summary: 'Electrical power for life support and equipment.',
    inGame: 'Energy drains each day and recovers from solar output where the planet provides it. When power becomes critical the engine sets POWER_CRITICAL.',
    realWorld: 'Solar output on Mars drops during dust storms, and lunar nights last about 14 Earth days. Fission power is a planned future option.',
    importance: 'Life support runs on power, so an energy shortage affects every other system.',
    sourceIds: ['REF04', 'REF07', 'REF08'],
  },
  {
    id: 'radiation',
    name: 'Radiation',
    summary: 'Cumulative radiation dose to the crew.',
    inGame: 'Radiation dose builds up over the mission. At the high threshold the engine sets RADIATION_HIGH, and at the critical threshold RADIATION_CRITICAL.',
    realWorld: 'Neither the Moon nor Mars has a strong magnetic field or thick atmosphere, so crews need shielding and shelter during solar storms.',
    importance: 'Radiation damage accumulates and cannot be undone, so exposure must be limited from the start.',
    sourceIds: ['REF07'],
  },
  {
    id: 'decisions',
    name: 'Decisions and events',
    summary: 'Choices that change the mission.',
    inGame: 'Each day you advance, resolve an event with one of its choices, or use emergency rations. The engine records each decision and whether it was optimal.',
    realWorld: 'Real mission control also weighs trade-offs between resources, risk and time.',
    importance: 'Decisions set the outcome, and the debrief explains them afterwards.',
    sourceIds: [],
  },
]

export function findSystem(id: string): GameSystem | undefined {
  return GAME_SYSTEMS.find((s) => s.id === id)
}
