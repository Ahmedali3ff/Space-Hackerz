// src/data/validation/planet-profile.schema.ts
//
// Zod schema for PlanetProfile. Validates both planet profiles at module load
// (fail-fast validation — bad data throws immediately with a descriptive Zod error).

import { z } from 'zod'
import { MOON_PROFILE } from '@data/nasa/moon-profile'
import { MARS_PROFILE } from '@data/nasa/mars-profile'

export const PlanetProfileSchema = z.object({
  id: z.enum(['moon', 'mars']),
  displayName: z.string().min(1),
  timeUnitLabel: z.string().min(1),
  temperatureRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  gravity_m_s2: z.number().positive(),
  solarIrradiance_W_m2: z.number().positive(),
  solarCycleDays: z.number().positive().optional(),
  solarDayLength: z.number().positive().optional(),
  solDuration_earthDays: z.number().positive().optional(),
  unshieldedDailyRadiation_mSv: z.number().nonnegative(),
})

// Fail-fast validation on module load.
// If either profile is malformed, the application throws immediately.
PlanetProfileSchema.parse(MOON_PROFILE)
PlanetProfileSchema.parse(MARS_PROFILE)

export type PlanetProfileBase = z.infer<typeof PlanetProfileSchema>
