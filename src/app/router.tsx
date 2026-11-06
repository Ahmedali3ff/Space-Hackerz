import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMissionStore } from '@store/mission-store'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { ScreenTransition } from '@/components/layout/ScreenTransition'

// ── Lazy-loaded screens ───────────────────────────────────────────────────────
// LoadingScreen itself is NOT lazy — it must be available immediately as a fallback.

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
const MissionsOverviewScreen = React.lazy(
  () => import('../features/missions/MissionsOverviewScreen').then((m) => ({ default: m.MissionsOverviewScreen })),
)
const LocationSelectionScreen = React.lazy(
  () => import('../features/location-selection/LocationSelectionScreen').then((m) => ({ default: m.LocationSelectionScreen })),
)
const MyDiscoveriesScreen = React.lazy(
  () => import('../features/discoveries/MyDiscoveriesScreen').then((m) => ({ default: m.MyDiscoveriesScreen })),
)
const StarMapScreen = React.lazy(
  () => import('../features/star-map/StarMapScreen').then((m) => ({ default: m.StarMapScreen })),
)
const MySpaceshipScreen = React.lazy(
  () => import('../features/spaceship/MySpaceshipScreen').then((m) => ({ default: m.MySpaceshipScreen })),
)
const ExplorersScreen = React.lazy(
  () => import('../features/explorers/ExplorersScreen').then((m) => ({ default: m.ExplorersScreen })),
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
const GameEventModal = React.lazy(
  () => import('../features/game/GameEventModal').then((m) => ({ default: m.GameEventModal })),
)
const PauseMenuOverlay = React.lazy(
  () => import('../features/game/PauseMenuOverlay').then((m) => ({ default: m.PauseMenuOverlay })),
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

/**
 * Guards game-play routes that require an active or recently-started mission.
 * Uses missionStarted so the guard remains true even briefly after advancing days.
 * Redirects to "/missions" (campaign hub) rather than "/" so the player can
 * pick a mission and re-enter the game naturally.
 */
function RequireGameActive({ children }: { readonly children: ReactNode }): JSX.Element {
  const missionStarted = useMissionStore((s) => s.missionStarted)

  if (!missionStarted) {
    return <Navigate to="/missions" replace />
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
        path="/missions"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ScreenTransition routeKey="/missions">
              <MissionsOverviewScreen />
            </ScreenTransition>
          </Suspense>
        }
      />
      <Route
        path="/discoveries"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ScreenTransition routeKey="/discoveries">
              <MyDiscoveriesScreen />
            </ScreenTransition>
          </Suspense>
        }
      />
      <Route
        path="/star-map"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ScreenTransition routeKey="/star-map">
              <StarMapScreen />
            </ScreenTransition>
          </Suspense>
        }
      />
      <Route
        path="/spaceship"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ScreenTransition routeKey="/spaceship">
              <MySpaceshipScreen />
            </ScreenTransition>
          </Suspense>
        }
      />
      <Route
        path="/explorers"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ScreenTransition routeKey="/explorers">
              <ExplorersScreen />
            </ScreenTransition>
          </Suspense>
        }
      />

      {/* ── Game campaign routes (dark theme) ──────────────────────────────── */}
      <Route
        path="/game/campaign"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <CampaignMapScreen />
          </Suspense>
        }
      />
      {/* Alias: /campaign-map → CampaignMapScreen */}
      <Route
        path="/campaign-map"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <CampaignMapScreen />
          </Suspense>
        }
      />
      <Route
        path="/game/cinematic/:missionId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <CinematicIntroScreen />
          </Suspense>
        }
      />
      {/* Alias: /intro/:levelId → CinematicIntroScreen */}
      <Route
        path="/intro/:missionId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <CinematicIntroScreen />
          </Suspense>
        }
      />
      <Route
        path="/game/play/:missionId"
        element={
          <RequireGameActive>
            <Suspense fallback={<LoadingScreen />}>
              <GameplayScreen />
            </Suspense>
          </RequireGameActive>
        }
      />
      {/* Alias: /game/:levelId → GameplayScreen */}
      <Route
        path="/game/:levelId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <GameplayScreen />
          </Suspense>
        }
      />
      <Route
        path="/game/event/:missionId/:eventId"
        element={
          <RequireGameActive>
            <Suspense fallback={<LoadingScreen />}>
              <GameEventModal />
            </Suspense>
          </RequireGameActive>
        }
      />
      <Route
        path="/game/pause/:missionId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <PauseMenuOverlay />
          </Suspense>
        }
      />
      <Route
        path="/game/level-complete/:missionId"
        element={
          <RequireMissionStarted>
            <Suspense fallback={<LoadingScreen />}>
              <LevelCompleteScreen />
            </Suspense>
          </RequireMissionStarted>
        }
      />
      {/* Alias: /level-complete/:levelId → LevelCompleteScreen */}
      <Route
        path="/level-complete/:missionId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <LevelCompleteScreen />
          </Suspense>
        }
      />
      <Route
        path="/game/game-over"
        element={
          <RequireMissionStarted>
            <Suspense fallback={<LoadingScreen />}>
              <GameOverScreen />
            </Suspense>
          </RequireMissionStarted>
        }
      />
      {/* Alias: /game-over/:levelId → GameOverScreen */}
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
