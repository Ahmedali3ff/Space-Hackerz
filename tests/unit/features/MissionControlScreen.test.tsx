// tests/unit/features/MissionControlScreen.test.tsx
// Tests for MissionControlScreen: Advance Day, events, End Mission, AstroAIPanel.
// useMissionControl is mocked to avoid instantiating the real SimulationEngine.
// useAstroContext is mocked to return null (no live mission context needed).

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MissionControlScreen } from '@/features/mission-control/MissionControlScreen'
import { missionStore, INITIAL_MISSION_STATE } from '@store/mission-store'
import { useAppStore } from '@store/app-store'
import type { ResourceSnapshot, ResourceHistoryPoint } from '@simulation/types'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
const mockAdvanceDay = vi.fn()
const mockEndMission = vi.fn()
const mockResolveEvent = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useAstroContext so it never throws attempting to build a full context
vi.mock('@/hooks/useAstroContext', () => ({
  useAstroContext: () => null,
}))

// Mock useMissionProgressStore so the screen doesn't attempt localStorage access
vi.mock('@store/mission-progress-store', () => ({
  useMissionProgressStore: Object.assign(
    (selector: (s: { commanderName: string; currentMissionId: string | null; totalStars: number; getCurrentMission: () => null; getMissionStatus: (id: string) => 'active' | 'completed' | 'locked'; missions: Record<string, unknown>; completeMission: () => void }) => unknown) =>
      selector({
        commanderName: '',
        currentMissionId: 'm01',
        totalStars: 0,
        getCurrentMission: () => null,
        getMissionStatus: (_id: string) => 'locked' as const,
        missions: {},
        completeMission: vi.fn(),
      }),
    {
      getState: () => ({
        commanderName: '',
        currentMissionId: 'm01',
        totalStars: 0,
        getCurrentMission: () => null,
        getMissionStatus: (_id: string) => 'locked' as const,
        missions: {},
        completeMission: vi.fn(),
      }),
    },
  ),
}))

// Track advanceDay calls so we can assert day increments via the mock
const makeControlHook = (overrides: Partial<ReturnType<typeof import('@/hooks/useMissionControl').useMissionControl>> = {}): ReturnType<typeof import('@/hooks/useMissionControl').useMissionControl> => ({
  selectedPlanetId: 'moon',
  selectedLocationId: null,
  missionDurationDays: 30,
  crewSize: 3,
  baseConfig: {
    solarPanelArea_m2: 100,
    batteryCapacity_kWh: 200,
    agricultureArea_m2: 20,
    shieldingLevel: 'medium',
    lifeSupportEfficiency: 1.0,
  },
  missionActive: true,
  missionStarted: true,
  currentResources: {
    oxygen_kg: 50,
    water_kg: 200,
    food_kg: 150,
    energy_kWh: 100,
    cumulativeRadiation_mSv: 5,
  } satisfies ResourceSnapshot,
  currentMissionDay: 1,
  activeFaultStates: [],
  activeEventIds: [],
  missionOutcome: 'ongoing' as const,
  decisionLog: [],
  missionScore: null,
  resourceHistory: [] as ResourceHistoryPoint[],
  isLoading: false,
  globalError: null,
  commanderName: '',
  currentMissionId: 'm01',
  initializeMission: vi.fn(),
  advanceDay: mockAdvanceDay,
  resolveEvent: mockResolveEvent,
  emergencyRation: vi.fn(),
  endMission: mockEndMission,
  setSelectedLocation: vi.fn(),
  setMissionDuration: vi.fn(),
  ...overrides,
})

// The module-level mock captures the latest return value via a factory
let controlHookReturnValue = makeControlHook()

vi.mock('@/hooks/useMissionControl', () => ({
  useMissionControl: () => controlHookReturnValue,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderScreen(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <MissionControlScreen />
    </MemoryRouter>,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MissionControlScreen', () => {
  beforeEach(() => {
    missionStore.setState({ ...INITIAL_MISSION_STATE })
    useAppStore.setState({
      isLoading: false,
      globalError: null,
      astroAIPanelOpen: false,
      reducedMotion: false,
    })
    controlHookReturnValue = makeControlHook()
    mockNavigate.mockClear()
    mockAdvanceDay.mockClear()
    mockEndMission.mockClear()
    mockResolveEvent.mockClear()
  })

  it('renders the Advance Day button', () => {
    renderScreen()
    expect(screen.getByRole('button', { name: /advance to next day/i })).toBeInTheDocument()
  })

  it('clicking Advance Day calls advanceDay', () => {
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /advance to next day/i }))
    expect(mockAdvanceDay).toHaveBeenCalledTimes(1)
  })

  it('renders the End Mission button', () => {
    renderScreen()
    expect(screen.getByRole('button', { name: /end mission/i })).toBeInTheDocument()
  })

  it('clicking End Mission calls endMission and navigates to /debrief', () => {
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /end mission and view debrief/i }))
    expect(mockEndMission).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/debrief')
  })

  it('shows "All systems nominal" when there are no active events', () => {
    // activeEventIds is [] by default in makeControlHook
    renderScreen()
    // May appear in both EventPanel and EnvironmentPanel
    const nominals = screen.getAllByText(/all systems nominal/i)
    expect(nominals.length).toBeGreaterThanOrEqual(1)
  })

  it('renders EventCard choices when active events are present', () => {
    // Inject a known lunar event ID
    controlHookReturnValue = makeControlHook({
      activeEventIds: ['lunar-dust-contamination'],
    })
    renderScreen()
    // The EventCard should render the event title
    expect(screen.getByText(/lunar dust alert/i)).toBeInTheDocument()
    // And should have choice buttons
    expect(screen.getByRole('button', { name: /deploy dust mitigation team/i })).toBeInTheDocument()
  })

  it('clicking an EventCard choice calls resolveEvent with the event and choice IDs', () => {
    controlHookReturnValue = makeControlHook({
      activeEventIds: ['lunar-dust-contamination'],
    })
    renderScreen()
    fireEvent.click(
      screen.getByRole('button', { name: /deploy dust mitigation team/i }),
    )
    expect(mockResolveEvent).toHaveBeenCalledWith('lunar-dust-contamination', 'deploy-dust-mitigation')
  })

  it('renders AstroAIPanel with an "Explain Situation" button', () => {
    renderScreen()
    expect(screen.getByRole('button', { name: /explain situation/i })).toBeInTheDocument()
  })

  it('shows mission day counter in HUD', () => {
    renderScreen()
    // The HUD shows the day as a bold span — at least one element with '1' exists
    const dayLabels = screen.getAllByText('1')
    expect(dayLabels.length).toBeGreaterThanOrEqual(1)
  })

  it('Advance Day button is disabled when mission is not active', () => {
    controlHookReturnValue = makeControlHook({ missionActive: false })
    renderScreen()
    expect(screen.getByRole('button', { name: /advance to next day/i })).toBeDisabled()
  })

  it('shows mission outcome overlay when outcome is success', () => {
    controlHookReturnValue = makeControlHook({ missionOutcome: 'success', missionActive: false })
    renderScreen()
    // Success now shows a full-screen Mission Complete overlay
    const completeHeadings = screen.getAllByText(/mission complete/i)
    expect(completeHeadings.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /view mission report/i })).toBeInTheDocument()
  })

  it('shows error panel and can dismiss it when globalError is set', () => {
    // Update the mock to return a globalError (the hook is mocked, not the real store)
    controlHookReturnValue = makeControlHook({ globalError: 'Something went wrong' })
    useAppStore.setState({ globalError: 'Something went wrong' })
    renderScreen()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /dismiss error/i }))
    expect(useAppStore.getState().globalError).toBeNull()
  })
})
