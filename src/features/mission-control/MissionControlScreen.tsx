// src/features/mission-control/MissionControlScreen.tsx
// Mission Control hero screen — the main gameplay view.
// Docks glass HUD panels around a decorative CSS habitat backdrop.
// Reads all game state from useMissionControl; sub-panels are separate files.

import { useNavigate } from 'react-router-dom'
import {
  House,
  CirclesFour,
  ArrowRight,
  XCircle,
  CheckCircle,
  SkipForward,
  Flag,
} from '@phosphor-icons/react'
import { useMissionControl } from '@/hooks/useMissionControl'
import { useAppStore } from '@store/app-store'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { Panel } from '@/components/common/Panel'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { ResourcePanel } from './ResourcePanel'
import { EnvironmentPanel } from './EnvironmentPanel'
import { EventPanel } from './EventPanel'
import { AstroAIPanel } from './AstroAIPanel'

// ── CSS Habitat Backdrop ──────────────────────────────────────────────────────

function HabitatBackdrop(): JSX.Element {
  return (
    <div
      className="relative mx-auto flex h-48 w-full max-w-sm items-center justify-center"
      aria-hidden="true"
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full border border-accent-orbit/20 bg-accent-orbit/5 blur-sm" />
      {/* Central module */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          {/* Left dome */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-orbit/40 bg-space-panelRaised">
            <CirclesFour size={26} weight="fill" className="text-accent-orbit" />
          </div>
          {/* Main habitat */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-accent-ignition/50 bg-space-panel shadow-glow-ignition">
            <House size={36} weight="fill" className="text-accent-ignition" />
          </div>
          {/* Right dome */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-orbit/40 bg-space-panelRaised">
            <CirclesFour size={26} weight="fill" className="text-accent-orbit" />
          </div>
        </div>
        {/* Ground line */}
        <div className="h-0.5 w-40 rounded-full bg-gradient-to-r from-transparent via-accent-orbit/50 to-transparent" />
        {/* Base label */}
        <p className="hud-mono text-xs text-text-muted">HABITAT ALPHA — OPERATIONAL</p>
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

// ── Screen ────────────────────────────────────────────────────────────────────

interface MissionControlScreenProps {}

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
  } = useMissionControl()

  const clearError = useAppStore((s) => s.clearError)

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
        <div className="flex min-h-screen flex-col gap-6 p-4 md:p-6">
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

          {/* Central habitat backdrop */}
          <HabitatBackdrop />

          {/* HUD panel grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ResourcePanel />
            <EnvironmentPanel />
            <div className="md:col-span-2 lg:col-span-2">
              <EventPanel />
            </div>
          </div>

          {/* Astro-AI panel — full width */}
          <AstroAIPanel />
        </div>
      </AppShell>
    </ScreenTransition>
  )
}
