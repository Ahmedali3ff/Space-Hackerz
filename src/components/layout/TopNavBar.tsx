// src/components/layout/TopNavBar.tsx
// Top navigation bar for Space+ screens.
// Left: Space+ logo/wordmark. Center: 4 nav tabs. Right: UserChip + motion toggle.

import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Eye, EyeClosed } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMissionProgressStore } from '@store/mission-progress-store'

type TopNavVariant = 'dark' | 'light'

interface StepIndicator {
  readonly current: number
  readonly total: number
}

interface TopNavBarProps {
  readonly title?: string
  readonly hudSlot?: ReactNode
  readonly stepIndicator?: StepIndicator
  readonly variant?: TopNavVariant
  readonly activeTab?: 'explorers' | 'mission' | 'discoveries' | 'spacecraft'
}

// Routes that count as "Mission Control" tab being active
const MISSION_ROUTES: readonly string[] = [
  '/',
  '/select-planet',
  '/select-location',
  '/select-crew',
  '/configure-base',
  '/mission',
  '/missions',
  '/campaign-map',
  '/game/campaign',
]

interface NavTabProps {
  readonly label: string
  readonly to: string
  readonly active: boolean
}

function NavTab({ label, to, active }: NavTabProps): JSX.Element {
  return (
    <NavLink
      to={to}
      className={`relative px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FC8C0] rounded-lg whitespace-nowrap ${
        active
          ? 'text-[#1FC8C0]'
          : 'text-[#6B7280] hover:text-[#1A1D2E]'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
      {active && (
        <span
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1FC8C0]"
          aria-hidden="true"
        />
      )}
    </NavLink>
  )
}

export function TopNavBar({
  title,
  hudSlot,
  stepIndicator,
  variant = 'light',
}: TopNavBarProps): JSX.Element {
  const { reducedMotion, toggleReducedMotion } = useReducedMotion()
  const location = useLocation()
  const commanderName = useMissionProgressStore((s) => s.commanderName)
  const currentLevel = useMissionProgressStore((s) => s.currentLevel)
  const commanderTitle = useMissionProgressStore((s) => s.commanderTitle)

  const isLight = variant === 'light'

  const barClass = isLight
    ? 'flex items-center gap-4 px-4 py-2 bg-white border-b border-[#E5E7EB]'
    : 'flex items-center gap-4 px-4 py-2 backdrop-blur-sm border-b border-[#E5E7EB]/60 bg-[#0D0F1A]/70'

  // Determine which tab is active
  const path = location.pathname
  const isMissionActive = MISSION_ROUTES.includes(path) ||
    path.startsWith('/select') ||
    path.startsWith('/configure') ||
    path.startsWith('/mission') ||
    path.startsWith('/debrief') ||
    path.startsWith('/game/') ||
    path.startsWith('/intro/') ||
    path.startsWith('/level-complete/') ||
    path.startsWith('/game-over/')
  const isDiscoveriesActive = path === '/discoveries' || path.startsWith('/discoveries')
  const isSpacecraftActive = path === '/spaceship' || path.startsWith('/spaceship')
  const isExplorersActive = path === '/explorers' || path.startsWith('/explorers')
  const isStarMapActive = path === '/star-map' || path.startsWith('/star-map')

  const displayName = commanderName.trim().length > 0 ? commanderName : null

  return (
    <nav className={`${barClass} sh-top-nav`} aria-label="Space Hackerz navigation">
      {/* ── Left: Logo + wordmark ── */}
      <NavLink
        to="/missions"
        className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FC8C0] rounded-lg flex-shrink-0"
        aria-label="Space Hackerz — missions overview"
      >
        <img className="sh-brand-logo" src="/assets/icons/space-hackerz-mark.svg" alt="" aria-hidden="true" />
        <span className="font-bold text-lg leading-none">
          {title !== undefined ? (
            <span className="text-[#1A1D2E]">{title}</span>
          ) : (
            <>
              <span className="text-[#12345A]">Space</span>
              <span className="text-[#11B8C5]"> HackerZ</span>
            </>
          )}
        </span>
      </NavLink>

      {/* ── Center: 4 nav tabs ── */}
      <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto scrollbar-none">
        <NavTab
          label="Explorers"
          to="/explorers"
          active={isExplorersActive}
        />
        <NavTab
          label="Mission Control"
          to="/missions"
          active={isMissionActive && !isExplorersActive && !isDiscoveriesActive && !isSpacecraftActive && !isStarMapActive}
        />
        <NavTab
          label="My Discoveries"
          to="/discoveries"
          active={isDiscoveriesActive}
        />
        <NavTab
          label="My Spaceship"
          to="/spaceship"
          active={isSpacecraftActive}
        />
      </div>

      {/* ── Right: optional hudSlot / step indicator + UserChip + motion toggle ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {hudSlot !== undefined ? (
          <div className="flex items-center gap-2">{hudSlot}</div>
        ) : null}

        {stepIndicator !== undefined ? (
          <span
            className="text-sm font-semibold text-[#6B7280]"
            aria-label={`Step ${stepIndicator.current} of ${stepIndicator.total}`}
          >
            {stepIndicator.current}/{stepIndicator.total}
          </span>
        ) : null}

        {/* UserChip — only shown when a commander name is set */}
        {displayName !== null ? (
          <div
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB]"
            aria-label={`${displayName}, Level ${currentLevel} · ${commanderTitle}`}
          >
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1FC8C0] font-bold text-white text-xs"
              aria-hidden="true"
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-bold text-[#1A1D2E]">{displayName}</span>
              <span className="text-[10px] text-[#6B7280]">
                Level {currentLevel} · {commanderTitle}
              </span>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          aria-label={`Toggle reduced motion — currently ${reducedMotion ? 'on' : 'off'}`}
          aria-pressed={reducedMotion}
          onClick={toggleReducedMotion}
          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-[#E5E7EB] px-2 text-sm text-[#6B7280] transition-colors hover:border-[#1FC8C0] hover:text-[#1A1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FC8C0]"
        >
          {reducedMotion ? (
            <EyeClosed size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
          <span className="hidden sm:inline text-xs ml-1">
            {reducedMotion ? 'Motion: Off' : 'Motion: On'}
          </span>
        </button>
      </div>
    </nav>
  )
}
