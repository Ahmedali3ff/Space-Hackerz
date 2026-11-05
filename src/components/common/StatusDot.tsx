// src/components/common/StatusDot.tsx
// Small colored dot with label. Color is NEVER the sole signal — an aria-label
// on the dot also describes the status semantically for screen readers.

type DotStatus = 'good' | 'warn' | 'crit' | 'info' | 'locked'
type DotSize = 'sm' | 'md'

interface StatusDotProps {
  readonly status: DotStatus
  readonly label: string
  readonly size?: DotSize
}

const DOT_COLOR: Readonly<Record<DotStatus, string>> = {
  good: 'bg-status-good',
  warn: 'bg-status-warn',
  crit: 'bg-status-crit',
  info: 'bg-status-info',
  locked: 'bg-spaceplus-text-muted',
}

const STATUS_LABEL: Readonly<Record<DotStatus, string>> = {
  good: 'Good',
  warn: 'Warning',
  crit: 'Critical',
  info: 'Info',
  locked: 'Locked',
}

const SIZE_MAP: Readonly<Record<DotSize, { dot: string; text: string }>> = {
  sm: { dot: 'w-2 h-2', text: 'text-xs' },
  md: { dot: 'w-2.5 h-2.5', text: 'text-sm' },
}

export function StatusDot({ status, label, size = 'md' }: StatusDotProps): JSX.Element {
  const { dot, text } = SIZE_MAP[size]

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`shrink-0 rounded-full ${dot} ${DOT_COLOR[status]}`}
        aria-label={`${STATUS_LABEL[status]} status`}
        role="img"
      />
      <span className={`${text} text-spaceplus-text-body`}>{label}</span>
    </span>
  )
}
