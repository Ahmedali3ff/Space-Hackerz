// tests/unit/components/ScreenTransition.test.tsx
// Verifies ScreenTransition renders its children.

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ScreenTransition } from '@/components/layout/ScreenTransition'

describe('ScreenTransition', () => {
  it('renders children', () => {
    render(
      <MemoryRouter>
        <ScreenTransition routeKey="test">
          <div>Screen content</div>
        </ScreenTransition>
      </MemoryRouter>,
    )
    expect(screen.getByText('Screen content')).toBeInTheDocument()
  })

  it('accepts a routeKey prop without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <ScreenTransition routeKey="planet-selection">
          <span data-testid="child">Planet Screen</span>
        </ScreenTransition>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(container).toBeTruthy()
  })
})
