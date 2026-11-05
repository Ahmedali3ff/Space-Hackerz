// tests/unit/features/MissionDebriefScreen.test.tsx
// Component tests for MissionDebriefScreen.
// Wraps renders in MemoryRouter because the component calls useNavigate.

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MissionDebriefScreen } from '@/features/mission-debrief/MissionDebriefScreen'
import { missionStore, INITIAL_MISSION_STATE } from '@store/mission-store'
import { useAppStore } from '@store/app-store'
import type { MissionScore, ResourceHistoryPoint } from '@simulation/types'

// ── Helpers ─────────────────────────────────────────────────────────────────

const mockScore: MissionScore = {
  baseScore: 200,
  resourceStabilityBonus: 150,
  decisionQualityBonus: 75,
  eventsResolvedBonus: 60,
  criticalFailurePenalty: -50,
  finalScore: 435,
  outcome: 'partial',
}

const mockHistory: ResourceHistoryPoint[] = [
  { missionDay: 1, oxygen_kg: 100, water_kg: 360, food_kg: 216, energy_kWh: 160, cumulativeRadiation_mSv: 1 },
  { missionDay: 2, oxygen_kg: 95, water_kg: 354, food_kg: 210, energy_kWh: 155, cumulativeRadiation_mSv: 2 },
]

function renderDebrief(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <MissionDebriefScreen />
    </MemoryRouter>,
  )
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('MissionDebriefScreen', () => {
  beforeEach(() => {
    missionStore.setState({ ...INITIAL_MISSION_STATE })
    useAppStore.setState({
      isLoading: false,
      globalError: null,
      astroAIPanelOpen: false,
    })
  })

  it('renders without crashing when missionScore is null (default state)', () => {
    // Default INITIAL_MISSION_STATE has missionScore: null and resourceHistory: []
    expect(() => renderDebrief()).not.toThrow()
  })

  it('displays success text for outcome success', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, missionOutcome: 'success' })
    renderDebrief()
    // The outcome banner label and learning section both mention "success"
    expect(screen.getAllByText(/success/i).length).toBeGreaterThan(0)
  })

  it('displays failure text for outcome failure', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, missionOutcome: 'failure' })
    renderDebrief()
    expect(screen.getAllByText(/failure/i).length).toBeGreaterThan(0)
  })

  it('displays score breakdown rows when missionScore is set', () => {
    missionStore.setState({ ...INITIAL_MISSION_STATE, missionScore: mockScore })
    renderDebrief()
    expect(screen.getByText('Base Score')).toBeTruthy()
    // finalScore is 435 — should appear as text
    expect(screen.getByText('435')).toBeTruthy()
  })

  it('shows no mission data message when resourceHistory is empty', () => {
    // resourceHistory is [] in INITIAL_MISSION_STATE
    renderDebrief()
    expect(screen.getByText('No mission data recorded')).toBeTruthy()
  })

  it('shows decision log entry text when decisionLog has an entry', () => {
    missionStore.setState({
      ...INITIAL_MISSION_STATE,
      decisionLog: [
        {
          missionDay: 1,
          action: { type: 'ADVANCE_DAY' },
          resultSummary: 'Nominal step',
          wasOptimal: true,
        },
      ],
    })
    renderDebrief()
    expect(screen.getByText('Nominal step')).toBeTruthy()
  })

  it('shows no decisions recorded message when decisionLog is empty', () => {
    // decisionLog is [] in INITIAL_MISSION_STATE
    renderDebrief()
    expect(screen.getByText('No decisions recorded.')).toBeTruthy()
  })
})
