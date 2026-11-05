// src/components/layout/TopNavBar.tsx
// Top navigation bar for Space+ light-variant screens.
// Renders the ASTRA rocket logo + wordmark on the left, an optional center
// hudSlot, and step indicator + reduced-motion toggle on the right.
// Uses NavLink from react-router-dom for accessible navigation.

import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Rocket } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Eye, EyeClosed } from '@phosphor-icons/react'

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
}

export function TopNavBar({
  title,
  hudSlot,
  stepIndicator,
  variant = 'light',
}: TopNavBarProps): JSX.Element {
  const { reducedMotion, toggleReducedMotion } = useReducedMotion()

  const isLight = variant === 'light'

  const barClass = isLight
    ? 'flex items-center justify-between gap-4 px-6 py-3 bg-spaceplus-card border-b border-spaceplus-border-light'
    : 'flex items-center justify-between gap-4 px-6 py-3 backdrop-blur-sm border-b border-border-subtle/60 bg-space-void/70'

  const logoTextClass = isLight
    ? 'font-display2 text-lg font-800 text-spaceplus-text-heading'
    : 'font-display text-lg font-bold text-text-primary'

  const toggleClass = isLight
    ? 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border border-spaceplus-border-light px-3 text-sm text-spaceplus-text-secondary transition-colors hover:border-spaceplus-accent-teal/60 hover:text-spaceplus-text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal'
    : 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border border-border-subtle px-3 text-sm text-text-secondary transition-colors hover:border-accent-orbit/60 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orbit'

  const stepClass = isLight
    ? 'text-sm font-600 text-spaceplus-text-secondary'
    : 'text-sm font-semibold text-text-secondary'

  return (
    <nav className={barClass} aria-label="Space+ navigation">
      {/* ── Left: Logo + wordmark ── */}
      <NavLink
        to="/"
        className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal rounded-lg"
        aria-label="Space+ — home"
      >
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full bg-spaceplus-accent-teal"
          aria-hidden="true"
        >
          <Rocket size={18} weight="fill" color="#fff" />
        </span>
        <span className={logoTextClass}>
          {title ?? <><span className="text-[#1A1D2E]">Space</span><span className="text-[#1FC8C0]">+</span></>}
        </span>
      </NavLink>

      {/* ── Center: optional hudSlot ── */}
      {hudSlot !== undefined ? (
        <div className="flex-1 flex items-center justify-center px-4">
          {hudSlot}
        </div>
      ) : null}

      {/* ── Right: step indicator + motion toggle ── */}
      <div className="flex items-center gap-3">
        {stepIndicator !== undefined ? (
          <span className={stepClass} aria-label={`Step ${stepIndicator.current} of ${stepIndicator.total}`}>
            {stepIndicator.current}/{stepIndicator.total}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={`Toggle reduced motion — currently ${reducedMotion ? 'on' : 'off'}`}
          aria-pressed={reducedMotion}
          onClick={toggleReducedMotion}
          className={toggleClass}
        >
          {reducedMotion ? (
            <EyeClosed size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
          <span className="hidden sm:inline text-xs">
            {reducedMotion ? 'Motion: Off' : 'Motion: On'}
          </span>
        </button>
      </div>
    </nav>
  )
}
