// src/data/nasa/mars-profile.ts
//
// Mars planet profile for ASTRA simulation.
// All values sourced from NASA public datasets — see docs/scientific-references.md
// NO React, Zustand, or Phaser imports.

import type { PlanetProfile } from '@simulation/types'

/** Mars surface temperature extremes
 *  Classification: OBSERVED_DATA — NASA Mars Fact Sheet / MGS TES, MRO MCS
 *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html */
const TEMPERATURE_RANGE_C = { min: -125, max: 20 } as const

/** Mars surface gravity
 *  Classification: OBSERVED_DATA — NASA Mars Fact Sheet
 *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html */
const GRAVITY_M_S2 = 3.72 as const

/** Solar irradiance at Mars (~1.524 AU from Sun).
 *  Derivation: 1361 W/m² × (1 AU / 1.524 AU)² ≈ 586 W/m²
 *  Classification: DERIVED_PARAMETER — NASA Mars Fact Sheet (orbital data)
 *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html */
const SOLAR_IRRADIANCE_W_M2 = 586 as const

/** Martian sol duration relative to Earth days.
 *  1 sol = 24 h 39 m 35 s ≈ 1.027 Earth days.
 *  Classification: OBSERVED_DATA — NASA Mars Fact Sheet
 *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html */
const SOL_DURATION_EARTH_DAYS = 1.027 as const

/** Average unshielded daily radiation dose on Mars surface (Curiosity RAD).
 *  Classification: OBSERVED_DATA — MSL Curiosity RAD instrument
 *  Source: Hassler et al. (2014), Science https://www.science.org/doi/10.1126/science.1244797
 *  Also: https://www.nasa.gov/mission_pages/msl/news/msl20130930.html */
const UNSHIELDED_DAILY_RADIATION_MSV = 0.64 as const

export const MARS_PROFILE: PlanetProfile = {
  id: 'mars',
  displayName: 'Mars',
  timeUnitLabel: 'Sol',
  temperatureRange: TEMPERATURE_RANGE_C,
  gravity_m_s2: GRAVITY_M_S2,
  solarIrradiance_W_m2: SOLAR_IRRADIANCE_W_M2,
  solDuration_earthDays: SOL_DURATION_EARTH_DAYS,
  unshieldedDailyRadiation_mSv: UNSHIELDED_DAILY_RADIATION_MSV,
}
