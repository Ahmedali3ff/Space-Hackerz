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
import { RISK_STYLE, StatCard, DetailRow } from './shared'

const RISK = RISK_STYLE

const STATUS_TEXT: Readonly<Record<RiskLevel, string>> = { stable: 'Stable', low: 'Low', critical: 'Critical' }

type Tab = 'overview' | 'errors' | 'learning'

export function AstroDashboardScreen(): JSX.Element {
  const [tab, setTab] = useState<Tab>('overview')
  const context = useAstroContext()
  const decisionLog = useMissionStore((s) => s.decisionLog)

  const analysis = useMemo(() => (context ? analyzeMission(context) : null), [context])
  const errors = useMemo(() => (context ? buildErrorItems(decisionLog, context) : []), [decisionLog, context])

  return (
    <main className="astro-theme astro-dark mx-auto flex min-h-screen max-w-4xl flex-col gap-6 astro-page p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold astro-text">Astro-AI</h1>
          <p className="text-sm astro-muted">Mission intelligence system</p>
        </div>
        <Link to="/mission" className="rounded-lg border astro-border px-3 py-2 text-sm font-semibold astro-link astro-hover astro-focus">
          Back to mission
        </Link>
      </header>

      {context === null || analysis === null ? (
        <section className="rounded-2xl astro-surface p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold astro-text">No active mission</h2>
          <p className="mt-2 text-sm astro-muted">Start a mission to see its status, resources and detected errors.</p>
        </section>
      ) : (
        <>
          <section aria-label="Mission summary" className="rounded-2xl astro-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider astro-muted">{context.planetDisplayName}</p>
                <h2 className="text-lg font-semibold astro-text">Day {context.missionDay} · Crew of {context.crewSize}</h2>
              </div>
              <span className={`text-sm font-semibold ${RISK[analysis.overallRisk].tone}`}>
                <span aria-hidden="true">{RISK[analysis.overallRisk].icon} </span>{RISK[analysis.overallRisk].label}
              </span>
            </div>
            <p className="mt-2 text-sm astro-muted">
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
                className={`rounded-full px-4 py-2 text-sm font-semibold astro-focus ${tab === t ? 'astro-accent-bg text-white' : 'astro-surface astro-text shadow-sm'}`}
              >
                {t === 'overview' ? 'Overview' : t === 'errors' ? `Error center (${errors.length})` : 'Learning'}
              </button>
            ))}
          </nav>

          {tab === 'overview' ? (
            <>
              <section aria-label="Resources" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {analysis.resources.map((r) => (
                  <article key={r.resource} className="flex flex-col gap-2 rounded-2xl astro-surface p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold capitalize astro-text">{r.resource}</h3>
                      <span className={`text-xs font-semibold ${RISK[r.status].tone}`}>
                        <span aria-hidden="true">{RISK[r.status].icon} </span>{STATUS_TEXT[r.status]}
                      </span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums astro-text">{r.percent}%</p>
                    <div role="progressbar" aria-label={`${r.resource} level`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.percent} className="h-2 w-full overflow-hidden rounded-full astro-track">
                      <div className="h-full rounded-full astro-accent-bg" style={{ width: `${Math.min(100, Math.max(0, r.percent))}%` }} />
                    </div>
                  </article>
                ))}
              </section>

              <section aria-label="Risk overview" className="rounded-2xl astro-surface p-5 shadow-sm">
                <h2 className="text-base font-semibold astro-text">Risk overview</h2>
                {analysis.problems.length === 0 ? (
                  <p className="mt-2 text-sm astro-ok">No issues detected in the current mission.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1 text-sm astro-text">
                    {analysis.problems.slice(0, 3).map((p) => (
                      <li key={p.id}><span aria-hidden="true">{p.severity === 'critical' ? '✕ ' : '! '}</span>{p.title}: {p.detail}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs italic astro-muted">{analysis.forecast.reason}</p>
              </section>

              <section aria-label="Recent decisions" className="rounded-2xl astro-surface p-5 shadow-sm">
                <h2 className="text-base font-semibold astro-text">Recent decisions</h2>
                {decisionLog.length === 0 ? (
                  <p className="mt-2 text-sm astro-muted">No decisions recorded yet.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1 text-sm astro-text">
                    {decisionLog.slice(-3).reverse().map((d, i) => (
                      <li key={i}>Day {d.missionDay}: {d.resultSummary} <span className="astro-muted">({d.wasOptimal ? 'optimal' : 'not optimal'})</span></li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-label="Astro-AI tools" className="rounded-2xl astro-surface p-5 shadow-sm">
                <h2 className="mb-3 text-base font-semibold astro-text">Tools</h2>
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
        <StatCard label="Total" value={summary.total} />
        <StatCard label="Critical" value={summary.critical} />
        <StatCard label="Warnings" value={summary.warnings} />
        <StatCard label="Optimisations" value={summary.optimizations} />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col text-xs font-semibold astro-text">
          Severity
          <select value={severity} onChange={(e) => setSeverity(e.target.value as ErrorSeverity | '')} className="mt-1 rounded-lg border astro-border px-2 py-1.5 text-sm">
            <option value="">All</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="optimization">Optimisation</option>
          </select>
        </label>
        <label className="flex flex-col text-xs font-semibold astro-text">
          Resource
          <select value={resource} onChange={(e) => setResource(e.target.value as ErrorResource | '')} className="mt-1 rounded-lg border astro-border px-2 py-1.5 text-sm">
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
        <p className="rounded-2xl astro-surface p-5 text-sm astro-ok shadow-sm">No issues match these filters.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((item) => {
            const open = openId === item.id
            return (
              <li key={item.id} className="rounded-2xl astro-surface p-4 shadow-sm">
                <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : item.id)} className="flex w-full items-start justify-between gap-3 text-start astro-focus">
                  <span>
                    <span className="block text-xs font-semibold uppercase astro-muted">{item.severity}{item.day !== null ? ` · Day ${item.day}` : ''}</span>
                    <span className="block font-semibold astro-text">{item.title}</span>
                  </span>
                  <span aria-hidden="true" className="astro-muted">{open ? '−' : '+'}</span>
                </button>
                {open ? (
                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm astro-text">
                    <DetailRow term="Decision" value={item.decision} />
                    <DetailRow term="What happened" value={item.happened} />
                    <DetailRow term="Rule" value={item.ruleNote} />
                    <DetailRow term="Impact" value={item.impact} />
                    <DetailRow term="How to avoid it" value={item.avoid} />
                    <DetailRow term="Better choice" value={item.betterChoice} />
                    <DetailRow term="Lesson" value={item.lesson} />
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


