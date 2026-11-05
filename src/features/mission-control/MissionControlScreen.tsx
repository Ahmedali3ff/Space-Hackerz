// src/features/mission-control/MissionControlScreen.tsx
// Mission Control — Space+ redesign matching reference image.
// Layout: AppShell (light) → heading row → 2-col grid (MissionMapCard + MissionDetailPanel) → CosmicJourneyStrip.
// Floating resource bar at bottom.
// PRESERVED: all aria-labels, outcome text, button labels, AstroAI 'Explain Situation',
//            'All systems nominal', event card choices, HUD slot controls.

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  XCircle,
  CheckCircle,
  SkipForward,
  Flag,
  ArrowRight,
  Rocket,
  Star,
  Lock,
  PauseCircle,
  ArrowsOut,
} from '@phosphor-icons/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { useAppStore } from '@store/app-store'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { MISSIONS } from '@data/missions/mission-definitions'
import type { MissionDefinition } from '@data/missions/mission-definitions'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { Card } from '@/components/common/Card'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { TaskChecklistItem } from '@/components/common/TaskChecklistItem'
import { StarScore } from '@/components/common/StarScore'
import { MiniProgressBar } from '@/components/charts/MiniProgressBar'
import { ResourcePanel } from './ResourcePanel'
import { EnvironmentPanel } from './EnvironmentPanel'
import { EventPanel } from './EventPanel'
import { AstroAIPanel } from './AstroAIPanel'

interface MissionControlScreenProps {}

// ── Toast notification ────────────────────────────────────────────────────────

interface ToastProps {
  readonly message: string
  readonly onDismiss: () => void
  readonly durationMs?: number
}

function Toast({ message, onDismiss, durationMs = 3000 }: ToastProps): JSX.Element {
  useEffect(() => {
    const t = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(t)
  }, [onDismiss, durationMs])

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-4 z-50 max-w-sm rounded-2xl bg-white border border-[#E5E7EB] shadow-lg px-5 py-4 flex items-center gap-3 animate-slide-in"
    >
      <span className="text-sm text-[#1A1D2E]">{message}</span>
    </div>
  )
}

// ── Mission complete overlay ───────────────────────────────────────────────────

interface MissionCompleteOverlayProps {
  readonly title: string
  readonly starsEarned: number
  readonly xpEarned: number
  readonly onViewReport: () => void
  readonly onPlayNext: () => void
}

function MissionCompleteOverlay({
  title,
  starsEarned,
  xpEarned,
  onViewReport,
  onPlayNext,
}: MissionCompleteOverlayProps): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Mission complete"
    >
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xl p-10 max-w-md text-center">
        <div className="text-5xl" aria-hidden="true">🎉</div>
        <h2 className="text-3xl font-bold text-[#1A1D2E]">Mission Complete!</h2>
        <p className="text-lg text-[#6B7280]">{title}</p>

        {/* Stars */}
        <div className="flex items-center gap-1" aria-label={`${starsEarned} stars earned`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              size={36}
              weight={n <= starsEarned ? 'fill' : 'regular'}
              className={n <= starsEarned ? 'text-[#F5A623]' : 'text-[#E5E7EB]'}
              aria-hidden="true"
            />
          ))}
        </div>

        <p className="text-lg font-bold text-[#1FC8C0]">+{xpEarned} XP earned</p>

        <div className="flex flex-col gap-3 w-full">
          <PrimaryButton
            variant="hint"
            size="lg"
            onClick={onViewReport}
            ariaLabel="View mission report"
          >
            View Mission Report
            <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            size="lg"
            onClick={onPlayNext}
            ariaLabel="Play next mission"
          >
            Play Next Mission
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

// ── Mission failed overlay ────────────────────────────────────────────────────

interface MissionFailedOverlayProps {
  readonly reason: string
  readonly onTryAgain: () => void
  readonly onViewReport: () => void
}

function MissionFailedOverlay({
  reason,
  onTryAgain,
  onViewReport,
}: MissionFailedOverlayProps): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Mission failed"
    >
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-white border border-[#E5E7EB] shadow-xl p-10 max-w-md text-center">
        <div className="text-5xl" aria-hidden="true">💔</div>
        <h2 className="text-3xl font-bold text-[#EF4444]">Mission Failed</h2>
        <p className="text-[#6B7280]">{reason}</p>

        {/* 1 star */}
        <div className="flex items-center gap-1" aria-label="1 star earned">
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              size={36}
              weight={n === 1 ? 'fill' : 'regular'}
              className={n === 1 ? 'text-[#F5A623]' : 'text-[#E5E7EB]'}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <PrimaryButton
            variant="hint"
            size="lg"
            onClick={onTryAgain}
            ariaLabel="Try again"
          >
            Try Again
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            size="lg"
            onClick={onViewReport}
            ariaLabel="View mission report"
          >
            View Report
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

// ── Horizontal Journey Map (reference image spec) ─────────────────────────────

interface HorizontalJourneyMapProps {
  readonly currentDay: number
  readonly totalDays: number
  readonly planetId: string | null
  readonly missionTitle: string
  readonly missionSubtitle: string
  readonly missionDescription: string
  readonly onAdvanceDay: () => void
  readonly missionActive: boolean
}

function HorizontalJourneyMap({
  currentDay,
  totalDays,
  planetId,
  missionTitle,
  missionSubtitle,
  missionDescription,
  onAdvanceDay,
  missionActive,
}: HorizontalJourneyMapProps): JSX.Element {
  const isMars = planetId === 'mars'

  // Destination gradient CSS based on planet
  const destGradient = isMars
    ? 'bg-gradient-to-br from-[#FF8A65] to-[#BF360C]'
    : 'bg-gradient-to-br from-[#B0BEC5] to-[#546E7A]'
  const destLabel = isMars ? 'Mars' : 'Moon'
  const destAriaLabel = isMars ? 'Mars destination' : 'Moon destination'

  return (
    <div className="flex flex-col gap-4">
      {/* Mission subtitle + controls row */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1FC8C0]">
          {missionSubtitle}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Pause mission"
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-[#1A1D2E] hover:bg-[#F4F7FA] transition-colors"
          >
            <PauseCircle size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Expand mission view"
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-[#1A1D2E] hover:bg-[#F4F7FA] transition-colors"
          >
            <ArrowsOut size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mission title + description */}
      <div>
        <h2 className="text-[22px] font-bold text-[#1A1D2E] leading-tight">{missionTitle}</h2>
        <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">{missionDescription}</p>
      </div>

      {/* Horizontal waypoint map */}
      <div
        className="relative flex items-center justify-between py-8"
        aria-label="Mission journey map"
        role="img"
      >
        {/* SVG dashed line connecting waypoints */}
        <svg
          className="absolute left-[56px] right-[56px] top-1/2 -translate-y-1/2 h-0.5 w-[calc(100%-112px)]"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="#1FC8C0"
            strokeDasharray="6 4"
            strokeWidth="2"
          />
        </svg>

        {/* Earth waypoint */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4FC3F7] to-[#1565C0] shadow-card flex items-center justify-center"
            aria-label="Earth — mission start"
          >
            <span className="text-2xl" aria-hidden="true">🌍</span>
          </div>
          <span className="text-xs font-semibold text-[#1A1D2E]">Earth</span>
        </div>

        {/* Rocket / YOU ARE HERE waypoint */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          {/* Pulsing ring */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full bg-[#1FC8C0]/20 animate-ping"
              style={{ margin: '-8px' }}
              aria-hidden="true"
            />
            <div
              className="w-12 h-12 rounded-full bg-[#E8FAF9] border-2 border-[#1FC8C0] flex items-center justify-center shadow-card"
              aria-label="Current position — you are here"
            >
              <Rocket size={24} weight="fill" className="text-[#1FC8C0]" aria-hidden="true" />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1FC8C0]">YOU&apos;RE HERE</span>
            <span className="text-xs text-[#6B7280] tabular-nums">Day {currentDay}</span>
          </div>
        </div>

        {/* Destination waypoint */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div
            className={`w-14 h-14 rounded-full ${destGradient} shadow-card flex items-center justify-center`}
            aria-label={destAriaLabel}
          >
            <span className="text-2xl" aria-hidden="true">{isMars ? '🔴' : '🌕'}</span>
          </div>
          <span className="text-xs font-semibold text-[#1A1D2E]">{destLabel}</span>
        </div>
      </div>

      {/* Bottom row: star rating + advance day button */}
      <div className="flex items-center justify-between">
        <StarScore score={Math.min(Math.floor((currentDay / totalDays) * 5), 5)} size="md" />
        <PrimaryButton
          variant="hint"
          size="md"
          onClick={onAdvanceDay}
          disabled={!missionActive}
          ariaLabel={`Advance to day ${currentDay + 1}`}
        >
          Advance Day {currentDay + 1}
          <ArrowRight size={16} aria-hidden="true" />
        </PrimaryButton>
      </div>
    </div>
  )
}

// ── Mission Detail Panel (right column) ──────────────────────────────────────

interface MissionDetailPanelProps {
  readonly mission: MissionDefinition | null
  readonly planetId: string | null
  readonly currentDay: number
  readonly totalDays: number
  readonly onAdvanceDay: () => void
  readonly onEndMission: () => void
  readonly missionActive: boolean
}

function MissionDetailPanel({
  mission,
  planetId,
  currentDay,
  totalDays,
  onAdvanceDay,
  onEndMission,
  missionActive,
}: MissionDetailPanelProps): JSX.Element {
  const progress = totalDays > 0 ? Math.round((currentDay / totalDays) * 100) : 0
  const progressLabel = planetId === 'mars' ? 'Mars power' : 'Moon power'

  return (
    <Card className="flex flex-col gap-4">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1A1D2E]">Your mission</h2>
          <p className="text-xs text-[#9CA3AF]">Astro-AI is your co-pilot</p>
        </div>
        <button
          type="button"
          aria-label="Play mission audio briefing"
          className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-[#1A1D2E] hover:bg-[#F4F7FA] transition-colors"
        >
          {/* Speaker icon — Phosphor Speaker */}
          <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32Zm112,111.64L88,169.21V86.79l56,43.58ZM208,128a79.55,79.55,0,0,1-32,63.29,8,8,0,0,1-10-12.33,64,64,0,0,0,0-101.92A8,8,0,1,1,176,64.71,79.56,79.56,0,0,1,208,128Z"/>
          </svg>
        </button>
      </header>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-[#1A1D2E]">{progressLabel}</span>
          <span className="text-xs text-[#9CA3AF] tabular-nums">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#E5E7EB] overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Mission progress: ${progress}%`}>
          <div
            className="h-full rounded-full bg-[#1FC8C0] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task checklist */}
      {mission !== null ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">Tasks</p>
          {mission.tasks.map((task) => (
            <TaskChecklistItem
              key={task.id}
              label={task.label}
              description={task.description}
              state="active"
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#9CA3AF]">No active mission selected.</p>
      )}

      {/* Reward card */}
      {mission !== null ? (
        <div className="bg-[#FFF8F0] border border-[#F5A623] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5A623]/20 flex items-center justify-center shrink-0">
            <Star size={20} weight="fill" className="text-[#F5A623]" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]">MISSION REWARD</p>
            <p className="text-sm font-semibold text-[#1A1D2E] truncate">{mission.title}</p>
          </div>
          <span className="text-sm font-bold text-[#F5A623] shrink-0">+{mission.rewards.stars} stars</span>
        </div>
      ) : null}

      {/* Astro-AI hint + primary controls */}
      <div className="flex flex-col gap-2">
        <PrimaryButton
          variant="hint"
          size="md"
          onClick={onAdvanceDay}
          disabled={!missionActive}
          ariaLabel={`Advance to day ${currentDay + 1}`}
        >
          <ArrowRight size={16} aria-hidden="true" />
          Advance Day {currentDay + 1} →
        </PrimaryButton>
        <button
          type="button"
          onClick={onEndMission}
          disabled={!missionActive}
          aria-label="Stop mission and view debrief"
          className="text-sm text-[#9CA3AF] hover:text-[#6B7280] underline underline-offset-2 transition-colors disabled:opacity-40"
        >
          End Mission
        </button>
      </div>
    </Card>
  )
}

// ── Cosmic Journey Strip (bottom of screen) ──────────────────────────────────

interface CosmicJourneyStripProps {
  readonly currentMissionId: string | null
  readonly getMissionStatus: (id: string) => 'active' | 'completed' | 'locked'
}

function CosmicJourneyStrip({ currentMissionId, getMissionStatus }: CosmicJourneyStripProps): JSX.Element {
  // Find the current mission index to show prev/current/next
  const currentIndex = MISSIONS.findIndex((m) => m.id === currentMissionId)
  const displayMissions = MISSIONS.slice(
    Math.max(0, currentIndex - 1),
    Math.min(MISSIONS.length, currentIndex + 2),
  )

  const completedCount = MISSIONS.filter((m) => getMissionStatus(m.id) === 'completed').length

  return (
    <Card className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#1A1D2E]">Your cosmic journey</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#9CA3AF]">{completedCount} of 6 missions complete</span>
          <Link
            to="/missions"
            className="text-sm font-semibold text-[#1FC8C0] hover:underline"
            aria-label="View all missions"
          >
            View all missions →
          </Link>
        </div>
      </div>

      {/* Mini mission cards */}
      <div className="flex gap-3 overflow-x-auto pb-1" role="list" aria-label="Mission progression">
        {displayMissions.map((m) => {
          const status = getMissionStatus(m.id)
          const isCurrent = m.id === currentMissionId

          if (status === 'completed') {
            return (
              <div
                key={m.id}
                role="listitem"
                className="bg-[#E8FAF9] rounded-xl p-3 flex items-center gap-2 min-w-[160px] flex-shrink-0"
                aria-label={`Mission ${m.number}: ${m.title} — completed`}
              >
                <CheckCircle size={20} weight="fill" className="text-[#1FC8C0] shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1A1D2E] truncate">{m.title}</p>
                  <p className="text-[10px] text-[#1FC8C0] font-semibold">Completed</p>
                </div>
              </div>
            )
          }

          if (isCurrent) {
            return (
              <div
                key={m.id}
                role="listitem"
                className="bg-white border-2 border-[#1FC8C0] rounded-xl p-3 flex items-center gap-2 min-w-[160px] flex-shrink-0"
                aria-label={`Mission ${m.number}: ${m.title} — current`}
                aria-current="true"
              >
                <ArrowRight size={20} weight="bold" className="text-[#1FC8C0] shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1A1D2E] truncate">{m.title}</p>
                  <p className="text-[10px] text-[#1FC8C0] font-bold uppercase tracking-wide">YOU ARE HERE</p>
                </div>
              </div>
            )
          }

          return (
            <div
              key={m.id}
              role="listitem"
              className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 flex items-center gap-2 min-w-[160px] flex-shrink-0 opacity-70"
              aria-label={`Mission ${m.number}: ${m.title} — locked`}
            >
              <Lock size={20} className="text-[#9CA3AF] shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#6B7280] truncate">{m.title}</p>
                <p className="text-[10px] text-[#9CA3AF]">Locked</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── HUD Slot ─────────────────────────────────────────────────────────────────

interface HudSlotProps {
  readonly currentMissionDay: number
  readonly planetName: string
  readonly crewSize: number
  readonly onAdvanceDay: () => void
  readonly onEndMission: () => void
  readonly missionActive: boolean
  readonly timeUnitLabel: string
}

function HudSlot({
  currentMissionDay,
  planetName,
  crewSize,
  onAdvanceDay,
  onEndMission,
  missionActive,
  timeUnitLabel,
}: HudSlotProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-sm text-spaceplus-text-secondary">
        <span className="text-spaceplus-text-muted">{timeUnitLabel} </span>
        <span className="text-lg font-bold text-spaceplus-text-heading">{currentMissionDay}</span>
      </span>
      <span className="text-xs text-spaceplus-text-muted">{planetName}</span>
      <span className="font-mono text-xs text-spaceplus-text-secondary tabular-nums">{crewSize} Crew</span>
      <PrimaryButton
        variant="hint"
        size="md"
        onClick={onAdvanceDay}
        disabled={!missionActive}
        ariaLabel="Advance to next day"
      >
        <SkipForward size={16} aria-hidden="true" />
        Advance Day
      </PrimaryButton>
      <PrimaryButton
        variant="secondary"
        size="md"
        onClick={onEndMission}
        disabled={!missionActive}
        ariaLabel="End mission and view debrief"
      >
        <Flag size={16} aria-hidden="true" />
        End Mission
      </PrimaryButton>
    </div>
  )
}

// ── Floating resource status bar ──────────────────────────────────────────────

interface FloatingResourceBarProps {
  readonly oxygen: number
  readonly water: number
  readonly food: number
  readonly energy: number
  readonly maxOxygen: number
  readonly maxWater: number
  readonly maxFood: number
  readonly maxEnergy: number
  readonly currentDay: number
  readonly timeUnit: string
}

function FloatingResourceBar({
  oxygen, water, food, energy,
  maxOxygen, maxWater, maxFood, maxEnergy,
  currentDay, timeUnit,
}: FloatingResourceBarProps): JSX.Element {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-spaceplus-border-light px-4 py-3"
      aria-label="Resource status bar"
    >
      <div className="mx-auto max-w-5xl flex items-center gap-4">
        <span className="font-mono text-xs text-spaceplus-text-muted shrink-0 tabular-nums">
          {timeUnit} {currentDay}
        </span>
        <div className="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniProgressBar label="Oxygen" value={oxygen} max={maxOxygen} unit="kg" color="#1FC8C0" />
          <MiniProgressBar label="Water" value={water} max={maxWater} unit="kg" color="#4DD0E1" />
          <MiniProgressBar label="Food" value={food} max={maxFood} unit="kg" color="#66BB6A" />
          <MiniProgressBar label="Energy" value={energy} max={maxEnergy} unit="kWh" color="#F59E0B" />
        </div>
      </div>
    </div>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export function MissionControlScreen(
  _props: MissionControlScreenProps,
): JSX.Element {
  const navigate = useNavigate()
  const {
    currentMissionDay,
    selectedPlanetId,
    crewSize,
    missionOutcome,
    globalError,
    missionActive,
    advanceDay,
    endMission,
    currentResources,
    activeFaultStates,
  } = useMissionControl()

  const clearError = useAppStore((s) => s.clearError)
  const getCurrentMission = useMissionProgressStore((s) => s.getCurrentMission)
  const getMissionStatus = useMissionProgressStore((s) => s.getMissionStatus)
  const totalStars = useMissionProgressStore((s) => s.totalStars)
  const commanderName = useMissionProgressStore((s) => s.commanderName)
  const currentMissionId = useMissionProgressStore((s) => s.currentMissionId)
  const completeMission = useMissionProgressStore((s) => s.completeMission)

  const currentMission = getCurrentMission()

  // ── Toast state ──────────────────────────────────────────────────────────────
  const [daySummaryToast, setDaySummaryToast] = useState<string | null>(null)
  const [taskToast, setTaskToast] = useState<string | null>(null)
  const [showCompleteOverlay, setShowCompleteOverlay] = useState(false)
  const [showFailedOverlay, setShowFailedOverlay] = useState(false)

  // Track previous task completion to detect newly completed ones
  // (reserved for future task-toast integration)

  // Watch for mission outcome changes to trigger overlays
  useEffect(() => {
    if (missionOutcome === 'success') {
      setShowCompleteOverlay(true)
    } else if (missionOutcome === 'failure') {
      setShowFailedOverlay(true)
    }
  }, [missionOutcome])

  const dismissDaySummary = useCallback(() => setDaySummaryToast(null), [])
  const dismissTaskToast = useCallback(() => setTaskToast(null), [])

  // Wrapped advanceDay that also shows a day summary toast
  function handleAdvanceDay(): void {
    const prevDay = currentMissionDay
    advanceDay()
    // Show a quick day summary — the actual resource values will update reactively
    setDaySummaryToast(`Day ${prevDay + 1} — Resources updated`)
  }

  // Determine planet display label for the HUD
  const planetName =
    selectedPlanetId === 'moon'
      ? 'The Moon'
      : selectedPlanetId === 'mars'
      ? 'Mars'
      : '—'

  const timeUnitLabel =
    selectedPlanetId === 'mars' ? 'Sol' : 'Day'

  const missionTotalDays = currentMission?.duration ?? 30

  function handleEndMission(): void {
    endMission()
    navigate('/debrief')
  }

  // Derive failure reason from fault states
  const failureReason: string = (() => {
    if (activeFaultStates.includes('OXYGEN_DEPLETED')) {
      return `Oxygen ran out on ${timeUnitLabel} ${currentMissionDay}`
    }
    if (activeFaultStates.includes('WATER_DEPLETED')) {
      return `Water ran out on ${timeUnitLabel} ${currentMissionDay}`
    }
    if (activeFaultStates.includes('RADIATION_CRITICAL')) {
      return `Radiation levels became critical on ${timeUnitLabel} ${currentMissionDay}`
    }
    return `Mission ended on ${timeUnitLabel} ${currentMissionDay}`
  })()

  // Stars earned: based on how far through the mission we are (1–3)
  const starsEarned = Math.max(
    1,
    Math.min(3, Math.ceil((currentMissionDay / missionTotalDays) * 3)),
  )
  const xpEarned = starsEarned * 20 + (currentMission?.number ?? 1) * 10

  // Resources for floating bar
  const res = currentResources
  const maxOxy = res ? Math.max(res.oxygen_kg * 2, 100) : 100
  const maxWat = res ? Math.max(res.water_kg * 2, 100) : 100
  const maxFood = res ? Math.max(res.food_kg * 2, 100) : 100
  const maxEnergy = res ? Math.max(res.energy_kWh * 2, 100) : 100

  return (
    <ScreenTransition routeKey="/mission">
      <AppShell
        variant="light"
        title="Mission Control"
        hudSlot={
          <HudSlot
            currentMissionDay={currentMissionDay}
            planetName={planetName}
            crewSize={crewSize}
            onAdvanceDay={handleAdvanceDay}
            onEndMission={handleEndMission}
            missionActive={missionActive}
            timeUnitLabel={timeUnitLabel}
          />
        }
      >
        <div className="flex min-h-screen flex-col gap-4 p-4 pb-24 md:p-6 md:pb-28">

          {/* ── Day summary toast ── */}
          {daySummaryToast !== null && (
            <Toast message={daySummaryToast} onDismiss={dismissDaySummary} durationMs={2500} />
          )}

          {/* ── Task complete toast ── */}
          {taskToast !== null && (
            <Toast message={taskToast} onDismiss={dismissTaskToast} durationMs={3000} />
          )}

          {/* ── Global error banner ── */}
          {globalError !== null ? (
            <Card accent="coral" className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <XCircle
                  size={20}
                  weight="fill"
                  className="shrink-0 text-spaceplus-status-error"
                  aria-hidden="true"
                />
                <p className="text-sm text-spaceplus-text-body">{globalError}</p>
              </div>
              <button
                type="button"
                onClick={clearError}
                aria-label="Dismiss error"
                className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl text-spaceplus-text-secondary hover:text-spaceplus-text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal"
              >
                <XCircle size={20} aria-hidden="true" />
              </button>
            </Card>
          ) : null}

          {/* ── Mission outcome banner (for partial) ── */}
          {missionOutcome === 'partial' ? (
            <Card
              accent="teal"
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={20}
                  weight="fill"
                  className="text-spaceplus-status-warning"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-spaceplus-text-heading">
                  Mission Ended — Partial Success
                </p>
              </div>
              <PrimaryButton
                variant="hint"
                size="md"
                onClick={() => { navigate('/debrief') }}
                ariaLabel="View mission debrief"
              >
                <ArrowRight size={16} aria-hidden="true" />
                View Debrief
              </PrimaryButton>
            </Card>
          ) : null}

          {/* ── Top heading row ── */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#1FC8C0] mb-1">
                SOLAR SYSTEM ADVENTURE
              </p>
              <h1 className="text-2xl font-bold text-[#1A1D2E]">
                Ready for your mission{commanderName ? `, ${commanderName}` : ''}?
              </h1>
            </div>
            <div className="flex items-center gap-2" aria-label={`Mission status: ${missionActive ? 'in progress' : 'not started'}`}>
              <span
                className={`w-2 h-2 rounded-full inline-block ${missionActive ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'}`}
                aria-hidden="true"
              />
              <span className="text-sm text-[#6B7280]">
                {missionActive ? 'Mission in progress' : 'Not started'}
              </span>
              <span className="ml-2 bg-[#FFF8F0] text-[#F5A623] rounded-full px-3 py-1 text-sm font-bold" aria-label={`${totalStars} total stars earned`}>
                ⭐ {totalStars}
              </span>
            </div>
          </div>

          {/* ── Main 2-col grid: MissionMapCard (left) + MissionDetailPanel (right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            {/* Left: Mission Map Card */}
            <Card className="p-4">
              <HorizontalJourneyMap
                currentDay={currentMissionDay}
                totalDays={missionTotalDays}
                planetId={selectedPlanetId}
                missionTitle={currentMission?.title ?? 'Free Play'}
                missionSubtitle={currentMission?.subtitle ?? (planetName + ' Mission')}
                missionDescription={currentMission?.description ?? 'Manage your base and keep your crew alive!'}
                onAdvanceDay={handleAdvanceDay}
                missionActive={missionActive}
              />
            </Card>

            {/* Right: Mission Detail Panel */}
            <MissionDetailPanel
              mission={currentMission}
              planetId={selectedPlanetId}
              currentDay={currentMissionDay}
              totalDays={missionTotalDays}
              onAdvanceDay={handleAdvanceDay}
              onEndMission={handleEndMission}
              missionActive={missionActive}
            />
          </div>

          {/* ── Systems row: Resources + Environment + Events ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResourcePanel />
            <EnvironmentPanel />
            <EventPanel />
          </div>

          {/* ── Astro-AI panel (full width) ── */}
          <AstroAIPanel />

          {/* ── Cosmic Journey Strip (bottom) ── */}
          <CosmicJourneyStrip
            currentMissionId={currentMissionId}
            getMissionStatus={getMissionStatus}
          />
        </div>

        {/* ── Floating resource status bar ── */}
        {res !== null && (
          <FloatingResourceBar
            oxygen={res.oxygen_kg}
            water={res.water_kg}
            food={res.food_kg}
            energy={res.energy_kWh}
            maxOxygen={maxOxy}
            maxWater={maxWat}
            maxFood={maxFood}
            maxEnergy={maxEnergy}
            currentDay={currentMissionDay}
            timeUnit={timeUnitLabel}
          />
        )}

        {/* ── Mission complete overlay ── */}
        {showCompleteOverlay && (
          <MissionCompleteOverlay
            title={currentMission?.title ?? 'Mission Complete!'}
            starsEarned={starsEarned}
            xpEarned={xpEarned}
            onViewReport={() => {
              setShowCompleteOverlay(false)
              if (currentMission !== null) {
                completeMission(currentMission.id, starsEarned)
              }
              endMission()
              navigate('/debrief')
            }}
            onPlayNext={() => {
              setShowCompleteOverlay(false)
              if (currentMission !== null) {
                completeMission(currentMission.id, starsEarned)
              }
              endMission()
              navigate('/missions')
            }}
          />
        )}

        {/* ── Mission failed overlay ── */}
        {showFailedOverlay && (
          <MissionFailedOverlay
            reason={failureReason}
            onTryAgain={() => {
              setShowFailedOverlay(false)
              navigate('/configure-base')
            }}
            onViewReport={() => {
              setShowFailedOverlay(false)
              endMission()
              navigate('/debrief')
            }}
          />
        )}
      </AppShell>
    </ScreenTransition>
  )
}
