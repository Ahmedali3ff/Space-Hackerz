// src/features/location-selection/LocationSelectionScreen.tsx
// Location selection screen — shows 3 landing sites per planet.
// Clicking a location card persists the selection into mission-store via
// setSelectedLocation, which is wired into the simulation engine at init time.

import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MapPin, CheckCircle } from '@phosphor-icons/react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { Card } from '@/components/common/Card'
import { SectionLabel } from '@/components/common/SectionLabel'
import { useMissionStore } from '@store/mission-store'
import { MOON_LOCATIONS, MARS_LOCATIONS } from '@/data/locations'
import type { LandingLocation } from '@/data/locations'

interface LocationSelectionScreenProps {}

// ── Location card ─────────────────────────────────────────────────────────────

interface LocationCardProps {
  readonly location: LandingLocation
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
      className={`w-full text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FC8C0] rounded-2xl ${
        isSelected ? 'ring-2 ring-[#1FC8C0]' : ''
      }`}
    >
      <Card accent={isSelected ? 'teal' : 'none'} className={isSelected ? 'shadow-cardHover' : ''}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Planet emoji icon */}
            <div className="mt-0.5 flex-shrink-0 text-2xl" aria-hidden="true">
              {location.imageEmoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#1A1D2E] truncate">
                  {location.name}
                </h3>
                {isSelected && (
                  <CheckCircle
                    size={18}
                    weight="fill"
                    className="text-[#1FC8C0] shrink-0"
                    aria-hidden="true"
                  />
                )}
              </div>
              <p className="mt-1 text-sm text-[#6B7280] leading-snug">
                {location.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {location.highlights.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-[#E8FAF9] px-2.5 py-0.5 text-xs font-semibold text-[#1FC8C0]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {!isSelected && (
            <MapPin
              size={20}
              className="shrink-0 mt-1 text-[#9CA3AF]"
              aria-hidden="true"
            />
          )}
        </div>
      </Card>
    </button>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function LocationSelectionScreen(_props: LocationSelectionScreenProps): JSX.Element {
  const navigate = useNavigate()
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const selectedLocationId = useMissionStore((s) => s.selectedLocationId)
  const setSelectedLocation = useMissionStore((s) => s.setSelectedLocation)

  const locations = selectedPlanetId === 'mars' ? MARS_LOCATIONS : MOON_LOCATIONS
  const planetLabel = selectedPlanetId === 'mars' ? 'Mars' : 'Moon'

  const canContinue = selectedLocationId !== null

  return (
    <AppShell title="Choose Your Landing Site" variant="light">
      <ScreenTransition routeKey="/select-location">
        <div className="flex min-h-[calc(100vh-65px)] flex-col items-center px-6 py-16">
          {/* ── Heading ── */}
          <div className="mb-10 text-center max-w-lg">
            <SectionLabel className="block mb-2">Step 2 of 4 — Landing Site</SectionLabel>
            <h2 className="text-4xl font-extrabold text-[#1A1D2E] sm:text-5xl">
              Choose Your Landing Site
            </h2>
            <p className="mt-3 text-lg text-[#6B7280]">
              Select a location on{' '}
              <span className="font-semibold text-[#1FC8C0]">{planetLabel}</span>{' '}
              for your base. Each site has unique conditions.
            </p>
          </div>

          {/* ── Location cards ── */}
          <div className="w-full max-w-lg flex flex-col gap-4">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                isSelected={selectedLocationId === location.id}
                onSelect={setSelectedLocation}
              />
            ))}
          </div>

          {/* ── No selection note ── */}
          {selectedLocationId === null && (
            <p className="mt-8 text-sm text-[#9CA3AF]" role="status">
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
