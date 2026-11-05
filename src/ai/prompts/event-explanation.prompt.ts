// src/ai/prompts/event-explanation.prompt.ts
// Prompt builder for explaining active simulation events.
// NO React, Zustand, or Phaser imports.

import type { SimulationContext } from '../simulation-context'

/**
 * Formats the simulation context as human-readable key/value lines for prompt injection.
 */
function formatContext(context: SimulationContext): string {
  const faultList =
    context.faultStates.length > 0 ? context.faultStates.join(', ') : 'none'
  const eventList =
    context.activeEventIds.length > 0 ? context.activeEventIds.join(', ') : 'none'

  return [
    `Planet: ${context.planetDisplayName}`,
    `Mission ${context.timeUnitLabel}: ${context.missionDay}`,
    `Crew Size: ${context.crewSize}`,
    `Oxygen: ${context.resourceLevels.oxygenPercent.toFixed(1)}%`,
    `Water: ${context.resourceLevels.waterPercent.toFixed(1)}%`,
    `Food: ${context.resourceLevels.foodPercent.toFixed(1)}%`,
    `Energy: ${context.resourceLevels.energyPercent.toFixed(1)}%`,
    `Radiation dose so far: ${context.resourceLevels.radiationDose_mSv.toFixed(1)} mSv`,
    `Active events: ${eventList}`,
    `Faults: ${faultList}`,
  ].join('\n')
}

/**
 * Builds a prompt asking Astro-AI to explain the current active simulation events
 * in age-appropriate language for students aged 8–12.
 */
export function buildEventExplanationPrompt(context: SimulationContext): string {
  return `You are Astro, an educational AI assistant for Space+ Mission Academy. You help students aged 8–12 understand real space science.

Current mission status:
${formatContext(context)}

Please explain what the active events mean for this space mission. Describe why they happen scientifically, what danger they present to the crew, and what could happen if the crew does not take action.

Use simple, exciting language a 10-year-old can understand.
Do NOT invent specific numbers or measurements.
Do NOT claim this data comes from a live NASA feed.
Refer to the crew in first person: 'your crew'.

Respond with ONLY a JSON object matching this schema:
{ "explanation": string (10–500 chars), "scienceFact": string (optional, max 300 chars), "suggestion": string (optional, max 200 chars), "isGrounded": boolean }`
}
