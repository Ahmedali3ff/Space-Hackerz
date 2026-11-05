// src/features/mission-control/ResourcePanel.tsx
// Displays current resource levels via ResourceBar + sparklines.
// Reads all data from useMissionControl and the mission store directly.
// NO simulation engine imports.

import { Drop, Leaf, Wind, Lightning, Biohazard, Users } from '@phosphor-icons/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { useMissionStore } from '@store/mission-store'
import { Card } from '@/components/common/Card'
import { ResourceBar } from '@/components/charts/ResourceBar'
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
  good: '#46E6A0',
  warn: '#FFC93C',
  crit: '#FF5A5F',
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

function getResourceStatus(
  current: number,
  initial: number,
  critPct: number,
  warnPct: number,
): BarStatus {
  if (initial <= 0) return 'crit'
  const pct = current / initial
  if (pct < critPct) return 'crit'
  if (pct < warnPct) return 'warn'
  return 'good'
}

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

// ── Component ─────────────────────────────────────────────────────────────────

interface ResourcePanelProps {}

export function ResourcePanel(_props: ResourcePanelProps): JSX.Element {
  const { currentResources, resourceHistory, crewSize } = useMissionControl()
  const initialResources = useMissionStore((s) => s.initialResources)

  const res = currentResources
  const init = initialResources

  const oxyStatus = res && init
    ? getResourceStatus(res.oxygen_kg, init.oxygen_kg, 0.10, 0.20)
    : 'good'
  const waterStatus = res && init
    ? getResourceStatus(res.water_kg, init.water_kg, 0.10, 0.20)
    : 'good'
  const foodStatus = res && init
    ? getResourceStatus(res.food_kg, init.food_kg, 0.10, 0.20)
    : 'good'
  const energyStatus = res && init
    ? getResourceStatus(res.energy_kWh, init.energy_kWh, 0.15, 0.25)
    : 'good'
  const radStatus = res ? getRadiationStatus(res.cumulativeRadiation_mSv) : 'good'

  const hasHistory = resourceHistory.length >= 2
  const oxyHistory = hasHistory ? extractSeries(resourceHistory, 'oxygen_kg') : []
  const waterHistory = hasHistory ? extractSeries(resourceHistory, 'water_kg') : []
  const foodHistory = hasHistory ? extractSeries(resourceHistory, 'food_kg') : []
  const energyHistory = hasHistory ? extractSeries(resourceHistory, 'energy_kWh') : []

  return (
    <Card className="flex flex-col gap-4">
      <header className="mb-1">
        <h2 className="font-display2 text-lg font-semibold text-spaceplus-text-heading">Resources</h2>
      </header>
      {/* Oxygen */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <ResourceBar
            label="Oxygen"
            value={res?.oxygen_kg ?? 0}
            max={init?.oxygen_kg ?? 1}
            unit="kg"
            status={oxyStatus}
            icon={Wind}
          />
        </div>
        <Sparkline points={oxyHistory} status={oxyStatus} label="Oxygen" />
      </div>

      {/* Water */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <ResourceBar
            label="Water"
            value={res?.water_kg ?? 0}
            max={init?.water_kg ?? 1}
            unit="kg"
            status={waterStatus}
            icon={Drop}
          />
        </div>
        <Sparkline points={waterHistory} status={waterStatus} label="Water" />
      </div>

      {/* Food */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <ResourceBar
            label="Food"
            value={res?.food_kg ?? 0}
            max={init?.food_kg ?? 1}
            unit="kg"
            status={foodStatus}
            icon={Leaf}
          />
        </div>
        <Sparkline points={foodHistory} status={foodStatus} label="Food" />
      </div>

      {/* Energy */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <ResourceBar
            label="Energy"
            value={res?.energy_kWh ?? 0}
            max={init?.energy_kWh ?? 1}
            unit="kWh"
            status={energyStatus}
            icon={Lightning}
          />
        </div>
        <Sparkline points={energyHistory} status={energyStatus} label="Energy" />
      </div>

      {/* Radiation */}
      <div className="flex items-center justify-between gap-2 border-t border-spaceplus-border-light pt-3">
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
      <div className="flex items-center gap-2 border-t border-spaceplus-border-light pt-3">
        <Users size={18} weight="fill" className="text-spaceplus-accent-teal" aria-hidden="true" />
        <span className="text-sm text-spaceplus-text-secondary">Crew aboard:</span>
        <span className="font-mono font-semibold text-spaceplus-text-heading tabular-nums">{crewSize}</span>
      </div>
    </Card>
  )
}
