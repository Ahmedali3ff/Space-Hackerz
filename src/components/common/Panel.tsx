// src/components/common/Panel.tsx
// Glassmorphic HUD panel — the base surface for all framed content.
// Token-driven (glass-panel utility + accent glow). When `title` is provided
// an accessible <h2> heading is rendered for screen readers and sighted users.

import type { ElementType, ReactNode } from 'react'

type PanelAccent = 'ignition' | 'orbit' | 'none'

interface PanelProps {
  readonly as?: ElementType
  readonly className?: string
  readonly children: ReactNode
  readonly accent?: PanelAccent
  readonly title?: string
}

const ACCENT_BORDER: Readonly<Record<PanelAccent, string>> = {
  ignition: 'border-accent-ignition/70 shadow-glow-ignition',
  orbit: 'border-accent-orbit/70 shadow-glow-orbit',
  none: 'border-border-subtle',
}

export function Panel({
  as,
  className = '',
  children,
  accent = 'none',
  title,
}: PanelProps): JSX.Element {
  const Tag: ElementType = as ?? 'section'
  return (
    <Tag className={`glass-panel rounded-xl p-5 ${ACCENT_BORDER[accent]} ${className}`}>
      {title !== undefined ? (
        <header className="mb-3">
          <h2 className="font-display text-xl font-semibold text-text-primary">{title}</h2>
        </header>
      ) : null}
      {children}
    </Tag>
  )
}
