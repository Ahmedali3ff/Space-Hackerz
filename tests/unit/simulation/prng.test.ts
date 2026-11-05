import { describe, it, expect } from 'vitest'
import { createPRNG } from '../../../src/simulation/core/prng'

describe('createPRNG (mulberry32)', () => {
  it('returns values in [0, 1) range', () => {
    const rand = createPRNG(42)
    for (let i = 0; i < 100; i++) {
      const val = rand()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })

  it('same seed produces the same sequence for 100 calls', () => {
    const rand1 = createPRNG(12345)
    const rand2 = createPRNG(12345)

    const seq1 = Array.from({ length: 100 }, () => rand1())
    const seq2 = Array.from({ length: 100 }, () => rand2())

    expect(seq1).toEqual(seq2)
  })

  it('different seeds produce different first values', () => {
    const rand1 = createPRNG(1)
    const rand2 = createPRNG(2)

    expect(rand1()).not.toEqual(rand2())
  })

  it('produces different values across a sequence (not constant)', () => {
    const rand = createPRNG(99)
    const values = new Set(Array.from({ length: 50 }, () => rand()))
    // With 50 draws from a uniform [0,1) distribution, collision probability is negligible
    expect(values.size).toBeGreaterThan(40)
  })
})
