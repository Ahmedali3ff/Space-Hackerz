import { Routes, Route, Link, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMissionStore } from '@store/mission-store'
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen'
import { PlanetSelectionScreen } from '@/features/planet-selection/PlanetSelectionScreen'
import { CrewSelectionScreen } from '@/features/crew-selection/CrewSelectionScreen'
import { BaseConfigurationScreen } from '@/features/base-configuration/BaseConfigurationScreen'
import { MissionDebriefScreen } from '@/features/mission-debrief/MissionDebriefScreen'

// ── Route guard components ────────────────────────────────────────────────────

/**
 * Guards routes that require planet + crew to be selected.
 * Redirects to "/" if setup is incomplete.
 */
function RequireSetup({ children }: { readonly children: ReactNode }): JSX.Element {
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const crewSize = useMissionStore((s) => s.crewSize)

  if (selectedPlanetId === null || crewSize === 0) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

/**
 * Guards routes that require an active mission.
 * Redirects to "/select-planet" if no mission is active.
 */
function RequireMission({ children }: { readonly children: ReactNode }): JSX.Element {
  const missionActive = useMissionStore((s) => s.missionActive)

  if (!missionActive) {
    return <Navigate to="/select-planet" replace />
  }
  return <>{children}</>
}

/**
 * Guards routes that require a mission to have been started.
 * Uses missionStarted (not missionActive) so the debrief screen remains
 * accessible after endMission() sets missionActive to false.
 * Redirects to "/" if the mission was never started.
 */
function RequireMissionStarted({ children }: { readonly children: ReactNode }): JSX.Element {
  const missionStarted = useMissionStore((s) => s.missionStarted)

  if (!missionStarted) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

// ── Placeholder screen (mission control only — replaced in FEAT-004) ─────────

interface PlaceholderScreenProps {
  readonly name: string
  readonly nextPath: string
  readonly nextLabel: string
}

function PlaceholderScreen({ name, nextPath, nextLabel }: PlaceholderScreenProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">{name}</h1>
      <p className="text-sm text-gray-500 border border-dashed px-2 py-1">
        PLACEHOLDER — not yet implemented
      </p>
      <Link to={nextPath} className="text-blue-500 underline">
        {nextLabel} →
      </Link>
    </div>
  )
}

// ── Router ────────────────────────────────────────────────────────────────────

export function AppRouter(): JSX.Element {
  return (
    <Routes>
      <Route
        path="/"
        element={<OnboardingScreen />}
      />
      <Route
        path="/select-planet"
        element={<PlanetSelectionScreen />}
      />
      <Route
        path="/select-crew"
        element={<CrewSelectionScreen />}
      />
      <Route
        path="/configure-base"
        element={
          <RequireSetup>
            <BaseConfigurationScreen />
          </RequireSetup>
        }
      />
      <Route
        path="/mission"
        element={
          <RequireSetup>
            <RequireMission>
              <PlaceholderScreen
                name="Mission Control"
                nextPath="/debrief"
                nextLabel="End Mission"
              />
            </RequireMission>
          </RequireSetup>
        }
      />
      <Route
        path="/debrief"
        element={
          <RequireSetup>
            <RequireMissionStarted>
              <MissionDebriefScreen />
            </RequireMissionStarted>
          </RequireSetup>
        }
      />
    </Routes>
  )
}
