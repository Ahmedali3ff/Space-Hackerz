// Personalised learning: counts only real recorded mistakes, never double-counts, and never breaks on bad storage.
import { describe, it, expect } from 'vitest'
import {
  EMPTY_PROFILE, parseProfile, recordMission, repeatedMistakes, optimalRate, practiceFor, PRACTICE_BANK, PROFILE_VERSION,
} from '@/ai/learning/learning-profile'
import type { ErrorItem } from '@/ai/errors/error-center'

function item(id: string, resource: ErrorItem['resource']): ErrorItem {
  return { id, severity: 'optimization', resource, title: '', day: 1, decision: '', happened: '', ruleNote: '', impact: '', avoid: '', betterChoice: '', lesson: '' }
}

describe('recordMission', () => {
  it('counts decision mistakes by resource', () => {
    const p = recordMission(EMPTY_PROFILE, 'm1', [item('decision:0', 'food'), item('decision:1', 'food')], 5, 3)
    expect(p.mistakes.food).toBe(2)
    expect(p.decisions).toBe(5)
    expect(p.optimalDecisions).toBe(3)
  })

  it('does not count engine faults as habits', () => {
    const p = recordMission(EMPTY_PROFILE, 'm1', [item('fault:OXYGEN_DEPLETED', 'oxygen')], 2, 2)
    expect(p.mistakes.oxygen ?? 0).toBe(0)
  })

  it('never double-counts the same mission', () => {
    const once = recordMission(EMPTY_PROFILE, 'm1', [item('decision:0', 'water')], 2, 1)
    const twice = recordMission(once, 'm1', [item('decision:0', 'water')], 2, 1)
    expect(twice.mistakes.water).toBe(1)
    expect(twice.decisions).toBe(2)
  })
})

describe('repeated mistakes and practice', () => {
  it('flags a resource only after repeated mistakes', () => {
    let p = recordMission(EMPTY_PROFILE, 'm1', [item('decision:0', 'energy')], 1, 0)
    expect(repeatedMistakes(p)).toEqual([])
    p = recordMission(p, 'm2', [item('decision:0', 'energy')], 1, 0)
    expect(repeatedMistakes(p)).toEqual(['energy'])
  })

  it('puts practice for repeated weaknesses first', () => {
    let p = recordMission(EMPTY_PROFILE, 'm1', [item('decision:0', 'radiation')], 1, 0)
    p = recordMission(p, 'm2', [item('decision:0', 'radiation')], 1, 0)
    expect(practiceFor(p)[0]?.resource).toBe('radiation')
  })

  it('every practice question has a valid correct option and an explanation', () => {
    for (const q of PRACTICE_BANK) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(q.options.length)
      expect(q.explanation.length).toBeGreaterThan(10)
    }
  })

  it('reports no skill rate before any decisions', () => {
    expect(optimalRate(EMPTY_PROFILE)).toBeNull()
    expect(optimalRate(recordMission(EMPTY_PROFILE, 'm1', [], 4, 3))).toBe(75)
  })
})

describe('storage parsing', () => {
  it('returns an empty profile for missing, broken or outdated data', () => {
    expect(parseProfile(null)).toEqual(EMPTY_PROFILE)
    expect(parseProfile('{not json')).toEqual(EMPTY_PROFILE)
    expect(parseProfile(JSON.stringify({ version: PROFILE_VERSION + 1 }))).toEqual(EMPTY_PROFILE)
  })

  it('round-trips a valid profile', () => {
    const p = recordMission(EMPTY_PROFILE, 'm1', [item('decision:0', 'food')], 2, 1)
    expect(parseProfile(JSON.stringify(p))).toEqual(p)
  })
})
