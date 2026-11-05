// src/app/providers/GlobalProviders.tsx
// Top-level provider wrapper. Composes all application-level providers so
// App.tsx remains clean. Add future providers (theme, i18n, etc.) here.

import type { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

interface GlobalProvidersProps {
  readonly children: ReactNode
}

export function GlobalProviders({ children }: GlobalProvidersProps): JSX.Element {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
