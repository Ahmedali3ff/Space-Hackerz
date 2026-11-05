// src/simulation/core/simulation-clock.ts
// All functions are pure — no side effects, no Date.now().
// NO React, Zustand, or Phaser imports.

import type { SimulationState, PlanetId } from '@simulation/types'

/** Returns the position within the 28-day lunar cycle (1–28).
 *  Day 1–14 = lunar day (solar available). Day 15–28 = lunar night.
 *
 *  Reference: NASA Moon Fact Sheet — lunar synodic period = 27.3 days (rounded to 28
 *  for educational simplicity per docs/scientific-assumptions.md ASM-EN-005)
 *  https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html */
export function getLunarCycleDay(missionDay: number): number {
  return ((missionDay - 1) % 28) + 1
}

/** Returns true if solar power is available for the given day and planet. */
export function isSolarAvailable(missionDay: number, planetId: PlanetId): boolean {
  if (planetId === 'mars') return true // Mars: always available (storms are handled as events)
  return getLunarCycleDay(missionDay) <= 14
}

/** Returns the base solar availability factor (0–1) before event modifiers.
 *
 *  Moon: 1.0 on days 1–14 (lunar day), 0.0 on days 15–28 (lunar night).
 *  Classification: EDUCATIONAL_ASSUMPTION (ASM-EN-005)
 *  Source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
 *
 *  Mars: 1.0 normally; dust storm events apply their own modifiers via EventEngine.
 *  Global and regional dust storms are handled as active event IDs. */
export function getSolarAvailabilityFactor(
  missionDay: number,
  planetId: PlanetId,
  activeEventIds: readonly string[],
): number {
  if (planetId === 'moon') {
    return getLunarCycleDay(missionDay) <= 14 ? 1.0 : 0.0
  }
  // Mars: dust storm events override via EventEngine modifiers
  // These checks are a fallback; the primary modifier path is EventEngine
  if (activeEventIds.includes('global-dust-storm')) return 0.01
  if (activeEventIds.includes('regional-dust-storm')) return 0.5
  return 1.0
}

/** Returns the next simulation state with missionDay incremented.
 *  Pure function — returns new state, does not mutate. */
export function advanceClock(state: SimulationState): SimulationState {
  return { ...state, missionDay: state.missionDay + 1 }
}
