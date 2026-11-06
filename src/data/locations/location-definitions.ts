// src/data/locations/location-definitions.ts
// NASA-based landing location definitions with scientifically accurate modifiers.

import type { Location, PlanetId } from '@simulation/types'

/**
 * MOON_LOCATIONS — 3 lunar landing sites
 * 
 * Sources:
 * - Mare Tranquillitatis: Apollo 11 landing site
 *   https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_11_30th.html
 * - Shackleton Crater: Artemis landing region (South Pole)
 *   https://www.nasa.gov/feature/ames/ice-confirmed-at-the-moon-s-poles
 * - Oceanus Procellarum: Western nearside maria
 *   https://www.lpi.usra.edu/lunar/missions/apollo/apollo_12/
 */
export const MOON_LOCATIONS: readonly Location[] = [
  {
    id: 'moon-tranquillitatis',
    name: 'Mare Tranquillitatis',
    planetId: 'moon',
    latitude: 0.7,
    solarEfficiencyModifier: 1.0, // Equatorial, full solar exposure
    thermalSwingFactor: 1.4, // Extreme day/night thermal cycling
    dustStormProbability: 0, // Moon has no atmosphere
    description: 'Historic Apollo 11 landing site. Near-equatorial location with consistent solar access but extreme temperature swings.',
  },
  {
    id: 'moon-shackleton',
    name: 'Shackleton Crater',
    planetId: 'moon',
    latitude: -89.9,
    solarEfficiencyModifier: 0.65, // South pole, partial solar exposure
    thermalSwingFactor: 0.8, // Moderated thermal extremes at pole
    dustStormProbability: 0, // Moon has no atmosphere
    description: 'South Pole crater with water-ice deposits. Reduced solar efficiency but stable thermal environment.',
  },
  {
    id: 'moon-procellarum',
    name: 'Oceanus Procellarum',
    planetId: 'moon',
    latitude: 18.4,
    solarEfficiencyModifier: 0.95, // Near-equatorial, slight latitude reduction
    thermalSwingFactor: 1.2, // Moderate-high thermal cycling
    dustStormProbability: 0, // Moon has no atmosphere
    description: 'Vast lunar mare with basaltic regolith. Good solar access with moderate thermal management challenges.',
  },
] as const

/**
 * MARS_LOCATIONS — 3 Martian landing sites
 * 
 * Sources:
 * - Jezero Crater: Mars 2020 Perseverance landing site
 *   https://mars.nasa.gov/mars2020/mission/overview/
 * - Hellas Planitia: Deepest impact basin on Mars
 *   https://www.jpl.nasa.gov/missions/mars-exploration-rovers-spirit-and-opportunity
 * - Olympus Mons Base: Slopes of largest volcano in solar system
 *   https://solarsystem.nasa.gov/moons/mars-moons/olympus-mons/in-depth/
 */
export const MARS_LOCATIONS: readonly Location[] = [
  {
    id: 'mars-jezero',
    name: 'Jezero Crater',
    planetId: 'mars',
    latitude: 18.4,
    solarEfficiencyModifier: 0.9, // Mid-latitude, good solar access
    thermalSwingFactor: 1.1, // Moderate thermal cycling
    dustStormProbability: 0.15, // Moderate dust storm risk
    description: 'Ancient river delta explored by Perseverance. Balanced environment with moderate dust storm risk.',
  },
  {
    id: 'mars-hellas',
    name: 'Hellas Planitia',
    planetId: 'mars',
    latitude: -42.4,
    solarEfficiencyModifier: 0.85, // Southern mid-latitude, reduced solar
    thermalSwingFactor: 1.3, // Higher thermal swings at depth
    dustStormProbability: 0.35, // High dust storm frequency
    description: 'Deepest basin on Mars with higher atmospheric pressure but frequent dust storms and reduced solar efficiency.',
  },
  {
    id: 'mars-olympus',
    name: 'Olympus Mons Base',
    planetId: 'mars',
    latitude: 18.6,
    solarEfficiencyModifier: 1.0, // High altitude, excellent solar access
    thermalSwingFactor: 0.9, // Reduced thermal extremes at altitude
    dustStormProbability: 0.05, // Low dust storm risk at high altitude
    description: 'High-altitude slopes of the solar system\'s largest volcano. Excellent solar access and minimal dust, but challenging terrain.',
  },
] as const

/**
 * Get all landing locations for a given planet.
 * @param planetId - 'moon' or 'mars'
 * @returns Array of Location objects for that planet
 */
export function getLocationsForPlanet(planetId: PlanetId): readonly Location[] {
  return planetId === 'moon' ? MOON_LOCATIONS : MARS_LOCATIONS
}

/**
 * Get a specific location by its ID.
 * @param id - Location ID (e.g., 'moon-tranquillitatis')
 * @returns Location object or null if not found
 */
export function getLocationById(id: string): Location | null {
  const allLocations = [...MOON_LOCATIONS, ...MARS_LOCATIONS]
  return allLocations.find((loc) => loc.id === id) ?? null
}
