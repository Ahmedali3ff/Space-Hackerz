// src/features/planet-selection/PlanetSelectionScreen.tsx
// Planet selection screen — Space+ light card layout with CSS sphere illustrations.
// PRESERVED: 'Select The Moon' / 'Select Mars' aria-pressed buttons, 'The Moon' and
//            'Mars' text, 'No atmosphere' / 'Thin CO₂ atmosphere', '1.62' gravity,
//            'continue to crew selection' aria-label, navigation to '/select-crew'.

import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { StatReadout } from '@/components/common/StatReadout'
import { SectionLabel } from '@/components/common/SectionLabel'
import { MOON_PROFILE } from '@data/nasa/moon-profile'
import { MARS_PROFILE } from '@data/nasa/mars-profile'
import { useMissionStore } from '@store/mission-store'
import type { PlanetId } from '@simulation/types'
import type { PlanetProfile } from '@simulation/types'

interface PlanetSelectionScreenProps {}

// ── Static atmosphere notes ───────────────────────────────────────────────────

const ATMOSPHERE_NOTES: Readonly<Record<PlanetId, string>> = {
  moon: 'No atmosphere',
  mars: 'Thin CO₂ atmosphere',
}

// ── CSS sphere styles ─────────────────────────────────────────────────────────

const SPHERE_STYLE: Readonly<Record<PlanetId, React.CSSProperties>> = {
  moon: {
    background: 'radial-gradient(circle at 35% 35%, #E8EAF6, #9FA8DA)',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    boxShadow: '0 4px 24px rgba(159, 168, 218, 0.4)',
  },
  mars: {
    background: 'radial-gradient(circle at 35% 35%, #FFCCBC, #FF7043)',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    boxShadow: '0 4px 24px rgba(255, 112, 67, 0.4)',
  },
}

// ── Mission count data ────────────────────────────────────────────────────────

const MISSION_COUNT: Readonly<Record<PlanetId, number>> = {
  moon: 3,
  mars: 3,
}

// ── Planet card ──────────────────────────────────────────────────────────────

interface PlanetCardProps {
  readonly profile: PlanetProfile
  readonly isSelected: boolean
  readonly onSelect: (id: PlanetId) => void
  readonly atmosphereNote: string
  readonly badgeColorClass: string
}

function PlanetCard({
  profile,
  isSelected,
  onSelect,
  atmosphereNote,
  badgeColorClass,
}: PlanetCardProps): JSX.Element {
  const accentClass = isSelected
    ? 'ring-2 ring-spaceplus-accent-teal border-spaceplus-accent-teal shadow-cardHover'
    : 'border-spaceplus-border-light hover:shadow-cardHover hover:border-spaceplus-border-medium'

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`Select ${profile.displayName}`}
      onClick={() => onSelect(profile.id)}
      className={`relative w-full max-w-xs rounded-2xl border bg-spaceplus-card p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal ${accentClass}`}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <span
          className="absolute right-4 top-4 text-spaceplus-accent-teal"
          aria-hidden="true"
        >
          <CheckCircle size={24} weight="fill" />
        </span>
      )}

      {/* CSS sphere illustration */}
      <div className="mb-5 flex justify-center">
        <div
          style={SPHERE_STYLE[profile.id]}
          role="img"
          aria-label={`${profile.displayName} planet illustration`}
        />
      </div>

      {/* Planet name + atmosphere */}
      <div className="mb-1">
        <h3 className="font-display2 text-2xl font-bold text-spaceplus-text-heading">
          {profile.displayName}
        </h3>
        <p className="mt-0.5 text-sm text-spaceplus-text-secondary">{atmosphereNote}</p>
      </div>

      {/* Mission count pill */}
      <div className="mb-4 mt-2 flex items-center gap-2">
        <SectionLabel>Missions</SectionLabel>
        <span className={`sp-badge-teal ${badgeColorClass}`}>
          {MISSION_COUNT[profile.id]} missions
        </span>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
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

// ── Screen ────────────────────────────────────────────────────────────────────

export function PlanetSelectionScreen(_props: PlanetSelectionScreenProps): JSX.Element {
  const navigate = useNavigate()
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const selectPlanet = useMissionStore((s) => s.selectPlanet)

  const canContinue = selectedPlanetId !== null

  return (
    <AppShell title="ASTRA — Choose Your Destination" variant="light">
      <ScreenTransition routeKey="/select-planet">
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 py-16">
          {/* ── Heading ── */}
          <div className="mb-10 text-center">
            <SectionLabel className="block mb-2">Step 1 of 3 — Destination</SectionLabel>
            <h2 className="font-display2 text-4xl font-extrabold text-spaceplus-text-heading sm:text-5xl">
              Choose Your Destination
            </h2>
            <p className="mt-3 text-lg text-spaceplus-text-secondary">
              Select the world where your crew will build their base.
            </p>
          </div>

          {/* ── Planet cards ── */}
          <div className="flex w-full flex-col items-center justify-center gap-6 sm:flex-row sm:items-stretch sm:gap-8">
            <PlanetCard
              profile={MOON_PROFILE}
              isSelected={selectedPlanetId === 'moon'}
              onSelect={selectPlanet}
              atmosphereNote={ATMOSPHERE_NOTES.moon}
              badgeColorClass=""
            />
            <PlanetCard
              profile={MARS_PROFILE}
              isSelected={selectedPlanetId === 'mars'}
              onSelect={selectPlanet}
              atmosphereNote={ATMOSPHERE_NOTES.mars}
              badgeColorClass="bg-spaceplus-accent-amber"
            />
          </div>

          {/* ── Info note ── */}
          {selectedPlanetId === null && (
            <p className="mt-8 text-sm text-spaceplus-text-muted" role="status">
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
              variant="hint"
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
