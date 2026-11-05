// src/components/layout/AppShell.tsx
// Full-height layout shell for every screen.
// ─ CSS starfield via layered radial-gradient (static when reducedMotion).
// ─ Top HUD bar: hudSlot on left, Reduce-Motion toggle on right.
// ─ Visually-hidden <h1> from title for screen-reader landmark.
// ─ Main content area: children.
// ─ variant='light' renders the Space+ light-theme shell (white bg, teal accent).

import type { ReactNode } from 'react'
import { Eye, EyeClosed } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type AppShellVariant = 'dark' | 'light'

interface AppShellProps {
  readonly children: ReactNode
  readonly hudSlot?: ReactNode
  readonly title?: string
  readonly variant?: AppShellVariant
}

// Star positions encoded as inline radial-gradient layers.
// These are static values — no JS randomisation so they are SSR-safe and
// consistent across renders.
const STARFIELD_STYLE: React.CSSProperties = {
  backgroundImage: [
    'radial-gradient(1px 1px at  8%  12%, rgba(234,241,250,0.90) 0%, transparent 100%)',
    'radial-gradient(1px 1px at 22%  35%, rgba(234,241,250,0.65) 0%, transparent 100%)',
    'radial-gradient(1.5px 1.5px at 37%  7%, rgba(234,241,250,0.80) 0%, transparent 100%)',
    'radial-gradient(1px 1px at 54%  48%, rgba(234,241,250,0.55) 0%, transparent 100%)',
    'radial-gradient(2px 2px at 66%  20%, rgba(234,241,250,0.70) 0%, transparent 100%)',
    'radial-gradient(1px 1px at 79%  63%, rgba(234,241,250,0.60) 0%, transparent 100%)',
    'radial-gradient(1.5px 1.5px at 91%  15%, rgba(234,241,250,0.85) 0%, transparent 100%)',
    'radial-gradient(1px 1px at 14%  80%, rgba(234,241,250,0.50) 0%, transparent 100%)',
    'radial-gradient(1px 1px at 43%  72%, rgba(234,241,250,0.45) 0%, transparent 100%)',
    'radial-gradient(1.5px 1.5px at 58%  88%, rgba(234,241,250,0.70) 0%, transparent 100%)',
    'radial-gradient(1px 1px at 72%  95%, rgba(234,241,250,0.55) 0%, transparent 100%)',
    'radial-gradient(2px 2px at 85%  42%, rgba(234,241,250,0.65) 0%, transparent 100%)',
    'radial-gradient(1px 1px at  3%  55%, rgba(234,241,250,0.40) 0%, transparent 100%)',
    'radial-gradient(1.5px 1.5px at 28%  91%, rgba(234,241,250,0.60) 0%, transparent 100%)',
    'radial-gradient(1px 1px at 96%  78%, rgba(234,241,250,0.75) 0%, transparent 100%)',
  ].join(', '),
}

export function AppShell({ children, hudSlot, title, variant = 'dark' }: AppShellProps): JSX.Element {
  const { reducedMotion, toggleReducedMotion } = useReducedMotion()

  const isLight = variant === 'light'

  // Dark: combine the star radial-gradients with a slow drift animation when
  // reduced-motion is off.
  const darkClass = reducedMotion
    ? 'bg-space-void'
    : 'bg-space-void animate-[drift_120s_linear_infinite]'

  // Light: plain surface background — no starfield
  const lightClass = 'bg-spaceplus-surface'

  const wrapperClass = `relative min-h-screen w-full ${isLight ? lightClass : darkClass}`

  // Header classes differ by variant
  const headerClass = isLight
    ? 'sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3 bg-spaceplus-card border-b border-spaceplus-border-light'
    : 'sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3 backdrop-blur-sm border-b border-border-subtle/60 bg-space-void/70'

  // Motion toggle classes differ by variant
  const toggleClass = isLight
    ? 'inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 rounded-xl border border-spaceplus-border-light px-3 text-sm text-spaceplus-text-secondary transition-colors hover:border-spaceplus-accent-teal/60 hover:text-spaceplus-text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal'
    : 'inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 rounded-xl border border-border-subtle px-3 text-sm text-text-secondary transition-colors hover:border-accent-orbit/60 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orbit'

  return (
    <div
      className={wrapperClass}
      style={isLight ? undefined : STARFIELD_STYLE}
    >
      {/* ── Top HUD bar ── */}
      <header className={headerClass}>
        {/* Left slot — caller can inject mission-day counter etc. */}
        <div className="flex items-center gap-4">{hudSlot}</div>

        {/* Right: Reduce-Motion toggle */}
        <button
          type="button"
          aria-label={`Toggle reduced motion — currently ${reducedMotion ? 'on' : 'off'}`}
          aria-pressed={reducedMotion}
          onClick={toggleReducedMotion}
          className={toggleClass}
        >
          {reducedMotion ? (
            <EyeClosed size={20} aria-hidden="true" />
          ) : (
            <Eye size={20} aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {reducedMotion ? 'Motion: Off' : 'Motion: On'}
          </span>
        </button>
      </header>

      {/* ── Screen-reader landmark ── */}
      {title !== undefined ? (
        <h1 className="sr-only">{title}</h1>
      ) : null}

      {/* ── Main content ── */}
      <main className="relative w-full">{children}</main>
    </div>
  )
}
