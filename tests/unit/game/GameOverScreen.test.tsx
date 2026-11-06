// tests/unit/game/GameOverScreen.test.tsx
// Render tests for GameOverScreen.
// useMissionStore is mocked with activeFaultStates so failure reason renders.

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameOverScreen } from '@/features/game/GameOverScreen'
import type { FaultState } from '@simulation/types'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useMissionStore with oxygen depletion fault
vi.mock('@store/mission-store', () => ({
  useMissionStore: Object.assign(
    (
      selector: (s: {
        activeFaultStates: readonly FaultState[]
        currentMissionDay: number
        missionStarted: boolean
      }) => unknown,
    ) =>
      selector({
        activeFaultStates: ['OXYGEN_DEPLETED' as FaultState],
        currentMissionDay: 5,
        missionStarted: true,
      }),
    {
      getState: () => ({
        activeFaultStates: ['OXYGEN_DEPLETED' as FaultState],
        currentMissionDay: 5,
        missionStarted: true,
      }),
    },
  ),
  missionStore: {
    getState: () => ({}),
    setState: vi.fn(),
  },
  INITIAL_MISSION_STATE: {},
}))

// Mock useMissionProgressStore
vi.mock('@store/mission-progress-store', () => ({
  useMissionProgressStore: Object.assign(
    (selector: (s: { currentMissionId: string | null }) => unknown) =>
      selector({ currentMissionId: 'm01' }),
    {
      getState: () => ({ currentMissionId: 'm01' }),
    },
  ),
}))

// Mock audio-manager to avoid AudioContext errors
vi.mock('@/services/audio-manager', () => ({
  getAudioManager: () => ({
    playSound: vi.fn(),
    playMusic: vi.fn(),
    stopMusic: vi.fn(),
    setMuted: vi.fn(),
    setVolume: vi.fn(),
    isMuted: () => false,
    getVolume: () => 0.8,
  }),
  audioManager: {
    playSound: vi.fn(),
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderScreen(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <GameOverScreen />
    </MemoryRouter>,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GameOverScreen', () => {
  it('renders Mission Failed heading', () => {
    renderScreen()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Mission Failed/i)
  })

  it('renders oxygen depletion reason', () => {
    renderScreen()
    expect(screen.getByText(/ran out of oxygen/i)).toBeInTheDocument()
  })

  it('renders Try Again button', () => {
    renderScreen()
    const btn = screen.getByRole('button', { name: /Try Again/i })
    expect(btn).toBeInTheDocument()
  })

  it('renders Return to Campaign button', () => {
    renderScreen()
    const btn = screen.getByRole('button', { name: /Return to Campaign/i })
    expect(btn).toBeInTheDocument()
  })
})
