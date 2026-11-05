// src/features/mission-debrief/MissionDebriefScreen.tsx
// Mission debrief — Space+ light layout.
// Outcome emoji heading, StarScore, stats grid, resource charts,
// learning cards, next-mission CTA.
// PRESERVED: 'Score Breakdown' section, 'Decision Log' section,
//            'What Did We Learn?' section text, 'Play Again' button,
//            resetMission call, all chart data wiring.

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
import { useMissionControl } from '@/hooks/useMissionControl'
import { useMissionStore } from '@store/mission-store'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { useAstroContext } from '@/hooks/useAstroContext'
import { AstroAssistant } from '@ai/astro-assistant'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { Card } from '@/components/common/Card'
import { SectionLabel } from '@/components/common/SectionLabel'
import { StarScore } from '@/components/common/StarScore'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { getMissionById } from '@data/missions/mission-definitions'
import { apiClient } from '@/services/api-client'
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

// ── Sub-component: ScoreRow ────────────────────────────────────────────────────

interface ScoreRowProps {
  readonly label: string
  readonly value: number
}

function ScoreRow({ label, value }: ScoreRowProps): JSX.Element {
  const colour = value < 0 ? 'text-spaceplus-status-error' : 'text-spaceplus-status-success'
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-spaceplus-border-light">
      <span className="text-sm text-spaceplus-text-secondary">{label}</span>
      <span className={`text-sm font-bold ${colour}`}>{value}</span>
    </div>
  )
}

// ── Sub-component: ResourceChart ───────────────────────────────────────────────

interface ResourceChartProps {
  readonly title: string
  readonly dataKey: keyof ResourceHistoryPoint
  readonly data: readonly ResourceHistoryPoint[]
  readonly colour: string
  readonly unit: string
}

function ResourceChart({ title, dataKey, data, colour, unit }: ResourceChartProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-spaceplus-border-light bg-spaceplus-surface p-4">
      <h3 className="text-sm font-semibold text-spaceplus-text-secondary mb-2">{title}</h3>
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

// ── Sub-component: DecisionLogItem ─────────────────────────────────────────────

interface DecisionLogItemProps {
  readonly entry: DecisionLogEntry
}

function DecisionLogItem({ entry }: DecisionLogItemProps): JSX.Element {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-spaceplus-border-light">
      <span className="text-xs text-spaceplus-text-muted w-14 shrink-0">Day {entry.missionDay}</span>
      <span className="text-xs text-spaceplus-text-secondary w-28 shrink-0">{entry.action.type}</span>
      <span className="text-sm text-spaceplus-text-heading flex-1">{entry.resultSummary}</span>
      {entry.wasOptimal ? (
        <span className="text-xs bg-spaceplus-status-successBg text-spaceplus-status-success rounded px-2 py-0.5 shrink-0">
          Optimal
        </span>
      ) : (
        <span className="text-xs bg-spaceplus-surface text-spaceplus-text-muted rounded px-2 py-0.5 shrink-0">
          Suboptimal
        </span>
      )}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getOutcomeEmoji(outcome: string): string {
  if (outcome === 'success') return '🎉'
  if (outcome === 'partial') return '⚠️'
  return '💫'
}

function getOutcomeHeading(outcome: string): string {
  if (outcome === 'success') return '🎉 Mission Complete!'
  if (outcome === 'partial') return '⚠️ Partial Success'
  return '💫 Mission Ended'
}

function getOutcomeStars(score: MissionScore | null): number {
  if (score === null) return 1
  if (score.finalScore >= 600) return 3
  if (score.finalScore >= 300) return 2
  return 1
}

function countEventsResolved(log: readonly DecisionLogEntry[]): number {
  return log.filter((e) => e.action.type === 'RESOLVE_EVENT').length
}

function getBestResource(history: readonly ResourceHistoryPoint[]): string {
  if (history.length === 0) return '—'
  const last = history[history.length - 1]
  const first = history[0]
  if (!last || !first) return '—'
  const ratios = [
    { name: 'Oxygen', ratio: first.oxygen_kg > 0 ? last.oxygen_kg / first.oxygen_kg : 0 },
    { name: 'Water', ratio: first.water_kg > 0 ? last.water_kg / first.water_kg : 0 },
    { name: 'Food', ratio: first.food_kg > 0 ? last.food_kg / first.food_kg : 0 },
    { name: 'Energy', ratio: first.energy_kWh > 0 ? last.energy_kWh / first.energy_kWh : 0 },
  ]
  const best = ratios.reduce((a, b) => (a.ratio > b.ratio ? a : b))
  return best.name
}

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
    return <p className="text-spaceplus-text-muted italic text-sm">Score data not available.</p>
  }
  return (
    <div className="space-y-0.5">
      <ScoreRow label="Base Score" value={missionScore.baseScore} />
      <ScoreRow label="Resource Stability Bonus" value={missionScore.resourceStabilityBonus} />
      <ScoreRow label="Decision Quality Bonus" value={missionScore.decisionQualityBonus} />
      <ScoreRow label="Events Resolved Bonus" value={missionScore.eventsResolvedBonus} />
      <ScoreRow label="Critical Failure Penalty" value={missionScore.criticalFailurePenalty} />
      <div className="flex justify-between items-center py-2 mt-1 border-t-2 border-spaceplus-border-medium">
        <span className="text-spaceplus-text-heading font-bold">Final Score</span>
        <span className="text-xl font-bold text-spaceplus-text-heading">{missionScore.finalScore}</span>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MissionDebriefScreen(): JSX.Element {
  const navigate = useNavigate()
  const {
    missionOutcome,
    missionScore,
    currentMissionDay,
    resourceHistory,
    decisionLog,
    selectedPlanetId,
    crewSize,
    missionDurationDays,
    currentMissionId: currentMissionIdFromControl,
  } = useMissionControl()
  const resetMission = useMissionStore((s) => s.resetMission)
  const currentMissionId = useMissionProgressStore((s) => s.currentMissionId)
  const startMission = useMissionProgressStore((s) => s.startMission)
  const completeMission = useMissionProgressStore((s) => s.completeMission)

  // AstroAssistant — instantiated once, used for mission summary
  const assistantRef = useRef<AstroAssistant | null>(null)
  if (assistantRef.current === null) {
    assistantRef.current = new AstroAssistant({
      apiKey: import.meta.env.VITE_AI_API_KEY as string | undefined,
      apiEndpoint: import.meta.env.VITE_AI_API_ENDPOINT as string | undefined,
      model: import.meta.env.VITE_AI_MODEL as string | undefined,
    })
  }

  const astroContext = useAstroContext()

  const [aiSummary, setAiSummary] = useState<AstroResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // ── Persist mission run to backend (fire-and-forget, once per mount) ────────
  const runSavedRef = useRef(false)
  useEffect(() => {
    if (runSavedRef.current) return
    if (missionScore === null) return
    runSavedRef.current = true

    const earnedStars = getOutcomeStars(missionScore)
    const eventsCount = countEventsResolved(decisionLog)

    apiClient
      .saveMissionRun({
        id: crypto.randomUUID(),
        playerId: 'player-1',
        missionId: currentMissionIdFromControl ?? currentMissionId ?? 'unknown',
        planetId: selectedPlanetId ?? 'unknown',
        crewSize: crewSize ?? 1,
        missionDurationDays: missionDurationDays ?? 30,
        daysSurvived: currentMissionDay ?? 0,
        finalScore: missionScore.finalScore,
        starsEarned: earnedStars,
        outcome: missionOutcome ?? 'unknown',
        eventsResolved: eventsCount,
      })
      .then(() => {})
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionScore])
  // ──────────────────────────────────────────────────────────────────────────

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [astroContext?.outcome])

  const planetLabel =
    selectedPlanetId === 'moon' ? 'Moon' : selectedPlanetId === 'mars' ? 'Mars' : 'Unknown'

  const earnedStars = getOutcomeStars(missionScore)
  const eventsResolved = countEventsResolved(decisionLog)
  const bestResource = getBestResource(resourceHistory)

  // Find next mission
  const nextMission = currentMissionId
    ? getMissionById(MISSIONS_AFTER[currentMissionId] ?? '')
    : undefined

  function handlePlayAgain(): void {
    resetMission()
    void navigate('/')
  }

  function handleNextMission(): void {
    if (nextMission === undefined) return
    // Record completion of current mission
    if (currentMissionId) {
      completeMission(currentMissionId, earnedStars)
    }
    startMission(nextMission.id)
    navigate('/missions')
  }

  return (
    <AppShell title="Mission Debrief" variant="light">
      <ScreenTransition routeKey="/debrief">
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* ── Section 1: Outcome heading with emoji ─────────────────── */}
            <Card className="text-center">
              <h1 className="font-display2 text-3xl font-extrabold text-spaceplus-text-heading mb-2">
                {getOutcomeHeading(missionOutcome)}
              </h1>
              <p className="text-base text-spaceplus-text-secondary mb-4">
                {planetLabel} Mission — {currentMissionDay} day{currentMissionDay !== 1 ? 's' : ''}
              </p>
              <div className="flex justify-center">
                <StarScore score={earnedStars} maxScore={3} size="lg" />
              </div>
            </Card>

            {/* ── Stats grid 2×2 ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card className="text-center">
                <SectionLabel className="block mb-1">Days Survived</SectionLabel>
                <p className="text-2xl font-bold text-spaceplus-text-heading tabular-nums">{currentMissionDay}</p>
              </Card>
              <Card className="text-center">
                <SectionLabel className="block mb-1">Final Score</SectionLabel>
                <p className="text-2xl font-bold text-spaceplus-text-heading tabular-nums">
                  {missionScore?.finalScore ?? 0}
                </p>
              </Card>
              <Card className="text-center">
                <SectionLabel className="block mb-1">Events Resolved</SectionLabel>
                <p className="text-2xl font-bold text-spaceplus-text-heading tabular-nums">{eventsResolved}</p>
              </Card>
              <Card className="text-center">
                <SectionLabel className="block mb-1">Best Resource</SectionLabel>
                <p className="text-lg font-bold text-spaceplus-text-heading">{bestResource}</p>
              </Card>
            </div>

            {/* ── Section 2: Score Breakdown ─────────────────────────────── */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-spaceplus-text-heading">Score Breakdown</h2>
              <Card>
                {renderScoreBreakdown(missionScore)}
              </Card>
            </section>

            {/* ── Section 3: Resource History Charts ────────────────────── */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-spaceplus-text-heading">Resource History</h2>
              {resourceHistory.length === 0 ? (
                <Card>
                  <p className="text-spaceplus-text-muted italic text-sm">No mission data recorded</p>
                </Card>
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

            {/* ── Section 4: Decision Log ────────────────────────────────── */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-spaceplus-text-heading">Decision Log</h2>
              <Card className="max-h-64 overflow-y-auto">
                {decisionLog.length === 0 ? (
                  <p className="text-spaceplus-text-muted italic text-sm">No decisions recorded.</p>
                ) : (
                  <div>
                    {decisionLog.map((entry, idx) => (
                      <DecisionLogItem key={`${entry.missionDay}-${idx}`} entry={entry} />
                    ))}
                  </div>
                )}
              </Card>
            </section>

            {/* ── Section 5: Learning cards ──────────────────────────────── */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-spaceplus-text-heading">
                What Did We Learn?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* What Happened */}
                <Card accent="teal">
                  <SectionLabel className="block mb-2">What Happened</SectionLabel>
                  <p className="text-sm text-spaceplus-text-body leading-relaxed">
                    {getOutcomeEmoji(missionOutcome)}{' '}
                    {missionOutcome === 'success'
                      ? `Your crew completed a ${currentMissionDay}-day ${planetLabel} mission successfully.`
                      : missionOutcome === 'partial'
                      ? `Your crew survived ${currentMissionDay} days on ${planetLabel} before the mission ended.`
                      : `The mission ended after ${currentMissionDay} days. Every failure is a lesson.`}
                  </p>
                </Card>

                {/* What You Learned */}
                <Card accent="none">
                  <SectionLabel className="block mb-2">What You Learned</SectionLabel>
                  {summaryLoading ? (
                    <p className="text-spaceplus-text-muted italic text-sm">Calculating mission summary...</p>
                  ) : (
                    <p className="text-sm text-spaceplus-text-body leading-relaxed">
                      {aiSummary !== null
                        ? aiSummary.explanation
                        : getFallbackLearningText(missionOutcome)}
                    </p>
                  )}
                </Card>

                {/* Science Fact */}
                <Card accent="amber">
                  <SectionLabel className="block mb-2">Science Fact</SectionLabel>
                  <p className="text-sm text-spaceplus-text-body leading-relaxed italic">
                    {aiSummary?.scienceFact !== undefined && aiSummary.scienceFact.length > 0
                      ? aiSummary.scienceFact
                      : selectedPlanetId === 'moon'
                      ? 'The lunar day lasts about 14 Earth days — followed by 14 days of total darkness. Your batteries need to survive both phases.'
                      : 'Mars receives only 43% of the solar energy that Earth gets, making power management on Mars far more challenging.'}
                  </p>
                </Card>
              </div>
            </section>

            {/* ── Section 6: Next mission CTA + Play Again ───────────────── */}
            <section>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
                {nextMission !== undefined && (
                  <Card accent="teal" className="flex-1 sm:max-w-sm">
                    <SectionLabel className="block mb-2">Next Mission</SectionLabel>
                    <p className="font-semibold text-spaceplus-text-heading mb-1">{nextMission.title}</p>
                    <p className="text-xs text-spaceplus-text-secondary mb-4">{nextMission.subtitle}</p>
                    <PrimaryButton
                      variant="hint"
                      size="md"
                      onClick={handleNextMission}
                      ariaLabel={`Accept next mission: ${nextMission.title}`}
                    >
                      Accept Next Mission
                    </PrimaryButton>
                  </Card>
                )}

                <div className="flex justify-center">
                  <PrimaryButton
                    variant="secondary"
                    size="lg"
                    onClick={handlePlayAgain}
                    ariaLabel="Play again"
                  >
                    Play Again
                  </PrimaryButton>
                </div>
              </div>
            </section>

          </div>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}

// ── Mission unlock chain lookup ────────────────────────────────────────────────
// Maps mission ID → next mission ID in the chain.
const MISSIONS_AFTER: Readonly<Record<string, string>> = {
  m01: 'm02',
  m02: 'm03',
  m03: 'm04',
  m04: 'm05',
  m05: 'm06',
}
