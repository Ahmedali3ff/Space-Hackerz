// src/features/events/event-registry.ts
// Lookup helpers that map event IDs to their EventDefinition.
// Imports the event arrays from @simulation/events — re-exporting for
// presentation lookup is allowed; this file does NOT import the engine.
// NO React imports.

import type { EventDefinition, PlanetId } from '@simulation/types'
import { LUNAR_EVENTS } from '@simulation/events/lunar-events'
import { MARTIAN_EVENTS } from '@simulation/events/martian-events'

// Build a single id→definition map for O(1) lookups.
const eventMap = new Map<string, EventDefinition>()

for (const event of LUNAR_EVENTS) {
  eventMap.set(event.id, event)
}
for (const event of MARTIAN_EVENTS) {
  eventMap.set(event.id, event)
}

/**
 * Returns the EventDefinition for the given event ID, or undefined if not found.
 */
export function getEventDefinition(eventId: string): EventDefinition | undefined {
  return eventMap.get(eventId)
}

/**
 * Returns all event definitions for the given planet.
 */
export function getEventsForPlanet(planetId: PlanetId): readonly EventDefinition[] {
  if (planetId === 'moon') return LUNAR_EVENTS
  return MARTIAN_EVENTS
}
