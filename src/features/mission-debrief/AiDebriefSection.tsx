// src/features/mission-debrief/AiDebriefSection.tsx
// The automatic debrief: mistakes, good decisions, remaining faults and lessons, all from the recorded decisions.
import { useEffect, useMemo } from 'react'
import { buildErrorItems } from '@/ai/errors/error-center'
import { useLearningProfile } from '@/hooks/useLearningProfile'
import { buildMissionDebrief } from '@/ai/debrief/mission-debrief'
import type { SimulationContext } from '@/ai/simulation-context'
import type { DecisionLogEntry } from '@simulation/types'

interface Props {
  readonly decisionLog: readonly DecisionLogEntry[]
  readonly context: SimulationContext | null
}

export function AiDebriefSection({ decisionLog, context }: Props): JSX.Element | null {
  const debrief = useMemo(() => (context ? buildMissionDebrief(decisionLog, context) : null), [decisionLog, context])
  const { recordFinishedMission } = useLearningProfile()

  // Record this mission once, so the learning profile reflects real results.
  useEffect(() => {
    if (context === null) return
    const key = `${context.outcome}:${context.missionDay}:${decisionLog.length}`
    const items = buildErrorItems(decisionLog, context)
    const optimal = decisionLog.filter((d) => d.wasOptimal).length
    recordFinishedMission(key, items, decisionLog.length, optimal)
  }, [context, decisionLog, recordFinishedMission])
  if (debrief === null) {
    return <p className="text-sm text-[#9CA3AF]">The debrief appears once the mission state is available.</p>
  }

  return (
    <section aria-label="AI mission debrief" className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <header>
        <h2 className="text-lg font-semibold text-[#1A1D2E]">Astro-AI debrief</h2>
        <p className="text-sm text-[#6B7280]">
          {debrief.daysSurvived} days · {debrief.optimalDecisions} of {debrief.totalDecisions} decisions were optimal
        </p>
      </header>

      {debrief.mistakes.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-[#DC2626]"><span aria-hidden="true">✕ </span>Mistakes</h3>
          <ul className="mt-2 flex flex-col gap-3">
            {debrief.mistakes.map((m, i) => (
              <li key={i} className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm">
                <p className="font-semibold text-[#1A1D2E]">Day {m.day}: {m.action}</p>
                <p className="text-[#1A1D2E]"><span className="font-semibold">What happened: </span>{m.what}</p>
                <p className="text-[#1A1D2E]"><span className="font-semibold">Why it matters: </span>{m.why}</p>
                <p className="text-[#1A1D2E]"><span className="font-semibold">Better choice: </span>{m.better}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {debrief.goodDecisions.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-[#16A34A]"><span aria-hidden="true">✓ </span>Good decisions</h3>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#1A1D2E]">
            {debrief.goodDecisions.slice(0, 5).map((g, i) => (
              <li key={i}>Day {g.day}: {g.action}. {g.what}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold text-[#1A1D2E]">Still active at the end</h3>
        {debrief.remainingFaults.length === 0 ? (
          <p className="text-sm text-[#16A34A]">No critical faults remained.</p>
        ) : (
          <ul className="mt-1 list-disc ps-5 text-sm text-[#DC2626]">
            {debrief.remainingFaults.map((f) => <li key={f}>{f}</li>)}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#1A1D2E]">Lessons</h3>
        <ul className="mt-1 list-disc ps-5 text-sm text-[#1A1D2E]">
          {debrief.lessons.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </div>
    </section>
  )
}
