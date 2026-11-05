// src/components/common/SectionLabel.tsx
// Uppercase 11px teal section label — used above card sections in the Space+ UI.
// Uses .sp-section-label CSS utility class + teal-dark text color.

import type { ReactNode } from 'react'

interface SectionLabelProps {
  readonly children: ReactNode
  readonly className?: string
}

export function SectionLabel({ children, className = '' }: SectionLabelProps): JSX.Element {
  return (
    <span
      className={`sp-section-label text-spaceplus-accent-tealDark ${className}`}
    >
      {children}
    </span>
  )
}
