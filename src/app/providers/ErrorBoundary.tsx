// src/app/providers/ErrorBoundary.tsx
// Class-based error boundary. Catches render errors in any child component
// and shows a safe fallback so the rest of the app remains stable.
// NOTE: This is intentionally a class component — React does not expose
// getDerivedStateFromError / componentDidCatch to functional components.

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  readonly children: ReactNode
}

interface ErrorBoundaryState {
  readonly hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(_error: unknown, _info: ErrorInfo): void {
    // Intentionally empty — no raw error surfaced to console or UI.
    // If an error-reporting service is added in a future phase, wire it here.
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 bg-spaceplus-bg-app">
          <div className="text-6xl mb-2">🛸</div>
          <h1 className="text-2xl font-bold text-spaceplus-text-heading">Houston, we have a problem!</h1>
          <p className="text-spaceplus-text-secondary text-center max-w-md">
            Something unexpected happened and ASTRA needs to restart. 
            Your mission progress is saved locally and will be restored.
          </p>
          <button
            type="button"
            className="px-6 py-3 bg-spaceplus-teal hover:bg-spaceplus-teal/90 text-white font-bold rounded-xl transition-colors"
            onClick={() => {
              window.location.reload()
            }}
          >
            Reload ASTRA
          </button>
          <p className="text-xs text-spaceplus-text-muted mt-4">
            If this keeps happening, try clearing your browser cache.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
