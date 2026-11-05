// tests/unit/ai/astro-assistant.test.ts
// Behavioural tests for AstroAssistant.
// All tests use an unavailable assistant (no apiKey) — no fetch calls are made.

import { describe, it, expect } from 'vitest'
import { AstroAssistant } from '@ai/astro-assistant'
import { AstroResponseSchema } from '@ai/schemas/astro-response.schema'
import type { SimulationContext } from '@ai/simulation-context'

// Minimal valid SimulationContext for testing — no imports from React, Zustand, or Phaser.
const testContext: SimulationContext = {
  planetId: 'moon',
  planetDisplayName: 'Moon',
  missionDay: 1,
  timeUnitLabel: 'Day',
  crewSize: 4,
  resourceLevels: {
    oxygenPercent: 90,
    waterPercent: 85,
    foodPercent: 80,
    energyPercent: 75,
    radiationDose_mSv: 5,
  },
  activeEventIds: ['lunar-dust-contamination'],
  faultStates: [],
  lastStepExplanations: [],
  outcome: 'ongoing',
}

describe('AstroAssistant', () => {
  it('isAvailable() is false when no apiKey is provided', () => {
    const assistant = new AstroAssistant({})
    expect(assistant.isAvailable()).toBe(false)
  })

  it('isAvailable() is false when apiKey is an empty string', () => {
    const assistant = new AstroAssistant({ apiKey: '' })
    expect(assistant.isAvailable()).toBe(false)
  })

  it('isAvailable() is true when a non-empty apiKey is provided', () => {
    const assistant = new AstroAssistant({ apiKey: 'test-key' })
    expect(assistant.isAvailable()).toBe(true)
  })

  it('explainEvent() with unavailable assistant returns a valid AstroResponse without fetch', async () => {
    const assistant = new AstroAssistant({})
    const result = await assistant.explainEvent(testContext)
    const parsed = AstroResponseSchema.safeParse(result)
    expect(parsed.success).toBe(true)
  })

  it('explainResourceChange() with unavailable assistant returns a valid AstroResponse', async () => {
    const assistant = new AstroAssistant({})
    const result = await assistant.explainResourceChange(testContext, 'oxygen')
    const parsed = AstroResponseSchema.safeParse(result)
    expect(parsed.success).toBe(true)
  })

  it('getDecisionGuidance() with unavailable assistant returns a valid AstroResponse', async () => {
    const assistant = new AstroAssistant({})
    const result = await assistant.getDecisionGuidance(testContext, 'lunar-dust-contamination')
    const parsed = AstroResponseSchema.safeParse(result)
    expect(parsed.success).toBe(true)
  })

  describe('getMissionSummary', () => {
    it('returns a valid AstroResponse for outcome=success (offline fallback)', async () => {
      const assistant = new AstroAssistant({})
      const context: SimulationContext = { ...testContext, outcome: 'success' }
      const result = await assistant.getMissionSummary(context)
      const parsed = AstroResponseSchema.safeParse(result)
      expect(parsed.success).toBe(true)
    })

    it('returns a valid AstroResponse for outcome=failure (offline fallback)', async () => {
      const assistant = new AstroAssistant({})
      const context: SimulationContext = { ...testContext, outcome: 'failure' }
      const result = await assistant.getMissionSummary(context)
      const parsed = AstroResponseSchema.safeParse(result)
      expect(parsed.success).toBe(true)
    })

    it('returns a valid AstroResponse for outcome=partial (offline fallback)', async () => {
      const assistant = new AstroAssistant({})
      const context: SimulationContext = { ...testContext, outcome: 'partial' }
      const result = await assistant.getMissionSummary(context)
      const parsed = AstroResponseSchema.safeParse(result)
      expect(parsed.success).toBe(true)
    })

    it('returns a valid AstroResponse for outcome=ongoing (falls back to default trigger)', async () => {
      const assistant = new AstroAssistant({})
      const context: SimulationContext = { ...testContext, outcome: 'ongoing' }
      const result = await assistant.getMissionSummary(context)
      const parsed = AstroResponseSchema.safeParse(result)
      expect(parsed.success).toBe(true)
    })
  })
})
