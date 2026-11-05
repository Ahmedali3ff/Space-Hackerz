// src/data/locations/index.ts
// Barrel export for landing location data.
// Use getLocationById to resolve a location by id regardless of planet.

import { MOON_LOCATIONS, getMoonLocationById } from './moon-locations'
import { MARS_LOCATIONS, getMarsLocationById } from './mars-locations'
import type { LandingLocation } from './moon-locations'

export type { LandingLocation }
export { MOON_LOCATIONS, getMoonLocationById, MARS_LOCATIONS, getMarsLocationById }

export function getLocationById(id: string): LandingLocation | undefined {
  return [...MOON_LOCATIONS, ...MARS_LOCATIONS].find((l) => l.id === id)
}
