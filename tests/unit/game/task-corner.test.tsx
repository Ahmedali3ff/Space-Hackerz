// tests/unit/game/task-corner.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { TaskCorner } from '@/features/game/TaskCorner'

// Mock event registry — getEventDefinition returns undefined for all IDs
vi.mock('@/features/events/event-registry', () => ({
  getEventDefinition: vi.fn(() => undefined),
}))

const BASE_RESOURCES = {
  oxygen_kg: 84,
  water_kg: 90,
  food_kg: 54,
  energy_kWh: 100,
  cumulativeRadiation_mSv: 0,
}

const INITIAL_RESOURCES = {
  oxygen_kg: 100,
  water_kg: 100,
  food_kg: 100,
  energy_kWh: 100,
  cumulativeRadiation_mSv: 0,
}

describe('TaskCorner', () => {
  it('renders the objectives heading', () => {
    render(
      React.createElement(TaskCorner, {
        currentResources: BASE_RESOURCES,
        initialResources: INITIAL_RESOURCES,
        currentDay: 5,
        totalDays: 30,
        activeEventIds: [],
        activeFaultStates: [],
      }),
    )

    expect(screen.getByText(/Mission Objectives/i)).toBeInTheDocument()
  })

  it('shows the current day / total days', () => {
    render(
      React.createElement(TaskCorner, {
        currentResources: BASE_RESOURCES,
        initialResources: INITIAL_RESOURCES,
        currentDay: 12,
        totalDays: 60,
        activeEventIds: [],
        activeFaultStates: [],
      }),
    )

    expect(screen.getByText(/Day 12 \/ 60/i)).toBeInTheDocument()
  })

  it('shows 🚨 critical icon when oxygen is below threshold + 5', () => {
    const criticalResources = {
      ...BASE_RESOURCES,
      oxygen_kg: 10, // 10% — below 15% threshold
    }

    render(
      React.createElement(TaskCorner, {
        currentResources: criticalResources,
        initialResources: INITIAL_RESOURCES,
        currentDay: 1,
        totalDays: 30,
        activeEventIds: [],
        activeFaultStates: [],
      }),
    )

    // 🚨 should appear for critical resource
    const alerts = screen.getAllByText('🚨')
    expect(alerts.length).toBeGreaterThan(0)
  })

  it('shows fault state warning when activeFaultStates is non-empty', () => {
    render(
      React.createElement(TaskCorner, {
        currentResources: BASE_RESOURCES,
        initialResources: INITIAL_RESOURCES,
        currentDay: 3,
        totalDays: 30,
        activeEventIds: [],
        activeFaultStates: ['OXYGEN_DEPLETED'],
      }),
    )

    // fault state is formatted by replacing underscores
    expect(screen.getByText(/OXYGEN DEPLETED/i)).toBeInTheDocument()
    expect(screen.getByText(/Resolve this or lose the mission/i)).toBeInTheDocument()
  })

  it('shows ✅ when resources are healthy', () => {
    render(
      React.createElement(TaskCorner, {
        currentResources: INITIAL_RESOURCES,
        initialResources: INITIAL_RESOURCES,
        currentDay: 1,
        totalDays: 30,
        activeEventIds: [],
        activeFaultStates: [],
      }),
    )

    // Multiple ✅ expected (one per healthy objective)
    const checks = screen.getAllByText('✅')
    expect(checks.length).toBeGreaterThan(0)
  })
})
