// src/data/nasa/life-support-constants.ts
//
// Educational assumptions for life support resource consumption and production.
// Every constant is an EDUCATIONAL_ASSUMPTION per docs/scientific-assumptions.md.
// All assumption IDs (ASM-*) correspond to entries in that document.

/** Oxygen consumption per person per day.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-001)
 *  Reference: NASA HIDH / NASA SP-2010-3407
 *  Source: https://humanresearchroadmap.nasa.gov/ */
export const OXYGEN_PER_PERSON_PER_DAY_KG = 0.84 as const

/** Water consumption per person per day (drinking + hygiene).
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-002)
 *  Reference: ISS life support baseline (simplified from ~3.6 kg) */
export const WATER_PER_PERSON_PER_DAY_KG = 3.0 as const

/** Food consumption per person per day (net food mass, no packaging).
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-003)
 *  Reference: ISS food logistics approximate */
export const FOOD_PER_PERSON_PER_DAY_KG = 1.8 as const

/** Fraction of consumed water recovered by recycling system.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-004)
 *  Reference: ISS ECLSS (~90–93% actual; 85% used as educational baseline) */
export const WATER_RECYCLING_EFFICIENCY = 0.85 as const

/** Fraction of exhaled CO₂ converted back to O₂ by life support.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-005)
 *  Reference: ISS Sabatier reactor concept (simplified fixed rate) */
export const CO2_RECOVERY_RATE = 0.50 as const

/** Solar panel photovoltaic conversion efficiency.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-EN-001)
 *  Reference: Typical modern PV range 15–22%; 20% used as midpoint */
export const SOLAR_PANEL_EFFICIENCY = 0.20 as const

/** Battery round-trip charge/discharge efficiency.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-EN-003)
 *  Reference: Modern Li-ion range 85–95%; 90% used */
export const BATTERY_ROUND_TRIP_EFFICIENCY = 0.90 as const

/** Continuous power draw per crew member (habitat + life support baseline).
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-EN-002)
 *  Reference: Gameplay balance — ISS uses ~75–90 kW for 6–7 crew */
export const POWER_PER_CREW_MEMBER_KW = 2.0 as const

/** Additional power load for agriculture systems.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-AGR-002)
 *  Reference: Simulation design decision */
export const AGRICULTURE_POWER_LOAD_KW = 0.5 as const

/** Food yield per square metre of agriculture area per day.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-AGR-001)
 *  Reference: NASA Veggie system on ISS: ~0.1–0.5 kg/m²/day; 0.3 used */
export const FOOD_YIELD_PER_M2_PER_DAY_KG = 0.3 as const

/** Life support efficiency penalty when power is critical: 30% reduction.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-LS-006)
 *  Reference: docs/simulation-model.md — "Power Critical Effects" */
export const POWER_CRITICAL_LIFE_SUPPORT_PENALTY = 0.30 as const

/** Radiation shielding reduction factors by shielding level.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-RAD-003)
 *  Reference: docs/scientific-assumptions.md */
export const SHIELDING_REDUCTION = {
  low: 0.30,
  medium: 0.60,
  high: 0.85,
} as const

/** Radiation alert threshold: elevated crew health risk.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-RAD-001)
 *  Reference: docs/simulation-model.md */
export const RADIATION_HIGH_THRESHOLD_MSV = 50 as const

/** Radiation critical threshold: mission-threatening health risk.
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-RAD-002)
 *  Reference: docs/simulation-model.md */
export const RADIATION_CRITICAL_THRESHOLD_MSV = 150 as const

/** Mission scoring success threshold.
 *  Classification: EDUCATIONAL_ASSUMPTION — simulation design constant */
export const SCORE_SUCCESS_THRESHOLD = 800 as const

/** Mission scoring partial success threshold.
 *  Classification: EDUCATIONAL_ASSUMPTION — simulation design constant */
export const SCORE_PARTIAL_THRESHOLD = 400 as const
