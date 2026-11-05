// src/components/charts/MiniProgressBar.tsx
// Compact inline label + progress bar + value/unit — for use in sidebars.
// This is a smaller inline variant than ProgressBar — single-row layout.

interface MiniProgressBarProps {
  readonly label: string
  readonly value: number
  readonly max: number
  readonly unit: string
  readonly color?: string
}

export function MiniProgressBar({
  label,
  value,
  max,
  unit,
  color = '#1FC8C0',
}: MiniProgressBarProps): JSX.Element {
  const safeMax = max > 0 ? max : 1
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100))
  const displayValue = Math.round(value)
  const srText = `${label}: ${displayValue} ${unit}`

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Label */}
      <span className="shrink-0 w-20 text-xs font-medium text-spaceplus-text-secondary truncate" aria-hidden="true">
        {label}
      </span>

      {/* Bar */}
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden bg-spaceplus-border-light"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={srText}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {/* Value + unit */}
      <span className="shrink-0 text-xs font-semibold text-spaceplus-text-heading tabular-nums" aria-hidden="true">
        {displayValue}
        <span className="text-spaceplus-text-secondary font-normal"> {unit}</span>
      </span>

      {/* SR only text */}
      <span className="sr-only">{srText}</span>
    </div>
  )
}
