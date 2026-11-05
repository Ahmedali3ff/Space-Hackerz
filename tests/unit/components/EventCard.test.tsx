// tests/unit/components/EventCard.test.tsx
// Verifies EventCard renders title/description/choices and calls onResolve.

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EventCard } from '@/components/feedback/EventCard'
import type { EventDefinition } from '@simulation/types'

// Minimal EventDefinition fixture
const mockEvent: EventDefinition = {
  id: 'test-event',
  planetId: 'moon',
  title: 'Dust Storm Warning',
  description: 'A dust storm is heading toward your base!',
  scientificExplanation: 'Lunar dust can damage equipment.',
  affectedSystems: ['energy'],
  triggerCondition: {
    minDay: 1,
    probability: 0.5,
    maxOccurrences: 2,
  },
  choices: [
    {
      id: 'choice-a',
      label: 'Seal the hatches',
      description: 'Close all external ports.',
      consequence: { lifeSupportEfficiencyModifier: -0.1 },
      isOptimal: true,
    },
    {
      id: 'choice-b',
      label: 'Ignore it',
      description: 'Keep working outside.',
      consequence: { solarPanelAreaLoss_m2: 5 },
      isOptimal: false,
    },
  ],
}

function renderCard(onResolve = vi.fn()): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <EventCard event={mockEvent} onResolve={onResolve} />
    </MemoryRouter>,
  )
}

describe('EventCard', () => {
  it('renders the event title', () => {
    renderCard()
    expect(screen.getByText('Dust Storm Warning')).toBeInTheDocument()
  })

  it('renders the event description', () => {
    renderCard()
    expect(screen.getByText('A dust storm is heading toward your base!')).toBeInTheDocument()
  })

  it('renders a button for each choice', () => {
    renderCard()
    expect(screen.getByText('Seal the hatches')).toBeInTheDocument()
    expect(screen.getByText('Ignore it')).toBeInTheDocument()
  })

  it('calls onResolve with the correct choiceId when first button clicked', () => {
    const onResolve = vi.fn()
    renderCard(onResolve)
    fireEvent.click(screen.getByText('Seal the hatches'))
    expect(onResolve).toHaveBeenCalledWith('choice-a')
  })

  it('calls onResolve with the correct choiceId when second button clicked', () => {
    const onResolve = vi.fn()
    renderCard(onResolve)
    fireEvent.click(screen.getByText('Ignore it'))
    expect(onResolve).toHaveBeenCalledWith('choice-b')
  })

  it('includes event title in aria-label of each choice button', () => {
    renderCard()
    const sealBtn = screen.getByRole('button', { name: /Seal the hatches — Dust Storm Warning/i })
    expect(sealBtn).toBeInTheDocument()
    const ignoreBtn = screen.getByRole('button', { name: /Ignore it — Dust Storm Warning/i })
    expect(ignoreBtn).toBeInTheDocument()
  })
})
