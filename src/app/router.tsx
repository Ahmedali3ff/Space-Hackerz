import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMissionStore } from '@store/mission-store'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { ScreenTransition } from '@/components/layout/ScreenTransition'

// ── Lazy-loaded screens ───────────────────────────────────────────────────────
// LoadingScreen itself is NOT lazy — it must be available immediately as a fallback.

const MainMenuScreen = React.lazy(
  () => import('../features/main-menu/MainMenuScreen').then((m) => ({ default: m.MainMenuScreen })),
)
const OnboardingScreen = React.lazy(
  () => import('../features/onboarding/OnboardingScreen').then((m) => ({ default: m.OnboardingScreen })),
)
const PlanetSelectionScreen = React.lazy(
  () => import('../features/planet-selection/PlanetSelectionScreen').then((m) => ({ default: m.PlanetSelectionScreen })),
)
const CrewSelectionScreen = React.lazy(
  () => import('../features/crew-selection/CrewSelectionScreen').then((m) => ({ default: m.CrewSelectionScreen })),
)
const BaseConfigurationScreen = React.lazy(
  () => import('../features/base-configuration/BaseConfigurationScreen').then((m) => ({ default: m.BaseConfigurationScreen })),
)
const MissionControlScreen = React.lazy(
  () => import('../features/mission-control/MissionControlScreen').then((m) => ({ default: m.MissionControlScreen })),
)
const MissionDebriefScreen = React.lazy(
  () => import('../features/mission-debrief/MissionDebriefScreen').then((m) => ({ default: m.MissionDebriefScreen })),
)
const LocationSelectionScreen = React.lazy(
  () => import('../features/location-selection/LocationSelectionScreen').then((m) => ({ default: m.LocationSelectionScreen })),
)

// ── Game screens (dark campaign layer) ────────────────────────────────────────
const CampaignMapScreen = React.lazy(
  () => import('../features/game/CampaignMapScreen').then((m) => ({ default: m.CampaignMapScreen })),
)
const CinematicIntroScreen = React.lazy(
  () => import('../features/game/CinematicIntroScreen').then((m) => ({ default: m.CinematicIntroScreen })),
)
const GameplayScreen = React.lazy(
  () => import('../features/game/GameplayScreen').then((m) => ({ default: m.GameplayScreen })),
)
const LevelCompleteScreen = React.lazy(
  () => import('../features/game/LevelCompleteScreen').then((m) => ({ default: m.LevelCompleteScreen })),
)
const GameOverScreen = React.lazy(
  () => import('../features/game/GameOverScreen').then((m) => ({ default: m.GameOverScreen })),
)

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
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ScreenTransition routeKey="/">
              <MainMenuScreen />
            </ScreenTransition>
          </Suspense>
        }
      />
      <Route
        path="/onboarding"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ScreenTransition routeKey="/onboarding">
              <OnboardingScreen />
            </ScreenTransition>
          </Suspense>
        }
      />
      <Route
        path="/select-planet"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ScreenTransition routeKey="/select-planet">
              <PlanetSelectionScreen />
            </ScreenTransition>
          </Suspense>
        }
      />
      <Route
        path="/select-location"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ScreenTransition routeKey="/select-location">
              <LocationSelectionScreen />
            </ScreenTransition>
          </Suspense>
        }
      />
      <Route
        path="/select-crew"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ScreenTransition routeKey="/select-crew">
              <CrewSelectionScreen />
            </ScreenTransition>
          </Suspense>
        }
      />
      <Route
        path="/configure-base"
        element={
          <RequireSetup>
            <Suspense fallback={<LoadingScreen />}>
              <ScreenTransition routeKey="/configure-base">
                <BaseConfigurationScreen />
              </ScreenTransition>
            </Suspense>
          </RequireSetup>
        }
      />
      <Route
        path="/mission"
        element={
          <RequireSetup>
            <RequireMission>
              <Suspense fallback={<LoadingScreen />}>
                <ScreenTransition routeKey="/mission">
                  <MissionControlScreen />
                </ScreenTransition>
              </Suspense>
            </RequireMission>
          </RequireSetup>
        }
      />
      <Route
        path="/debrief"
        element={
          <RequireSetup>
            <RequireMissionStarted>
              <Suspense fallback={<LoadingScreen />}>
                <ScreenTransition routeKey="/debrief">
                  <MissionDebriefScreen />
                </ScreenTransition>
              </Suspense>
            </RequireMissionStarted>
          </RequireSetup>
        }
      />
      <Route
        path="/mission-hub"
        element={<Navigate to="/campaign-map" replace />}
      />
      {/* Legacy utility pages now return to the single mission flow. */}
      <Route path="/missions" element={<Navigate to="/campaign-map" replace />} />
      <Route path="/discoveries" element={<Navigate to="/campaign-map" replace />} />
      <Route path="/star-map" element={<Navigate to="/campaign-map" replace />} />
      <Route path="/spaceship" element={<Navigate to="/campaign-map" replace />} />
      <Route path="/explorers" element={<Navigate to="/campaign-map" replace />} />
      <Route path="/game-settings" element={<Navigate to="/campaign-map" replace />} />

      {/* ── Game campaign routes (dark theme) ──────────────────────────────── */}
      {/* /campaign-map → CampaignMapScreen */}
      <Route
        path="/campaign-map"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <CampaignMapScreen />
          </Suspense>
        }
      />
      {/* /intro/:levelId → CinematicIntroScreen */}
      <Route
        path="/intro/:missionId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <CinematicIntroScreen />
          </Suspense>
        }
      />
      {/* /game/cinematic/:missionId → alias for CinematicIntroScreen (used by CampaignMapScreen) */}
      <Route
        path="/game/cinematic/:missionId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <CinematicIntroScreen />
          </Suspense>
        }
      />
      {/* /game/:levelId → GameplayScreen */}
      <Route
        path="/game/:levelId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <GameplayScreen />
          </Suspense>
        }
      />
      {/* /level-complete/:levelId → LevelCompleteScreen */}
      <Route
        path="/level-complete/:missionId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <LevelCompleteScreen />
          </Suspense>
        }
      />
      {/* /game-over/:levelId → GameOverScreen */}
      <Route
        path="/game-over/:levelId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <GameOverScreen />
          </Suspense>
        }
      />
    </Routes>
  )
}
