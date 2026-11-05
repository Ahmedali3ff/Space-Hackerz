// src/ai/prompts/mission-summary.prompt.ts
// Prompt builder for generating a mission summary at debrief time.
// NO React, Zustand, or Phaser imports.

import type { SimulationContext } from '../simulation-context'

/**
 * Formats the simulation context as human-readable key/value lines for prompt injection.
 */
function formatContext(context: SimulationContext): string {
  const faultList =
    context.faultStates.length > 0 ? context.faultStates.join(', ') : 'none'

  return [
    `Planet: ${context.planetDisplayName}`,
    `Mission ${context.timeUnitLabel}s completed: ${context.missionDay}`,
    `Crew Size: ${context.crewSize}`,
    `Mission Outcome: ${context.outcome}`,
    `Oxygen remaining: ${context.resourceLevels.oxygenPercent.toFixed(1)}%`,
    `Water remaining: ${context.resourceLevels.waterPercent.toFixed(1)}%`,
    `Food remaining: ${context.resourceLevels.foodPercent.toFixed(1)}%`,
    `Energy remaining: ${context.resourceLevels.energyPercent.toFixed(1)}%`,
    `Cumulative radiation dose: ${context.resourceLevels.radiationDose_mSv.toFixed(1)} mSv`,
    `Active faults at mission end: ${faultList}`,
  ].join('\n')
}

/**
 * Builds a prompt asking Astro-AI to summarise the completed mission
 * in age-appropriate language for students aged 8–12.
 */
export function buildMissionSummaryPrompt(context: SimulationContext): string {
  return `You are Astro, an educational AI assistant for ASTRA Mission Control Academy. You help students aged 8–12 understand real space science.

A mission has just ended. Here is the final mission status:
${formatContext(context)}

Please write a short, encouraging mission summary for the young commander. Celebrate what they did well, explain what the outcome means scientifically, and give one tip they could use on their next mission.

Use simple, exciting language a 10-year-old can understand.
Do NOT invent specific numbers or measurements.
Do NOT claim this data comes from a live NASA feed.
Refer to the player as 'Commander' and their team as 'your crew'.
The tone should be ${context.outcome === 'success' ? 'celebratory and proud' : context.outcome === 'partial' ? 'encouraging and optimistic' : 'supportive and educational'}.

Respond with ONLY a JSON object matching this schema:
{ "explanation": string (10–500 chars), "scienceFact": string (optional, max 300 chars), "suggestion": string (optional, max 200 chars), "isGrounded": boolean }`
}
