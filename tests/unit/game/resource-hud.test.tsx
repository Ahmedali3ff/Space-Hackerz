// tests/unit/game/resource-hud.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ResourceHUD } from '@/features/game/ResourceHUD'

function renderHUD(overrides: Partial<Parameters<typeof ResourceHUD>[0]> = {}): ReturnType<typeof render> {
  const defaults = {
    oxygen: 80,
    water: 75,
    food: 90,
    energy: 60,
    maxOxygen: 100,
    maxWater: 100,
    maxFood: 100,
    maxEnergy: 100,
    ...overrides,
  }
  return render(React.createElement(ResourceHUD, defaults))
}

describe('ResourceHUD', () => {
  it('renders all four resource labels', () => {
    renderHUD()
    expect(screen.getByText('Oxygen')).toBeInTheDocument()
    expect(screen.getByText('Water')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Energy')).toBeInTheDocument()
  })

  it('renders all four resource percentage values', () => {
    renderHUD({
      oxygen: 80,
      water: 75,
      food: 90,
      energy: 60,
      maxOxygen: 100,
      maxWater: 100,
      maxFood: 100,
      maxEnergy: 100,
    })
    expect(screen.getByLabelText('Oxygen 80%')).toBeInTheDocument()
    expect(screen.getByLabelText('Water 75%')).toBeInTheDocument()
    expect(screen.getByLabelText('Food 90%')).toBeInTheDocument()
    expect(screen.getByLabelText('Energy 60%')).toBeInTheDocument()
  })

  it('renders 4 progressbar roles', () => {
    renderHUD()
    const bars = screen.getAllByRole('progressbar')
    expect(bars).toHaveLength(4)
  })

  it('shows 0% when resource is 0', () => {
    renderHUD({ oxygen: 0, maxOxygen: 100 })
    expect(screen.getByLabelText('Oxygen 0%')).toBeInTheDocument()
  })

  it('shows 100% when resource equals max', () => {
    renderHUD({ food: 100, maxFood: 100 })
    expect(screen.getByLabelText('Food 100%')).toBeInTheDocument()
  })

  it('caps percentage at 100 even if value exceeds max', () => {
    renderHUD({ energy: 120, maxEnergy: 100 })
    expect(screen.getByLabelText('Energy 100%')).toBeInTheDocument()
  })

  it('rounds percentage values', () => {
    renderHUD({ water: 33, maxWater: 100 })
    expect(screen.getByLabelText('Water 33%')).toBeInTheDocument()
  })
})
