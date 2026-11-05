// src/ai/prompts/resource-change.prompt.ts
// Prompt builder for explaining why a specific resource changed.
// NO React, Zustand, or Phaser imports.

import type { SimulationContext } from '../simulation-context'
import type { ResourceType } from '@simulation/types'

/** Maps a ResourceType to a human-readable display label. */
function resourceLabel(resource: ResourceType): string {
  const labels: Record<ResourceType, string> = {
    oxygen: 'Oxygen',
    water: 'Water',
    food: 'Food',
    energy: 'Energy',
  }
  return labels[resource]
}

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
 * Builds a prompt asking Astro-AI to explain why a specific resource changed
 * and what the student commander can do about it.
 */
export function buildResourceChangePrompt(
  context: SimulationContext,
  resource: ResourceType,
): string {
  const label = resourceLabel(resource)
  const level =
    resource === 'oxygen'
      ? context.resourceLevels.oxygenPercent
      : resource === 'water'
        ? context.resourceLevels.waterPercent
        : resource === 'food'
          ? context.resourceLevels.foodPercent
          : context.resourceLevels.energyPercent

  return `You are Astro, an educational AI assistant for ASTRA Mission Control Academy. You help students aged 8–12 understand real space science.

Current mission status:
${formatContext(context)}

The student commander wants to understand why ${label} changed. ${label} is currently at ${level.toFixed(1)}% of the initial supply.

Please explain: why does ${label} change in a space habitat, what causes it to go up or down, and what the student commander can do to keep it at a safe level.

Use simple, exciting language a 10-year-old can understand.
Do NOT invent specific numbers or measurements.
Do NOT claim this data comes from a live NASA feed.
Refer to the crew in first person: 'your crew'.

Respond with ONLY a JSON object matching this schema:
{ "explanation": string (10–500 chars), "scienceFact": string (optional, max 300 chars), "suggestion": string (optional, max 200 chars), "isGrounded": boolean }`
}
