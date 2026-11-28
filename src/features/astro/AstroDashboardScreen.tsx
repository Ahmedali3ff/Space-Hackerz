// src/features/astro/AstroDashboardScreen.tsx
// Astro-AI command centre: overview (resources, risk, tools, recent decisions) and the Error Detection Center.
// Read-only: nothing here changes the mission.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAstroContext } from '@/hooks/useAstroContext'
import { useMissionStore } from '@store/mission-store'
import { analyzeMission } from '@/ai/analysis'
import type { RiskLevel } from '@/ai/analysis'
import { buildErrorItems, summarizeErrors, filterErrors } from '@/ai/errors/error-center'
import type { ErrorItem, ErrorResource, ErrorSeverity } from '@/ai/errors/error-center'
import { AstroToolsSection } from '@/features/mission-control/AstroToolsSection'
import { LearningSection } from './LearningSection'

const RISK: Readonly<Record<RiskLevel, { label: string; icon: string; tone: string }>> = {
  stable: { label: 'Stable', icon: '✓', tone: 'text-[#16A34A]' },
  low: { label: 'Needs attention', icon: '!', tone: 'text-[#B45309]' },
  critical: { label: 'Critical', icon: '✕', tone: 'text-[#B91C1C]' },
}

const STATUS_TEXT: Readonly<Record<RiskLevel, string>> = { stable: 'Stable', low: 'Low', critical: 'Critical' }

type Tab = 'overview' | 'errors' | 'learning'

export function AstroDashboardScreen(): JSX.Element {
  const [tab, setTab] = useState<Tab>('overview')
  const context = useAstroContext()
  const decisionLog = useMissionStore((s) => s.decisionLog)

  const analysis = useMemo(() => (context ? analyzeMission(context) : null), [context])
  const errors = useMemo(() => (context ? buildErrorItems(decisionLog, context) : []), [decisionLog, context])

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-[#F4F7FB] p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D2E]">Astro-AI</h1>
          <p className="text-sm text-[#6B7280]">Mission intelligence system</p>
        </div>
        <Link to="/mission" className="rounded-lg border border-[#1FC8C0] px-3 py-2 text-sm font-semibold text-[#0E7490] hover:bg-[#E8FAF9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1FC8C0]">
          Back to mission
        </Link>
      </header>

      {context === null || analysis === null ? (
        <section className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-[#1A1D2E]">No active mission</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Start a mission to see its status, resources and detected errors.</p>
        </section>
      ) : (
        <>
          <section aria-label="Mission summary" className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#6B7280]">{context.planetDisplayName}</p>
                <h2 className="text-lg font-semibold text-[#1A1D2E]">Day {context.missionDay} · Crew of {context.crewSize}</h2>
              </div>
              <span className={`text-sm font-semibold ${RISK[analysis.overallRisk].tone}`}>
                <span aria-hidden="true">{RISK[analysis.overallRisk].icon} </span>{RISK[analysis.overallRisk].label}
              </span>
            </div>
            <p className="mt-2 text-sm text-[#6B7280]">
              {analysis.criticalCount} critical · {analysis.warningCount} warnings
            </p>
          </section>

          <nav aria-label="Astro-AI sections" className="flex gap-2">
            {(['overview', 'errors', 'learning'] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1FC8C0] ${tab === t ? 'bg-[#1FC8C0] text-white' : 'bg-white text-[#1A1D2E] shadow-sm'}`}
              >
                {t === 'overview' ? 'Overview' : t === 'errors' ? `Error center (${errors.length})` : 'Learning'}
              </button>
            ))}
          </nav>

          {tab === 'overview' ? (
            <>
              <section aria-label="Resources" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {analysis.resources.map((r) => (
                  <article key={r.resource} className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold capitalize text-[#1A1D2E]">{r.resource}</h3>
                      <span className={`text-xs font-semibold ${RISK[r.status].tone}`}>
                        <span aria-hidden="true">{RISK[r.status].icon} </span>{STATUS_TEXT[r.status]}
                      </span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-[#1A1D2E]">{r.percent}%</p>
                    <div role="progressbar" aria-label={`${r.resource} level`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.percent} className="h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                      <div className="h-full rounded-full bg-[#1FC8C0]" style={{ width: `${Math.min(100, Math.max(0, r.percent))}%` }} />
                    </div>
                  </article>
                ))}
              </section>

              <section aria-label="Risk overview" className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-[#1A1D2E]">Risk overview</h2>
                {analysis.problems.length === 0 ? (
                  <p className="mt-2 text-sm text-[#16A34A]">No issues detected in the current mission.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-[#1A1D2E]">
                    {analysis.problems.slice(0, 3).map((p) => (
                      <li key={p.id}><span aria-hidden="true">{p.severity === 'critical' ? '✕ ' : '! '}</span>{p.title}: {p.detail}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs italic text-[#6B7280]">{analysis.forecast.reason}</p>
              </section>

              <section aria-label="Recent decisions" className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-[#1A1D2E]">Recent decisions</h2>
                {decisionLog.length === 0 ? (
                  <p className="mt-2 text-sm text-[#6B7280]">No decisions recorded yet.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-[#1A1D2E]">
                    {decisionLog.slice(-3).reverse().map((d, i) => (
                      <li key={i}>Day {d.missionDay}: {d.resultSummary} <span className="text-[#6B7280]">({d.wasOptimal ? 'optimal' : 'not optimal'})</span></li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-label="Astro-AI tools" className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-base font-semibold text-[#1A1D2E]">Tools</h2>
                <AstroToolsSection />
              </section>
            </>
          ) : tab === 'errors' ? (
            <ErrorCenter items={errors} />
          ) : (
            <LearningSection />
          )}
        </>
      )}
    </main>
  )
}

function ErrorCenter({ items }: { readonly items: readonly ErrorItem[] }): JSX.Element {
  const [severity, setSeverity] = useState<ErrorSeverity | ''>('')
  const [resource, setResource] = useState<ErrorResource | ''>('')
  const [openId, setOpenId] = useState<string | null>(null)

  const summary = summarizeErrors(items)
  const shown = filterErrors(items, {
    severity: severity === '' ? undefined : severity,
    resource: resource === '' ? undefined : resource,
  })

  return (
    <section aria-label="Error detection center" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={summary.total} />
        <Stat label="Critical" value={summary.critical} />
        <Stat label="Warnings" value={summary.warnings} />
        <Stat label="Optimisations" value={summary.optimizations} />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col text-xs font-semibold text-[#1A1D2E]">
          Severity
          <select value={severity} onChange={(e) => setSeverity(e.target.value as ErrorSeverity | '')} className="mt-1 rounded-lg border border-[#D1D5DB] px-2 py-1.5 text-sm">
            <option value="">All</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="optimization">Optimisation</option>
          </select>
        </label>
        <label className="flex flex-col text-xs font-semibold text-[#1A1D2E]">
          Resource
          <select value={resource} onChange={(e) => setResource(e.target.value as ErrorResource | '')} className="mt-1 rounded-lg border border-[#D1D5DB] px-2 py-1.5 text-sm">
            <option value="">All</option>
            <option value="oxygen">Oxygen</option>
            <option value="water">Water</option>
            <option value="food">Food</option>
            <option value="energy">Energy</option>
            <option value="radiation">Radiation</option>
            <option value="decision">Decisions</option>
          </select>
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl bg-white p-5 text-sm text-[#16A34A] shadow-sm">No issues match these filters.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((item) => {
            const open = openId === item.id
            return (
              <li key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : item.id)} className="flex w-full items-start justify-between gap-3 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1FC8C0]">
                  <span>
                    <span className="block text-xs font-semibold uppercase text-[#6B7280]">{item.severity}{item.day !== null ? ` · Day ${item.day}` : ''}</span>
                    <span className="block font-semibold text-[#1A1D2E]">{item.title}</span>
                  </span>
                  <span aria-hidden="true" className="text-[#6B7280]">{open ? '−' : '+'}</span>
                </button>
                {open ? (
                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm text-[#1A1D2E]">
                    <Detail term="Decision" value={item.decision} />
                    <Detail term="What happened" value={item.happened} />
                    <Detail term="Rule" value={item.ruleNote} />
                    <Detail term="Impact" value={item.impact} />
                    <Detail term="How to avoid it" value={item.avoid} />
                    <Detail term="Better choice" value={item.betterChoice} />
                    <Detail term="Lesson" value={item.lesson} />
                  </dl>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Stat({ label, value }: { readonly label: string; readonly value: number }): JSX.Element {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className="text-2xl font-bold tabular-nums text-[#1A1D2E]">{value}</p>
    </div>
  )
}

function Detail({ term, value }: { readonly term: string; readonly value: string }): JSX.Element {
  return (
    <div>
      <dt className="font-semibold">{term}</dt>
      <dd className="text-[#374151]">{value}</dd>
    </div>
  )
}
