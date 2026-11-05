// tests/unit/features/PlanetSelectionScreen.test.tsx
// Verifies PlanetSelectionScreen renders planet cards, selection, and navigation.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PlanetSelectionScreen } from '@/features/planet-selection/PlanetSelectionScreen'
import { missionStore, INITIAL_MISSION_STATE } from '@store/mission-store'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderScreen(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <PlanetSelectionScreen />
    </MemoryRouter>,
  )
}

describe('PlanetSelectionScreen', () => {
  beforeEach(() => {
    missionStore.setState({ ...INITIAL_MISSION_STATE })
    mockNavigate.mockClear()
  })

  it('renders Moon and Mars cards', () => {
    renderScreen()
    expect(screen.getByText('The Moon')).toBeInTheDocument()
    expect(screen.getByText('Mars')).toBeInTheDocument()
  })

  it('Continue button is disabled before a planet is selected', () => {
    renderScreen()
    // When no planet selected, aria-label is "Select a planet to continue"
    const continueBtn = screen.getByRole('button', { name: /select a planet to continue/i })
    expect(continueBtn).toBeDisabled()
  })

  it('clicking the Moon card calls selectPlanet with "moon"', () => {
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /select the moon/i }))
    expect(missionStore.getState().selectedPlanetId).toBe('moon')
  })

  it('clicking the Mars card calls selectPlanet with "mars"', () => {
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /select mars/i }))
    expect(missionStore.getState().selectedPlanetId).toBe('mars')
  })

  it('Continue button is enabled after selecting a planet', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, selectedPlanetId: 'moon' })
    renderScreen()
    const continueBtn = screen.getByRole('button', { name: /continue to location selection/i })
    expect(continueBtn).not.toBeDisabled()
  })

  it('Continue button navigates to /select-location when clicked after selection', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, selectedPlanetId: 'moon' })
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /continue to location selection/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/select-location')
  })

  it('Back button navigates to /', () => {
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /back to onboarding/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('selected Moon card has aria-pressed true', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, selectedPlanetId: 'moon' })
    renderScreen()
    const moonCard = screen.getByRole('button', { name: /select the moon/i })
    expect(moonCard).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows real profile facts — Moon gravity', () => {
    renderScreen()
    // MOON_PROFILE.gravity_m_s2 = 1.62
    expect(screen.getByText('1.62')).toBeInTheDocument()
  })

  it('shows atmosphere note for Moon', () => {
    renderScreen()
    expect(screen.getByText('No atmosphere')).toBeInTheDocument()
  })

  it('shows atmosphere note for Mars', () => {
    renderScreen()
    expect(screen.getByText('Thin CO₂ atmosphere')).toBeInTheDocument()
  })
})
