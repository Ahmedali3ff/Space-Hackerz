// Mission analysis must come from simulation facts only.
import { describe, it, expect } from 'vitest'
import { analyzeMission, LOW_RESOURCE_PERCENT } from '@/ai/analysis'
import type { SimulationContext } from '@/ai/simulation-context'

function ctx(overrides: Partial<SimulationContext> & { levels?: Partial<SimulationContext['resourceLevels']> } = {}): SimulationContext {
  const { levels, ...rest } = overrides
  return {
    planetId: 'moon',
    planetDisplayName: 'Moon',
    missionDay: 10,
    timeUnitLabel: 'Day',
    crewSize: 4,
    resourceLevels: { oxygenPercent: 90, waterPercent: 90, foodPercent: 90, energyPercent: 90, radiationDose_mSv: 5, ...levels },
    activeEventIds: [],
    faultStates: [],
    lastStepExplanations: [],
    outcome: 'ongoing',
    ...rest,
  }
}

describe('analyzeMission', () => {
  it('reports stable when nothing is wrong', () => {
    const a = analyzeMission(ctx())
    expect(a.overallRisk).toBe('stable')
    expect(a.problems).toHaveLength(0)
    expect(a.recommendations).toHaveLength(0)
  })

  it('treats an engine depletion fault as critical and recommends an action', () => {
    const a = analyzeMission(ctx({ faultStates: ['OXYGEN_DEPLETED'], levels: { oxygenPercent: 0 } }))
    expect(a.overallRisk).toBe('critical')
    expect(a.criticalCount).toBeGreaterThan(0)
    expect(a.problems[0]?.source).toBe('engine-fault')
    expect(a.recommendations.some((r) => r.problemId === 'fault:OXYGEN_DEPLETED')).toBe(true)
  })

  it('marks a resource below the analysis threshold as low, and says the threshold is not an engine rule', () => {
    const a = analyzeMission(ctx({ levels: { waterPercent: LOW_RESOURCE_PERCENT - 5 } }))
    const water = a.resources.find((r) => r.resource === 'water')
    expect(water?.status).toBe('low')
    expect(a.overallRisk).toBe('low')
    const problem = a.problems.find((p) => p.id === 'low:water')
    expect(problem?.source).toBe('analysis-threshold')
  })

  it('a depleted resource is critical even without a fault flag', () => {
    const a = analyzeMission(ctx({ levels: { foodPercent: 0 } }))
    expect(a.resources.find((r) => r.resource === 'food')?.status).toBe('critical')
  })

  it('shows engine step reasons for losses, and ignores gains', () => {
    const a = analyzeMission(ctx({
      lastStepExplanations: [
        { resource: 'oxygen', delta: -4, reason: 'Crew respiration' },
        { resource: 'water', delta: 3, reason: 'Recycling gain' },
      ],
    }))
    const reasons = a.problems.filter((p) => p.source === 'engine-explanation').map((p) => p.detail)
    expect(reasons).toEqual(['Crew respiration'])
  })

  it('never invents a time-to-depletion forecast', () => {
    const a = analyzeMission(ctx({ levels: { oxygenPercent: 3 } }))
    expect(a.forecast.available).toBe(false)
  })

  it('sorts critical problems before warnings', () => {
    const a = analyzeMission(ctx({ faultStates: ['RADIATION_HIGH', 'WATER_DEPLETED'], levels: { waterPercent: 0 } }))
    expect(a.problems[0]?.severity).toBe('critical')
  })
})
