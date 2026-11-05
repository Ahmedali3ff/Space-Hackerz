// src/features/star-map/StarMapScreen.tsx
// Space+ "Your Cosmic Journey" — SVG mission path showing 7 waypoints
// (Earth → Moon1–3 → Mars1–3). Completed = teal, active = pulsing ring,
// locked = gray. Clicking a waypoint shows a mission summary card below.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { Card } from '@/components/common/Card'
import { SectionLabel } from '@/components/common/SectionLabel'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { MISSIONS } from '@data/missions/mission-definitions'
import { useMissionProgressStore } from '@store/mission-progress-store'
import type { MissionDefinition } from '@data/missions/mission-definitions'
import type { MissionStatus } from '@data/missions/mission-progress'

// ── Waypoint layout ───────────────────────────────────────────────────────────
// SVG viewBox is 800×260. Earth at left, mission nodes spread along a gentle arc.
// Earth (index 0) and then 6 mission waypoints (index 1–6).

interface Waypoint {
  readonly id: string        // 'earth' | mission id
  readonly label: string
  readonly x: number
  readonly y: number
  readonly emoji: string
}

const WAYPOINTS: readonly Waypoint[] = [
  { id: 'earth', label: 'Earth',  x: 60,  y: 130, emoji: '🌍' },
  { id: 'm01',   label: 'M1',     x: 160, y: 90,  emoji: '🌕' },
  { id: 'm02',   label: 'M2',     x: 270, y: 60,  emoji: '🌕' },
  { id: 'm03',   label: 'M3',     x: 380, y: 80,  emoji: '🌕' },
  { id: 'm04',   label: 'M4',     x: 500, y: 110, emoji: '🔴' },
  { id: 'm05',   label: 'M5',     x: 620, y: 80,  emoji: '🔴' },
  { id: 'm06',   label: 'M6',     x: 740, y: 100, emoji: '🔴' },
]

// ── Star rating ───────────────────────────────────────────────────────────────

interface MiniStarsProps {
  readonly earned: number
  readonly max: number
}

function MiniStars({ earned, max }: MiniStarsProps): JSX.Element {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${earned} of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-sm ${i < earned ? 'text-[#F5A623]' : 'text-[#E5E7EB]'}`}>
          ★
        </span>
      ))}
    </span>
  )
}

// ── Summary card ──────────────────────────────────────────────────────────────

interface SummaryCardProps {
  readonly mission: MissionDefinition
  readonly status: MissionStatus
  readonly earnedStars: number
  readonly onStartMission: (missionId: string) => void
}

function SummaryCard({ mission, status, earnedStars, onStartMission }: SummaryCardProps): JSX.Element {
  const isLocked = status === 'locked'
  const isComplete = status === 'completed'
  const difficultyLabels: Readonly<Record<MissionDefinition['difficulty'], string>> = {
    beginner: '⚪ Beginner',
    intermediate: '🟡 Intermediate',
    advanced: '🔴 Advanced',
  }

  return (
    <Card accent={isComplete ? 'teal' : isLocked ? 'none' : 'amber'} className="max-w-lg mx-auto">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-[#1FC8C0] uppercase tracking-wide mb-0.5">
            Mission {mission.number} · {mission.planet === 'moon' ? 'Moon' : 'Mars'}
          </p>
          <h3 className="font-bold text-lg text-[#1A1D2E]">{mission.title}</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">{difficultyLabels[mission.difficulty]}</p>
        </div>
        {isComplete && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] bg-[#D1FAE5] px-2 py-1 rounded-full">
            ✓ Done
          </span>
        )}
        {isLocked && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#9CA3AF] bg-[#F3F4F6] px-2 py-1 rounded-full">
            🔒 Locked
          </span>
        )}
      </div>

      <p className="text-sm text-[#6B7280] mb-3">{mission.description}</p>

      {isComplete && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-[#6B7280]">Stars earned:</span>
          <MiniStars earned={earnedStars} max={mission.rewards.stars} />
        </div>
      )}

      {status === 'active' && (
        <PrimaryButton
          variant="primary"
          size="md"
          onClick={() => { onStartMission(mission.id) }}
          ariaLabel={`Start mission: ${mission.title}`}
        >
          🚀 Start Mission
        </PrimaryButton>
      )}

      {isLocked && (
        <p className="text-xs text-[#9CA3AF]">
          Complete the previous mission to unlock this one.
        </p>
      )}

      {isComplete && (
        <p className="text-xs text-[#10B981]">
          Badge earned: <strong>{mission.rewards.badge}</strong>
        </p>
      )}
    </Card>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────────

interface StarMapScreenProps {}

export function StarMapScreen(_props: StarMapScreenProps): JSX.Element {
  const navigate = useNavigate()
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)

  const getMissionStatus = useMissionProgressStore((s) => s.getMissionStatus)
  const startMission = useMissionProgressStore((s) => s.startMission)
  const missions = useMissionProgressStore((s) => s.missions)

  function getWaypointStatus(waypointId: string): MissionStatus | 'earth' {
    if (waypointId === 'earth') return 'earth'
    return getMissionStatus(waypointId)
  }

  function getNodeFill(waypointId: string): string {
    if (waypointId === 'earth') return '#1FC8C0'
    const status = getMissionStatus(waypointId)
    if (status === 'completed') return '#1FC8C0'
    if (status === 'active') return '#1FC8C0'
    return '#D1D5DB'
  }

  function getLineFill(fromId: string, toId: string): { stroke: string; strokeDasharray: string } {
    const fromStatus = getWaypointStatus(fromId)
    const toStatus = getWaypointStatus(toId)
    const fromComplete = fromStatus === 'earth' || fromStatus === 'completed'
    const toComplete = toStatus === 'completed'
    if (fromComplete && toComplete) {
      return { stroke: '#1FC8C0', strokeDasharray: 'none' }
    }
    return { stroke: '#D1D5DB', strokeDasharray: '6 4' }
  }

  function handleNodeClick(waypointId: string): void {
    if (waypointId === 'earth') {
      setSelectedMissionId(null)
      return
    }
    setSelectedMissionId(waypointId === selectedMissionId ? null : waypointId)
  }

  function handleStartMission(missionId: string): void {
    startMission(missionId)
    navigate('/select-planet')
  }

  const selectedMission = selectedMissionId !== null
    ? MISSIONS.find((m) => m.id === selectedMissionId)
    : null

  const selectedEarnedStars = selectedMissionId !== null
    ? (missions[selectedMissionId]?.earnedStars ?? 0)
    : 0

  const selectedStatus = selectedMissionId !== null
    ? getMissionStatus(selectedMissionId)
    : 'locked'

  return (
    <AppShell title="Your Cosmic Journey">
      <ScreenTransition routeKey="/star-map">
        <div className="min-h-screen px-4 py-10 sm:px-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <SectionLabel className="block mb-1">Mission Path</SectionLabel>
            <h1 className="font-display2 text-3xl font-extrabold text-[#1A1D2E] sm:text-4xl">
              Your Cosmic Journey
            </h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Tap a waypoint to see mission details
            </p>
          </div>

          {/* SVG Star Map */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 800 260"
              className="w-full max-w-3xl mx-auto"
              role="img"
              aria-label="Mission path from Earth through Moon and Mars missions"
            >
              {/* Connecting lines */}
              {WAYPOINTS.slice(0, -1).map((wp, i) => {
                const next = WAYPOINTS[i + 1]
                const lineStyle = getLineFill(wp.id, next.id)
                return (
                  <line
                    key={`line-${i}`}
                    x1={wp.x}
                    y1={wp.y}
                    x2={next.x}
                    y2={next.y}
                    stroke={lineStyle.stroke}
                    strokeWidth={2}
                    strokeDasharray={lineStyle.strokeDasharray === 'none' ? undefined : lineStyle.strokeDasharray}
                    strokeLinecap="round"
                  />
                )
              })}

              {/* Waypoint nodes */}
              {WAYPOINTS.map((wp) => {
                const status = getWaypointStatus(wp.id)
                const isActive = status === 'active'
                const fill = getNodeFill(wp.id)
                const isSelected = wp.id === selectedMissionId
                const nodeR = wp.id === 'earth' ? 22 : 18

                return (
                  <g
                    key={wp.id}
                    onClick={() => { handleNodeClick(wp.id) }}
                    style={{ cursor: wp.id === 'earth' ? 'default' : 'pointer' }}
                    role={wp.id === 'earth' ? undefined : 'button'}
                    aria-label={wp.id === 'earth' ? 'Earth — starting point' : `${wp.label}: click for details`}
                  >
                    {/* Pulsing ring for active node */}
                    {isActive && (
                      <circle
                        cx={wp.x}
                        cy={wp.y}
                        r={nodeR + 8}
                        fill="none"
                        stroke="#1FC8C0"
                        strokeWidth={2}
                        opacity={0.4}
                        className="animate-ping"
                        style={{ transformOrigin: `${wp.x}px ${wp.y}px` }}
                      />
                    )}

                    {/* Selected ring */}
                    {isSelected && (
                      <circle
                        cx={wp.x}
                        cy={wp.y}
                        r={nodeR + 5}
                        fill="none"
                        stroke="#1FC8C0"
                        strokeWidth={2}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={wp.x}
                      cy={wp.y}
                      r={nodeR}
                      fill={fill}
                      stroke={isSelected ? '#17A99E' : 'white'}
                      strokeWidth={2}
                    />

                    {/* Emoji label inside circle */}
                    <text
                      x={wp.x}
                      y={wp.y + 6}
                      textAnchor="middle"
                      fontSize={wp.id === 'earth' ? 18 : 14}
                      aria-hidden="true"
                    >
                      {wp.emoji}
                    </text>

                    {/* Node label below circle */}
                    <text
                      x={wp.x}
                      y={wp.y + nodeR + 16}
                      textAnchor="middle"
                      fontSize={11}
                      fill={status === 'locked' ? '#9CA3AF' : '#1A1D2E'}
                      fontWeight={600}
                    >
                      {wp.id === 'earth' ? 'Earth' : `M${wp.id.replace('m0', '').replace('m', '')}`}
                    </text>

                    {/* Completion tick */}
                    {status === 'completed' && (
                      <text
                        x={wp.x + nodeR - 4}
                        y={wp.y - nodeR + 4}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#10B981"
                      >
                        ✓
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Planet zone labels */}
              <text x={270} y={240} textAnchor="middle" fontSize={11} fill="#9CA3AF" fontWeight={500}>
                🌕 Moon Zone
              </text>
              <text x={620} y={240} textAnchor="middle" fontSize={11} fill="#9CA3AF" fontWeight={500}>
                🔴 Mars Zone
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-2 mb-8 flex-wrap text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#1FC8C0] inline-block" />
              Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#1FC8C0] inline-block animate-pulse" />
              Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#D1D5DB] inline-block" />
              Locked
            </span>
          </div>

          {/* Mission summary card */}
          {selectedMission !== undefined && selectedMission !== null ? (
            <div className="mt-4 px-0 sm:px-4">
              <SummaryCard
                mission={selectedMission}
                status={selectedStatus}
                earnedStars={selectedEarnedStars}
                onStartMission={handleStartMission}
              />
            </div>
          ) : (
            <div className="text-center mt-4 text-sm text-[#9CA3AF]">
              Click a mission node above to see details
            </div>
          )}
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
