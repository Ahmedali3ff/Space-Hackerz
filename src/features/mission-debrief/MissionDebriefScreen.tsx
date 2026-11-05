// src/features/mission-debrief/MissionDebriefScreen.tsx
// Mission debrief screen — displayed after a mission ends.
// Reads all data from useMissionControl(); does NOT import stores or simulation directly.
// Re-skinned with ASTRA design tokens (space-panel / glass, text.*, border.*, status.*)
// Outcome banner uses icon + label (never color alone) via StatusBadge.
// Chart colors sourced from CHART_COLORS / CHART_* constants.
// Learning summary fetched async from AstroAssistant.getMissionSummary().

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Trophy, Warning, Info } from '@phosphor-icons/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { useMissionStore } from '@store/mission-store'
import { useAstroContext } from '@/hooks/useAstroContext'
import { AstroAssistant } from '@ai/astro-assistant'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import {
  CHART_COLORS,
  CHART_AXIS_COLOR,
  CHART_GRID_COLOR,
  CHART_TOOLTIP_BG,
  CHART_TOOLTIP_BORDER,
  CHART_TOOLTIP_TEXT,
} from '@/components/charts/chart-colors'
import type { MissionScore, ResourceHistoryPoint, DecisionLogEntry } from '@simulation/types'
import type { AstroResponse } from '@ai/schemas/astro-response.schema'
import type { Icon } from '@phosphor-icons/react'

// ── Sub-component: ScoreRow ───────────────────────────────────────────────────

interface ScoreRowProps {
  readonly label: string
  readonly value: number
}

function ScoreRow({ label, value }: ScoreRowProps): JSX.Element {
  const colour = value < 0 ? 'text-status-crit' : 'text-status-good'
  return (
    <div className="flex justify-between items-center py-1 border-b border-border-subtle">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-bold ${colour}`}>{value}</span>
    </div>
  )
}

// ── Sub-component: ResourceChart ──────────────────────────────────────────────

interface ResourceChartProps {
  readonly title: string
  readonly dataKey: keyof ResourceHistoryPoint
  readonly data: readonly ResourceHistoryPoint[]
  readonly colour: string
  readonly unit: string
}

function ResourceChart({ title, dataKey, data, colour, unit }: ResourceChartProps): JSX.Element {
  return (
    <div className="bg-space-panelRaised rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-secondary mb-2">{title}</h3>
      {/* sr-only summary for screen-reader users */}
      <p className="sr-only">
        {title} resource history chart over {data.length} mission days.
      </p>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data as ResourceHistoryPoint[]}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
          <XAxis
            dataKey="missionDay"
            tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }}
            label={{
              value: 'Day',
              position: 'insideBottomRight',
              offset: -5,
              fill: CHART_AXIS_COLOR,
              fontSize: 11,
            }}
          />
          <YAxis tick={{ fill: CHART_AXIS_COLOR, fontSize: 11 }} unit={unit} />
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_TOOLTIP_BG,
              border: `1px solid ${CHART_TOOLTIP_BORDER}`,
              color: CHART_TOOLTIP_TEXT,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: CHART_AXIS_COLOR }} />
          <Line
            type="monotone"
            dataKey={dataKey as string}
            stroke={colour}
            dot={false}
            strokeWidth={2}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Sub-component: DecisionLogItem ────────────────────────────────────────────

interface DecisionLogItemProps {
  readonly entry: DecisionLogEntry
}

function DecisionLogItem({ entry }: DecisionLogItemProps): JSX.Element {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border-subtle">
      <span className="text-xs text-text-muted w-14 shrink-0">Day {entry.missionDay}</span>
      <span className="text-xs text-text-secondary w-28 shrink-0">{entry.action.type}</span>
      <span className="text-sm text-text-primary flex-1">{entry.resultSummary}</span>
      {entry.wasOptimal ? (
        <span className="text-xs bg-status-good/20 text-status-good rounded px-2 py-0.5 shrink-0">
          Optimal
        </span>
      ) : (
        <span className="text-xs bg-space-panelRaised text-text-muted rounded px-2 py-0.5 shrink-0">
          Suboptimal
        </span>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type OutcomeStatus = 'good' | 'warn' | 'crit'

function getOutcomeStatus(outcome: string): OutcomeStatus {
  if (outcome === 'success') return 'good'
  if (outcome === 'partial') return 'warn'
  return 'crit'
}

function getOutcomeIcon(outcome: string): Icon {
  if (outcome === 'success') return Trophy
  if (outcome === 'partial') return Warning
  return Info
}

function getOutcomeLabel(outcome: string): string {
  if (outcome === 'success') return 'Mission Success!'
  if (outcome === 'partial') return 'Partial Success'
  return 'Mission Failure'
}

function getOutcomeBannerClass(outcome: string): string {
  if (outcome === 'success') return 'bg-status-good/15 border border-status-good/40'
  if (outcome === 'partial') return 'bg-status-warn/15 border border-status-warn/40'
  return 'bg-status-crit/15 border border-status-crit/40'
}

/** Static fallback while AI summary is loading or unavailable. */
function getFallbackLearningText(outcome: string): string {
  if (outcome === 'success') {
    return 'Outstanding mission commander! Every resource was managed with precision. Your crew made it through every challenge — real astronauts would be proud!'
  }
  if (outcome === 'partial') {
    return 'Good effort! Your crew survived but some systems were under stress. Study the resource charts to see where things got tricky.'
  }
  return 'Space is unforgiving — but every mission teaches us something new. Review your decisions below and see what you would do differently next time!'
}

function renderScoreBreakdown(missionScore: MissionScore | null): JSX.Element {
  if (missionScore === null) {
    return <p className="text-text-muted italic text-sm">Score data not available.</p>
  }
  return (
    <div className="space-y-0.5">
      <ScoreRow label="Base Score" value={missionScore.baseScore} />
      <ScoreRow label="Resource Stability Bonus" value={missionScore.resourceStabilityBonus} />
      <ScoreRow label="Decision Quality Bonus" value={missionScore.decisionQualityBonus} />
      <ScoreRow label="Events Resolved Bonus" value={missionScore.eventsResolvedBonus} />
      <ScoreRow label="Critical Failure Penalty" value={missionScore.criticalFailurePenalty} />
      <div className="flex justify-between items-center py-2 mt-1 border-t-2 border-border-strong">
        <span className="text-text-primary font-bold">Final Score</span>
        <span className="text-xl font-bold text-text-primary">{missionScore.finalScore}</span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function MissionDebriefScreen(): JSX.Element {
  const navigate = useNavigate()
  const {
    missionOutcome,
    missionScore,
    currentMissionDay,
    resourceHistory,
    decisionLog,
    selectedPlanetId,
  } = useMissionControl()
  const resetMission = useMissionStore((s) => s.resetMission)

  // AstroAssistant — instantiated once, used for mission summary
  const assistantRef = useRef<AstroAssistant | null>(null)
  if (assistantRef.current === null) {
    assistantRef.current = new AstroAssistant({
      apiKey: import.meta.env.VITE_AI_API_KEY as string | undefined,
      apiEndpoint: import.meta.env.VITE_AI_API_ENDPOINT as string | undefined,
      model: import.meta.env.VITE_AI_MODEL as string | undefined,
    })
  }

  // useAstroContext returns null before mission is active (debrief reads store state)
  const astroContext = useAstroContext()

  const [aiSummary, setAiSummary] = useState<AstroResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    if (astroContext === null) return
    if (assistantRef.current === null) return

    let cancelled = false
    setSummaryLoading(true)

    void assistantRef.current.getMissionSummary(astroContext).then((response) => {
      if (!cancelled) {
        setAiSummary(response)
        setSummaryLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  // Re-run only when context becomes available (outcome change is captured inside context)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [astroContext?.outcome])

  const planetLabel =
    selectedPlanetId === 'moon' ? 'Moon' : selectedPlanetId === 'mars' ? 'Mars' : 'Unknown'

  const outcomeStatus = getOutcomeStatus(missionOutcome)
  const OutcomeIcon = getOutcomeIcon(missionOutcome)
  const outcomeBannerClass = getOutcomeBannerClass(missionOutcome)

  function handlePlayAgain(): void {
    resetMission()
    void navigate('/')
  }

  return (
    <AppShell title="Mission Debrief">
      <ScreenTransition routeKey="/debrief">
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* ── Section 1: Outcome Banner ──────────────────────────────── */}
            <div className={`rounded-xl p-6 text-center ${outcomeBannerClass}`}>
              <div className="flex justify-center mb-3">
                <StatusBadge
                  status={outcomeStatus}
                  label={getOutcomeLabel(missionOutcome)}
                  icon={OutcomeIcon}
                />
              </div>
              <h1 className="text-3xl font-bold font-display text-text-primary mb-2">
                {getOutcomeLabel(missionOutcome)}
              </h1>
              <p className="text-lg text-text-secondary">
                {planetLabel} Mission —{' '}
                {currentMissionDay} day{currentMissionDay !== 1 ? 's' : ''}
              </p>
            </div>

            {/* ── Section 2: Score Breakdown ─────────────────────────────── */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-text-primary">Score Breakdown</h2>
              <div className="bg-space-panelRaised rounded-xl p-5">
                {renderScoreBreakdown(missionScore)}
              </div>
            </section>

            {/* ── Section 3: Resource History Charts ───────────────────── */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-text-primary">Resource History</h2>
              {resourceHistory.length === 0 ? (
                <p className="text-text-muted italic text-sm">No mission data recorded</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ResourceChart
                    title="Oxygen"
                    dataKey="oxygen_kg"
                    data={resourceHistory}
                    colour={CHART_COLORS.oxygen}
                    unit=" kg"
                  />
                  <ResourceChart
                    title="Water"
                    dataKey="water_kg"
                    data={resourceHistory}
                    colour={CHART_COLORS.water}
                    unit=" kg"
                  />
                  <ResourceChart
                    title="Food"
                    dataKey="food_kg"
                    data={resourceHistory}
                    colour={CHART_COLORS.food}
                    unit=" kg"
                  />
                  <ResourceChart
                    title="Energy"
                    dataKey="energy_kWh"
                    data={resourceHistory}
                    colour={CHART_COLORS.energy}
                    unit=" kWh"
                  />
                </div>
              )}
            </section>

            {/* ── Section 4: Decision Log ───────────────────────────────── */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-text-primary">Decision Log</h2>
              <div className="glass-panel p-4 max-h-64 overflow-y-auto">
                {decisionLog.length === 0 ? (
                  <p className="text-text-muted italic text-sm">No decisions recorded.</p>
                ) : (
                  <div>
                    {decisionLog.map((entry, idx) => (
                      <DecisionLogItem key={`${entry.missionDay}-${idx}`} entry={entry} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── Section 5: Learning Summary ───────────────────────────── */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-text-primary">
                What Did We Learn?
              </h2>
              <div className="glass-panel p-5">
                {summaryLoading ? (
                  <p className="text-text-muted italic text-sm">
                    Calculating mission summary...
                  </p>
                ) : (
                  <p className="text-text-secondary leading-relaxed">
                    {aiSummary !== null
                      ? aiSummary.explanation
                      : getFallbackLearningText(missionOutcome)}
                  </p>
                )}
                {aiSummary?.scienceFact !== undefined ? (
                  <p className="mt-3 text-text-muted text-sm italic">
                    Science fact: {aiSummary.scienceFact}
                  </p>
                ) : null}
              </div>
            </section>

            {/* ── Section 6: Navigation ─────────────────────────────────── */}
            <section className="flex justify-center">
              <PrimaryButton onClick={handlePlayAgain} size="lg">
                Play Again
              </PrimaryButton>
            </section>

          </div>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
