// src/components/common/LoadingScreen.tsx
// Branded Suspense fallback — shown while lazy-loaded routes are loading.
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
      className="sh-loading-screen fixed inset-0 flex flex-col items-center justify-center"
      role="status"
    >
      <img
        src="/assets/icons/space-hackerz-mark.svg"
        alt=""
        width="96"
        height="96"
        className="sh-loading-mark"
        aria-hidden="true"
      />
      <span className="sh-loading-brand" aria-hidden="true">SPACE HACKERZ</span>
      <span className="sh-loading-subtitle" aria-hidden="true">MISSION CONTROL ONLINE</span>

      {/* Animated ring — static when reducedMotion */}
      <div className="mt-8" aria-hidden="true">
        {reducedMotion ? (
          <div className="sh-loading-spinner static" />
        ) : (
          <div className="sh-loading-spinner animate-spin" />
        )}
      </div>

      {/* Screen-reader text */}
      <span className="sr-only">Loading mission data...</span>
    </div>
  )
}
