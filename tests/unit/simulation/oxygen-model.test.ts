import { describe, it, expect } from 'vitest'
import { calculateOxygenDelta } from '../../../src/simulation/resources/oxygen-model'

describe('OxygenModel', () => {
  it('returns negative delta (net consumption) at standard efficiency', () => {
    const result = calculateOxygenDelta({
      crewSize: 4,
      lifeSupportEfficiency: 1.0,
      currentOxygen_kg: 100,
    })
    // consumption = 4 × 0.84 = 3.36; production = 3.36 × 0.5 × 1.0 = 1.68; delta = -1.68
    expect(result.delta_kg).toBeLessThan(0)
    expect(result.consumption_kg).toBeCloseTo(3.36, 5)
    expect(result.production_kg).toBeCloseTo(1.68, 5)
    expect(result.delta_kg).toBeCloseTo(-1.68, 5)
  })

  it('reduces oxygen each day at full efficiency', () => {
    const result = calculateOxygenDelta({
      crewSize: 4,
      lifeSupportEfficiency: 1.0,
      currentOxygen_kg: 100,
    })
    expect(result.newLevel_kg).toBeCloseTo(100 - 1.68, 5)
    expect(result.depleted).toBe(false)
  })

  it('reduces oxygen more when efficiency is lower', () => {
    const full = calculateOxygenDelta({
      crewSize: 4,
      lifeSupportEfficiency: 1.0,
      currentOxygen_kg: 100,
    })
    const half = calculateOxygenDelta({
      crewSize: 4,
      lifeSupportEfficiency: 0.5,
      currentOxygen_kg: 100,
    })
    // Lower efficiency means less production → larger deficit
    expect(half.production_kg).toBeLessThan(full.production_kg)
    expect(half.delta_kg).toBeLessThan(full.delta_kg)
    expect(half.newLevel_kg).toBeLessThan(full.newLevel_kg)
  })

  it('sets depleted=true and clamps to 0 when oxygen reaches zero', () => {
    const result = calculateOxygenDelta({
      crewSize: 4,
      lifeSupportEfficiency: 1.0,
      currentOxygen_kg: 0.1, // tiny reserve — will deplete
    })
    expect(result.depleted).toBe(true)
    expect(result.newLevel_kg).toBe(0)
  })

  it('never returns a negative newLevel_kg', () => {
    const result = calculateOxygenDelta({
      crewSize: 100,
      lifeSupportEfficiency: 0,
      currentOxygen_kg: 0,
    })
    expect(result.newLevel_kg).toBeGreaterThanOrEqual(0)
  })
})
