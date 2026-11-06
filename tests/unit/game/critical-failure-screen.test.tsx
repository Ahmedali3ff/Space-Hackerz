// tests/unit/game/critical-failure-screen.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { CriticalFailureScreen } from '@/features/game/CriticalFailureScreen'

const RESOURCES = {
  oxygen_kg: 5,
  water_kg: 2,
  food_kg: 0,
  energy_kWh: 50,
  cumulativeRadiation_mSv: 0,
}

const INITIAL = {
  oxygen_kg: 100,
  water_kg: 100,
  food_kg: 100,
  energy_kWh: 100,
  cumulativeRadiation_mSv: 0,
}

describe('CriticalFailureScreen', () => {
  it('renders the failure heading', () => {
    render(
      React.createElement(CriticalFailureScreen, {
        faultStates: ['OXYGEN_DEPLETED'],
        dayReached: 7,
        resources: RESOURCES,
        initialResources: INITIAL,
        onRetry: vi.fn(),
        onBackToMap: vi.fn(),
      }),
    )

    expect(screen.getByText(/Mission Critical Failure/i)).toBeInTheDocument()
  })

  it('shows the oxygen depleted message', () => {
    render(
      React.createElement(CriticalFailureScreen, {
        faultStates: ['OXYGEN_DEPLETED'],
        dayReached: 7,
        resources: RESOURCES,
        initialResources: INITIAL,
        onRetry: vi.fn(),
        onBackToMap: vi.fn(),
      }),
    )

    expect(screen.getByText(/ran out of oxygen/i)).toBeInTheDocument()
  })

  it('shows the day reached', () => {
    render(
      React.createElement(CriticalFailureScreen, {
        faultStates: ['FOOD_DEPLETED'],
        dayReached: 14,
        resources: RESOURCES,
        initialResources: INITIAL,
        onRetry: vi.fn(),
        onBackToMap: vi.fn(),
      }),
    )

    expect(screen.getByText(/Day 14/i)).toBeInTheDocument()
  })

  it('calls onRetry when Try Again button clicked', async () => {
    const onRetry = vi.fn()
    render(
      React.createElement(CriticalFailureScreen, {
        faultStates: ['POWER_CRITICAL'],
        dayReached: 3,
        resources: RESOURCES,
        initialResources: INITIAL,
        onRetry,
        onBackToMap: vi.fn(),
      }),
    )

    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('calls onBackToMap when Back to Map button clicked', async () => {
    const onBackToMap = vi.fn()
    render(
      React.createElement(CriticalFailureScreen, {
        faultStates: ['WATER_DEPLETED'],
        dayReached: 5,
        resources: RESOURCES,
        initialResources: INITIAL,
        onRetry: vi.fn(),
        onBackToMap,
      }),
    )

    await userEvent.click(screen.getByRole('button', { name: /back to map/i }))
    expect(onBackToMap).toHaveBeenCalledOnce()
  })

  it('shows the educational Did You Know section', () => {
    render(
      React.createElement(CriticalFailureScreen, {
        faultStates: ['OXYGEN_DEPLETED'],
        dayReached: 2,
        resources: RESOURCES,
        initialResources: INITIAL,
        onRetry: vi.fn(),
        onBackToMap: vi.fn(),
      }),
    )

    expect(screen.getByText(/Did You Know/i)).toBeInTheDocument()
  })

  it('shows Final Resource Status table', () => {
    render(
      React.createElement(CriticalFailureScreen, {
        faultStates: ['OXYGEN_DEPLETED'],
        dayReached: 2,
        resources: RESOURCES,
        initialResources: INITIAL,
        onRetry: vi.fn(),
        onBackToMap: vi.fn(),
      }),
    )

    expect(screen.getByText(/Final Resource Status/i)).toBeInTheDocument()
  })
})
