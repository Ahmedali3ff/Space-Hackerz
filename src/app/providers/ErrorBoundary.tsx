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
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
          <h1 className="text-2xl font-bold text-red-600">Something went wrong.</h1>
          <p className="text-gray-600">Please refresh the page.</p>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              window.location.reload()
            }}
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
