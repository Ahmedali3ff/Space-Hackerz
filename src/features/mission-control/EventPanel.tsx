// src/features/mission-control/EventPanel.tsx
// Shows active event cards with urgency-based styling.
// High-severity events (OXYGEN or WATER affected) get a red border.
// After resolving an event, shows an inline result toast that auto-dismisses.

import { useState, useEffect } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { Card } from '@/components/common/Card'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { getEventDefinition } from '../events/event-registry'
import type { EventDefinition } from '@simulation/types'

interface EventPanelProps {}

// ── Event result toast ────────────────────────────────────────────────────────

interface ResultToastProps {
  readonly text: string
  readonly onDismiss: () => void
}

function ResultToast({ text, onDismiss }: ResultToastProps): JSX.Element {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-2 rounded-xl bg-[#E8FAF9] border border-[#1FC8C0]/30 px-4 py-3 text-sm text-[#1A1D2E] animate-fade-in"
    >
      <span className="font-semibold text-[#1FC8C0]">Result: </span>{text}
    </div>
  )
}

// ── Single event card ─────────────────────────────────────────────────────────

interface ActiveEventCardProps {
  readonly eventId: string
  readonly def: EventDefinition
  readonly onResolve: (eventId: string, choiceId: string) => void
}

function ActiveEventCard({ eventId, def, onResolve }: ActiveEventCardProps): JSX.Element {
  const [resultText, setResultText] = useState<string | null>(null)
  const [resolved, setResolved] = useState(false)

  const isHighSeverity =
    def.affectedSystems.includes('oxygen') || def.affectedSystems.includes('water')

  function handleChoice(choiceId: string): void {
    const choice = def.choices.find((c) => c.id === choiceId)
    onResolve(eventId, choiceId)
    setResolved(true)
    setResultText(choice?.description ?? 'Event resolved.')
  }

  const borderClass = isHighSeverity
    ? 'border-l-4 border-[#EF4444]'
    : 'border-l-4 border-[#F5A623]'
  const bgClass = isHighSeverity ? 'bg-[#FEF2F2]' : 'bg-[#FFFBEB]'

  return (
    <div className={`rounded-2xl p-4 flex flex-col gap-3 ${bgClass} ${borderClass}`}>
      <div>
        <h3 className="font-semibold text-base text-[#1A1D2E]">{def.title}</h3>
        <p className="mt-1 text-sm text-[#6B7280] leading-snug">{def.description}</p>
      </div>

      {!resolved ? (
        <div className="flex flex-col gap-2">
          {def.choices.map((choice, index) => (
            <PrimaryButton
              key={choice.id}
              variant={index === 0 ? 'hint' : 'secondary'}
              size="md"
              onClick={() => handleChoice(choice.id)}
              ariaLabel={`${choice.label} — ${def.title}`}
            >
              {choice.label}
            </PrimaryButton>
          ))}
        </div>
      ) : (
        resultText !== null && (
          <ResultToast text={resultText} onDismiss={() => setResultText(null)} />
        )
      )}
    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function EventPanel(_props: EventPanelProps): JSX.Element {
  const { activeEventIds, resolveEvent } = useMissionControl()

  const resolvedEvents = activeEventIds
    .map((id) => ({ id, def: getEventDefinition(id) }))
    .filter(
      (entry): entry is { id: string; def: NonNullable<ReturnType<typeof getEventDefinition>> } =>
        entry.def !== undefined,
    )

  return (
    <section aria-label="Active Events">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
        Active Events
      </h2>

      {resolvedEvents.length === 0 ? (
        <Card className="flex items-center gap-3">
          <CheckCircle
            size={24}
            weight="fill"
            className="text-[#10B981]"
            aria-hidden="true"
          />
          <p className="text-sm text-[#6B7280]">All systems nominal ✓</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {resolvedEvents.map(({ id, def }) => (
            <ActiveEventCard
              key={id}
              eventId={id}
              def={def}
              onResolve={resolveEvent}
            />
          ))}
        </div>
      )}
    </section>
  )
}
