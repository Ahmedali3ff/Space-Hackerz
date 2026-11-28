// Error Detection Center: items come from the decision log and engine faults only.
import { describe, it, expect } from 'vitest'
import { buildErrorItems, summarizeErrors, filterErrors } from '@/ai/errors/error-center'
import type { SimulationContext } from '@/ai/simulation-context'
import type { DecisionLogEntry } from '@simulation/types'

function ctx(o: Partial<SimulationContext> = {}): SimulationContext {
  return {
    planetId: 'moon', planetDisplayName: 'Moon', missionDay: 12, timeUnitLabel: 'Day', crewSize: 4,
    resourceLevels: { oxygenPercent: 80, waterPercent: 80, foodPercent: 80, energyPercent: 80, radiationDose_mSv: 5 },
    activeEventIds: [], faultStates: [], lastStepExplanations: [], outcome: 'ongoing', ...o,
  }
}

const log: DecisionLogEntry[] = [
  { missionDay: 3, action: { type: 'ADVANCE_DAY' }, resultSummary: 'Normal day.', wasOptimal: true },
  { missionDay: 5, action: { type: 'EMERGENCY_RATION' }, resultSummary: 'Food fell to 10%.', wasOptimal: false },
  { missionDay: 8, action: { type: 'RESOLVE_EVENT', eventId: 'dust', choiceId: 'ignore' }, resultSummary: 'Dust cut solar output.', wasOptimal: false },
]

describe('buildErrorItems', () => {
  it('turns each non-optimal decision into an item with what happened and a better choice', () => {
    const items = buildErrorItems(log, ctx())
    const decisions = items.filter((i) => i.id.startsWith('decision:'))
    expect(decisions).toHaveLength(2)
    expect(decisions[0]?.happened).toBe('Food fell to 10%.')
    expect(decisions[0]?.betterChoice.length).toBeGreaterThan(0)
  })

  it('makes engine faults critical', () => {
    const items = buildErrorItems([], ctx({ faultStates: ['OXYGEN_DEPLETED'] }))
    expect(items[0]?.severity).toBe('critical')
    expect(items[0]?.resource).toBe('oxygen')
  })

  it('marks a low resource as a warning and labels the threshold honestly', () => {
    const items = buildErrorItems([], ctx({ resourceLevels: { oxygenPercent: 80, waterPercent: 10, foodPercent: 80, energyPercent: 80, radiationDose_mSv: 5 } }))
    const water = items.find((i) => i.id === 'low:water')
    expect(water?.severity).toBe('warning')
    expect(water?.ruleNote).toMatch(/Analysis threshold/)
  })

  it('reports no items for a clean run', () => {
    expect(buildErrorItems([{ missionDay: 1, action: { type: 'ADVANCE_DAY' }, resultSummary: 'ok', wasOptimal: true }], ctx())).toHaveLength(0)
  })
})

describe('summary and filters', () => {
  it('counts each severity', () => {
    const items = buildErrorItems(log, ctx({ faultStates: ['WATER_DEPLETED'] }))
    const s = summarizeErrors(items)
    expect(s.total).toBe(items.length)
    expect(s.critical).toBe(1)
    expect(s.critical + s.warnings + s.optimizations).toBe(s.total)
  })

  it('filters by severity and by resource', () => {
    const items = buildErrorItems(log, ctx({ faultStates: ['WATER_DEPLETED'] }))
    expect(filterErrors(items, { severity: 'critical' }).every((i) => i.severity === 'critical')).toBe(true)
    expect(filterErrors(items, { resource: 'food' }).every((i) => i.resource === 'food')).toBe(true)
  })
})
