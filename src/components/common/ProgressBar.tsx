// src/components/common/ProgressBar.tsx
// Thin 8px Space+ progress bar with teal fill and full accessibility support.
// Screen reader text shows label + percentage. Animated fill via CSS transition.

interface ProgressBarProps {
  readonly value: number
  readonly max: number
  readonly label: string
  readonly showLabel?: boolean
  readonly className?: string
}

export function ProgressBar({
  value,
  max,
  label,
  showLabel = false,
  className = '',
}: ProgressBarProps): JSX.Element {
  const safeMax = max > 0 ? max : 1
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100))
  const rounded = Math.round(pct)

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {showLabel ? (
        <span className="text-sm font-medium text-spaceplus-text-body" aria-hidden="true">
          {label}
        </span>
      ) : null}
      {/* Screen-reader text with full label + percentage */}
      <span className="sr-only">
        {label}: {rounded}%
      </span>
      <div
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-spaceplus-accent-tealLight"
      >
        <div
          className="h-full rounded-full bg-spaceplus-accent-teal transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
