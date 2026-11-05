// src/components/common/StatReadout.tsx
// Telemetry-style numeric readout with optional trend arrow.
// Migrated to Space+ tokens — light theme, Nunito font, teal/status palette.
// The trend uses an icon + aria-label so direction is never conveyed by
// color alone. Status optionally tints the value text.

import type { Icon } from '@phosphor-icons/react'
import { ArrowUp, ArrowDown, Minus } from '@phosphor-icons/react'

type ReadoutStatus = 'good' | 'warn' | 'crit' | 'info'
type Trend = 'up' | 'down' | 'flat'

interface StatReadoutProps {
  readonly label: string
  readonly value: string | number
  readonly unit?: string
  readonly status?: ReadoutStatus
  readonly trend?: Trend
}

// Space+ status token classes (light-theme palette)
const STATUS_TEXT: Readonly<Record<ReadoutStatus, string>> = {
  good: 'text-spaceplus-status-success',
  warn: 'text-spaceplus-status-warning',
  crit: 'text-spaceplus-status-error',
  info: 'text-spaceplus-status-info',
}

const TREND: Readonly<Record<Trend, { readonly Icon: Icon; readonly label: string }>> = {
  up: { Icon: ArrowUp, label: 'increasing' },
  down: { Icon: ArrowDown, label: 'decreasing' },
  flat: { Icon: Minus, label: 'stable' },
}

export function StatReadout({ label, value, unit, status, trend }: StatReadoutProps): JSX.Element {
  const valueColor = status !== undefined ? STATUS_TEXT[status] : 'text-spaceplus-text-heading'

  let trendNode: JSX.Element | null = null
  if (trend !== undefined) {
    const { Icon, label: trendLabel } = TREND[trend]
    trendNode = (
      <Icon size={18} weight="bold" className={valueColor} aria-label={trendLabel} role="img" />
    )
  }

  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-spaceplus-text-muted">{label}</span>
      <span className="font-mono tabular-nums flex items-baseline gap-1 text-2xl font-semibold">
        <span className={valueColor}>{value}</span>
        {unit !== undefined ? (
          <span className="text-sm font-normal text-spaceplus-text-secondary">{unit}</span>
        ) : null}
        {trendNode !== null ? <span className="ml-1 inline-flex self-center">{trendNode}</span> : null}
      </span>
    </div>
  )
}
