// src/features/mission-control/MissionControlDashboardScreen.tsx
// Space Hackerz — Mission Control hub shown BETWEEN missions.
// Full-screen dark space theme with sidebar nav, resource overview,
// planet selector, and launch button.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMissionStore } from '@store/mission-store'
import { useMissionProgressStore } from '@store/mission-progress-store'
import type { PlanetId } from '@simulation/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type SidebarTab = 'mission' | 'resources' | 'achievements' | 'settings'
type PlanetSelection = 'moon' | 'mars'

interface SidebarItem {
  readonly id: SidebarTab
  readonly emoji: string
  readonly label: string
}

interface ResourceRow {
  readonly emoji: string
  readonly label: string
  readonly key: 'water' | 'food' | 'oxygen' | 'energy'
  readonly color: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { id: 'mission',      emoji: '🚀', label: 'Mission'  },
  { id: 'resources',    emoji: '📦', label: 'Resources' },
  { id: 'achievements', emoji: '🏆', label: 'Achieve'   },
  { id: 'settings',     emoji: '⚙️',  label: 'Settings'  },
]

const RESOURCE_ROWS: readonly ResourceRow[] = [
  { emoji: '💧', label: 'Water',   key: 'water',   color: '#3B9BFF' },
  { emoji: '🍽️', label: 'Food',    key: 'food',    color: '#4CAF50' },
  { emoji: '🫁', label: 'Oxygen',  key: 'oxygen',  color: '#A855F7' },
  { emoji: '⚡',  label: 'Energy',  key: 'energy',  color: '#FFB800' },
]

const PLACEHOLDER_RESOURCES: Record<ResourceRow['key'], number> = {
  water:   80,
  food:    70,
  oxygen:  90,
  energy:  75,
}

const PLANET_ID_MAP: Record<PlanetSelection, PlanetId> = {
  moon: 'moon',
  mars: 'mars',
}

const PLANET_LABEL: Record<PlanetSelection, string> = {
  moon: '🌙 The Moon',
  mars: '🔴 Mars',
}

const PLANETS: readonly PlanetSelection[] = ['moon', 'mars']

// ── Helper ────────────────────────────────────────────────────────────────────

/** Derive a 0–100 display percentage from a raw resource value.
 *  The raw values are kg / kWh; we cap at 100 for display purposes. */
function toPercent(raw: number): number {
  return Math.min(100, Math.max(0, Math.round(raw)))
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MissionControlDashboardScreen(): JSX.Element {
  const navigate = useNavigate()

  // ── Sidebar tab state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<SidebarTab>('mission')

  // ── Planet selection state ─────────────────────────────────────────────────
  const storedPlanetId = useMissionStore((s) => s.selectedPlanetId)
  const selectPlanet   = useMissionStore((s) => s.selectPlanet)
  const missionActive  = useMissionStore((s) => s.missionActive)
  const currentResources = useMissionStore((s) => s.currentResources)

  // Derive initial planet selection from store or default to moon
  const initialPlanet: PlanetSelection =
    storedPlanetId === 'mars' ? 'mars' : 'moon'
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetSelection>(initialPlanet)

  // ── Progress store ─────────────────────────────────────────────────────────
  const totalStars = useMissionProgressStore((s) => s.totalStars)

  // ── Resource display values ────────────────────────────────────────────────
  // If mission is active and we have real resources, derive from them.
  // Otherwise show placeholder percentages.
  const resourceValues: Record<ResourceRow['key'], number> = (() => {
    if (missionActive && currentResources !== null) {
      return {
        water:   toPercent(currentResources.water_kg   / 10),
        food:    toPercent(currentResources.food_kg    / 10),
        oxygen:  toPercent(currentResources.oxygen_kg  / 10),
        energy:  toPercent(currentResources.energy_kWh / 10),
      }
    }
    return PLACEHOLDER_RESOURCES
  })()

  // ── Planet cycle handlers ──────────────────────────────────────────────────
  function cyclePlanet(direction: 'prev' | 'next'): void {
    const currentIndex = PLANETS.indexOf(selectedPlanet)
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % PLANETS.length
        : (currentIndex - 1 + PLANETS.length) % PLANETS.length
    const next = PLANETS[nextIndex]
    setSelectedPlanet(next)
    selectPlanet(PLANET_ID_MAP[next])
  }

  // ── Launch handler ─────────────────────────────────────────────────────────
  function handleLaunch(): void {
    // Ensure the planet is set in the store before navigating
    selectPlanet(PLANET_ID_MAP[selectedPlanet])
    navigate('/game/level-1')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="sh-bg"
      style={{
        display:       'flex',
        flexDirection: 'column',
        width:         '100vw',
        height:        '100vh',
        fontFamily:    "'Nunito', sans-serif",
        overflow:      'hidden',
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <TopBar totalStars={totalStars} />

      {/* ── Body (sidebar + main) ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Left sidebar ──────────────────────────────────────────────── */}
        <LeftSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Main content ──────────────────────────────────────────────── */}
        <main
          style={{
            flex:       1,
            overflowY:  'auto',
            padding:    '24px',
            display:    'flex',
            alignItems: 'flex-start',
          }}
        >
          <div
            className="sh-card"
            style={{
              position: 'relative',
              padding:  '24px',
              width:    '100%',
              maxWidth: '700px',
              margin:   '0 auto',
            }}
          >
            {/* Mission Overview heading */}
            <MissionOverviewSection selectedPlanet={selectedPlanet} />

            {/* Divider */}
            <div
              style={{
                height:     '1px',
                background: 'rgba(59,111,232,0.2)',
                margin:     '20px 0',
              }}
            />

            {/* Resources */}
            <ResourcesSection resourceValues={resourceValues} />

            {/* Planet selector */}
            <PlanetSelector
              selectedPlanet={selectedPlanet}
              onCycle={cyclePlanet}
            />

            {/* Launch button */}
            <button
              className="sh-btn-gold"
              style={{
                width:      '100%',
                height:     '56px',
                fontSize:   '18px',
                marginTop:  '24px',
              }}
              onClick={handleLaunch}
              type="button"
            >
              🚀 Launch Mission
            </button>

            {/* Robot illustration */}
            <RobotIllustration />
          </div>
        </main>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface TopBarProps {
  readonly totalStars: number
}

function TopBar({ totalStars }: TopBarProps): JSX.Element {
  return (
    <header
      style={{
        height:       '64px',
        background:   '#050A1A',
        borderBottom: '1px solid rgba(59,111,232,0.2)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
        padding:      '0 24px',
        flexShrink:   0,
        zIndex:       10,
      }}
    >
      {/* Left: NASA logo + Mission Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            fontFamily:  'Georgia, serif',
            fontWeight:  'bold',
            color:       '#CC0000',
            fontSize:    '20px',
            letterSpacing: '0.05em',
          }}
        >
          NASA
        </span>
        <div
          style={{
            width:      '1px',
            height:     '24px',
            background: 'rgba(255,255,255,0.3)',
          }}
        />
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            color:      'white',
            fontSize:   '18px',
          }}
        >
          Mission Control
        </span>
      </div>

      {/* Right: stars + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Score */}
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '6px',
            color:      '#FFB800',
            fontWeight: 700,
            fontSize:   '16px',
          }}
        >
          <span>⭐</span>
          <span style={{ color: 'white' }}>{totalStars}</span>
        </div>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width:        '40px',
              height:       '40px',
              borderRadius: '50%',
              background:   'linear-gradient(135deg, #3B6FE8, #00D4FF)',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              color:        'white',
              fontWeight:   700,
              fontSize:     '18px',
              flexShrink:   0,
            }}
          >
            S
          </div>
          <span
            style={{
              color:      'white',
              fontSize:   '14px',
              fontWeight: 600,
            }}
          >
            Space Explorer
          </span>
        </div>
      </div>
    </header>
  )
}

interface LeftSidebarProps {
  readonly activeTab: SidebarTab
  readonly onTabChange: (tab: SidebarTab) => void
}

function LeftSidebar({ activeTab, onTabChange }: LeftSidebarProps): JSX.Element {
  return (
    <nav
      style={{
        width:      '72px',
        background: '#0A1628',
        flexShrink: 0,
        display:    'flex',
        flexDirection: 'column',
        paddingTop: '8px',
        borderRight: '1px solid rgba(59,111,232,0.15)',
      }}
    >
      {SIDEBAR_ITEMS.map((item) => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            style={{
              width:            '100%',
              height:           '64px',
              display:          'flex',
              flexDirection:    'column',
              alignItems:       'center',
              justifyContent:   'center',
              gap:              '4px',
              background:       isActive ? 'rgba(59,111,232,0.2)' : 'transparent',
              border:           'none',
              borderLeft:       isActive ? '3px solid #3B6FE8' : '3px solid transparent',
              cursor:           'pointer',
              transition:       'all 0.15s',
              padding:          0,
            }}
          >
            <span style={{ fontSize: '24px', lineHeight: 1 }}>{item.emoji}</span>
            <span
              style={{
                fontSize:   '9px',
                color:      '#7EB8F7',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

interface MissionOverviewSectionProps {
  readonly selectedPlanet: PlanetSelection
}

function MissionOverviewSection({ selectedPlanet }: MissionOverviewSectionProps): JSX.Element {
  const [showTooltip, setShowTooltip] = useState(false)
  const locationLabel = selectedPlanet === 'moon' ? 'the Moon' : 'Mars'

  return (
    <div>
      {/* Heading row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <h2
          style={{
            color:      'white',
            fontSize:   '20px',
            fontWeight: 700,
            margin:     0,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Mission Overview
        </h2>
        {/* Info icon */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            style={{
              background:   'none',
              border:       'none',
              cursor:       'pointer',
              fontSize:     '18px',
              lineHeight:   1,
              padding:      0,
              color:        '#7EB8F7',
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label="About this mission"
          >
            ℹ️
          </button>
          {showTooltip && (
            <div
              role="tooltip"
              style={{
                position:     'absolute',
                left:         '24px',
                top:          '-8px',
                background:   '#1E3A6E',
                color:        'white',
                fontSize:     '12px',
                padding:      '6px 10px',
                borderRadius: '8px',
                whiteSpace:   'nowrap',
                zIndex:       100,
                border:       '1px solid rgba(59,111,232,0.4)',
              }}
            >
              About this mission
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          color:      '#7EB8F7',
          fontSize:   '14px',
          margin:     0,
          fontFamily: "'Nunito', sans-serif",
          lineHeight: 1.6,
        }}
      >
        Build and maintain your base on {locationLabel}. Manage your resources and face challenges!
      </p>
    </div>
  )
}

interface ResourcesSectionProps {
  readonly resourceValues: Record<ResourceRow['key'], number>
}

function ResourcesSection({ resourceValues }: ResourcesSectionProps): JSX.Element {
  return (
    <div>
      <h3
        style={{
          color:      'white',
          fontSize:   '16px',
          fontWeight: 700,
          margin:     '0 0 16px 0',
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        Resources
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {RESOURCE_ROWS.map((row) => {
          const pct = resourceValues[row.key]
          return (
            <div
              key={row.key}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '10px',
              }}
            >
              {/* Emoji */}
              <span style={{ fontSize: '24px', lineHeight: 1, flexShrink: 0 }}>{row.emoji}</span>

              {/* Label */}
              <span
                style={{
                  color:      'white',
                  fontSize:   '14px',
                  minWidth:   '80px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {row.label}
              </span>

              {/* Progress bar */}
              <div className="sh-resource-bar" style={{ flex: 1 }}>
                <div
                  className="sh-resource-bar-fill"
                  style={{
                    width:      `${pct}%`,
                    background: row.color,
                  }}
                />
              </div>

              {/* Percentage */}
              <span
                style={{
                  color:      'white',
                  fontSize:   '14px',
                  fontWeight: 700,
                  minWidth:   '40px',
                  textAlign:  'right',
                  fontFamily: "'Nunito', sans-serif",
                  flexShrink: 0,
                }}
              >
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface PlanetSelectorProps {
  readonly selectedPlanet: PlanetSelection
  readonly onCycle: (direction: 'prev' | 'next') => void
}

function PlanetSelector({ selectedPlanet, onCycle }: PlanetSelectorProps): JSX.Element {
  return (
    <div
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        marginTop:       '24px',
      }}
    >
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '16px',
          background:   'rgba(59,111,232,0.1)',
          border:       '1px solid rgba(59,111,232,0.3)',
          borderRadius: '9999px',
          padding:      '8px 20px',
        }}
      >
        <button
          type="button"
          onClick={() => onCycle('prev')}
          aria-label="Previous planet"
          style={{
            background:  'none',
            border:      'none',
            color:       '#7EB8F7',
            fontSize:    '18px',
            cursor:      'pointer',
            padding:     '0 4px',
            lineHeight:  1,
            fontWeight:  700,
          }}
        >
          {'<'}
        </button>

        <span
          style={{
            color:      'white',
            fontSize:   '16px',
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            minWidth:   '100px',
            textAlign:  'center',
          }}
        >
          {PLANET_LABEL[selectedPlanet]}
        </span>

        <button
          type="button"
          onClick={() => onCycle('next')}
          aria-label="Next planet"
          style={{
            background:  'none',
            border:      'none',
            color:       '#7EB8F7',
            fontSize:    '18px',
            cursor:      'pointer',
            padding:     '0 4px',
            lineHeight:  1,
            fontWeight:  700,
          }}
        >
          {'>'}
        </button>
      </div>
    </div>
  )
}

function RobotIllustration(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      style={{
        position:  'absolute',
        bottom:    '16px',
        right:     '16px',
        fontSize:  '64px',
        animation: 'sh-float 3s ease-in-out infinite',
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      🤖
    </div>
  )
}
