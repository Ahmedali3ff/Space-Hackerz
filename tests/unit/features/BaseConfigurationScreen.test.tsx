// tests/unit/features/BaseConfigurationScreen.test.tsx
// Verifies BaseConfigurationScreen sliders, shielding, guards, and Start Mission flow.
// useMissionControl is mocked to avoid real SimulationEngine creation in unit tests.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BaseConfigurationScreen } from '@/features/base-configuration/BaseConfigurationScreen'
import { missionStore, INITIAL_MISSION_STATE } from '@store/mission-store'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
const mockInitializeMission = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks/useMissionControl', () => ({
  useMissionControl: () => ({
    initializeMission: mockInitializeMission,
    selectedPlanetId: null,
    crewSize: 0,
    baseConfig: null,
    missionActive: false,
    missionStarted: false,
    currentResources: null,
    currentMissionDay: 0,
    activeFaultStates: [],
    activeEventIds: [],
    missionOutcome: 'ongoing' as const,
    decisionLog: [],
    missionScore: null,
    resourceHistory: [],
    isLoading: false,
    globalError: null,
    advanceDay: vi.fn(),
    resolveEvent: vi.fn(),
    emergencyRation: vi.fn(),
    endMission: vi.fn(),
  }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderScreen(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <BaseConfigurationScreen />
    </MemoryRouter>,
  )
}

function renderWithValidSetup(): ReturnType<typeof render> {
  missionStore.setState({
    ...INITIAL_MISSION_STATE,
    selectedPlanetId: 'moon',
    crewSize: 3,
  })
  return renderScreen()
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BaseConfigurationScreen', () => {
  beforeEach(() => {
    missionStore.setState({ ...INITIAL_MISSION_STATE })
    mockNavigate.mockClear()
    mockInitializeMission.mockClear()
  })

  it('renders Solar Panels slider', () => {
    renderWithValidSetup()
    expect(screen.getByLabelText(/solar panels/i)).toBeInTheDocument()
  })

  it('renders Battery Storage slider', () => {
    renderWithValidSetup()
    expect(screen.getByLabelText(/battery storage/i)).toBeInTheDocument()
  })

  it('renders Agriculture Area slider', () => {
    renderWithValidSetup()
    expect(screen.getByLabelText(/agriculture area/i)).toBeInTheDocument()
  })

  it('renders Life Support Efficiency slider', () => {
    renderWithValidSetup()
    expect(screen.getByLabelText(/life support efficiency/i)).toBeInTheDocument()
  })

  it('renders shielding level buttons', () => {
    renderWithValidSetup()
    expect(screen.getByRole('button', { name: /low/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /medium/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /high/i })).toBeInTheDocument()
  })

  it('medium shielding is selected by default', () => {
    renderWithValidSetup()
    expect(screen.getByRole('button', { name: /medium/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('clicking High shielding selects it', () => {
    renderWithValidSetup()
    fireEvent.click(screen.getByRole('button', { name: /high/i }))
    expect(screen.getByRole('button', { name: /high/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /medium/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows warning when planet/crew not selected', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE }) // no planet, no crew
    renderScreen()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/please select a planet and crew size first/i)).toBeInTheDocument()
  })

  it('Launch Mission is disabled when planet/crew not set', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE })
    renderScreen()
    const btn = screen.getByRole('button', { name: /complete base configuration first/i })
    expect(btn).toBeDisabled()
  })

  it('Launch Mission is enabled when planet and crew are set', () => {
    renderWithValidSetup()
    const btn = screen.getByRole('button', { name: /launch your mission/i })
    expect(btn).not.toBeDisabled()
  })

  it('Launch Mission calls setBaseConfig, initializeMission, and navigates to /game/level-1', () => {
    renderWithValidSetup()
    fireEvent.click(screen.getByRole('button', { name: /launch your mission/i }))
    // setBaseConfig should have been called (store should have a non-null baseConfig)
    expect(missionStore.getState().baseConfig).not.toBeNull()
    // initializeMission mock should have been called
    expect(mockInitializeMission).toHaveBeenCalledTimes(1)
    // navigate to /game/level-1
    expect(mockNavigate).toHaveBeenCalledWith('/game/level-1')
  })

  it('Back button navigates to /select-crew', () => {
    renderWithValidSetup()
    fireEvent.click(screen.getByRole('button', { name: /back to crew selection/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/select-crew')
  })
})
