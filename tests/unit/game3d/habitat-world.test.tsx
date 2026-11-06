// tests/unit/game3d/habitat-world.test.tsx
// Smoke test: HabitatWorld renders without crashing when R3F is mocked.
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock HabitatWorld sub-components that use raw THREE geometry
// (they are excluded from jsdom anyway, but we need the module import to succeed)
vi.mock('@/game3d/components/LunarTerrain', () => ({
  LunarTerrain: () => null,
}))
vi.mock('@/game3d/components/MarsTerrain', () => ({
  MarsTerrain: () => null,
}))
vi.mock('@/game3d/components/HabitatDome', () => ({
  HabitatDome: () => null,
}))
vi.mock('@/game3d/components/SolarArray', () => ({
  SolarArray: () => null,
}))
vi.mock('@/game3d/components/SatelliteDish', () => ({
  SatelliteDish: () => null,
}))
vi.mock('@/game3d/components/PowerGenerator', () => ({
  PowerGenerator: () => null,
}))
vi.mock('@/game3d/components/KidAstronaut', () => ({
  KidAstronaut: () => null,
}))
vi.mock('@/game3d/components/EarthInSky', () => ({
  EarthInSky: () => null,
}))

describe('HabitatWorld', () => {
  it('renders the R3F Canvas without crashing', async () => {
    const { HabitatWorld } = await import('@/game3d/components/HabitatWorld')

    const mockResources = {
      oxygen_kg: 80,
      water_kg: 75,
      food_kg: 90,
      energy_kWh: 60,
      cumulativeRadiation_mSv: 0,
    }

    render(
      React.createElement(HabitatWorld, {
        planetId: 'moon',
        resources: mockResources,
        initialResources: mockResources,
        crewStatus: 'happy',
        commanderName: 'Alex',
        onBuildingClick: vi.fn(),
      }),
    )

    // The mocked Canvas renders a div[data-testid="r3f-canvas"]
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()
  })

  it('renders mars variant without crashing', async () => {
    const { HabitatWorld } = await import('@/game3d/components/HabitatWorld')

    const mockResources = {
      oxygen_kg: 40,
      water_kg: 30,
      food_kg: 20,
      energy_kWh: 10,
      cumulativeRadiation_mSv: 5,
    }

    render(
      React.createElement(HabitatWorld, {
        planetId: 'mars',
        resources: mockResources,
        initialResources: {
          oxygen_kg: 100,
          water_kg: 100,
          food_kg: 100,
          energy_kWh: 100,
          cumulativeRadiation_mSv: 0,
        },
        crewStatus: 'worried',
        commanderName: 'Jordan',
        onBuildingClick: vi.fn(),
      }),
    )

    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()
  })
})
