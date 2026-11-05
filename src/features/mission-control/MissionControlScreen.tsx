// src/features/mission-control/MissionControlScreen.tsx
// Mission Control — 2-column layout with journey map (left) + task checklist (right).
// Dark AppShell for immersion. Floating resource bar at bottom.
// Event overlay card in top-right when events are active.
// PRESERVED: all aria-labels, outcome text, button labels, AstroAI 'Explain Situation',
//            'All systems nominal', event card choices.

import { useNavigate } from 'react-router-dom'
import {
  XCircle,
  CheckCircle,
  SkipForward,
  Flag,
  ArrowRight,
} from '@phosphor-icons/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { useAppStore } from '@store/app-store'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { Panel } from '@/components/common/Panel'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { TaskChecklistItem } from '@/components/common/TaskChecklistItem'
import { StarScore } from '@/components/common/StarScore'
import { MiniProgressBar } from '@/components/charts/MiniProgressBar'
import { ResourcePanel } from './ResourcePanel'
import { EnvironmentPanel } from './EnvironmentPanel'
import { EventPanel } from './EventPanel'
import { AstroAIPanel } from './AstroAIPanel'

interface MissionControlScreenProps {}

// ── Journey map ───────────────────────────────────────────────────────────────

interface JourneyMapProps {
  readonly currentDay: number
  readonly totalDays?: number
}

function JourneyMap({ currentDay, totalDays = 30 }: JourneyMapProps): JSX.Element {
  // 6 waypoints evenly spaced across the mission duration
  const waypoints = [1, Math.round(totalDays / 5), Math.round(totalDays * 2 / 5),
    Math.round(totalDays * 3 / 5), Math.round(totalDays * 4 / 5), totalDays]

  return (
    <div className="flex flex-col gap-0" aria-label="Mission journey map" aria-hidden="true">
      {waypoints.map((wayDay, idx) => {
        const isComplete = currentDay > wayDay
        const isCurrent = currentDay >= wayDay && (idx === waypoints.length - 1 || currentDay <= waypoints[idx + 1])
        const dotClass = isComplete
          ? 'bg-spaceplus-accent-teal border-spaceplus-accent-teal'
          : isCurrent
          ? 'bg-spaceplus-accent-teal border-spaceplus-accent-teal animate-pulse'
          : 'bg-transparent border-text-muted'

        return (
          <div key={idx} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${dotClass}`}
              />
              {idx < waypoints.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${isComplete ? 'bg-spaceplus-accent-teal' : 'bg-border-subtle'}`}
                />
              )}
            </div>
            <span className={`text-xs font-medium ${
              isComplete
                ? 'text-spaceplus-accent-teal'
                : isCurrent
                ? 'text-text-primary font-bold'
                : 'text-text-muted'
            }`}>
              Day {wayDay}
            </span>
          </div>
        )
      })}

      {/* Cosmic journey strip — decorative */}
      <div
        className="mt-4 h-8 w-full rounded-full"
        style={{
          background: 'linear-gradient(to right, #00BCD4, #7C4DFF)',
          opacity: 0.3,
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {/* Stars */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(1px 1px at 10% 50%, rgba(255,255,255,0.8) 0%, transparent 100%), radial-gradient(1px 1px at 30% 30%, rgba(255,255,255,0.7) 0%, transparent 100%), radial-gradient(1px 1px at 50% 70%, rgba(255,255,255,0.9) 0%, transparent 100%), radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 90% 60%, rgba(255,255,255,0.8) 0%, transparent 100%)',
          }}
        />
      </div>
    </div>
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
      <span className="hud-mono text-sm text-text-secondary">
        <span className="text-text-muted">{timeUnitLabel} </span>
        <span className="text-lg font-bold text-text-primary">{currentMissionDay}</span>
      </span>
      <span className="text-xs text-text-muted">{planetName}</span>
      <span className="hud-mono text-xs text-text-secondary">{crewSize} Crew</span>
      <PrimaryButton
        variant="primary"
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
      className="fixed bottom-0 left-0 right-0 z-40 bg-space-panel/95 backdrop-blur-sm border-t border-border-subtle px-4 py-3"
      aria-label="Resource status bar"
    >
      <div className="mx-auto max-w-5xl flex items-center gap-4">
        <span className="hud-mono text-xs text-text-muted shrink-0">
          {timeUnit} {currentDay}
        </span>
        <div className="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniProgressBar label="Oxygen" value={oxygen} max={maxOxygen} unit="kg" color="#29E6F3" />
          <MiniProgressBar label="Water" value={water} max={maxWater} unit="kg" color="#4FC3F7" />
          <MiniProgressBar label="Food" value={food} max={maxFood} unit="kg" color="#66BB6A" />
          <MiniProgressBar label="Energy" value={energy} max={maxEnergy} unit="kWh" color="#FFA726" />
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
  } = useMissionControl()

  const clearError = useAppStore((s) => s.clearError)
  const getCurrentMission = useMissionProgressStore((s) => s.getCurrentMission)
  const totalStars = useMissionProgressStore((s) => s.totalStars)

  const currentMission = getCurrentMission()

  // Determine planet display label for the HUD
  const planetName =
    selectedPlanetId === 'moon'
      ? 'The Moon'
      : selectedPlanetId === 'mars'
      ? 'Mars'
      : '—'

  const timeUnitLabel =
    selectedPlanetId === 'mars' ? 'Sol' : 'Day'

  function handleEndMission(): void {
    endMission()
    navigate('/debrief')
  }

  // Resources for floating bar
  const res = currentResources
  const maxOxy = res ? Math.max(res.oxygen_kg * 2, 100) : 100
  const maxWat = res ? Math.max(res.water_kg * 2, 100) : 100
  const maxFood = res ? Math.max(res.food_kg * 2, 100) : 100
  const maxEnergy = res ? Math.max(res.energy_kWh * 2, 100) : 100

  return (
    <ScreenTransition routeKey="/mission">
      <AppShell
        title="Mission Control"
        hudSlot={
          <HudSlot
            currentMissionDay={currentMissionDay}
            planetName={planetName}
            crewSize={crewSize}
            onAdvanceDay={advanceDay}
            onEndMission={handleEndMission}
            missionActive={missionActive}
            timeUnitLabel={timeUnitLabel}
          />
        }
      >
        <div className="flex min-h-screen flex-col gap-4 p-4 pb-24 md:p-6 md:pb-24">
          {/* Global error banner */}
          {globalError !== null ? (
            <Panel accent="ignition" className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <XCircle
                  size={20}
                  weight="fill"
                  className="shrink-0 text-status-crit"
                  aria-hidden="true"
                />
                <p className="text-sm text-text-primary">{globalError}</p>
              </div>
              <button
                type="button"
                onClick={clearError}
                aria-label="Dismiss error"
                className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orbit"
              >
                <XCircle size={20} aria-hidden="true" />
              </button>
            </Panel>
          ) : null}

          {/* Mission outcome banner */}
          {missionOutcome !== 'ongoing' ? (
            <Panel
              accent={missionOutcome === 'success' ? 'orbit' : 'ignition'}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={20}
                  weight="fill"
                  className={
                    missionOutcome === 'success'
                      ? 'text-status-good'
                      : missionOutcome === 'partial'
                      ? 'text-status-warn'
                      : 'text-status-crit'
                  }
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-text-primary">
                  {missionOutcome === 'success'
                    ? 'Mission Successful!'
                    : missionOutcome === 'partial'
                    ? 'Mission Ended — Partial Success'
                    : 'Mission Failed'}
                </p>
              </div>
              <PrimaryButton
                variant="primary"
                size="md"
                onClick={() => { navigate('/debrief') }}
                ariaLabel="View mission debrief"
              >
                <ArrowRight size={16} aria-hidden="true" />
                View Debrief
              </PrimaryButton>
            </Panel>
          ) : null}

          {/* ── 2-column main content ── */}
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-5 lg:gap-6">
            {/* ── Left column (60%): journey map + resources + environment ── */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Journey map card */}
              <Panel title="Mission Journey" accent="orbit" className="p-4">
                <JourneyMap currentDay={currentMissionDay} totalDays={30} />
              </Panel>

              {/* Resource + environment in row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ResourcePanel />
                <EnvironmentPanel />
              </div>

              {/* Event panel (nominal or active events) */}
              <EventPanel />
            </div>

            {/* ── Right column (40%): task checklist + stars + AstroAI ── */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Task checklist */}
              <Panel title="Mission Tasks" accent="none">
                {currentMission !== null ? (
                  <div className="flex flex-col gap-1">
                    <p className="mb-2 text-xs text-text-muted">{currentMission.title}</p>
                    {currentMission.tasks.map((task) => (
                      <TaskChecklistItem
                        key={task.id}
                        label={task.label}
                        description={task.description}
                        state="active"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">No active mission selected.</p>
                )}
              </Panel>

              {/* Star reward display */}
              <Panel accent="none" className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-text-muted mb-1">Total Stars Earned</p>
                  <StarScore score={totalStars} size="lg" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted mb-1">Mission</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {currentMission?.title ?? 'Free Play'}
                  </p>
                </div>
              </Panel>

              {/* Astro-AI — collapsed by default via AstroAIPanel */}
              <AstroAIPanel />
            </div>
          </div>
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
      </AppShell>
    </ScreenTransition>
  )
}
