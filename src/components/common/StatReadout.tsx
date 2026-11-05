// src/components/common/StatReadout.tsx
// Telemetry-style numeric readout (Space Mono) with optional trend arrow.
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

const STATUS_TEXT: Readonly<Record<ReadoutStatus, string>> = {
  good: 'text-status-good',
  warn: 'text-status-warn',
  crit: 'text-status-crit',
  info: 'text-status-info',
}

const TREND: Readonly<Record<Trend, { readonly Icon: Icon; readonly label: string }>> = {
  up: { Icon: ArrowUp, label: 'increasing' },
  down: { Icon: ArrowDown, label: 'decreasing' },
  flat: { Icon: Minus, label: 'stable' },
}

export function StatReadout({ label, value, unit, status, trend }: StatReadoutProps): JSX.Element {
  const valueColor = status !== undefined ? STATUS_TEXT[status] : 'text-text-primary'

  let trendNode: JSX.Element | null = null
  if (trend !== undefined) {
    const { Icon, label: trendLabel } = TREND[trend]
    trendNode = (
      <Icon size={18} weight="bold" className={valueColor} aria-label={trendLabel} role="img" />
    )
  }

  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-text-muted">{label}</span>
      <span className="hud-mono flex items-baseline gap-1 text-2xl font-semibold">
        <span className={valueColor}>{value}</span>
        {unit !== undefined ? (
          <span className="text-sm font-normal text-text-secondary">{unit}</span>
        ) : null}
        {trendNode !== null ? <span className="ml-1 inline-flex self-center">{trendNode}</span> : null}
      </span>
    </div>
  )
}
