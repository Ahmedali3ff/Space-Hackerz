// src/components/common/StatusBadge.tsx
// Pill-shaped status indicator. Maps a semantic status to its token color and
// ALWAYS renders an icon + label — color is never the sole signal (§7.1/7.4).
// When no icon is supplied a sensible default per status is used so the
// non-color signal is guaranteed.

import type { Icon } from '@phosphor-icons/react'
import { CheckCircle, Warning, WarningOctagon, Info } from '@phosphor-icons/react'

type BadgeStatus = 'good' | 'warn' | 'crit' | 'info'

interface StatusBadgeProps {
  readonly status: BadgeStatus
  readonly label: string
  readonly icon?: Icon
}

interface StatusStyle {
  readonly classes: string
  readonly icon: Icon
}

const STATUS_STYLE: Readonly<Record<BadgeStatus, StatusStyle>> = {
  good: { classes: 'text-status-good bg-status-good/15 border-status-good/40', icon: CheckCircle },
  warn: { classes: 'text-status-warn bg-status-warn/15 border-status-warn/40', icon: Warning },
  crit: { classes: 'text-status-crit bg-status-crit/15 border-status-crit/40', icon: WarningOctagon },
  info: { classes: 'text-status-info bg-status-info/15 border-status-info/40', icon: Info },
}

export function StatusBadge({ status, label, icon }: StatusBadgeProps): JSX.Element {
  const { classes, icon: defaultIcon } = STATUS_STYLE[status]
  const IconComp = icon ?? defaultIcon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${classes}`}
    >
      <IconComp size={18} weight="fill" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
