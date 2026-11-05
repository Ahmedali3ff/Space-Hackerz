// tests/unit/data/missions.test.ts
// Unit tests for mission-definitions.ts — verifies the 6-mission arc shape,
// helper functions, and key progression constraints.

import { describe, it, expect } from 'vitest'
import { MISSIONS, getMissionById } from '@data/missions/mission-definitions'

describe('MISSIONS array', () => {
  it('has 6 entries', () => {
    expect(MISSIONS).toHaveLength(6)
  })

  it('mission m01 has planet moon', () => {
    const m01 = MISSIONS.find((m) => m.id === 'm01')
    expect(m01?.planet).toBe('moon')
  })

  it('mission m04 has planet mars', () => {
    const m04 = MISSIONS.find((m) => m.id === 'm04')
    expect(m04?.planet).toBe('mars')
  })

  it('all missions have at least 2 tasks', () => {
    for (const mission of MISSIONS) {
      expect(mission.tasks.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('mission m06 has difficulty advanced', () => {
    const m06 = MISSIONS.find((m) => m.id === 'm06')
    expect(m06?.difficulty).toBe('advanced')
  })

  it('mission m01 unlockRequirement is undefined (no prerequisite)', () => {
    const m01 = MISSIONS.find((m) => m.id === 'm01')
    expect(m01?.unlockRequirement).toBeUndefined()
  })

  it('mission m02 unlockRequirement is m01', () => {
    const m02 = MISSIONS.find((m) => m.id === 'm02')
    expect(m02?.unlockRequirement).toBe('m01')
  })
})

describe('getMissionById', () => {
  it('returns the first mission for id m01', () => {
    const result = getMissionById('m01')
    expect(result).toBeDefined()
    expect(result?.id).toBe('m01')
    expect(result?.number).toBe(1)
  })

  it('returns undefined for an unknown id', () => {
    const result = getMissionById('unknown')
    expect(result).toBeUndefined()
  })
})
