// src/features/mission-control/MissionAnalysisSummary.tsx
// Shows the deterministic mission analysis inside Astro-AI. Read-only: it never changes the mission.
import { useMemo } from 'react'
import { analyzeMission } from '@/ai/analysis'
import type { SimulationContext } from '@/ai/simulation-context'
import { RISK_STYLE } from '@/features/astro/shared'


interface Props {
  readonly context: SimulationContext | null
}

export function MissionAnalysisSummary({ context }: Props): JSX.Element | null {
  const analysis = useMemo(() => (context ? analyzeMission(context) : null), [context])
  if (analysis === null) {
    return <p className="text-xs text-[#9CA3AF]">Mission analysis appears once a mission is running.</p>
  }
  const risk = RISK_STYLE[analysis.overallRisk]

  return (
    <section aria-label="Mission analysis" className="flex flex-col gap-3 border-t border-[#1FC8C0]/20 pt-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1D2E]">Mission status</h3>
        <span className={`text-sm font-semibold ${risk.tone}`}>
          <span aria-hidden="true">{risk.icon} </span>{risk.label}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-2 text-xs">
        {analysis.resources.map((r) => (
          <li key={r.resource} className="flex justify-between rounded-lg bg-white px-2 py-1.5">
            <span className="capitalize text-[#1A1D2E]">{r.resource}</span>
            <span className="font-semibold tabular-nums text-[#1A1D2E]">{r.percent}%</span>
          </li>
        ))}
      </ul>

      {analysis.problems.length === 0 ? (
        <p className="text-xs text-[#16A34A]">No issues detected in the current mission.</p>
      ) : (
        <ul className="flex flex-col gap-1.5 text-xs" aria-label="Detected problems">
          {analysis.problems.slice(0, 5).map((p) => (
            <li key={p.id} className="text-[#1A1D2E]">
              <span className="font-semibold">{p.severity === 'critical' ? '✕ ' : '! '}{p.title}.</span>{' '}
              <span className="text-[#6B7280]">{p.detail}</span>
            </li>
          ))}
        </ul>
      )}

      {analysis.recommendations.length > 0 ? (
        <div className="text-xs">
          <p className="font-semibold text-[#1A1D2E]">Recommended next steps</p>
          <ol className="mt-1 list-decimal ps-4 text-[#1A1D2E]">
            {analysis.recommendations.slice(0, 3).map((r) => (
              <li key={r.problemId}>{r.action}</li>
            ))}
          </ol>
        </div>
      ) : null}

      <p className="text-[11px] italic text-[#6B7280]">{analysis.forecast.reason}</p>
    </section>
  )
}
