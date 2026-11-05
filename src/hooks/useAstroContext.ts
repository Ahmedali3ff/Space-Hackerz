// src/hooks/useAstroContext.ts
// Derives a SimulationContext from current mission store state.
// Used by AstroAIPanel and MissionDebriefScreen.
// NO direct simulation engine imports.

import { useMissionControl } from './useMissionControl'
import { useMissionStore } from '@store/mission-store'
import { buildSimulationContext } from '@ai/simulation-context'
import { MOON_PROFILE } from '@data/nasa/moon-profile'
import { MARS_PROFILE } from '@data/nasa/mars-profile'
import type { SimulationContext } from '@ai/simulation-context'
import type { SimulationState } from '@simulation/types'

/**
 * Returns a SimulationContext built from the current mission store state,
 * or null if the mission is not active or required data is missing.
 *
 * Importing the profile objects is read-only data access (allowed per architecture rules).
 * Importing buildSimulationContext from @ai is allowed (ai -> application layer boundary).
 */
export function useAstroContext(): SimulationContext | null {
  const {
    selectedPlanetId,
    crewSize,
    baseConfig,
    currentResources,
    currentMissionDay,
    activeEventIds,
    activeFaultStates,
    missionOutcome,
    missionActive,
  } = useMissionControl()

  const initialResources = useMissionStore((s) => s.initialResources)

  if (
    !missionActive ||
    selectedPlanetId === null ||
    baseConfig === null ||
    currentResources === null ||
    initialResources === null
  ) {
    return null
  }

  const profile = selectedPlanetId === 'moon' ? MOON_PROFILE : MARS_PROFILE

  // Reconstruct a minimal SimulationState from store data.
  // seed: 0 — not used by buildSimulationContext; the engine owns the real seed.
  const simulationState: SimulationState = {
    planetId: selectedPlanetId,
    missionDay: currentMissionDay,
    crewSize,
    baseConfig,
    resources: currentResources,
    seed: 0,
    activeEventIds: [...activeEventIds],
    faultStates: [...activeFaultStates],
    outcome: missionOutcome,
  }

  return buildSimulationContext(
    simulationState,
    null,
    profile.displayName,
    profile.timeUnitLabel,
    initialResources,
  )
}
