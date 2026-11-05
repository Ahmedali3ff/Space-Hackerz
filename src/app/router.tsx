import { Routes, Route, Link, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMissionStore } from '@store/mission-store'

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

// ── Placeholder screens ───────────────────────────────────────────────────────

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
        element={
          <PlaceholderScreen name="Onboarding" nextPath="/select-planet" nextLabel="Select Planet" />
        }
      />
      <Route
        path="/select-planet"
        element={
          <PlaceholderScreen
            name="Planet Selection"
            nextPath="/select-crew"
            nextLabel="Select Crew"
          />
        }
      />
      <Route
        path="/select-crew"
        element={
          <PlaceholderScreen
            name="Crew Selection"
            nextPath="/configure-base"
            nextLabel="Configure Base"
          />
        }
      />
      <Route
        path="/configure-base"
        element={
          <RequireSetup>
            <PlaceholderScreen
              name="Base Configuration"
              nextPath="/mission"
              nextLabel="Start Mission"
            />
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
            <PlaceholderScreen name="Mission Debrief" nextPath="/" nextLabel="Play Again" />
          </RequireSetup>
        }
      />
    </Routes>
  )
}
