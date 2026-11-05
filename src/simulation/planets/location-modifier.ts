// src/simulation/planets/location-modifier.ts
// Pure utility — applies a landing-site modifier to a PlanetProfile.
// NO React, Zustand, or Phaser imports.
// Returns a new object; never mutates the input.

import type { PlanetProfile } from '../types'

export interface LocationModifier {
  readonly solarIrradiance_factor: number
  readonly radiationDelta_mSv: number
  readonly temperatureMin_delta: number
  readonly temperatureMax_delta: number
  readonly dustFactor: number
  readonly classificationNote: string
}

/**
 * PURE — returns a new PlanetProfile, never mutates the input.
 * Applies landing-site modifiers to solar irradiance, radiation, and temperature.
 *
 * EDUCATIONAL_ASSUMPTION: modifier values are simplified educational approximations.
 */
export function applyLocationModifier(
  profile: Readonly<PlanetProfile>,
  modifier: LocationModifier,
): PlanetProfile {
  return {
    ...profile,
    solarIrradiance_W_m2: profile.solarIrradiance_W_m2 * modifier.solarIrradiance_factor,
    unshieldedDailyRadiation_mSv:
      profile.unshieldedDailyRadiation_mSv + modifier.radiationDelta_mSv,
    temperatureRange: {
      min: profile.temperatureRange.min + modifier.temperatureMin_delta,
      max: profile.temperatureRange.max + modifier.temperatureMax_delta,
    },
  }
}
