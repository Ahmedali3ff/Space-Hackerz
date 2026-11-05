import { describe, it, expect } from 'vitest'
import { SimulationEngine } from '../../../src/simulation/core/simulation-engine'
import type { SimulationEngineConfig } from '../../../src/simulation/types'

const MOON_BASE_CONFIG = {
  solarPanelArea_m2: 200,
  batteryCapacity_kWh: 2000,
  agricultureArea_m2: 30,
  shieldingLevel: 'high' as const,
  lifeSupportEfficiency: 1.0,
}

const MOON_INITIAL_RESOURCES = {
  oxygen_kg: 1000,
  water_kg: 1000,
  food_kg: 1000,
  energy_kWh: 1500,
  cumulativeRadiation_mSv: 0,
}

const MOON_CONFIG: SimulationEngineConfig = {
  planetId: 'moon',
  crewSize: 4,
  baseConfig: MOON_BASE_CONFIG,
  seed: 42,
  initialResources: MOON_INITIAL_RESOURCES,
}

const MARS_CONFIG: SimulationEngineConfig = {
  planetId: 'mars',
  crewSize: 4,
  baseConfig: {
    solarPanelArea_m2: 300,
    batteryCapacity_kWh: 3000,
    agricultureArea_m2: 40,
    shieldingLevel: 'medium' as const,
    lifeSupportEfficiency: 1.0,
  },
  seed: 1,
  initialResources: {
    oxygen_kg: 2000,
    water_kg: 2000,
    food_kg: 2000,
    energy_kWh: 2000,
    cumulativeRadiation_mSv: 0,
  },
}

describe('SimulationEngine', () => {
  it('runs a 10-day Moon mission without throwing', () => {
    const engine = new SimulationEngine(MOON_CONFIG)

    for (let i = 0; i < 10; i++) {
      const result = engine.step({ type: 'ADVANCE_DAY' })
      expect(result.success).toBe(true)
    }

    const state = engine.getState()
    expect(state.missionDay).toBe(10)
  })

  it('runs a 10-sol Mars mission successfully', () => {
    const engine = new SimulationEngine(MARS_CONFIG)

    for (let i = 0; i < 10; i++) {
      const result = engine.step({ type: 'ADVANCE_DAY' })
      expect(result.success).toBe(true)
    }

    const state = engine.getState()
    expect(state.missionDay).toBe(10)
  })

  it('produces OXYGEN_DEPLETED fault state when oxygen reserves are exhausted', () => {
    // Tiny oxygen reserve, zero life support efficiency → rapid depletion
    const engine = new SimulationEngine({
      ...MOON_CONFIG,
      baseConfig: {
        ...MOON_BASE_CONFIG,
        lifeSupportEfficiency: 0, // no CO2 recovery
      },
      initialResources: {
        ...MOON_INITIAL_RESOURCES,
        oxygen_kg: 1.0, // only 1 kg — will deplete in 1 step with 4 crew (needs 3.36/day)
      },
    })

    // Step once — should deplete with 4 crew consuming 3.36 kg/day and 1 kg reserve
    const result1 = engine.step({ type: 'ADVANCE_DAY' })
    expect(result1.success).toBe(true)

    const state = engine.getState()
    expect(state.faultStates).toContain('OXYGEN_DEPLETED')
    expect(state.resources.oxygen_kg).toBe(0)
  })

  it('is deterministic: same seed + same actions produce identical results', () => {
    const engine1 = new SimulationEngine({ ...MOON_CONFIG, seed: 99 })
    const engine2 = new SimulationEngine({ ...MOON_CONFIG, seed: 99 })

    const states1: unknown[] = []
    const states2: unknown[] = []

    for (let i = 0; i < 10; i++) {
      engine1.step({ type: 'ADVANCE_DAY' })
      engine2.step({ type: 'ADVANCE_DAY' })
      states1.push(engine1.getState())
      states2.push(engine2.getState())
    }

    expect(states1).toEqual(states2)
  })

  it('returns Result with success:false on invalid state, does not throw', () => {
    // Bypass constructor to inject invalid state
    const engine = new SimulationEngine(MOON_CONFIG)

    // Directly corrupt internal state via cast
    const internalState = engine.getState() as Record<string, unknown>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(engine as any).state = { ...internalState, crewSize: -1 }

    // Should return failure result, NOT throw
    let result: ReturnType<typeof engine.step> | undefined
    expect(() => {
      result = engine.step({ type: 'ADVANCE_DAY' })
    }).not.toThrow()

    expect(result).toBeDefined()
    // result is defined by now but TypeScript needs a guard
    if (result !== undefined) {
      expect(result.success).toBe(false)
    }
  })

  it('triggers at least one event or fault in a 30-sol Mars mission with seed 777', () => {
    // Mars with small resources to guarantee some faults or events
    const engine = new SimulationEngine({
      ...MARS_CONFIG,
      seed: 777,
      initialResources: {
        oxygen_kg: 500,
        water_kg: 500,
        food_kg: 200, // tight food supply
        energy_kWh: 1000,
        cumulativeRadiation_mSv: 0,
      },
    })

    const allTriggeredEvents: string[] = []
    let hadAnyFault = false

    for (let i = 0; i < 30; i++) {
      const result = engine.step({ type: 'ADVANCE_DAY' })
      if (result.success) {
        allTriggeredEvents.push(...result.value.triggeredEventIds)
        if (result.value.newFaultStates.length > 0) hadAnyFault = true
      }
      // Stop if mission failed
      if (engine.getState().outcome === 'failure') break
    }

    // Either events triggered or faults occurred (or both)
    const hadActivity = allTriggeredEvents.length > 0 || hadAnyFault
    expect(hadActivity).toBe(true)
  })

  it('resources are clamped to 0 and never go negative', () => {
    // Extreme scenario: 8 crew, no solar, minimal supplies
    const engine = new SimulationEngine({
      planetId: 'moon',
      crewSize: 8,
      baseConfig: {
        solarPanelArea_m2: 0, // no solar
        batteryCapacity_kWh: 100,
        agricultureArea_m2: 0, // no food production
        shieldingLevel: 'low',
        lifeSupportEfficiency: 0.1,
      },
      seed: 1,
      initialResources: {
        oxygen_kg: 5,
        water_kg: 5,
        food_kg: 5,
        energy_kWh: 5,
        cumulativeRadiation_mSv: 0,
      },
    })

    for (let i = 0; i < 5; i++) {
      engine.step({ type: 'ADVANCE_DAY' })
      const state = engine.getState()
      expect(state.resources.oxygen_kg).toBeGreaterThanOrEqual(0)
      expect(state.resources.water_kg).toBeGreaterThanOrEqual(0)
      expect(state.resources.food_kg).toBeGreaterThanOrEqual(0)
      expect(state.resources.energy_kWh).toBeGreaterThanOrEqual(0)
      expect(state.resources.cumulativeRadiation_mSv).toBeGreaterThanOrEqual(0)
    }
  })
})
