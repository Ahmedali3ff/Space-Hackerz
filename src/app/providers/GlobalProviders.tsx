// src/app/providers/GlobalProviders.tsx
// Top-level provider wrapper. Composes all application-level providers so
// App.tsx remains clean. Add future providers (theme, i18n, etc.) here.

import type { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { useEffect } from 'react'
import { usePreferencesStore } from '@store/preferences-store'

interface GlobalProvidersProps {
  readonly children: ReactNode
}

export function GlobalProviders({ children }: GlobalProvidersProps): JSX.Element {
  const language = usePreferencesStore((state) => state.language)
  const theme = usePreferencesStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dataset.theme = theme
  }, [language, theme])

  return <ErrorBoundary>{children}</ErrorBoundary>
}
