// src/features/mission-debrief/MissionDebriefScreen.tsx
// Mission debrief screen — displayed after a mission ends.
// Reads all data from useMissionControl(); does NOT import stores or simulation directly.

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
import type { MissionScore, ResourceHistoryPoint, DecisionLogEntry } from '@simulation/types'

// ── Sub-component: ScoreRow ───────────────────────────────────────────────────

interface ScoreRowProps {
  readonly label: string
  readonly value: number
}

function ScoreRow({ label, value }: ScoreRowProps): JSX.Element {
  const colour = value < 0 ? 'text-red-400' : 'text-green-400'
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-700">
      <span className="text-gray-300">{label}</span>
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
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data as ResourceHistoryPoint[]}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="missionDay"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            label={{ value: 'Day', position: 'insideBottomRight', offset: -5, fill: '#9CA3AF', fontSize: 11 }}
          />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} unit={unit} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
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
    <div className="flex items-start gap-3 py-2 border-b border-gray-700">
      <span className="text-xs text-gray-500 w-14 shrink-0">Day {entry.missionDay}</span>
      <span className="text-xs text-gray-400 w-28 shrink-0">{entry.action.type}</span>
      <span className="text-sm text-gray-300 flex-1">{entry.resultSummary}</span>
      {entry.wasOptimal ? (
        <span className="text-xs bg-green-900 text-green-300 rounded px-2 py-0.5 shrink-0">Optimal</span>
      ) : (
        <span className="text-xs bg-gray-700 text-gray-400 rounded px-2 py-0.5 shrink-0">Suboptimal</span>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOutcomeColour(outcome: string): string {
  if (outcome === 'success') return 'bg-green-900 border-green-600 text-green-200'
  if (outcome === 'partial') return 'bg-yellow-900 border-yellow-600 text-yellow-200'
  return 'bg-red-900 border-red-600 text-red-200'
}

function getOutcomeLabel(outcome: string): string {
  if (outcome === 'success') return '🚀 Mission Success!'
  if (outcome === 'partial') return '⚠️ Partial Success'
  return '💀 Mission Failure'
}

function getLearningText(outcome: string): string {
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
    return <p className="text-gray-500 italic text-sm">Score data not available.</p>
  }
  return (
    <div className="space-y-0.5">
      <ScoreRow label="Base Score" value={missionScore.baseScore} />
      <ScoreRow label="Resource Stability Bonus" value={missionScore.resourceStabilityBonus} />
      <ScoreRow label="Decision Quality Bonus" value={missionScore.decisionQualityBonus} />
      <ScoreRow label="Events Resolved Bonus" value={missionScore.eventsResolvedBonus} />
      <ScoreRow label="Critical Failure Penalty" value={missionScore.criticalFailurePenalty} />
      <div className="flex justify-between items-center py-2 mt-1 border-t-2 border-gray-500">
        <span className="text-white font-bold">Final Score</span>
        <span className="text-xl font-bold text-white">{missionScore.finalScore}</span>
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

  const planetLabel = selectedPlanetId === 'moon' ? 'Moon' : selectedPlanetId === 'mars' ? 'Mars' : 'Unknown'
  const outcomeColour = getOutcomeColour(missionOutcome)

  function handlePlayAgain(): void {
    resetMission()
    void navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Section 1: Outcome Banner ─────────────────────────────────── */}
        <div className={`rounded-xl border-2 p-6 text-center ${outcomeColour}`}>
          <h1 className="text-3xl font-bold mb-2">{getOutcomeLabel(missionOutcome)}</h1>
          <p className="text-lg">
            {planetLabel} Mission — {currentMissionDay} day{currentMissionDay !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── Section 2: Score Breakdown ────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Score Breakdown</h2>
          <div className="bg-gray-800 rounded-lg p-5">
            {renderScoreBreakdown(missionScore)}
          </div>
        </section>

        {/* ── Section 3: Resource History Charts ───────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Resource History</h2>
          {resourceHistory.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No mission data recorded</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResourceChart
                title="Oxygen"
                dataKey="oxygen_kg"
                data={resourceHistory}
                colour="#60A5FA"
                unit=" kg"
              />
              <ResourceChart
                title="Water"
                dataKey="water_kg"
                data={resourceHistory}
                colour="#34D399"
                unit=" kg"
              />
              <ResourceChart
                title="Food"
                dataKey="food_kg"
                data={resourceHistory}
                colour="#FBBF24"
                unit=" kg"
              />
              <ResourceChart
                title="Energy"
                dataKey="energy_kWh"
                data={resourceHistory}
                colour="#F87171"
                unit=" kWh"
              />
            </div>
          )}
        </section>

        {/* ── Section 4: Decision Log ───────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Decision Log</h2>
          <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
            {decisionLog.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No decisions recorded.</p>
            ) : (
              <div>
                {decisionLog.map((entry, idx) => (
                  <DecisionLogItem key={`${entry.missionDay}-${idx}`} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Section 5: Learning Summary ───────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-100">What Did We Learn?</h2>
          <div className="bg-gray-800 rounded-lg p-5">
            {/* AI-007: Replace with AstroAssistant.getMissionSummary() in Phase 8 integration */}
            <p className="text-gray-300 leading-relaxed">{getLearningText(missionOutcome)}</p>
          </div>
        </section>

        {/* ── Section 6: Navigation ─────────────────────────────────────── */}
        <section className="flex justify-center">
          <button
            onClick={handlePlayAgain}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
            type="button"
          >
            Play Again
          </button>
        </section>

      </div>
    </div>
  )
}
