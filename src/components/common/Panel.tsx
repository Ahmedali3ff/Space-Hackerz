// src/components/common/Panel.tsx
// Backward compatibility shim — all screens now use Card directly.
// This re-export prevents any lingering Panel import from crashing.
// Translates PanelAccent to CardAccent so styling still maps correctly.

import type { ElementType, ReactNode } from 'react'
import { Card } from './Card'

type PanelAccent = 'ignition' | 'orbit' | 'none'

interface PanelProps {
  readonly as?: ElementType
  readonly className?: string
  readonly children: ReactNode
  readonly accent?: PanelAccent
  readonly title?: string
}

const ACCENT_MAP: Readonly<Record<PanelAccent, 'coral' | 'teal' | 'none'>> = {
  ignition: 'coral',
  orbit: 'teal',
  none: 'none',
}

export function Panel({
  className = '',
  children,
  accent = 'none',
  title,
}: PanelProps): JSX.Element {
  return (
    <Card accent={ACCENT_MAP[accent]} className={className}>
      {title !== undefined ? (
        <header className="mb-3">
          <h2 className="font-display2 text-xl font-semibold text-spaceplus-text-heading">{title}</h2>
        </header>
      ) : null}
      {children}
    </Card>
  )
}
