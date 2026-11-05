// src/ai/prompts/decision-guidance.prompt.ts
// Prompt builder for providing decision guidance on a specific event.
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
 * Builds a prompt asking Astro-AI to provide decision guidance for a specific event.
 * Helps students aged 8–12 think through their choices scientifically.
 */
export function buildDecisionGuidancePrompt(
  context: SimulationContext,
  eventId: string,
): string {
  return `You are Astro, an educational AI assistant for ASTRA Mission Control Academy. You help students aged 8–12 understand real space science.

Current mission status:
${formatContext(context)}

The player must make a decision about event: ${eventId}

Please explain what this event is about in simple, exciting terms, why it is scientifically important for the mission, and help the student think through their choices. Describe what might happen if they act quickly versus what might happen if they ignore the event.

Use simple, exciting language a 10-year-old can understand.
Do NOT invent specific numbers or measurements.
Do NOT claim this data comes from a live NASA feed.
Refer to the crew in first person: 'your crew'.

Respond with ONLY a JSON object matching this schema:
{ "explanation": string (10–500 chars), "scienceFact": string (optional, max 300 chars), "suggestion": string (optional, max 200 chars), "isGrounded": boolean }`
}
