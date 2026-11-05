// src/simulation/events/event-engine.ts
// Determines which events trigger each step using the seeded PRNG.
// NO React, Zustand, or Phaser imports. NO Math.random().

import type { SimulationState, EventDefinition } from '@simulation/types'
import { LUNAR_EVENTS } from './lunar-events'
import { MARTIAN_EVENTS } from './martian-events'

const ALL_EVENTS: readonly EventDefinition[] = [...LUNAR_EVENTS, ...MARTIAN_EVENTS]

export interface EventEngineResult {
  readonly newActiveEventIds: readonly string[]
  readonly triggeredEventIds: readonly string[]
}

/**
 * Determines which events trigger this simulation step.
 *
 * Rules applied in order:
 * 1. Filter events to the active planet (state.planetId)
 * 2. Skip events already active (state.activeEventIds)
 * 3. Check minDay constraint
 * 4. Check occurrenceCount < maxOccurrences
 * 5. Check requiresActiveEvent (if set: skip if not active)
 * 6. Check requiresNoActiveEvent (if set: skip if active)
 * 7. Call prng() and compare to event.probability
 * 8. If triggered: add to result list, increment occurrenceCount
 *
 * NEVER calls Math.random().
 */
export function processEvents(
  state: SimulationState,
  prng: () => number,
  occurrenceCount: Readonly<Record<string, number>>,
): EventEngineResult {
  const planetEvents = ALL_EVENTS.filter((e) => e.planetId === state.planetId)
  const triggered: string[] = []

  for (const event of planetEvents) {
    // Skip if already active
    if (state.activeEventIds.includes(event.id)) continue

    const { minDay = 0, probability, maxOccurrences } = event.triggerCondition

    // Check minimum day
    if (state.missionDay < minDay) continue

    // Check max occurrences
    const count = occurrenceCount[event.id] ?? 0
    if (count >= maxOccurrences) continue

    // Check requiresActiveEvent
    if (
      event.triggerCondition.requiresActiveEvent !== undefined &&
      !state.activeEventIds.includes(event.triggerCondition.requiresActiveEvent)
    ) {
      continue
    }

    // Check requiresNoActiveEvent
    if (
      event.triggerCondition.requiresNoActiveEvent !== undefined &&
      state.activeEventIds.includes(event.triggerCondition.requiresNoActiveEvent)
    ) {
      continue
    }

    // Probability check using seeded PRNG
    if (prng() < probability) {
      triggered.push(event.id)
    }
  }

  const newActiveEventIds: readonly string[] = [...state.activeEventIds, ...triggered]
  return { newActiveEventIds, triggeredEventIds: triggered }
}

/** Looks up an event definition by ID. Returns undefined if not found. */
export function findEventById(eventId: string): EventDefinition | undefined {
  return ALL_EVENTS.find((e) => e.id === eventId)
}
