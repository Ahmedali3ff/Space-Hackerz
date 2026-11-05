// tests/unit/ai/astro-response.schema.test.ts
// Zod schema validation tests for AstroResponseSchema.

import { describe, it, expect } from 'vitest'
import { AstroResponseSchema } from '@ai/schemas/astro-response.schema'

describe('AstroResponseSchema', () => {
  it('valid minimal response (explanation + isGrounded) passes parse', () => {
    expect(() =>
      AstroResponseSchema.parse({ explanation: 'Your crew is doing great!', isGrounded: true }),
    ).not.toThrow()
  })

  it('valid full response with all fields passes parse', () => {
    expect(() =>
      AstroResponseSchema.parse({
        explanation: 'Your crew is managing oxygen levels carefully.',
        scienceFact: 'The ISS uses electrolysis to produce oxygen. (Source: NASA)',
        suggestion: 'Reduce crew activity to save oxygen.',
        isGrounded: true,
      }),
    ).not.toThrow()
  })

  it('missing explanation causes safeParse to fail', () => {
    const result = AstroResponseSchema.safeParse({ isGrounded: true })
    expect(result.success).toBe(false)
  })

  it('explanation over 500 characters causes safeParse to fail', () => {
    const longExplanation = 'A'.repeat(501)
    const result = AstroResponseSchema.safeParse({
      explanation: longExplanation,
      isGrounded: true,
    })
    expect(result.success).toBe(false)
  })

  it('missing isGrounded causes safeParse to fail', () => {
    const result = AstroResponseSchema.safeParse({
      explanation: 'Your crew is doing great!',
    })
    expect(result.success).toBe(false)
  })
})
