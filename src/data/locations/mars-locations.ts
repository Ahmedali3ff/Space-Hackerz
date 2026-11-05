// src/data/locations/mars-locations.ts
// Three Mars landing sites with educational simulation modifiers.
// EDUCATIONAL_ASSUMPTION: all modifier values are simplified educational approximations.

import type { LocationModifier } from '@simulation/planets/location-modifier'
import type { LandingLocation } from './moon-locations'

export type { LandingLocation }

/** EDUCATIONAL_ASSUMPTION: Modifier values are simplified educational approximations */
export const MARS_LOCATIONS: readonly LandingLocation[] = [
  {
    id: 'mars-gale-crater',
    name: 'Gale Crater',
    planet: 'mars',
    description: 'Curiosity rover landing site. Rich in geological history.',
    imageEmoji: '🔴',
    highlights: ['Geological diversity', 'Curiosity rover explored here', 'Moderate dust risk'],
    modifier: {
      solarIrradiance_factor: 1.0,
      radiationDelta_mSv: 0,
      temperatureMin_delta: 0,
      temperatureMax_delta: 0,
      dustFactor: 1.0,
      classificationNote: 'EDUCATIONAL_ASSUMPTION: Baseline Mars site',
    } satisfies LocationModifier,
  },
  {
    id: 'mars-jezero-crater',
    name: 'Jezero Crater',
    planet: 'mars',
    description: 'Perseverance rover site. Ancient river delta, high science value.',
    imageEmoji: '🌋',
    highlights: ['Ancient river delta', 'High science value', 'Perseverance explored here'],
    modifier: {
      solarIrradiance_factor: 0.95,
      radiationDelta_mSv: 0.05,
      temperatureMin_delta: -5,
      temperatureMax_delta: 3,
      dustFactor: 1.1,
      classificationNote: 'EDUCATIONAL_ASSUMPTION: Jezero site approximation',
    } satisfies LocationModifier,
  },
  {
    id: 'mars-elysium-planitia',
    name: 'Elysium Planitia',
    planet: 'mars',
    description: 'Flat equatorial plains. InSight lander site. Less dust, more stable.',
    imageEmoji: '🏜️',
    highlights: ['Very flat terrain', 'Less dust activity', 'InSight lander site'],
    modifier: {
      solarIrradiance_factor: 1.05,
      radiationDelta_mSv: -0.02,
      temperatureMin_delta: 3,
      temperatureMax_delta: 5,
      dustFactor: 0.8,
      classificationNote: 'EDUCATIONAL_ASSUMPTION: Elysium Planitia approximation',
    } satisfies LocationModifier,
  },
]

export function getMarsLocationById(id: string): LandingLocation | undefined {
  return MARS_LOCATIONS.find((l) => l.id === id)
}
