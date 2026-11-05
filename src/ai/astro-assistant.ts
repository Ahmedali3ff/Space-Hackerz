// src/ai/astro-assistant.ts
// AstroAssistant — wraps OpenAI-compatible API with graceful fallback to the knowledge base.
// NO React, Zustand, or Phaser imports. No `any`. No `!`.

import type { ResourceType } from '@simulation/types'
import type { SimulationContext } from './simulation-context'
import { type AstroResponse, AstroResponseSchema } from './schemas/astro-response.schema'
import { getKnowledgeEntry } from './knowledge-base'
import { buildEventExplanationPrompt } from './prompts/event-explanation.prompt'
import { buildResourceChangePrompt } from './prompts/resource-change.prompt'
import { buildDecisionGuidancePrompt } from './prompts/decision-guidance.prompt'
import { buildMissionSummaryPrompt } from './prompts/mission-summary.prompt'

export interface AstroAssistantConfig {
  readonly apiKey?: string
  readonly apiEndpoint?: string
  readonly model?: string
}

const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_MODEL = 'gpt-4o-mini'
const REQUEST_TIMEOUT_MS = 8000

/** Shape of an OpenAI-compatible chat completion response. */
interface ChatCompletionResponse {
  choices: { message?: { content?: string } }[]
}

function isChatCompletionResponse(value: unknown): value is ChatCompletionResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'choices' in value &&
    Array.isArray((value as Record<string, unknown>).choices) &&
    (value as Record<string, unknown[]>).choices.length > 0
  )
}

export class AstroAssistant {
  private readonly config: AstroAssistantConfig

  constructor(config: AstroAssistantConfig) {
    this.config = config
  }

  /** Returns true only when a non-empty API key is configured. */
  isAvailable(): boolean {
    return typeof this.config.apiKey === 'string' && this.config.apiKey.length > 0
  }

  /**
   * Explains the currently active events in the mission.
   * Never rejects — falls back to the knowledge base when offline or unavailable.
   */
  async explainEvent(context: SimulationContext): Promise<AstroResponse> {
    const trigger = context.activeEventIds[0] ?? 'default'
    const prompt = buildEventExplanationPrompt(context)
    return this.callAI(prompt, trigger)
  }

  /**
   * Explains why a specific resource changed.
   * Never rejects — falls back to the knowledge base when offline or unavailable.
   */
  async explainResourceChange(
    context: SimulationContext,
    resource: ResourceType,
  ): Promise<AstroResponse> {
    const trigger = `low-${resource}`
    const prompt = buildResourceChangePrompt(context, resource)
    return this.callAI(prompt, trigger)
  }

  /**
   * Provides decision guidance for a specific event.
   * Never rejects — falls back to the knowledge base when offline or unavailable.
   */
  async getDecisionGuidance(
    context: SimulationContext,
    eventId: string,
  ): Promise<AstroResponse> {
    const prompt = buildDecisionGuidancePrompt(context, eventId)
    return this.callAI(prompt, eventId)
  }

  /**
   * Generates a mission summary for the debrief screen.
   * Maps outcome to a knowledge-base fallback trigger.
   * Never rejects — falls back to the knowledge base when offline or unavailable.
   */
  async getMissionSummary(context: SimulationContext): Promise<AstroResponse> {
    let trigger: string
    if (context.outcome === 'success') {
      trigger = 'mission-success'
    } else if (context.outcome === 'failure') {
      trigger = 'mission-failure'
    } else if (context.outcome === 'partial') {
      trigger = 'mission-partial'
    } else {
      trigger = 'default'
    }
    const prompt = buildMissionSummaryPrompt(context)
    return this.callAI(prompt, trigger)
  }

  /** Maps a knowledge base entry to an AstroResponse (offline/fallback content). */
  private getFallback(trigger: string): AstroResponse {
    const entry = getKnowledgeEntry(trigger)
    return {
      explanation: entry.explanation,
      scienceFact: entry.scienceFact,
      suggestion: entry.suggestion,
      isGrounded: false,
    }
  }

  /**
   * Calls the AI API with the given prompt.
   * Returns a validated AstroResponse, or falls back to the knowledge base on any failure.
   * Never throws or rejects.
   */
  private async callAI(prompt: string, fallbackTrigger: string): Promise<AstroResponse> {
    if (!this.isAvailable()) {
      return this.getFallback(fallbackTrigger)
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const endpoint = this.config.apiEndpoint ?? DEFAULT_ENDPOINT
      const model = this.config.model ?? DEFAULT_MODEL

      const response = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      })

      clearTimeout(timer)

      if (!response.ok) {
        return this.getFallback(fallbackTrigger)
      }

      const data: unknown = await response.json()

      if (!isChatCompletionResponse(data)) {
        return this.getFallback(fallbackTrigger)
      }

      const content = data.choices[0]?.message?.content
      if (typeof content !== 'string') {
        return this.getFallback(fallbackTrigger)
      }

      const parsed: unknown = JSON.parse(content)
      const result = AstroResponseSchema.safeParse(parsed)

      if (result.success) {
        return result.data
      }

      return this.getFallback(fallbackTrigger)
    } catch {
      clearTimeout(timer)
      return this.getFallback(fallbackTrigger)
    }
  }
}
