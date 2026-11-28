// src/features/astro/shared.tsx
// Shared presentation pieces for Astro-AI screens, so each screen does not repeat the same markup.
import type { RiskLevel } from '@/ai/analysis'

export const RISK_STYLE: Readonly<Record<RiskLevel, { label: string; icon: string; tone: string }>> = {
  stable: { label: 'Stable', icon: '✓', tone: 'astro-ok' },
  low: { label: 'Needs attention', icon: '!', tone: 'astro-warn' },
  critical: { label: 'Critical', icon: '✕', tone: 'astro-critical' },
}

export function RiskBadge({ level }: { readonly level: RiskLevel }): JSX.Element {
  const style = RISK_STYLE[level]
  return (
    <span className={`text-sm font-semibold ${style.tone}`}>
      <span aria-hidden="true">{style.icon} </span>{style.label}
    </span>
  )
}

export function StatCard({ label, value }: { readonly label: string; readonly value: number }): JSX.Element {
  return (
    <div className="rounded-2xl astro-surface p-4 shadow-sm">
      <p className="text-xs astro-muted">{label}</p>
      <p className="text-2xl font-bold tabular-nums astro-text">{value}</p>
    </div>
  )
}

export function DetailRow({ term, value }: { readonly term: string; readonly value: string }): JSX.Element {
  return (
    <div>
      <dt className="font-semibold">{term}</dt>
      <dd className="astro-text-2">{value}</dd>
    </div>
  )
}
