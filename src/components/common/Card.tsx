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
  teal: 'border-l-4 border-l-[#1FC8C0]',
  amber: 'border-l-4 border-l-[#F5A623]',
  coral: 'border-l-4 border-l-[#FF6F61]',
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
    ? 'ring-2 ring-[#1FC8C0]'
    : ''

  const interactiveClass = clickable
    ? 'cursor-pointer hover:shadow-cardHover transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FC8C0]'
    : ''

  const combinedClass = `bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 ${ACCENT_BORDER[accent]} ${selectedClass} ${interactiveClass} ${className}`.trim()

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
