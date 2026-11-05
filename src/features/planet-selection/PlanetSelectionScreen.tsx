// src/features/planet-selection/PlanetSelectionScreen.tsx
// Planet selection screen — choose Moon or Mars before configuring crew.
// Shows real profile facts from the NASA data layer (read-only).

import { useNavigate } from 'react-router-dom'
import { Moon, Planet, ArrowLeft, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'

import { StatReadout } from '@/components/common/StatReadout'
import { MOON_PROFILE } from '@data/nasa/moon-profile'
import { MARS_PROFILE } from '@data/nasa/mars-profile'
import { useMissionStore } from '@store/mission-store'
import type { PlanetId } from '@simulation/types'
import type { PlanetProfile } from '@simulation/types'
import type { Icon } from '@phosphor-icons/react'

interface PlanetSelectionScreenProps {}

// ── Static atmosphere notes (presentation-layer constants) ──

const ATMOSPHERE_NOTES: Readonly<Record<PlanetId, string>> = {
  moon: 'No atmosphere',
  mars: 'Thin CO₂ atmosphere',
}

// ── Planet card ──────────────────────────────────────────────────────────────

interface PlanetCardProps {
  readonly profile: PlanetProfile
  readonly isSelected: boolean
  readonly onSelect: (id: PlanetId) => void
  readonly IconComponent: Icon
  readonly accentClass: string
  readonly ringClass: string
  readonly glowClass: string
  readonly atmosphereNote: string
}

function PlanetCard({
  profile,
  isSelected,
  onSelect,
  IconComponent,
  accentClass,
  ringClass,
  glowClass,
  atmosphereNote,
}: PlanetCardProps): JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`Select ${profile.displayName}`}
      onClick={() => onSelect(profile.id)}
      className={`relative w-full max-w-sm rounded-2xl border bg-space-panel/80 p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orbit
        ${isSelected
          ? `border-opacity-100 shadow-lg ${ringClass} ${glowClass}`
          : 'border-border-subtle hover:border-border-strong hover:bg-space-panelRaised/60'
        }`}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <span className={`absolute right-4 top-4 ${accentClass}`} aria-hidden="true">
          <CheckCircle size={24} weight="fill" />
        </span>
      )}

      {/* Planet icon */}
      <div className="mb-5 flex items-center gap-4">
        <span
          className={`inline-flex h-16 w-16 items-center justify-center rounded-full bg-space-deep ring-2 ${ringClass}`}
          aria-hidden="true"
        >
          <IconComponent size={36} weight="duotone" className={accentClass} />
        </span>
        <div>
          <h3 className="font-display text-2xl font-bold text-text-primary">
            {profile.displayName}
          </h3>
          <p className="mt-0.5 text-sm text-text-muted">{atmosphereNote}</p>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatReadout
          label="Gravity"
          value={profile.gravity_m_s2.toFixed(2)}
          unit="m/s²"
        />
        <StatReadout
          label="Radiation"
          value={profile.unshieldedDailyRadiation_mSv.toFixed(2)}
          unit="mSv/day"
          status="warn"
        />
        <StatReadout
          label="Temp Min"
          value={profile.temperatureRange.min}
          unit="°C"
          status="info"
        />
        <StatReadout
          label="Temp Max"
          value={profile.temperatureRange.max}
          unit="°C"
        />
        <StatReadout
          label="Time Unit"
          value={profile.timeUnitLabel}
        />
      </div>
    </button>
  )
}

// ── Screen ───────────────────────────────────────────────────────────────────

export function PlanetSelectionScreen(_props: PlanetSelectionScreenProps): JSX.Element {
  const navigate = useNavigate()
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const selectPlanet = useMissionStore((s) => s.selectPlanet)

  const canContinue = selectedPlanetId !== null

  return (
    <AppShell title="ASTRA — Choose Your Destination">
      <ScreenTransition routeKey="/select-planet">
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 py-16">
          {/* ── Heading ── */}
          <div className="mb-10 text-center">
            <h2 className="font-display text-4xl font-bold text-text-primary sm:text-5xl">
              Choose Your Destination
            </h2>
            <p className="mt-3 text-lg text-text-secondary">
              Select the world where your crew will build their base.
            </p>
          </div>

          {/* ── Planet cards ── */}
          <div className="flex w-full flex-col items-center justify-center gap-6 sm:flex-row sm:items-stretch sm:gap-8">
            <PlanetCard
              profile={MOON_PROFILE}
              isSelected={selectedPlanetId === 'moon'}
              onSelect={selectPlanet}
              IconComponent={Moon}
              accentClass="text-accent-starlight"
              ringClass="ring-accent-starlight/50"
              glowClass="border-accent-starlight/60 shadow-glow-orbit"
              atmosphereNote={ATMOSPHERE_NOTES.moon}
            />
            <PlanetCard
              profile={MARS_PROFILE}
              isSelected={selectedPlanetId === 'mars'}
              onSelect={selectPlanet}
              IconComponent={Planet}
              accentClass="text-accent-ignition"
              ringClass="ring-accent-ignition/50"
              glowClass="border-accent-ignition/60 shadow-glow-ignition"
              atmosphereNote={ATMOSPHERE_NOTES.mars}
            />
          </div>

          {/* ── Info note ── */}
          {selectedPlanetId === null && (
            <p className="mt-8 text-sm text-text-muted" role="status">
              Select a destination to continue.
            </p>
          )}

          {/* ── Navigation ── */}
          <div className="mt-10 flex items-center gap-4">
            <PrimaryButton
              variant="ghost"
              size="md"
              onClick={() => navigate('/')}
              ariaLabel="Back to onboarding"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Back
            </PrimaryButton>

            <PrimaryButton
              variant="primary"
              size="lg"
              disabled={!canContinue}
              onClick={() => navigate('/select-crew')}
              ariaLabel={
                canContinue
                  ? 'Continue to crew selection'
                  : 'Select a planet to continue'
              }
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
