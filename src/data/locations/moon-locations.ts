// src/data/locations/moon-locations.ts
// Three Moon landing sites with educational simulation modifiers.
// EDUCATIONAL_ASSUMPTION: all modifier values are simplified educational approximations.

import type { LocationModifier } from '@simulation/planets/location-modifier'

export interface LandingLocation {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly planet: 'moon' | 'mars'
  readonly modifier: LocationModifier
  readonly imageEmoji: string
  readonly highlights: readonly string[]
}

/** EDUCATIONAL_ASSUMPTION: Modifier values are simplified educational approximations */
export const MOON_LOCATIONS: readonly LandingLocation[] = [
  {
    id: 'moon-equatorial',
    name: 'Equatorial Plains',
    planet: 'moon',
    description: 'Standard landing zone. Moderate sunlight and radiation.',
    imageEmoji: '🌕',
    highlights: ['Good solar access', 'Well-studied terrain', 'Moderate temperatures'],
    modifier: {
      solarIrradiance_factor: 1.0,
      radiationDelta_mSv: 0,
      temperatureMin_delta: 0,
      temperatureMax_delta: 0,
      dustFactor: 1.0,
      classificationNote: 'EDUCATIONAL_ASSUMPTION: Baseline equatorial site',
    },
  },
  {
    id: 'moon-south-pole',
    name: 'South Pole — Shackleton Crater',
    planet: 'moon',
    description: 'Near-permanently shadowed region. Water ice access but reduced solar.',
    imageEmoji: '❄️',
    highlights: ['Water ice nearby', 'Stable temperatures', 'Reduced sunlight'],
    modifier: {
      solarIrradiance_factor: 0.3,
      radiationDelta_mSv: -0.1,
      temperatureMin_delta: -50,
      temperatureMax_delta: -80,
      dustFactor: 0.7,
      classificationNote: 'EDUCATIONAL_ASSUMPTION: PSR polar site approximation',
    },
  },
  {
    id: 'moon-mare-tranquillitatis',
    name: 'Mare Tranquillitatis',
    planet: 'moon',
    description: 'Historic Apollo landing zone. Flat basaltic plains, excellent solar.',
    imageEmoji: '🌑',
    highlights: ['Historic site', 'Flat terrain', 'High solar exposure'],
    modifier: {
      solarIrradiance_factor: 1.1,
      radiationDelta_mSv: 0.05,
      temperatureMin_delta: 5,
      temperatureMax_delta: 10,
      dustFactor: 1.2,
      classificationNote: 'EDUCATIONAL_ASSUMPTION: Apollo 11 site approximation',
    },
  },
]

export function getMoonLocationById(id: string): LandingLocation | undefined {
  return MOON_LOCATIONS.find((l) => l.id === id)
}
