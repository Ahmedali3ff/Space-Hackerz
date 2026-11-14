// src/components/layout/AppShell.tsx
// Space+ light theme shell — #F4F7FA background, white header with TopNavBar.
// The 'hudSlot' prop is forwarded to TopNavBar for Mission Control's controls.
// All variants now render the same light style.

import type { ReactNode } from 'react'
import { TopNavBar } from '@/components/layout/TopNavBar'

// Kept for backward compat — all variants render light now
type AppShellVariant = 'dark' | 'light'

interface AppShellProps {
  readonly children: ReactNode
  readonly hudSlot?: ReactNode
  readonly title?: string
  readonly variant?: AppShellVariant
}

export function AppShell({ children, hudSlot, title }: AppShellProps): JSX.Element {
  return (
    <div className="sh-site-shell relative min-h-screen w-full">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-30 sh-site-header">
        <TopNavBar hudSlot={hudSlot} />
      </header>

      {/* Screen-reader page title */}
      {title !== undefined ? <h1 className="sr-only">{title}</h1> : null}

      {/* Main content */}
      <main className="relative w-full">{children}</main>
    </div>
  )
}
