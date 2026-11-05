// src/utils/default-config.ts
// Default base configuration generator.
// Provides sensible starting values scaled to crew size.

import type { BaseConfig } from '@simulation/types'

/**
 * Returns a default BaseConfig scaled to the given crew size.
 * These values are educational assumptions documented in
 * docs/scientific-assumptions.md.
 */
export function getDefaultBaseConfig(crewSize: number): BaseConfig {
  return {
    solarPanelArea_m2: crewSize * 15,
    batteryCapacity_kWh: crewSize * 50,
    agricultureArea_m2: crewSize * 3,
    shieldingLevel: 'medium',
    lifeSupportEfficiency: 1.0,
  }
}
