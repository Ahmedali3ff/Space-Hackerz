// src/ai/index.ts
// Barrel export for the entire @ai/ module.

// simulation-context
export type { SimulationContext } from './simulation-context'
export { buildSimulationContext } from './simulation-context'

// schemas
export { AstroResponseSchema } from './schemas/astro-response.schema'
export type { AstroResponse } from './schemas/astro-response.schema'

// knowledge-base
export type { KnowledgeEntry } from './knowledge-base'
export { KNOWLEDGE_BASE, getKnowledgeEntry } from './knowledge-base'

// prompts
export { buildEventExplanationPrompt } from './prompts/event-explanation.prompt'
export { buildResourceChangePrompt } from './prompts/resource-change.prompt'
export { buildDecisionGuidancePrompt } from './prompts/decision-guidance.prompt'
export { buildMissionSummaryPrompt } from './prompts/mission-summary.prompt'

// astro-assistant
export type { AstroAssistantConfig } from './astro-assistant'
export { AstroAssistant } from './astro-assistant'
