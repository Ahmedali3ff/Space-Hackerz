// src/components/feedback/EventCard.tsx
// Animated card that presents a simulation event to the player.
// Slides in from the right (framer-motion); snaps instant on reduced-motion.
// Each choice renders as a PrimaryButton with an aria-label that includes
// both the choice label and the event title — color is never the sole signal.

import { motion } from 'framer-motion'
import { Lightning } from '@phosphor-icons/react'
import type { EventDefinition } from '@simulation/types'
import { Card } from '@/components/common/Card'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type EventCardAccent = 'ignition' | 'orbit'

interface EventCardProps {
  readonly event: EventDefinition
  readonly onResolve: (choiceId: string) => void
  readonly accent?: EventCardAccent
}

export function EventCard({
  event,
  onResolve,
  accent = 'orbit',
}: EventCardProps): JSX.Element {
  const { reducedMotion } = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { x: 60, opacity: 0 }}
      animate={reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
      transition={reducedMotion ? { duration: 0.01 } : { type: 'spring', stiffness: 320, damping: 28 }}
    >
      <Card accent={accent === 'ignition' ? 'coral' : 'teal'} className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Lightning
            size={28}
            weight="fill"
            className={accent === 'ignition' ? 'text-spaceplus-status-error' : 'text-spaceplus-accent-teal'}
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <h3 className="font-display2 text-lg font-semibold text-spaceplus-text-heading">
              {event.title}
            </h3>
            <p className="text-sm leading-relaxed text-spaceplus-text-secondary">{event.description}</p>
          </div>
        </div>

        {/* Choices */}
        <div className="flex flex-col gap-2">
          {event.choices.map((choice, index) => (
            <PrimaryButton
              key={choice.id}
              variant={index === 0 ? 'hint' : 'secondary'}
              onClick={() => { onResolve(choice.id) }}
              ariaLabel={`${choice.label} — ${event.title}`}
            >
              {choice.label}
            </PrimaryButton>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
