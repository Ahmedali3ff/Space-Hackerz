// src/features/crew-selection/CrewSelectionScreen.tsx
// Crew size selection — Space+ layout with two-column layout (lg screens).
// Left: crew counter with +/- stepper. Right: daily needs preview + mission summary.
// PRESERVED: 'Decrease crew size' / 'Increase crew size' aria-labels,
//            crew size aria-live readout, all StatReadout values,
//            Back/Continue navigation and aria-labels.

import { useNavigate } from 'react-router-dom'
import { User, ArrowLeft, ArrowRight, Minus, Plus } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { Card } from '@/components/common/Card'
import { SectionLabel } from '@/components/common/SectionLabel'
import { MiniProgressBar } from '@/components/charts/MiniProgressBar'
import { useMissionStore } from '@store/mission-store'
import { useMissionProgressStore } from '@store/mission-progress-store'
import {
  OXYGEN_PER_PERSON_PER_DAY_KG,
  WATER_PER_PERSON_PER_DAY_KG,
  FOOD_PER_PERSON_PER_DAY_KG,
  POWER_PER_CREW_MEMBER_KW,
} from '@data/nasa/life-support-constants'

const MIN_CREW = 1
const MAX_CREW = 8

// Max values for progress bars (1 person at max consumption rate × MAX_CREW)
const MAX_OXYGEN = MAX_CREW * OXYGEN_PER_PERSON_PER_DAY_KG
const MAX_WATER = MAX_CREW * WATER_PER_PERSON_PER_DAY_KG
const MAX_FOOD = MAX_CREW * FOOD_PER_PERSON_PER_DAY_KG
const MAX_POWER = MAX_CREW * POWER_PER_CREW_MEMBER_KW

interface CrewSelectionScreenProps {}

export function CrewSelectionScreen(_props: CrewSelectionScreenProps): JSX.Element {
  const navigate = useNavigate()
  const crewSize = useMissionStore((s) => s.crewSize)
  const setCrewSize = useMissionStore((s) => s.setCrewSize)
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const commanderName = useMissionProgressStore((s) => s.commanderName)

  // Effective crew for calculations — treat 0 as 1 for display warmth
  const effectiveCrew = crewSize < MIN_CREW ? MIN_CREW : crewSize

  const canDecrease = crewSize > MIN_CREW
  const canIncrease = crewSize < MAX_CREW
  const canContinue = crewSize >= MIN_CREW

  function handleDecrease(): void {
    if (canDecrease) setCrewSize(crewSize - 1)
  }

  function handleIncrease(): void {
    if (canIncrease) setCrewSize(crewSize + 1)
  }

  // Projected daily consumption
  const dailyOxygen = effectiveCrew * OXYGEN_PER_PERSON_PER_DAY_KG
  const dailyWater = effectiveCrew * WATER_PER_PERSON_PER_DAY_KG
  const dailyFood = effectiveCrew * FOOD_PER_PERSON_PER_DAY_KG
  const dailyPower = effectiveCrew * POWER_PER_CREW_MEMBER_KW

  const planetLabel = selectedPlanetId === 'moon' ? 'The Moon' : selectedPlanetId === 'mars' ? 'Mars' : '—'

  return (
    <AppShell title="ASTRA — Select Your Crew" variant="light">
      <ScreenTransition routeKey="/select-crew">
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 py-16">
          {/* ── Heading ── */}
          <div className="mb-10 text-center">
            <SectionLabel className="block mb-2">Step 2 of 3 — Crew</SectionLabel>
            <h2 className="font-display2 text-4xl font-extrabold text-spaceplus-text-heading sm:text-5xl">
              Select Your Crew
            </h2>
            <p className="mt-3 text-lg text-spaceplus-text-secondary">
              More crew = more mission power, but more supplies needed every day.
            </p>
          </div>

          {/* ── Two-column layout ── */}
          <div className="w-full max-w-3xl grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* ── Left: Crew stepper ── */}
            <Card className="flex flex-col items-center gap-6">
              <SectionLabel>Crew Size</SectionLabel>

              {/* Astronaut icons */}
              <div
                className="flex flex-wrap justify-center gap-2"
                aria-label={`${effectiveCrew} crew member${effectiveCrew === 1 ? '' : 's'} selected`}
                role="img"
              >
                {Array.from({ length: MAX_CREW }).map((_, i) => (
                  <span
                    key={i}
                    className={`transition-all duration-150 ${
                      i < effectiveCrew
                        ? 'text-spaceplus-accent-teal'
                        : 'text-spaceplus-border-medium opacity-40'
                    }`}
                    aria-hidden="true"
                  >
                    <User size={32} weight={i < effectiveCrew ? 'fill' : 'regular'} />
                  </span>
                ))}
              </div>

              {/* ± stepper row */}
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  aria-label="Decrease crew size"
                  disabled={!canDecrease}
                  onClick={handleDecrease}
                  className="inline-flex min-h-[52px] min-w-[52px] items-center justify-center rounded-xl border border-spaceplus-border-light bg-spaceplus-surface text-spaceplus-text-heading transition-colors hover:border-spaceplus-accent-teal hover:text-spaceplus-accent-teal disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal"
                >
                  <Minus size={24} aria-hidden="true" />
                </button>

                <span
                  className="min-w-[4rem] text-center text-5xl font-bold text-spaceplus-text-heading tabular-nums"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`Crew size: ${effectiveCrew}`}
                >
                  {effectiveCrew}
                </span>

                <button
                  type="button"
                  aria-label="Increase crew size"
                  disabled={!canIncrease}
                  onClick={handleIncrease}
                  className="inline-flex min-h-[52px] min-w-[52px] items-center justify-center rounded-xl border border-spaceplus-border-light bg-spaceplus-surface text-spaceplus-text-heading transition-colors hover:border-spaceplus-accent-teal hover:text-spaceplus-accent-teal disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal"
                >
                  <Plus size={24} aria-hidden="true" />
                </button>
              </div>

              <p className="text-sm text-spaceplus-text-muted">
                {MIN_CREW} – {MAX_CREW} crew members
              </p>
            </Card>

            {/* ── Right: Daily needs + mission summary ── */}
            <div className="flex flex-col gap-4">
              {/* Daily needs */}
              <Card>
                <SectionLabel className="block mb-3">Daily Resource Needs</SectionLabel>
                <p className="mb-4 text-xs text-spaceplus-text-secondary">
                  NASA life-support baselines — per day for your crew.
                </p>
                <div className="flex flex-col gap-3">
                  <MiniProgressBar
                    label="Oxygen"
                    value={dailyOxygen}
                    max={MAX_OXYGEN}
                    unit="kg/day"
                    color="#00BCD4"
                  />
                  <MiniProgressBar
                    label="Water"
                    value={dailyWater}
                    max={MAX_WATER}
                    unit="kg/day"
                    color="#0097A7"
                  />
                  <MiniProgressBar
                    label="Food"
                    value={dailyFood}
                    max={MAX_FOOD}
                    unit="kg/day"
                    color="#43A047"
                  />
                  <MiniProgressBar
                    label="Power"
                    value={dailyPower}
                    max={MAX_POWER}
                    unit="kW"
                    color="#FFB300"
                  />
                </div>

                {/* Exact values for test assertions — sr-only display matches StatReadout behavior */}
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-spaceplus-border-light pt-4">
                  <div className="text-center">
                    <p className="text-xs text-spaceplus-text-secondary">Oxygen</p>
                    <p className="font-bold text-spaceplus-text-heading tabular-nums">
                      {dailyOxygen.toFixed(2)}
                      <span className="ml-1 text-xs font-normal text-spaceplus-text-muted">kg/day</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-spaceplus-text-secondary">Water</p>
                    <p className="font-bold text-spaceplus-text-heading tabular-nums">
                      {dailyWater.toFixed(1)}
                      <span className="ml-1 text-xs font-normal text-spaceplus-text-muted">kg/day</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-spaceplus-text-secondary">Food</p>
                    <p className="font-bold text-spaceplus-text-heading tabular-nums">
                      {dailyFood.toFixed(1)}
                      <span className="ml-1 text-xs font-normal text-spaceplus-text-muted">kg/day</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-spaceplus-text-secondary">Power</p>
                    <p className="font-bold text-spaceplus-text-heading tabular-nums">
                      {dailyPower.toFixed(1)}
                      <span className="ml-1 text-xs font-normal text-spaceplus-text-muted">kW</span>
                    </p>
                  </div>
                </div>
              </Card>

              {/* Mission summary sidebar */}
              <Card accent="teal">
                <SectionLabel className="block mb-3">Mission Summary</SectionLabel>
                <div className="flex flex-col gap-2 text-sm">
                  {commanderName.trim().length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-spaceplus-text-secondary">Commander</span>
                      <span className="font-semibold text-spaceplus-text-heading">{commanderName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-spaceplus-text-secondary">Destination</span>
                    <span className="font-semibold text-spaceplus-text-heading">{planetLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-spaceplus-text-secondary">Crew Size</span>
                    <span className="font-semibold text-spaceplus-text-heading">{effectiveCrew}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* ── Navigation ── */}
          <div className="mt-10 flex items-center gap-4">
            <PrimaryButton
              variant="ghost"
              size="md"
              onClick={() => navigate('/select-planet')}
              ariaLabel="Back to planet selection"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Back
            </PrimaryButton>

            <PrimaryButton
              variant="hint"
              size="lg"
              disabled={!canContinue}
              onClick={() => navigate('/configure-base')}
              ariaLabel="Continue to base configuration"
            >
              Continue
              <ArrowRight size={18} aria-hidden="true" />
            </PrimaryButton>
          </div>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
