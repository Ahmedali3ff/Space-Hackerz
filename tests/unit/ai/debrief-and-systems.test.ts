// Debrief comes from the recorded decisions; system explanations cite only known Lumi sources.
import { describe, it, expect } from 'vitest'
import { buildMissionDebrief, actionLabel } from '@/ai/debrief/mission-debrief'
import { GAME_SYSTEMS, findSystem } from '@/ai/systems/game-systems'
import { getSource } from '@data/lumi/sources'
import type { SimulationContext } from '@/ai/simulation-context'
import type { DecisionLogEntry } from '@simulation/types'

function ctx(overrides: Partial<SimulationContext> = {}): SimulationContext {
  return {
    planetId: 'mars', planetDisplayName: 'Mars', missionDay: 20, timeUnitLabel: 'Sol', crewSize: 4,
    resourceLevels: { oxygenPercent: 80, waterPercent: 80, foodPercent: 80, energyPercent: 80, radiationDose_mSv: 10 },
    activeEventIds: [], faultStates: [], lastStepExplanations: [], outcome: 'ongoing', ...overrides,
  }
}

const entries: DecisionLogEntry[] = [
  { missionDay: 2, action: { type: 'ADVANCE_DAY' }, resultSummary: 'Day passed with normal use.', wasOptimal: true },
  { missionDay: 7, action: { type: 'EMERGENCY_RATION' }, resultSummary: 'Food dropped to 12%.', wasOptimal: false },
  { missionDay: 9, action: { type: 'RESOLVE_EVENT', eventId: 'dust', choiceId: 'shelter' }, resultSummary: '', wasOptimal: true },
]

describe('buildMissionDebrief', () => {
  it('splits decisions into mistakes and good decisions from the log', () => {
    const d = buildMissionDebrief(entries, ctx())
    expect(d.totalDecisions).toBe(3)
    expect(d.optimalDecisions).toBe(2)
    expect(d.mistakes).toHaveLength(1)
    expect(d.mistakes[0]?.what).toBe('Food dropped to 12%.')
    expect(d.mistakes[0]?.action).toBe('Used emergency rations')
  })

  it('explains an empty reason honestly instead of inventing one', () => {
    const d = buildMissionDebrief(entries, ctx())
    expect(d.goodDecisions.some((g) => g.why.includes('did not record'))).toBe(true)
  })

  it('reports the outcome and faults that remain at the end', () => {
    const d = buildMissionDebrief(entries, ctx({ outcome: 'failure', faultStates: ['WATER_DEPLETED'] }))
    expect(d.outcome).toBe('failure')
    expect(d.remainingFaults).toEqual(['WATER_DEPLETED'])
    expect(d.lessons.join(' ')).toMatch(/Water ran out/)
  })

  it('says so when there are no recorded mistakes', () => {
    const d = buildMissionDebrief([entries[0]!], ctx())
    expect(d.mistakes).toHaveLength(0)
    expect(d.lessons[0]).toMatch(/No recorded mistakes/)
  })

  it('labels actions in plain words', () => {
    expect(actionLabel({ type: 'ADVANCE_DAY' })).toBe('Advanced the day')
  })
})

describe('game systems', () => {
  it('covers the four resources, radiation and decisions', () => {
    const ids = GAME_SYSTEMS.map((s) => s.id)
    expect(ids).toEqual(expect.arrayContaining(['oxygen', 'water', 'food', 'energy', 'radiation', 'decisions']))
    expect(findSystem('oxygen')?.name).toBe('Oxygen')
  })

  it('cites only sources that exist in the Lumi reference data', () => {
    for (const system of GAME_SYSTEMS) {
      for (const id of system.sourceIds) expect(getSource(id), `${system.id} -> ${id}`).toBeDefined()
    }
  })

  it('states the engine fault that each resource triggers', () => {
    expect(findSystem('oxygen')?.inGame).toMatch(/OXYGEN_DEPLETED/)
    expect(findSystem('energy')?.inGame).toMatch(/POWER_CRITICAL/)
  })
})
