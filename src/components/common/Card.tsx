// src/components/common/Card.tsx
// White Space+ card with optional teal/amber/coral accent left border.
// Supports selected state (ring) and clickable behavior.
// Uses .sp-card CSS utility class for base white card styles.

import type { ReactNode } from 'react'

type CardAccent = 'teal' | 'amber' | 'coral' | 'none'

interface CardProps {
  readonly children: ReactNode
  readonly className?: string
  readonly accent?: CardAccent
  readonly clickable?: boolean
  readonly selected?: boolean
  readonly onClick?: () => void
  readonly ariaLabel?: string
  readonly ariaPressed?: boolean
}

const ACCENT_BORDER: Readonly<Record<CardAccent, string>> = {
  teal: 'border-l-4 border-l-spaceplus-accent-teal',
  amber: 'border-l-4 border-l-spaceplus-accent-amber',
  coral: 'border-l-4 border-l-spaceplus-accent-coral',
  none: '',
}

export function Card({
  children,
  className = '',
  accent = 'none',
  clickable = false,
  selected = false,
  onClick,
  ariaLabel,
  ariaPressed,
}: CardProps): JSX.Element {
  const selectedClass = selected
    ? 'ring-2 ring-spaceplus-accent-teal'
    : ''

  const interactiveClass = clickable
    ? 'cursor-pointer hover:shadow-cardHover transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal'
    : ''

  const combinedClass = `sp-card p-5 ${ACCENT_BORDER[accent]} ${selectedClass} ${interactiveClass} ${className}`.trim()

  if (clickable || onClick !== undefined) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={combinedClass}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.()
          }
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={combinedClass} aria-label={ariaLabel}>
      {children}
    </div>
  )
}
