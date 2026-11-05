// src/components/common/LoadingScreen.tsx
// Branded Suspense fallback — shown while lazy-loaded routes are loading.
// Migrated to Space+ light theme: #F4F7FA background, teal #1FC8C0.
// Respects prefers-reduced-motion: spinner is static when reduced motion is on.

import { useEffect, useState } from 'react'

function useReducedMotionMediaQuery(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent): void => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

export function LoadingScreen(): JSX.Element {
  const reducedMotion = useReducedMotionMediaQuery()

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#F4F7FA]"
      role="status"
    >
      {/* ASTRA wordmark */}
      <span
        className="font-display2 text-5xl font-bold tracking-widest text-spaceplus-accent-teal"
        aria-hidden="true"
      >
        ASTRA
      </span>

      {/* Animated ring — static when reducedMotion */}
      <div className="mt-8" aria-hidden="true">
        {reducedMotion ? (
          <div className="h-10 w-10 rounded-full border-2 border-spaceplus-accent-teal opacity-60" />
        ) : (
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-spaceplus-border-light border-t-spaceplus-accent-teal" />
        )}
      </div>

      {/* Screen-reader text */}
      <span className="sr-only">Loading mission data...</span>
    </div>
  )
}
