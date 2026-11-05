// src/features/mission-control/ResourcePanel.tsx
// Displays current resource levels with color-coded bars, deltas, and a
// critical warning banner when any resource drops below 15%.
// NO simulation engine imports — reads all data from useMissionControl and store.

import { Drop, Leaf, Wind, Lightning, Biohazard, Users, Warning } from '@phosphor-icons/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { useMissionStore } from '@store/mission-store'
import { Card } from '@/components/common/Card'
import { StatReadout } from '@/components/common/StatReadout'
import { StatusBadge } from '@/components/common/StatusBadge'
import {
  RADIATION_HIGH_THRESHOLD_MSV,
  RADIATION_CRITICAL_THRESHOLD_MSV,
} from '@data/nasa/life-support-constants'
import type { ResourceHistoryPoint } from '@simulation/types'

// ── Sparkline ─────────────────────────────────────────────────────────────────

type SparkStatus = 'good' | 'warn' | 'crit'

const SPARK_COLOR: Readonly<Record<SparkStatus, string>> = {
  good: '#1FC8C0',
  warn: '#F5A623',
  crit: '#EF4444',
}

const SPARKLINE_W = 60
const SPARKLINE_H = 24
const MAX_SPARK_POINTS = 20

interface SparklineProps {
  readonly points: readonly number[]
  readonly status: SparkStatus
  readonly label: string
}

function Sparkline({ points, status, label }: SparklineProps): JSX.Element | null {
  if (points.length < 2) return null
  const tail = points.slice(-MAX_SPARK_POINTS)
  const min = Math.min(...tail)
  const max = Math.max(...tail)
  const range = max - min === 0 ? 1 : max - min
  const coords = tail.map((v, i) => {
    const x = (i / (tail.length - 1)) * SPARKLINE_W
    const y = SPARKLINE_H - ((v - min) / range) * SPARKLINE_H
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const polyline = coords.join(' ')
  const color = SPARK_COLOR[status]
  return (
    <svg
      width={SPARKLINE_W}
      height={SPARKLINE_H}
      aria-hidden="true"
      className="ml-auto shrink-0"
      viewBox={`0 0 ${SPARKLINE_W} ${SPARKLINE_H}`}
    >
      <title>{label} trend</title>
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

// ── Status derivation helpers ─────────────────────────────────────────────────

type BarStatus = 'good' | 'warn' | 'crit'

function getRadiationStatus(dose: number): BarStatus {
  if (dose >= RADIATION_CRITICAL_THRESHOLD_MSV) return 'crit'
  if (dose >= RADIATION_HIGH_THRESHOLD_MSV) return 'warn'
  return 'good'
}

function extractSeries(
  history: readonly ResourceHistoryPoint[],
  key: keyof Omit<ResourceHistoryPoint, 'missionDay'>,
): number[] {
  return history.map((p) => p[key] as number)
}

// ── Inline resource bar (color-coded with delta) ─────────────────────────────

interface InlineResourceBarProps {
  readonly label: string
  readonly value: number
  readonly initial: number
  readonly unit: string
  readonly delta: number | null
  readonly icon: React.ReactNode
}

function InlineResourceBar({
  label,
  value,
  initial,
  unit,
  delta,
  icon,
}: InlineResourceBarProps): JSX.Element {
  const safeMax = initial > 0 ? initial : 1
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100))

  const barFill =
    pct > 50
      ? 'bg-[#1FC8C0]'
      : pct > 20
      ? 'bg-[#F5A623]'
      : 'bg-[#EF4444]'

  const containerBg =
    pct > 50
      ? ''
      : pct > 20
      ? 'bg-[#FEF3C7] rounded-xl px-3 py-2 -mx-1'
      : 'bg-[#FEE2E2] rounded-xl px-3 py-2 -mx-1'

  return (
    <div className={`flex flex-col gap-1.5 ${containerBg}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-2">
          {delta !== null && (
            <span
              className={`text-xs tabular-nums ${delta < 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}
              aria-label={`Daily change: ${delta >= 0 ? '+' : ''}${delta.toFixed(1)} ${unit} per day`}
            >
              {delta >= 0 ? '+' : ''}{delta.toFixed(1)}/day
            </span>
          )}
          <span className="font-mono text-sm font-semibold text-[#1A1D2E] tabular-nums">
            {Math.round(value)} {unit}
          </span>
        </div>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={Math.round(initial)}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barFill}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ResourcePanelProps {}

export function ResourcePanel(_props: ResourcePanelProps): JSX.Element {
  const { currentResources, resourceHistory, crewSize } = useMissionControl()
  const initialResources = useMissionStore((s) => s.initialResources)

  const res = currentResources
  const init = initialResources

  // Compute statuses
  const oxyPct = res && init && init.oxygen_kg > 0 ? res.oxygen_kg / init.oxygen_kg : 1
  const waterPct = res && init && init.water_kg > 0 ? res.water_kg / init.water_kg : 1
  const foodPct = res && init && init.food_kg > 0 ? res.food_kg / init.food_kg : 1
  const energyPct = res && init && init.energy_kWh > 0 ? res.energy_kWh / init.energy_kWh : 1

  const oxyStatus: BarStatus = oxyPct < 0.10 ? 'crit' : oxyPct < 0.20 ? 'warn' : 'good'
  const waterStatus: BarStatus = waterPct < 0.10 ? 'crit' : waterPct < 0.20 ? 'warn' : 'good'
  const foodStatus: BarStatus = foodPct < 0.10 ? 'crit' : foodPct < 0.20 ? 'warn' : 'good'
  const energyStatus: BarStatus = energyPct < 0.15 ? 'crit' : energyPct < 0.25 ? 'warn' : 'good'
  const radStatus: BarStatus = res ? getRadiationStatus(res.cumulativeRadiation_mSv) : 'good'

  // Compute daily deltas from last two history points
  const lastTwo = resourceHistory.slice(-2)
  const hasDeltas = lastTwo.length === 2
  const oxyDelta = hasDeltas ? lastTwo[1]!.oxygen_kg - lastTwo[0]!.oxygen_kg : null
  const waterDelta = hasDeltas ? lastTwo[1]!.water_kg - lastTwo[0]!.water_kg : null
  const foodDelta = hasDeltas ? lastTwo[1]!.food_kg - lastTwo[0]!.food_kg : null
  const energyDelta = hasDeltas ? lastTwo[1]!.energy_kWh - lastTwo[0]!.energy_kWh : null

  // Critical resources (< 15%)
  const criticalResources: string[] = []
  if (oxyPct < 0.15) criticalResources.push('Oxygen')
  if (waterPct < 0.15) criticalResources.push('Water')
  if (foodPct < 0.15) criticalResources.push('Food')
  if (energyPct < 0.15) criticalResources.push('Energy')

  // Sparkline history
  const hasHistory = resourceHistory.length >= 2
  const oxyHistory = hasHistory ? extractSeries(resourceHistory, 'oxygen_kg') : []
  const waterHistory = hasHistory ? extractSeries(resourceHistory, 'water_kg') : []
  const foodHistory = hasHistory ? extractSeries(resourceHistory, 'food_kg') : []
  const energyHistory = hasHistory ? extractSeries(resourceHistory, 'energy_kWh') : []

  return (
    <Card className="flex flex-col gap-4">
      {/* Critical warning banner */}
      {criticalResources.length > 0 && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-[#FEE2E2] border border-[#EF4444]/30 px-3 py-2 text-sm font-semibold text-[#EF4444]"
        >
          <Warning size={18} weight="fill" aria-hidden="true" />
          ⚠ Critical: {criticalResources.join(', ')} {criticalResources.length === 1 ? 'is' : 'are'} running low!
        </div>
      )}

      <header className="mb-1">
        <h2 className="text-lg font-semibold text-[#1A1D2E]">Resources</h2>
      </header>

      {/* Oxygen */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InlineResourceBar
            label="Oxygen"
            value={res?.oxygen_kg ?? 0}
            initial={init?.oxygen_kg ?? 1}
            unit="kg"
            delta={oxyDelta}
            icon={<Wind size={16} weight="fill" className="text-[#1FC8C0]" aria-hidden="true" />}
          />
        </div>
        <Sparkline points={oxyHistory} status={oxyStatus} label="Oxygen" />
      </div>

      {/* Water */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InlineResourceBar
            label="Water"
            value={res?.water_kg ?? 0}
            initial={init?.water_kg ?? 1}
            unit="kg"
            delta={waterDelta}
            icon={<Drop size={16} weight="fill" className="text-[#1FC8C0]" aria-hidden="true" />}
          />
        </div>
        <Sparkline points={waterHistory} status={waterStatus} label="Water" />
      </div>

      {/* Food */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InlineResourceBar
            label="Food"
            value={res?.food_kg ?? 0}
            initial={init?.food_kg ?? 1}
            unit="kg"
            delta={foodDelta}
            icon={<Leaf size={16} weight="fill" className="text-[#1FC8C0]" aria-hidden="true" />}
          />
        </div>
        <Sparkline points={foodHistory} status={foodStatus} label="Food" />
      </div>

      {/* Energy */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InlineResourceBar
            label="Energy"
            value={res?.energy_kWh ?? 0}
            initial={init?.energy_kWh ?? 1}
            unit="kWh"
            delta={energyDelta}
            icon={<Lightning size={16} weight="fill" className="text-[#F5A623]" aria-hidden="true" />}
          />
        </div>
        <Sparkline points={energyHistory} status={energyStatus} label="Energy" />
      </div>

      {/* Radiation */}
      <div className="flex items-center justify-between gap-2 border-t border-[#E5E7EB] pt-3">
        <StatReadout
          label="Radiation Dose"
          value={(res?.cumulativeRadiation_mSv ?? 0).toFixed(1)}
          unit="mSv"
          status={radStatus}
        />
        <StatusBadge
          status={radStatus}
          label={
            radStatus === 'crit'
              ? 'Critical'
              : radStatus === 'warn'
              ? 'Elevated'
              : 'Nominal'
          }
          icon={Biohazard}
        />
      </div>

      {/* Crew */}
      <div className="flex items-center gap-2 border-t border-[#E5E7EB] pt-3">
        <Users size={18} weight="fill" className="text-[#1FC8C0]" aria-hidden="true" />
        <span className="text-sm text-[#6B7280]">Crew aboard:</span>
        <span className="font-mono font-semibold text-[#1A1D2E] tabular-nums">{crewSize}</span>
      </div>
    </Card>
  )
}
