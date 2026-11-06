// tests/unit/game/mission-alert-banner.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MissionAlertBanner } from '@/features/game/MissionAlertBanner'

// Provide a deterministic event definition matching the real EventDefinition shape.
// "critical" is determined by affectedSystems.length >= 2 (no severity field).
vi.mock('@/features/events/event-registry', () => ({
  getEventDefinition: vi.fn((id: string) => {
    if (id === 'dust-storm') {
      return {
        id: 'dust-storm',
        planetId: 'mars',
        title: 'Martian Dust Storm',
        description: 'A massive dust storm is reducing solar power.',
        scientificExplanation: 'Dust storms can cover the entire planet.',
        // Two affected systems → isCritical === true
        affectedSystems: ['energy', 'food'],
        triggerCondition: { probability: 0.1, maxOccurrences: 2 },
        choices: [],
      }
    }
    if (id === 'minor-leak') {
      return {
        id: 'minor-leak',
        planetId: 'moon',
        title: 'Minor Water Leak',
        description: 'A small pipe is leaking.',
        scientificExplanation: 'Water is precious in space.',
        // One affected system → isCritical === false
        affectedSystems: ['water'],
        triggerCondition: { probability: 0.05, maxOccurrences: 1 },
        choices: [],
      }
    }
    return undefined
  }),
}))

describe('MissionAlertBanner', () => {
  it('renders nothing when eventId is null', () => {
    const { container } = render(
      React.createElement(MissionAlertBanner, { eventId: null, day: 1 }),
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders event title for a known event', () => {
    render(
      React.createElement(MissionAlertBanner, { eventId: 'dust-storm', day: 3 }),
    )
    expect(screen.getByText('Martian Dust Storm')).toBeInTheDocument()
  })

  it('shows CRITICAL ALERT for high-severity event', () => {
    render(
      React.createElement(MissionAlertBanner, { eventId: 'dust-storm', day: 3 }),
    )
    expect(screen.getByText(/CRITICAL ALERT/i)).toBeInTheDocument()
  })

  it('shows non-critical label for low-severity event', () => {
    render(
      React.createElement(MissionAlertBanner, { eventId: 'minor-leak', day: 2 }),
    )
    expect(screen.getByText(/New Event/i)).toBeInTheDocument()
  })

  it('shows dismiss button for non-critical events', () => {
    render(
      React.createElement(MissionAlertBanner, { eventId: 'minor-leak', day: 2 }),
    )
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
  })

  it('hides banner after dismiss button is clicked', async () => {
    render(
      React.createElement(MissionAlertBanner, { eventId: 'minor-leak', day: 2 }),
    )
    const btn = screen.getByRole('button', { name: /dismiss/i })
    await userEvent.click(btn)
    await waitFor(() => {
      expect(screen.queryByText('Minor Water Leak')).not.toBeInTheDocument()
    })
  })

  it('resets dismissed state when a new eventId is provided', async () => {
    const { rerender } = render(
      React.createElement(MissionAlertBanner, { eventId: 'minor-leak', day: 2 }),
    )

    // Dismiss it
    const btn = screen.getByRole('button', { name: /dismiss/i })
    await userEvent.click(btn)
    await waitFor(() => {
      expect(screen.queryByText('Minor Water Leak')).not.toBeInTheDocument()
    })

    // New event should show again
    rerender(
      React.createElement(MissionAlertBanner, { eventId: 'dust-storm', day: 3 }),
    )
    expect(screen.getByText('Martian Dust Storm')).toBeInTheDocument()
  })
})
