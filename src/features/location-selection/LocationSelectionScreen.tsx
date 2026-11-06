// src/features/location-selection/LocationSelectionScreen.tsx
// Landing site selection screen — Space+ white card layout with location stats.

import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, MapPin } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SectionLabel } from '@/components/common/SectionLabel'
import { useMissionStore } from '@store/mission-store'
import { getLocationsForPlanet } from '@data/locations/location-definitions'
import type { Location } from '@simulation/types'
import { MOON_PROFILE } from '@data/nasa/moon-profile'
import { MARS_PROFILE } from '@data/nasa/mars-profile'

interface LocationSelectionScreenProps {}

// ── CSS sphere styles (reused from PlanetSelectionScreen) ────────────────────

const SPHERE_STYLE_MOON: React.CSSProperties = {
  background: 'radial-gradient(circle at 35% 35%, #E8EAF6, #9FA8DA)',
  width: '160px',
  height: '160px',
  borderRadius: '50%',
  boxShadow: '0 8px 32px rgba(159, 168, 218, 0.5)',
}

const SPHERE_STYLE_MARS: React.CSSProperties = {
  background: 'radial-gradient(circle at 35% 35%, #FFCCBC, #FF7043)',
  width: '160px',
  height: '160px',
  borderRadius: '50%',
  boxShadow: '0 8px 32px rgba(255, 112, 67, 0.5)',
}

// ── Location card ─────────────────────────────────────────────────────────────

interface LocationCardProps {
  readonly location: Location
  readonly isSelected: boolean
  readonly onSelect: (id: string) => void
}

function LocationCard({ location, isSelected, onSelect }: LocationCardProps): JSX.Element {
  const accentClass = isSelected
    ? 'ring-2 ring-spaceplus-accent-teal border-spaceplus-accent-teal shadow-cardHover'
    : 'border-spaceplus-border-light hover:shadow-cardHover hover:border-spaceplus-border-medium'

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`Select ${location.name}`}
      onClick={() => onSelect(location.id)}
      className={`relative w-full rounded-2xl border bg-spaceplus-card p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal ${accentClass}`}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <span className="absolute right-4 top-4 text-spaceplus-accent-teal" aria-hidden="true">
          <CheckCircle size={24} weight="fill" />
        </span>
      )}

      {/* Location name + coordinates */}
      <div className="mb-4 flex items-start gap-2">
        <MapPin size={20} className="mt-1 shrink-0 text-spaceplus-accent-teal" aria-hidden="true" />
        <div>
          <h3 className="font-display2 text-xl font-bold text-spaceplus-text-heading">
            {location.name}
          </h3>
          <p className="mt-0.5 text-sm text-spaceplus-text-secondary">
            Latitude: {location.latitude.toFixed(1)}°
          </p>
        </div>
      </div>

      {/* Stat chips (3 columns) */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-spaceplus-teal-light px-3 py-2 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-spaceplus-text-muted">
            Solar
          </div>
          <div className="mt-1 font-display2 text-lg font-bold text-spaceplus-text-heading">
            {(location.solarEfficiencyModifier * 100).toFixed(0)}%
          </div>
        </div>
        <div className="rounded-lg bg-spaceplus-status-warn/10 px-3 py-2 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-spaceplus-text-muted">
            Thermal
          </div>
          <div className="mt-1 font-display2 text-lg font-bold text-spaceplus-text-heading">
            {location.thermalSwingFactor.toFixed(1)}x
          </div>
        </div>
        <div className="rounded-lg bg-spaceplus-status-crit/10 px-3 py-2 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-spaceplus-text-muted">
            Dust
          </div>
          <div className="mt-1 font-display2 text-lg font-bold text-spaceplus-text-heading">
            {(location.dustStormProbability * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-spaceplus-text-body">{location.description}</p>
    </button>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function LocationSelectionScreen(_props: LocationSelectionScreenProps): JSX.Element {
  const navigate = useNavigate()
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const selectedLocationId = useMissionStore((s) => s.selectedLocationId)
  const setSelectedLocation = useMissionStore((s) => s.setSelectedLocation)

  // If no planet selected, redirect to planet selection
  if (selectedPlanetId === null) {
    navigate('/select-planet', { replace: true })
    return <div />
  }

  const locations = getLocationsForPlanet(selectedPlanetId)
  const planetProfile = selectedPlanetId === 'moon' ? MOON_PROFILE : MARS_PROFILE
  const sphereStyle = selectedPlanetId === 'moon' ? SPHERE_STYLE_MOON : SPHERE_STYLE_MARS

  const canContinue = selectedLocationId !== null

  return (
    <AppShell title="Choose Landing Site" variant="light">
      <ScreenTransition routeKey="/select-location">
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6 py-12">
          {/* ── Heading ── */}
          <div className="mb-8 text-center">
            <SectionLabel className="mb-2 block">Step 2 of 4 — Landing Site</SectionLabel>
            <h2 className="font-display2 text-4xl font-extrabold text-spaceplus-text-heading sm:text-5xl">
              Choose Your Landing Site
            </h2>
            <p className="mt-3 text-lg text-spaceplus-text-secondary">
              Select where your base will be established on {planetProfile.displayName}.
            </p>
          </div>

          {/* ── Layout: Planet sphere + Location cards ── */}
          <div className="flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-start">
            {/* Planet CSS sphere (left side) */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div style={sphereStyle} role="img" aria-label={`${planetProfile.displayName} illustration`} />
              <p className="font-display2 text-xl font-bold text-spaceplus-text-heading">
                {planetProfile.displayName}
              </p>
            </div>

            {/* Location cards (right side) */}
            <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  isSelected={selectedLocationId === location.id}
                  onSelect={setSelectedLocation}
                />
              ))}
            </div>
          </div>

          {/* ── Info note ── */}
          {selectedLocationId === null && (
            <p className="mt-6 text-sm text-spaceplus-text-muted" role="status">
              Select a landing site to continue.
            </p>
          )}

          {/* ── Navigation ── */}
          <div className="mt-8 flex items-center gap-4">
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
              onClick={() => navigate('/select-crew')}
              ariaLabel={canContinue ? 'Continue to crew selection' : 'Select a location to continue'}
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
