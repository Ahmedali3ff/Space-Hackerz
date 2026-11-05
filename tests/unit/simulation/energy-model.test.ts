import { describe, it, expect } from 'vitest'
import { calculateEnergyDelta } from '../../../src/simulation/resources/energy-model'

const BASE_INPUT = {
  solarIrradiance_W_m2: 1361, // Moon/1AU
  solarAvailabilityFactor: 1.0,
  dustModifier: 1.0,
  solarPanelArea_m2: 100,
  crewSize: 4,
  agricultureArea_m2: 20,
  isPowerAvailable: true,
  currentBattery_kWh: 500,
  batteryCapacity_kWh: 1000,
}

describe('EnergyModel', () => {
  it('produces positive solar output during normal (Moon day) conditions', () => {
    const result = calculateEnergyDelta(BASE_INPUT)
    // solarOutput_kW = 1361 × 1.0 × 1.0 × 100 × 0.20 / 1000 = 27.22 kW
    // solarOutput_kWh = 27.22 × 24 = 653.28 kWh
    expect(result.solarOutput_kWh).toBeCloseTo(1361 * 1.0 * 100 * 0.20 / 1000 * 24, 1)
    expect(result.solarOutput_kWh).toBeGreaterThan(0)
  })

  it('produces zero solar output during lunar night (solarFactor=0)', () => {
    const result = calculateEnergyDelta({
      ...BASE_INPUT,
      solarAvailabilityFactor: 0.0,
    })
    expect(result.solarOutput_kWh).toBe(0)
  })

  it('reduces solar output during dust storm (dustModifier=0.5)', () => {
    const normal = calculateEnergyDelta(BASE_INPUT)
    const stormy = calculateEnergyDelta({ ...BASE_INPUT, dustModifier: 0.5 })
    expect(stormy.solarOutput_kWh).toBeCloseTo(normal.solarOutput_kWh * 0.5, 1)
  })

  it('battery drains during lunar night and sets powerCritical when empty', () => {
    // Very small battery, no solar
    const result = calculateEnergyDelta({
      ...BASE_INPUT,
      solarAvailabilityFactor: 0.0,
      currentBattery_kWh: 10, // will be fully drained
      batteryCapacity_kWh: 1000,
    })
    expect(result.newBatteryLevel_kWh).toBe(0)
    expect(result.powerCritical).toBe(true)
  })

  it('battery does not exceed capacity when charging', () => {
    const result = calculateEnergyDelta({
      ...BASE_INPUT,
      currentBattery_kWh: 990, // near full
      batteryCapacity_kWh: 1000,
    })
    expect(result.newBatteryLevel_kWh).toBeLessThanOrEqual(1000)
  })

  it('powerCritical is false when battery is not empty', () => {
    const result = calculateEnergyDelta({
      ...BASE_INPUT,
      currentBattery_kWh: 800,
    })
    expect(result.powerCritical).toBe(false)
  })

  it('calculates correct base consumption for 4 crew', () => {
    // baseConsumption = 4 × 2.0 kW × 24h = 192 kWh
    // agriConsumption = 0.5 kW × 24h = 12 kWh (power available, agri area > 0)
    // total = 204 kWh
    const result = calculateEnergyDelta({
      ...BASE_INPUT,
      solarAvailabilityFactor: 0, // no solar, pure consumption
      currentBattery_kWh: 10000,
      batteryCapacity_kWh: 10000,
    })
    expect(result.totalConsumption_kWh).toBeCloseTo(4 * 2.0 * 24 + 0.5 * 24, 1)
  })
})
