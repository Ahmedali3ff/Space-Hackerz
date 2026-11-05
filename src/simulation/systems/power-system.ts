// src/simulation/systems/power-system.ts
// Orchestrates energy model.
// NO React, Zustand, or Phaser imports.

import { calculateEnergyDelta } from '@simulation/resources/energy-model'
import type { EnergyModelInput } from '@simulation/resources/energy-model'

export type PowerSystemInput = EnergyModelInput

export interface PowerSystemOutput {
  readonly newEnergyLevel_kWh: number
  readonly solarOutput_kWh: number
  readonly totalConsumption_kWh: number
  readonly energyDelta_kWh: number
  readonly powerCritical: boolean
}

/**
 * Calculates power system state for one simulation step.
 * Thin orchestrator around calculateEnergyDelta.
 * The returned `powerCritical` flag is used by the SimulationEngine to set
 * POWER_CRITICAL fault state before calling LifeSupportSystem.
 *
 * Reference: docs/simulation-model.md — "Power System"
 */
export function calculatePowerSystem(input: PowerSystemInput): PowerSystemOutput {
  const result = calculateEnergyDelta(input)
  return {
    newEnergyLevel_kWh: result.newBatteryLevel_kWh,
    solarOutput_kWh: result.solarOutput_kWh,
    totalConsumption_kWh: result.totalConsumption_kWh,
    energyDelta_kWh: result.energyDelta_kWh,
    powerCritical: result.powerCritical,
  }
}
