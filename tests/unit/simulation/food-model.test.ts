import { describe, it, expect } from 'vitest'
import { calculateFoodDelta } from '../../../src/simulation/resources/food-model'

describe('FoodModel', () => {
  it('produces food when power is available and agriculture area is set', () => {
    const result = calculateFoodDelta({
      crewSize: 4,
      agricultureArea_m2: 20,
      isPowerAvailable: true,
      currentFood_kg: 100,
    })
    // production = 20 × 0.3 = 6.0 kg/day
    // consumption = 4 × 1.8 = 7.2 kg/day
    // delta = 6.0 - 7.2 = -1.2
    expect(result.production_kg).toBeCloseTo(6.0, 5)
    expect(result.consumption_kg).toBeCloseTo(7.2, 5)
    expect(result.delta_kg).toBeCloseTo(-1.2, 5)
    expect(result.depleted).toBe(false)
  })

  it('produces zero food when power is unavailable', () => {
    const result = calculateFoodDelta({
      crewSize: 4,
      agricultureArea_m2: 20,
      isPowerAvailable: false,
      currentFood_kg: 100,
    })
    expect(result.production_kg).toBe(0)
    expect(result.consumption_kg).toBeCloseTo(7.2, 5)
  })

  it('produces zero food when agriculture area is zero', () => {
    const result = calculateFoodDelta({
      crewSize: 4,
      agricultureArea_m2: 0,
      isPowerAvailable: true,
      currentFood_kg: 100,
    })
    expect(result.production_kg).toBe(0)
  })

  it('sets depleted=true when food runs out', () => {
    // Large crew, tiny agriculture → rapid depletion
    const result = calculateFoodDelta({
      crewSize: 8,
      agricultureArea_m2: 0,
      isPowerAvailable: true,
      currentFood_kg: 5, // 5 kg, crew needs 8 × 1.8 = 14.4 kg/day
    })
    expect(result.depleted).toBe(true)
    expect(result.newLevel_kg).toBe(0)
  })

  it('never returns a negative newLevel_kg', () => {
    const result = calculateFoodDelta({
      crewSize: 100,
      agricultureArea_m2: 0,
      isPowerAvailable: false,
      currentFood_kg: 0,
    })
    expect(result.newLevel_kg).toBeGreaterThanOrEqual(0)
  })
})
