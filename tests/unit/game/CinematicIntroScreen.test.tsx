// tests/unit/game/CinematicIntroScreen.test.tsx
// Render tests for CinematicIntroScreen.
// Wrapped in MemoryRouter with /game/cinematic/m01 so useParams resolves.

import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CinematicIntroScreen } from '@/features/game/CinematicIntroScreen'

// jsdom does not implement window.matchMedia — provide a stub so the typewriter
// hook's prefers-reduced-motion check doesn't throw.
beforeAll(() => {
  if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }
})

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useMissionProgressStore to avoid localStorage access
vi.mock('@store/mission-progress-store', () => ({
  useMissionProgressStore: Object.assign(
    (selector: (s: { startMission: () => void; currentMissionId: string | null }) => unknown) =>
      selector({
        startMission: vi.fn(),
        currentMissionId: 'm01',
      }),
    {
      getState: () => ({
        startMission: vi.fn(),
        currentMissionId: 'm01',
      }),
    },
  ),
}))

// Mock useMissionStore to avoid real store setup
vi.mock('@store/mission-store', () => ({
  useMissionStore: Object.assign(
    (selector: (s: { selectPlanet: () => void; setMissionDuration: () => void; setCrewSize: () => void }) => unknown) =>
      selector({
        selectPlanet: vi.fn(),
        setMissionDuration: vi.fn(),
        setCrewSize: vi.fn(),
      }),
    {
      getState: () => ({
        selectPlanet: vi.fn(),
        setMissionDuration: vi.fn(),
        setCrewSize: vi.fn(),
      }),
    },
  ),
  missionStore: {
    getState: () => ({}),
    setState: vi.fn(),
  },
  INITIAL_MISSION_STATE: {},
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderScreen(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/game/cinematic/m01']}>
      <Routes>
        <Route path="/game/cinematic/:missionId" element={<CinematicIntroScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CinematicIntroScreen', () => {
  it('renders mission title from mission definition', () => {
    renderScreen()
    // m01 mission title is "First Steps on the Moon"
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/First Steps on the Moon/i)
  })

  it('renders Begin Mission button', () => {
    renderScreen()
    const btn = screen.getByRole('button', { name: /Begin Mission/i })
    expect(btn).toBeInTheDocument()
  })

  it('renders Skip Intro button', () => {
    renderScreen()
    const btn = screen.getByRole('button', { name: /Skip Intro/i })
    expect(btn).toBeInTheDocument()
  })
})
