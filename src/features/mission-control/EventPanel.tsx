// src/features/mission-control/EventPanel.tsx
// Shows active event cards; falls back to a nominal status panel.
// Reads activeEventIds from useMissionControl and resolves definitions
// via the event-registry lookup (no simulation engine import).

import { CheckCircle } from '@phosphor-icons/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { Card } from '@/components/common/Card'
import { EventCard } from '@/components/feedback/EventCard'
import { getEventDefinition } from '../events/event-registry'

interface EventPanelProps {}

export function EventPanel(_props: EventPanelProps): JSX.Element {
  const { activeEventIds, resolveEvent } = useMissionControl()

  // Resolve definitions — skip any IDs not in the registry (graceful degradation)
  const resolvedEvents = activeEventIds
    .map((id) => ({ id, def: getEventDefinition(id) }))
    .filter((entry): entry is { id: string; def: NonNullable<ReturnType<typeof getEventDefinition>> } =>
      entry.def !== undefined,
    )

  return (
    <section aria-label="Active Events">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-spaceplus-text-muted">
        Active Events
      </h2>

      {resolvedEvents.length === 0 ? (
        <Card className="flex items-center gap-3">
          <CheckCircle size={24} weight="fill" className="text-spaceplus-status-success" aria-hidden="true" />
          <p className="text-sm text-spaceplus-text-secondary">All systems nominal ✓</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {resolvedEvents.map(({ id, def }) => (
            <EventCard
              key={id}
              event={def}
              accent="orbit"
              onResolve={(choiceId) => { resolveEvent(id, choiceId) }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
