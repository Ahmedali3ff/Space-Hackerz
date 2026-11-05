// src/simulation/resources/energy-model.ts
// Pure function — same inputs → same outputs.
// NO React, Zustand, or Phaser imports.

import {
  SOLAR_PANEL_EFFICIENCY,
  BATTERY_ROUND_TRIP_EFFICIENCY,
  POWER_PER_CREW_MEMBER_KW,
  AGRICULTURE_POWER_LOAD_KW,
} from '@data/nasa/life-support-constants'

export interface EnergyModelInput {
  readonly solarIrradiance_W_m2: number // planet base value
  readonly solarAvailabilityFactor: number // 0–1 from SimulationClock
  readonly dustModifier: number // 1.0 normally, 0.5/0.01 during storms
  readonly solarPanelArea_m2: number
  readonly crewSize: number
  readonly agricultureArea_m2: number // used to calculate agri load
  readonly isPowerAvailable: boolean // agri only runs if power available
  readonly currentBattery_kWh: number
  readonly batteryCapacity_kWh: number
  readonly lifeSupportLoad_kWh?: number // optional additional system load
}

export interface EnergyModelOutput {
  readonly solarOutput_kWh: number
  readonly totalConsumption_kWh: number
  readonly energyDelta_kWh: number
  readonly newBatteryLevel_kWh: number
  readonly powerCritical: boolean
}

/**
 * Calculates energy production, consumption, and battery balance for one step.
 *
 * Solar production:
 *   solarOutput_kW  = irradiance × solarFactor × dustModifier × panelArea × 0.20 / 1000
 *   solarOutput_kWh = solarOutput_kW × 24
 *
 * Energy consumption:
 *   baseConsumption  = crewSize × 2.0 kW × 24 h
 *   agriConsumption  = 0.5 kW × 24 h (if power available, regardless of agriculture area)
 *   totalConsumption = baseConsumption + agriConsumption + optional system loads
 *
 * Battery balance:
 *   delta > 0 → stored = min(battery + delta × 0.90, capacity)
 *   delta ≤ 0 → stored = max(battery + delta, 0)
 *   stored == 0 && delta < 0 → powerCritical = true
 *
 * Reference: docs/simulation-model.md — "Energy Calculations"
 * Assumption classifications: ASM-EN-001, ASM-EN-002, ASM-EN-003
 */
export function calculateEnergyDelta(input: EnergyModelInput): EnergyModelOutput {
  // Solar production
  const effectiveIrradiance =
    input.solarIrradiance_W_m2 * input.solarAvailabilityFactor * input.dustModifier
  const solarOutput_kW =
    (effectiveIrradiance * input.solarPanelArea_m2 * SOLAR_PANEL_EFFICIENCY) / 1000
  const solarOutput_kWh = solarOutput_kW * 24

  // Energy consumption
  const baseConsumption_kWh = input.crewSize * POWER_PER_CREW_MEMBER_KW * 24
  // Agriculture power load only applies when there's agriculture area and power is available
  const agriLoad_kWh =
    input.isPowerAvailable && input.agricultureArea_m2 > 0 ? AGRICULTURE_POWER_LOAD_KW * 24 : 0
  const extraLoad_kWh = input.lifeSupportLoad_kWh ?? 0
  const totalConsumption_kWh = baseConsumption_kWh + agriLoad_kWh + extraLoad_kWh

  // Battery balance
  const energyDelta_kWh = solarOutput_kWh - totalConsumption_kWh
  let newBatteryLevel_kWh: number
  if (energyDelta_kWh > 0) {
    newBatteryLevel_kWh = Math.min(
      input.currentBattery_kWh + energyDelta_kWh * BATTERY_ROUND_TRIP_EFFICIENCY,
      input.batteryCapacity_kWh,
    )
  } else {
    newBatteryLevel_kWh = Math.max(input.currentBattery_kWh + energyDelta_kWh, 0)
  }

  const powerCritical = newBatteryLevel_kWh === 0 && energyDelta_kWh < 0

  return {
    solarOutput_kWh,
    totalConsumption_kWh,
    energyDelta_kWh,
    newBatteryLevel_kWh,
    powerCritical,
  }
}
