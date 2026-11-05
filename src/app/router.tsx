import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMissionStore } from '@store/mission-store'
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen'
import { PlanetSelectionScreen } from '@/features/planet-selection/PlanetSelectionScreen'
import { CrewSelectionScreen } from '@/features/crew-selection/CrewSelectionScreen'
import { BaseConfigurationScreen } from '@/features/base-configuration/BaseConfigurationScreen'
import { MissionControlScreen } from '@/features/mission-control/MissionControlScreen'
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
              <MissionControlScreen />
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
