// src/components/layout/AppShell.tsx
// Space+ light theme shell — #F4F7FA background, white header, teal accent.
// The 'variant' prop is kept for backward compatibility but light is now the
// only rendered style. All dark glassmorphic code has been removed.
import type { ReactNode } from 'react'
import { Eye, EyeClosed } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Kept for backward compat — all variants render light now
type AppShellVariant = 'dark' | 'light'

interface AppShellProps {
  readonly children: ReactNode
  readonly hudSlot?: ReactNode
  readonly title?: string
  readonly variant?: AppShellVariant
}

export function AppShell({ children, hudSlot, title }: AppShellProps): JSX.Element {
  const { reducedMotion, toggleReducedMotion } = useReducedMotion()

  return (
    <div className="relative min-h-screen w-full bg-[#F4F7FA]">
      {/* Top header bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-6 py-3">
        <div className="flex items-center gap-4">{hudSlot}</div>
        <button
          type="button"
          aria-label={`Toggle reduced motion — currently ${reducedMotion ? 'on' : 'off'}`}
          aria-pressed={reducedMotion}
          onClick={toggleReducedMotion}
          className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#6B7280] transition-colors hover:border-[#1FC8C0] hover:text-[#1A1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FC8C0]"
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

      {/* Screen-reader landmark */}
      {title !== undefined ? <h1 className="sr-only">{title}</h1> : null}

      {/* Main content */}
      <main className="relative w-full">{children}</main>
    </div>
  )
}
