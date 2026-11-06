// src/game3d/types/game3d.types.ts
import type { ResourceSnapshot } from '@simulation/types'

export interface BuildingDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly position: readonly [number, number, number]
  readonly type: 'dome' | 'solar' | 'dish' | 'generator' | 'greenhouse' | 'airlock'
  readonly interactionRadius: number
  readonly resourceKey: keyof ResourceSnapshot | null
  readonly tip: string
}

export interface DialogLine {
  readonly character: 'commander' | 'engineer' | 'scientist' | 'ai'
  readonly text: string
  readonly durationMs: number
}

export interface BuildingStatus {
  readonly id: string
  readonly status: 'nominal' | 'warning' | 'critical'
  readonly resourcePct: number
}

export const HABITAT_BUILDINGS: readonly BuildingDef[] = [
  {
    id: 'life-support',
    name: 'Life Support',
    emoji: '🫁',
    position: [-6, 0, -4],
    type: 'dome',
    interactionRadius: 4,
    resourceKey: 'oxygen_kg',
    tip: 'Keeps air breathable. Each crew member uses ~0.84 kg O₂/day.',
  },
  {
    id: 'command-center',
    name: 'Command Center',
    emoji: '🖥️',
    position: [0, 0, -5],
    type: 'dome',
    interactionRadius: 4,
    resourceKey: null,
    tip: 'Mission hub. Talk to Astro-AI and review mission status here.',
  },
  {
    id: 'power-room',
    name: 'Power Room',
    emoji: '⚡',
    position: [6, 0, -4],
    type: 'generator',
    interactionRadius: 4,
    resourceKey: 'energy_kWh',
    tip: 'Battery storage and power distribution for all systems.',
  },
  {
    id: 'solar-panels',
    name: 'Solar Array',
    emoji: '☀️',
    position: [-10, 0, 0],
    type: 'solar',
    interactionRadius: 5,
    resourceKey: 'energy_kWh',
    tip: 'Main power source. Output drops during lunar night and Mars dust storms.',
  },
  {
    id: 'water-recycling',
    name: 'Water Recycling',
    emoji: '💧',
    position: [10, 0, 0],
    type: 'dome',
    interactionRadius: 4,
    resourceKey: 'water_kg',
    tip: 'Recycles 85% of water used by the crew every day.',
  },
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    emoji: '🌱',
    position: [-6, 0, 4],
    type: 'greenhouse',
    interactionRadius: 4,
    resourceKey: 'food_kg',
    tip: 'Grows food using LED lights and nutrient solution.',
  },
  {
    id: 'communications',
    name: 'Comms Tower',
    emoji: '📡',
    position: [6, 0, 4],
    type: 'dish',
    interactionRadius: 4,
    resourceKey: null,
    tip: 'Stay in contact with Mission Control on Earth.',
  },
  {
    id: 'airlock',
    name: 'Airlock',
    emoji: '🚪',
    position: [0, 0, 6],
    type: 'airlock',
    interactionRadius: 4,
    resourceKey: null,
    tip: 'Exit for EVA repairs and resource scouting outside the habitat.',
  },
] as const
