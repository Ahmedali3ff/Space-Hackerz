// src/components/common/LoadingScreen.tsx
// Branded Suspense fallback — shown while lazy-loaded routes are loading.
// Respects prefers-reduced-motion: spinner is static when reduced motion is on.

export function LoadingScreen(): JSX.Element {
  // Route chunks are lazy-loaded, but the transition must stay visually quiet.
  // The previous branded spinner made every navigation feel like a separate load.
  return <div aria-hidden="true" className="sh-loading-silent fixed inset-0" />
}
