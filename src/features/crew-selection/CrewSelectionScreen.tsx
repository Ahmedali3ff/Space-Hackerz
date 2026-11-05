// src/features/crew-selection/CrewSelectionScreen.tsx
// Crew size selection with live projected daily-consumption readouts.
// Constants come from life-support-constants (approved UI usage for the crew screen).

import { useNavigate } from 'react-router-dom'
import { User, ArrowLeft, ArrowRight, Minus, Plus } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { Panel } from '@/components/common/Panel'
import { StatReadout } from '@/components/common/StatReadout'
import {
  OXYGEN_PER_PERSON_PER_DAY_KG,
  WATER_PER_PERSON_PER_DAY_KG,
  FOOD_PER_PERSON_PER_DAY_KG,
  POWER_PER_CREW_MEMBER_KW,
} from '@data/nasa/life-support-constants'
import { useMissionStore } from '@store/mission-store'

const MIN_CREW = 1
const MAX_CREW = 8

interface CrewSelectionScreenProps {}

export function CrewSelectionScreen(_props: CrewSelectionScreenProps): JSX.Element {
  const navigate = useNavigate()
  const crewSize = useMissionStore((s) => s.crewSize)
  const setCrewSize = useMissionStore((s) => s.setCrewSize)

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
  const dailyOxygen = (effectiveCrew * OXYGEN_PER_PERSON_PER_DAY_KG).toFixed(2)
  const dailyWater = (effectiveCrew * WATER_PER_PERSON_PER_DAY_KG).toFixed(1)
  const dailyFood = (effectiveCrew * FOOD_PER_PERSON_PER_DAY_KG).toFixed(1)
  const dailyPower = (effectiveCrew * POWER_PER_CREW_MEMBER_KW).toFixed(1)

  return (
    <AppShell title="ASTRA — Select Your Crew">
      <ScreenTransition routeKey="/select-crew">
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 py-16">
          {/* ── Heading ── */}
          <div className="mb-10 text-center">
            <h2 className="font-display text-4xl font-bold text-text-primary sm:text-5xl">
              Select Your Crew
            </h2>
            <p className="mt-3 text-lg text-text-secondary">
              More crew = more mission power, but more supplies needed every day.
            </p>
          </div>

          <div className="w-full max-w-2xl space-y-8">
            {/* ── Stepper ── */}
            <Panel title="Crew Size" accent="orbit">
              <div className="flex flex-col items-center gap-6">
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
                          ? 'text-accent-orbit'
                          : 'text-border-subtle opacity-40'
                      }`}
                      aria-hidden="true"
                    >
                      <User size={36} weight={i < effectiveCrew ? 'fill' : 'regular'} />
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
                    className="inline-flex min-h-[52px] min-w-[52px] items-center justify-center rounded-xl border border-border-strong bg-space-panelRaised text-text-primary transition-colors hover:border-accent-orbit/60 hover:text-accent-orbit disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orbit"
                  >
                    <Minus size={24} aria-hidden="true" />
                  </button>

                  <span
                    className="hud-mono min-w-[4rem] text-center text-5xl font-bold text-text-primary"
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
                    className="inline-flex min-h-[52px] min-w-[52px] items-center justify-center rounded-xl border border-border-strong bg-space-panelRaised text-text-primary transition-colors hover:border-accent-orbit/60 hover:text-accent-orbit disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orbit"
                  >
                    <Plus size={24} aria-hidden="true" />
                  </button>
                </div>

                <p className="text-sm text-text-muted">
                  {MIN_CREW} – {MAX_CREW} crew members
                </p>
              </div>
            </Panel>

            {/* ── Daily consumption readouts ── */}
            <Panel title="Projected Daily Consumption" accent="none">
              <p className="mb-4 text-sm text-text-muted">
                Based on NASA life-support baselines. This is how much your crew needs every single day.
              </p>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <StatReadout
                  label="Oxygen"
                  value={dailyOxygen}
                  unit="kg/day"
                  status="info"
                />
                <StatReadout
                  label="Water"
                  value={dailyWater}
                  unit="kg/day"
                  status="info"
                />
                <StatReadout
                  label="Food"
                  value={dailyFood}
                  unit="kg/day"
                  status="info"
                />
                <StatReadout
                  label="Power"
                  value={dailyPower}
                  unit="kW"
                  status="info"
                />
              </div>
            </Panel>
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
              variant="primary"
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
