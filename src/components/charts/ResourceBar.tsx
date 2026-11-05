// src/components/charts/ResourceBar.tsx
// Animated resource bar (oxygen / water / food / energy). Fill color comes
// from the status token; the value/max/unit are also exposed as sr-only text
// and as ARIA progressbar attributes so the data is never color-only. The fill
// animates via Framer Motion width and snaps instantly when reduced motion is
// on (useReducedMotion reads the persisted/OS preference).

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { Icon } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type BarStatus = 'good' | 'warn' | 'crit'

interface ResourceBarProps {
  readonly label: string
  readonly value: number
  readonly max: number
  readonly unit?: string
  readonly status: BarStatus
  readonly icon?: Icon
  readonly valueLabel?: string
}

const BAR_FILL: Readonly<Record<BarStatus, string>> = {
  good: 'bg-status-good',
  warn: 'bg-status-warn',
  crit: 'bg-status-crit',
}

export function ResourceBar({
  label,
  value,
  max,
  unit,
  status,
  icon,
  valueLabel,
}: ResourceBarProps): JSX.Element {
  const { reducedMotion } = useReducedMotion()
  const safeMax = max > 0 ? max : 1
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100))
  const display = valueLabel ?? `${Math.round(value)}`
  const srText = `${label} ${Math.round(value)} of ${Math.round(max)}${unit !== undefined ? ' ' + unit : ''}`

  let iconNode: ReactNode = null
  if (icon !== undefined) {
    const IconComp = icon
    iconNode = <IconComp size={18} weight="fill" className="text-text-secondary" aria-hidden="true" />
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm text-text-secondary">
          {iconNode}
          {label}
        </span>
        <span className="hud-mono text-sm text-text-primary">
          {display}
          {unit !== undefined ? ' ' + unit : ''}
        </span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full border border-border-subtle bg-space-deep"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={Math.round(max)}
        aria-label={label}
      >
        <motion.div
          className={`h-full rounded-full ${BAR_FILL[status]}`}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="sr-only">{srText}</span>
    </div>
  )
}
