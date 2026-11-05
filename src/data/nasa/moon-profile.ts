// src/data/nasa/moon-profile.ts
//
// Moon planet profile for ASTRA simulation.
// All values sourced from NASA public datasets — see docs/scientific-references.md
// NO React, Zustand, or Phaser imports.

import type { PlanetProfile } from '@simulation/types'

/** Lunar surface temperature extremes (equatorial)
 *  Classification: OBSERVED_DATA — NASA Moon Fact Sheet / LRO Diviner
 *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
const TEMPERATURE_RANGE_C = { min: -173, max: 127 } as const

/** Lunar surface gravity
 *  Classification: OBSERVED_DATA — NASA Moon Fact Sheet
 *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
const GRAVITY_M_S2 = 1.62 as const

/** Solar irradiance at 1 AU (Moon is ~1 AU from Sun)
 *  Classification: OBSERVED_DATA — NASA Earth Fact Sheet (solar constant)
 *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
 *  Also: Kopp & Lean (2011), SORCE satellite https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2010GL045777 */
const SOLAR_IRRADIANCE_W_M2 = 1361 as const

/** Lunar synodic period (full cycle: new moon to new moon)
 *  Classification: OBSERVED_DATA — NASA Moon Fact Sheet
 *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
const SOLAR_CYCLE_DAYS = 28 as const

/** Duration of continuous sunlight per lunar cycle (days 1–14)
 *  Classification: OBSERVED_DATA — NASA Moon Fact Sheet / LRO mission overview
 *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
const SOLAR_DAY_LENGTH = 14 as const

/** Average unshielded daily radiation dose on lunar surface.
 *  Derived: 380 mSv/year ÷ 365 days ≈ 1.04 mSv/day
 *  Classification: DERIVED_PARAMETER — LRO CRaTER instrument
 *  Source: https://crater.sr.unh.edu/ */
const UNSHIELDED_DAILY_RADIATION_MSV = 1.04 as const

export const MOON_PROFILE: PlanetProfile = {
  id: 'moon',
  displayName: 'The Moon',
  timeUnitLabel: 'Day',
  temperatureRange: TEMPERATURE_RANGE_C,
  gravity_m_s2: GRAVITY_M_S2,
  solarIrradiance_W_m2: SOLAR_IRRADIANCE_W_M2,
  solarCycleDays: SOLAR_CYCLE_DAYS,
  solarDayLength: SOLAR_DAY_LENGTH,
  unshieldedDailyRadiation_mSv: UNSHIELDED_DAILY_RADIATION_MSV,
}
