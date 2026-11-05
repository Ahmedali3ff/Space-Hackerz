import { describe, it, expect } from 'vitest'
import { calculateWaterDelta } from '../../../src/simulation/resources/water-model'

describe('WaterModel', () => {
  it('calculates correct net consumption for 4 crew', () => {
    const result = calculateWaterDelta({
      crewSize: 4,
      currentWater_kg: 100,
    })
    // consumption = 4 × 3.0 = 12.0 kg/day
    // recycled = 12.0 × 0.85 = 10.2 kg/day
    // netConsumption = 12.0 - 10.2 = 1.8 kg/day
    // delta = -1.8
    expect(result.consumption_kg).toBeCloseTo(12.0, 5)
    expect(result.recycled_kg).toBeCloseTo(10.2, 5)
    expect(result.netConsumption_kg).toBeCloseTo(1.8, 5)
    expect(result.delta_kg).toBeCloseTo(-1.8, 5)
  })

  it('reduces water storage each day', () => {
    const result = calculateWaterDelta({
      crewSize: 4,
      currentWater_kg: 100,
    })
    expect(result.newLevel_kg).toBeCloseTo(100 - 1.8, 5)
    expect(result.depleted).toBe(false)
  })

  it('sets depleted=true and clamps to 0 when water reaches zero', () => {
    const result = calculateWaterDelta({
      crewSize: 4,
      currentWater_kg: 0.5, // tiny reserve — will deplete
    })
    expect(result.depleted).toBe(true)
    expect(result.newLevel_kg).toBe(0)
  })

  it('never returns a negative newLevel_kg', () => {
    const result = calculateWaterDelta({
      crewSize: 100,
      currentWater_kg: 0,
    })
    expect(result.newLevel_kg).toBeGreaterThanOrEqual(0)
  })

  it('scales linearly with crew size', () => {
    const crew4 = calculateWaterDelta({ crewSize: 4, currentWater_kg: 1000 })
    const crew8 = calculateWaterDelta({ crewSize: 8, currentWater_kg: 1000 })
    expect(crew8.consumption_kg).toBeCloseTo(crew4.consumption_kg * 2, 5)
    expect(crew8.netConsumption_kg).toBeCloseTo(crew4.netConsumption_kg * 2, 5)
  })
})
