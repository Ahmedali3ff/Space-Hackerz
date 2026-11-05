// tests/unit/components/AppShell.test.tsx
// Verifies AppShell renders children, hudSlot, and sr-only h1 when title provided.

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'

function renderShell(
  children: React.ReactNode = <div>Main content</div>,
  hudSlot?: React.ReactNode,
  title?: string,
): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <AppShell hudSlot={hudSlot} title={title}>
        {children}
      </AppShell>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('renders children', () => {
    renderShell()
    expect(screen.getByText('Main content')).toBeInTheDocument()
  })

  it('renders hudSlot content', () => {
    renderShell(
      <div>Main</div>,
      <span data-testid="hud-item">Mission Day 1</span>,
    )
    expect(screen.getByTestId('hud-item')).toBeInTheDocument()
    expect(screen.getByText('Mission Day 1')).toBeInTheDocument()
  })

  it('renders a visually-hidden h1 with title when title is provided', () => {
    renderShell(<div>Content</div>, undefined, 'ASTRA Mission Control')
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()
    expect(h1).toHaveTextContent('ASTRA Mission Control')
    expect(h1).toHaveClass('sr-only')
  })

  it('does not render an h1 when title is not provided', () => {
    renderShell()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('renders the reduce-motion toggle button', () => {
    renderShell()
    const toggleBtn = screen.getByRole('button', { name: /toggle reduced motion/i })
    expect(toggleBtn).toBeInTheDocument()
  })
})
