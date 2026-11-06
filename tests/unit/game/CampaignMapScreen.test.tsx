// tests/unit/game/CampaignMapScreen.test.tsx
// Render tests for CampaignMapScreen.
// useMissionProgressStore is mocked so localStorage is never touched.

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CampaignMapScreen } from '@/features/game/CampaignMapScreen'
import type { MissionStatus } from '@data/missions/mission-progress'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useMissionProgressStore:
// m01 is 'active', all others are 'locked'
vi.mock('@store/mission-progress-store', () => ({
  useMissionProgressStore: Object.assign(
    (
      selector: (s: {
        getMissionStatus: (id: string) => MissionStatus
        totalXP: number
        totalStars: number
        commanderName: string
        currentMissionId: string | null
        missions: Record<string, unknown>
        completeMission: () => void
        startMission: () => void
      }) => unknown,
    ) =>
      selector({
        getMissionStatus: (id: string): MissionStatus =>
          id === 'm01' ? 'active' : 'locked',
        totalXP: 0,
        totalStars: 0,
        commanderName: '',
        currentMissionId: 'm01',
        missions: {},
        completeMission: vi.fn(),
        startMission: vi.fn(),
      }),
    {
      getState: () => ({
        getMissionStatus: (id: string): MissionStatus =>
          id === 'm01' ? 'active' : 'locked',
        totalXP: 0,
        totalStars: 0,
        commanderName: '',
        currentMissionId: 'm01',
        missions: {},
        completeMission: vi.fn(),
        startMission: vi.fn(),
      }),
    },
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderScreen(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <CampaignMapScreen />
    </MemoryRouter>,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CampaignMapScreen', () => {
  it('renders 8 mission nodes', () => {
    renderScreen()
    // Each mission node has an aria-label of the form '{title} — {status}'
    // We can check by counting buttons with an aria-label pattern
    const missionButtons = screen.getAllByRole('button', {
      name: /—\s*(active|locked|completed)/i,
    })
    expect(missionButtons).toHaveLength(8)
  })

  it('active mission node is not disabled', () => {
    renderScreen()
    // m01 is active — its button should NOT be disabled
    // Pattern matches the aria-label "First Steps on the Moon — active"
    const activeButton = screen.getByRole('button', { name: /First Steps on the Moon.*active/i })
    expect(activeButton).not.toBeDisabled()
  })

  it('locked mission node shows lock indicator', () => {
    renderScreen()
    // Locked buttons are disabled
    const lockedButtons = screen.getAllByRole('button', { name: /— locked/i })
    expect(lockedButtons.length).toBeGreaterThanOrEqual(1)
    // All locked buttons are disabled
    lockedButtons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })
})
