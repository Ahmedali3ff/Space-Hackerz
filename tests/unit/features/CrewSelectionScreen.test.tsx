// tests/unit/features/CrewSelectionScreen.test.tsx
// Verifies crew stepper, live projected readouts, and navigation.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CrewSelectionScreen } from '@/features/crew-selection/CrewSelectionScreen'
import { missionStore, INITIAL_MISSION_STATE } from '@store/mission-store'
import {
  OXYGEN_PER_PERSON_PER_DAY_KG,
  WATER_PER_PERSON_PER_DAY_KG,
  FOOD_PER_PERSON_PER_DAY_KG,
  POWER_PER_CREW_MEMBER_KW,
} from '@data/nasa/life-support-constants'

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
      <CrewSelectionScreen />
    </MemoryRouter>,
  )
}

describe('CrewSelectionScreen', () => {
  beforeEach(() => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 1 })
    mockNavigate.mockClear()
  })

  it('renders + and - stepper buttons', () => {
    renderScreen()
    expect(screen.getByRole('button', { name: /increase crew size/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decrease crew size/i })).toBeInTheDocument()
  })

  it('displays current crew size', () => {
    renderScreen()
    // aria-label on the live-region span
    expect(screen.getByLabelText(/crew size: 1/i)).toBeInTheDocument()
  })

  it('+ button increments crew size', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 2 })
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /increase crew size/i }))
    expect(missionStore.getState().crewSize).toBe(3)
  })

  it('- button decrements crew size', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 3 })
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /decrease crew size/i }))
    expect(missionStore.getState().crewSize).toBe(2)
  })

  it('- button is disabled at minimum crew size (1)', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 1 })
    renderScreen()
    expect(screen.getByRole('button', { name: /decrease crew size/i })).toBeDisabled()
  })

  it('+ button is disabled at maximum crew size (8)', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 8 })
    renderScreen()
    expect(screen.getByRole('button', { name: /increase crew size/i })).toBeDisabled()
  })

  it('shows projected oxygen consumption', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 2 })
    renderScreen()
    const expected = (2 * OXYGEN_PER_PERSON_PER_DAY_KG).toFixed(2)
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('shows projected water consumption', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 2 })
    renderScreen()
    const expected = (2 * WATER_PER_PERSON_PER_DAY_KG).toFixed(1)
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('shows projected food consumption', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 2 })
    renderScreen()
    const expected = (2 * FOOD_PER_PERSON_PER_DAY_KG).toFixed(1)
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('shows projected power consumption', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 2 })
    renderScreen()
    const expected = (2 * POWER_PER_CREW_MEMBER_KW).toFixed(1)
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('Continue button is enabled when crewSize >= 1', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 1 })
    renderScreen()
    const btn = screen.getByRole('button', { name: /continue to base configuration/i })
    expect(btn).not.toBeDisabled()
  })

  it('Continue navigates to /configure-base', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, crewSize: 2 })
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /continue to base configuration/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/configure-base')
  })

  it('Back button navigates to /select-planet', () => {
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /back to planet selection/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/select-planet')
  })
})
