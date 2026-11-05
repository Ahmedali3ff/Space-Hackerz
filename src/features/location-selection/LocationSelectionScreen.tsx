// src/features/location-selection/LocationSelectionScreen.tsx
// Location selection screen — placeholder showing 3 locations per planet.
// Clicking any location navigates to /select-crew (display-only, no sim effect).

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MapPin, CheckCircle } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { Card } from '@/components/common/Card'
import { SectionLabel } from '@/components/common/SectionLabel'
import { useMissionStore } from '@store/mission-store'

interface LocationSelectionScreenProps {}

// ── Location data ─────────────────────────────────────────────────────────────

interface Location {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly tags: readonly string[]
}

const MOON_LOCATIONS: readonly Location[] = [
  {
    id: 'shackleton-crater',
    name: 'Shackleton Crater',
    description: 'South Pole rim with near-permanent sunlight peaks and confirmed water-ice deposits nearby.',
    tags: ['Water Ice', 'High Sunlight', 'South Pole'],
  },
  {
    id: 'mare-tranquillitatis',
    name: 'Mare Tranquillitatis',
    description: 'The Sea of Tranquility — flat basalt plains where Apollo 11 landed. Good solar access.',
    tags: ['Flat Terrain', 'Historic', 'Equatorial'],
  },
  {
    id: 'aristarchus-plateau',
    name: 'Aristarchus Plateau',
    description: 'One of the most geologically active regions on the Moon with high mineral diversity.',
    tags: ['Minerals', 'Lava Tubes', 'Research'],
  },
]

const MARS_LOCATIONS: readonly Location[] = [
  {
    id: 'jezero-crater',
    name: 'Jezero Crater',
    description: 'Ancient lake bed explored by Perseverance Rover. Rich in carbonate minerals.',
    tags: ['Ancient Lake', 'Minerals', 'Rover Site'],
  },
  {
    id: 'olympus-mons',
    name: 'Olympus Mons',
    description: 'The largest volcano in the solar system. High altitude reduces radiation exposure.',
    tags: ['Low Radiation', 'High Altitude', 'Volcanic'],
  },
  {
    id: 'valles-marineris',
    name: 'Valles Marineris',
    description: 'Vast canyon system stretching 4,000 km. Potential for subsurface water and shelter.',
    tags: ['Canyon', 'Shelter', 'Water Signs'],
  },
]

// ── Location card ─────────────────────────────────────────────────────────────

interface LocationCardProps {
  readonly location: Location
  readonly isSelected: boolean
  readonly onSelect: (id: string) => void
}

function LocationCard({ location, isSelected, onSelect }: LocationCardProps): JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`Select ${location.name}`}
      onClick={() => onSelect(location.id)}
      className={`w-full text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal rounded-2xl ${
        isSelected
          ? 'ring-2 ring-spaceplus-accent-teal'
          : ''
      }`}
    >
      <Card accent={isSelected ? 'teal' : 'none'} className={isSelected ? 'shadow-cardHover' : ''}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`mt-0.5 flex-shrink-0 ${
                isSelected ? 'text-spaceplus-accent-teal' : 'text-spaceplus-text-muted'
              }`}
            >
              {isSelected ? (
                <CheckCircle size={22} weight="fill" aria-hidden="true" />
              ) : (
                <MapPin size={22} aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-display2 text-base font-bold text-spaceplus-text-heading truncate">
                {location.name}
              </h3>
              <p className="mt-1 text-sm text-spaceplus-text-secondary leading-snug">
                {location.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {location.tags.map((tag) => (
                  <span key={tag} className="sp-badge-teal text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </button>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function LocationSelectionScreen(_props: LocationSelectionScreenProps): JSX.Element {
  const navigate = useNavigate()
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

  const locations = selectedPlanetId === 'mars' ? MARS_LOCATIONS : MOON_LOCATIONS
  const planetLabel = selectedPlanetId === 'mars' ? 'Mars' : 'Moon'

  const canContinue = selectedLocationId !== null

  return (
    <AppShell title="ASTRA — Choose Your Landing Site" variant="light">
      <ScreenTransition routeKey="/select-location">
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center px-6 py-16">
          {/* ── Heading ── */}
          <div className="mb-10 text-center max-w-lg">
            <SectionLabel className="block mb-2">Step 2 of 4 — Landing Site</SectionLabel>
            <h2 className="font-display2 text-4xl font-extrabold text-spaceplus-text-heading sm:text-5xl">
              Choose Your Landing Site
            </h2>
            <p className="mt-3 text-lg text-spaceplus-text-secondary">
              Select a location on{' '}
              <span className="font-semibold text-spaceplus-accent-teal">{planetLabel}</span>{' '}
              for your base.
            </p>
          </div>

          {/* ── Location cards ── */}
          <div className="w-full max-w-lg flex flex-col gap-4">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                isSelected={selectedLocationId === location.id}
                onSelect={setSelectedLocationId}
              />
            ))}
          </div>

          {/* ── No selection note ── */}
          {selectedLocationId === null && (
            <p className="mt-8 text-sm text-spaceplus-text-muted" role="status">
              Select a landing site to continue.
            </p>
          )}

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
              onClick={() => navigate('/select-crew')}
              ariaLabel={
                canContinue
                  ? 'Continue to crew selection'
                  : 'Select a location to continue'
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
