// src/simulation/core/prng.ts
//
// mulberry32 pseudo-random number generator.
// Algorithm: Tommy Ettinger — public domain.
// See: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
//
// Chosen for:
//   - Simplicity: ~5 lines of logic, easy to audit
//   - Good statistical properties for a 32-bit generator
//   - No external dependencies
//   - Deterministic: same seed → same sequence every time
//
// Returns values uniformly distributed in [0, 1).
// NO Math.random() is used anywhere in the simulation engine.

export function createPRNG(seed: number): () => number {
  // Coerce to unsigned 32-bit integer for reproducibility across platforms
  let state = seed >>> 0

  return function mulberry32(): number {
    state += 0x6d2b79f5 | 0
    let z = state
    z = Math.imul(z ^ (z >>> 15), z | 1)
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61)
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296
  }
}
