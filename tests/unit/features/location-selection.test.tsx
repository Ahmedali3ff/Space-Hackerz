// tests/unit/features/location-selection.test.tsx
// Unit tests for LocationSelectionScreen — render 3 cards, click one, navigate to /select-crew.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LocationSelectionScreen } from '@/features/location-selection/LocationSelectionScreen'
import { useMissionStore } from '@store/mission-store'

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LocationSelectionScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mission store to initial state
    useMissionStore.setState({
      selectedPlanetId: null,
      selectedLocationId: null,
      missionDurationDays: 30,
      crewSize: 0,
      baseConfig: null,
      missionActive: false,
      missionStarted: false,
      initialResources: null,
      currentResources: null,
      currentMissionDay: 0,
      activeFaultStates: [],
      activeEventIds: [],
      missionOutcome: 'ongoing',
      decisionLog: [],
      missionScore: null,
      resourceHistory: [],
    })
  })

  it('should redirect to /select-planet if no planet is selected', () => {
    useMissionStore.setState({ selectedPlanetId: null })

    render(
      <BrowserRouter>
        <LocationSelectionScreen />
      </BrowserRouter>,
    )

    expect(mockNavigate).toHaveBeenCalledWith('/select-planet', { replace: true })
  })

  it('should render 3 location cards for Moon', async () => {
    useMissionStore.setState({ selectedPlanetId: 'moon' })

    render(
      <BrowserRouter>
        <LocationSelectionScreen />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Mare Tranquillitatis')).toBeInTheDocument()
      expect(screen.getByText('Shackleton Crater')).toBeInTheDocument()
      expect(screen.getByText('Oceanus Procellarum')).toBeInTheDocument()
    })
  })

  it('should render 3 location cards for Mars', async () => {
    useMissionStore.setState({ selectedPlanetId: 'mars' })

    render(
      <BrowserRouter>
        <LocationSelectionScreen />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Jezero Crater')).toBeInTheDocument()
      expect(screen.getByText('Hellas Planitia')).toBeInTheDocument()
      expect(screen.getByText('Olympus Mons Base')).toBeInTheDocument()
    })
  })

  it('should select a location when clicked', async () => {
    const user = userEvent.setup()
    useMissionStore.setState({ selectedPlanetId: 'moon', selectedLocationId: null })

    render(
      <BrowserRouter>
        <LocationSelectionScreen />
      </BrowserRouter>,
    )

    const tranquillitasButton = await screen.findByRole('button', {
      name: /Select Mare Tranquillitatis/i,
    })

    await user.click(tranquillitasButton)

    await waitFor(() => {
      expect(useMissionStore.getState().selectedLocationId).toBe('moon-tranquillitatis')
    })
  })

  it('should navigate to /select-crew when Continue is clicked', async () => {
    const user = userEvent.setup()
    useMissionStore.setState({ selectedPlanetId: 'moon', selectedLocationId: 'moon-tranquillitatis' })

    render(
      <BrowserRouter>
        <LocationSelectionScreen />
      </BrowserRouter>,
    )

    const continueButton = await screen.findByRole('button', {
      name: /Continue to crew selection/i,
    })

    await user.click(continueButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/select-crew')
    })
  })

  it('should disable Continue button when no location is selected', async () => {
    useMissionStore.setState({ selectedPlanetId: 'moon', selectedLocationId: null })

    render(
      <BrowserRouter>
        <LocationSelectionScreen />
      </BrowserRouter>,
    )

    const continueButton = await screen.findByRole('button', {
      name: /Select a location to continue/i,
    })

    expect(continueButton).toBeDisabled()
  })

  it('should navigate back to /select-planet when Back is clicked', async () => {
    const user = userEvent.setup()
    useMissionStore.setState({ selectedPlanetId: 'moon' })

    render(
      <BrowserRouter>
        <LocationSelectionScreen />
      </BrowserRouter>,
    )

    const backButton = await screen.findByRole('button', {
      name: /Back to planet selection/i,
    })

    await user.click(backButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/select-planet')
    })
  })
})
