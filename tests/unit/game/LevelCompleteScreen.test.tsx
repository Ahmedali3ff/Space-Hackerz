// tests/unit/game/LevelCompleteScreen.test.tsx
// Render tests for LevelCompleteScreen.
// Wrapped in MemoryRouter with /game/level-complete/m01.

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LevelCompleteScreen } from '@/features/game/LevelCompleteScreen'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useMissionStore with required state
vi.mock('@store/mission-store', () => ({
  useMissionStore: Object.assign(
    (
      selector: (s: {
        currentMissionDay: number
        missionDurationDays: number
        missionStarted: boolean
        missionOutcome: string
      }) => unknown,
    ) =>
      selector({
        currentMissionDay: 20,
        missionDurationDays: 30,
        missionStarted: true,
        missionOutcome: 'success',
      }),
    {
      getState: () => ({
        currentMissionDay: 20,
        missionDurationDays: 30,
        missionStarted: true,
        missionOutcome: 'success',
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
    (
      selector: (s: {
        completeMission: () => void
        missions: Record<string, { completedTaskIds: string[] }>
      }) => unknown,
    ) =>
      selector({
        completeMission: vi.fn(),
        missions: {
          m01: { completedTaskIds: [] },
        },
      }),
    {
      getState: () => ({
        completeMission: vi.fn(),
        missions: { m01: { completedTaskIds: [] } },
      }),
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
    <MemoryRouter initialEntries={['/game/level-complete/m01']}>
      <Routes>
        <Route path="/game/level-complete/:missionId" element={<LevelCompleteScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LevelCompleteScreen', () => {
  it('renders Mission Complete heading', () => {
    renderScreen()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Mission Complete/i)
  })

  it('renders Continue Campaign button', () => {
    renderScreen()
    const btn = screen.getByRole('button', { name: /Continue Campaign/i })
    expect(btn).toBeInTheDocument()
  })

  it('renders View Full Report button', () => {
    renderScreen()
    const btn = screen.getByRole('button', { name: /View Full Report/i })
    expect(btn).toBeInTheDocument()
  })
})
