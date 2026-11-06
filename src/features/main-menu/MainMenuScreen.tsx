// src/features/main-menu/MainMenuScreen.tsx
// Space Hackerz — pixel-perfect main menu screen.
// Dark space navy background with animated star particles (sh-bg global class).
// Features Earth/Moon CSS spheres, animated logo with orbit ring, planet picker,
// NasaKidAstronaut mascot, and a rocket launchpad illustration.

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMissionStore } from '@store/mission-store'
import { NasaKidAstronaut } from '@/components/game/NasaKidAstronaut'
import { HowToPlayModal } from './HowToPlayModal'
import type { PlanetId } from '@simulation/types'

// ── Keyframe injection (orbit ring animation) ─────────────────────────────────
// Inlined via a <style> tag so no build-step changes are needed.
const ORBIT_RING_CSS = `
@keyframes sh-orbit-ring {
  from { transform: rotate(-15deg) scaleX(1.5); }
  to   { transform: rotate(345deg) scaleX(1.5); }
}
`

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Large Earth sphere — left background */
function EarthSphere({ size, style }: { readonly size: number; readonly style?: React.CSSProperties }): JSX.Element {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #4A90D9, #1E3A8A 60%, #0A1628)',
        boxShadow: '0 0 60px rgba(74,144,217,0.5)',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

/** Moon sphere */
function MoonSphere({ size, style }: { readonly size: number; readonly style?: React.CSSProperties }): JSX.Element {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #D1D5DB, #9CA3AF 60%, #4B5563)',
        boxShadow: '0 0 20px rgba(209,213,219,0.35)',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

/** CSS rocket launchpad illustration */
function RocketLaunchpad(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: '18%',
        bottom: '5%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}
    >
      {/* Cone (triangle pointing up) */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '20px solid white',
        }}
      />
      {/* Body */}
      <div
        style={{
          width: 16,
          height: 60,
          background: 'white',
          borderRadius: '0 0 3px 3px',
        }}
      />
      {/* Flame glow */}
      <div
        style={{
          width: 24,
          height: 14,
          marginTop: -2,
          borderRadius: '0 0 12px 12px',
          background: 'radial-gradient(ellipse at 50% 0%, #FF6B00 0%, rgba(255,107,0,0) 80%)',
          opacity: 0.85,
          animation: 'sh-float 0.6s ease-in-out infinite alternate',
        }}
      />
    </div>
  )
}

// ── Planet pill button ─────────────────────────────────────────────────────────

interface PlanetPillProps {
  readonly label: string
  readonly value: PlanetId
  readonly selected: boolean
  readonly onClick: () => void
}

function PlanetPill({ label, value, selected, onClick }: PlanetPillProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Select ${value}`}
      style={{
        padding: '8px 22px',
        borderRadius: 9999,
        border: selected ? '2px solid #3B6FE8' : '2px solid rgba(59,111,232,0.5)',
        background: selected ? '#3B6FE8' : 'transparent',
        color: selected ? '#FFFFFF' : '#7EB8F7',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: 'Nunito, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

export function MainMenuScreen(): JSX.Element {
  const navigate = useNavigate()
  const selectedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const selectPlanet = useMissionStore((s) => s.selectPlanet)

  const [showHowToPlay, setShowHowToPlay] = useState(false)

  // Resolve local display state — default to 'moon' before store is set
  const activePlanet: PlanetId = selectedPlanetId ?? 'moon'

  // On mount: set default planet if not yet chosen
  useEffect(() => {
    if (selectedPlanetId === null) {
      selectPlanet('moon')
    }
  }, [selectedPlanetId, selectPlanet])

  function handleSelectPlanet(id: PlanetId): void {
    selectPlanet(id)
  }

  function handleStartMission(): void {
    // Ensure planet is committed to store
    if (selectedPlanetId === null) {
      selectPlanet(activePlanet)
    }
    navigate('/configure-base')
  }

  return (
    <>
      {/* Inject orbit-ring keyframe once */}
      <style>{ORBIT_RING_CSS}</style>

      {/* Full-screen dark space background */}
      <div
        className="sh-bg"
        style={{
          minHeight: '100vh',
          width: '100%',
          background: 'radial-gradient(ellipse at 30% 50%, #0A1628 0%, #050A1A 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* ── Top-right icon buttons (Settings + Help) ── */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            display: 'flex',
            gap: 10,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => navigate('/missions')}
            aria-label="Settings"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#1E3A6E',
              border: '1px solid rgba(59,111,232,0.4)',
              color: 'white',
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⚙️
          </button>
          <button
            onClick={() => setShowHowToPlay(true)}
            aria-label="How to Play"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#1E3A6E',
              border: '1px solid rgba(59,111,232,0.4)',
              color: 'white',
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ❓
          </button>
        </div>

        {/* ── Left background: large Earth sphere ── */}
        <EarthSphere
          size={240}
          style={{
            position: 'absolute',
            left: '5%',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 0,
          }}
        />

        {/* ── Upper-center: small Moon sphere ── */}
        <MoonSphere
          size={80}
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 0,
          }}
        />

        {/* ── Right background: small second Earth sphere ── */}
        <EarthSphere
          size={100}
          style={{
            position: 'absolute',
            right: '2%',
            top: '30%',
            zIndex: 0,
            boxShadow: '0 0 30px rgba(74,144,217,0.4)',
          }}
        />

        {/* ── Rocket launchpad ── */}
        <RocketLaunchpad />

        {/* ── NasaKidAstronaut mascot ── */}
        <div
          style={{
            position: 'absolute',
            right: '10%',
            bottom: '10%',
            zIndex: 2,
          }}
        >
          <NasaKidAstronaut pose="standing" size={220} />
        </div>

        {/* ── Main center content ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: 480,
            width: '90%',
          }}
        >
          {/* Logo + orbit ring container */}
          <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Orbit ring behind the logo */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginLeft: -40,
                marginTop: -12,
                width: 80,
                height: 24,
                border: '2px solid rgba(0,212,255,0.5)',
                borderRadius: '50%',
                zIndex: -1,
                animation: 'sh-orbit-ring 8s linear infinite',
              }}
            />

            {/* Logo text */}
            <div
              style={{
                lineHeight: 1.1,
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: '#FFFFFF',
                  fontFamily: 'Nunito, sans-serif',
                  textShadow: '0 0 40px rgba(0,212,255,0.6), 0 2px 8px rgba(0,0,0,0.8)',
                  lineHeight: 1.05,
                }}
              >
                Space
              </div>
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: '#FFFFFF',
                  fontFamily: 'Nunito, sans-serif',
                  textShadow: '0 0 40px rgba(0,212,255,0.6), 0 2px 8px rgba(0,0,0,0.8)',
                  lineHeight: 1.05,
                }}
              >
                Hackerz{' '}
                <span role="img" aria-label="rocket">🚀</span>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <p
            style={{
              marginTop: 8,
              fontSize: 18,
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '0.05em',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            Explore • Learn • Survive
          </p>

          {/* Sub-tagline */}
          <p
            style={{
              marginTop: 4,
              fontSize: 14,
              color: '#7EB8F7',
              fontFamily: 'Nunito, sans-serif',
              textAlign: 'center',
              maxWidth: 360,
            }}
          >
            Your mission: build a sustainable base on the Moon or Mars!
          </p>

          {/* Start Your Mission button */}
          <button
            onClick={handleStartMission}
            className="sh-btn-gold"
            style={{
              width: 320,
              height: 56,
              fontSize: 18,
              marginTop: 24,
            }}
          >
            Start Your Mission ▶
          </button>

          {/* Planet destination selector card */}
          <div
            style={{
              marginTop: 16,
              background: 'rgba(13,27,62,0.9)',
              border: '1px solid rgba(59,111,232,0.3)',
              borderRadius: 16,
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              maxWidth: 340,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: '#7EB8F7',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                margin: 0,
              }}
            >
              Choose your destination:
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <PlanetPill
                label="🌙 The Moon"
                value="moon"
                selected={activePlanet === 'moon'}
                onClick={() => handleSelectPlanet('moon')}
              />
              <PlanetPill
                label="🔴 Mars"
                value="mars"
                selected={activePlanet === 'mars'}
                onClick={() => handleSelectPlanet('mars')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* How to Play modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </>
  )
}
