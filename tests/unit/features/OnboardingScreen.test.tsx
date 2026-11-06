// tests/unit/features/OnboardingScreen.test.tsx
// Verifies OnboardingScreen renders correctly and the CTA navigates.

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen'

// Mock useNavigate so we can assert navigation without a real router
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderScreen(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <OnboardingScreen />
    </MemoryRouter>,
  )
}

describe('OnboardingScreen', () => {
  it('renders the Space+ title', () => {
    renderScreen()
    // The onboarding h2 contains 'Space' text — use getAllByText since the
    // TopNavBar logo also renders a 'Space' text node in the same document.
    const spaceElements = screen.getAllByText('Space')
    expect(spaceElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the tagline', () => {
    renderScreen()
    // Tagline appears in the onboarding card — use getAllByText to handle
    // potential duplicates from navigation re-renders.
    expect(screen.getAllByText(/Explore/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Survive/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Learn/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders a Begin Mission button', () => {
    renderScreen()
    const btn = screen.getByRole('button', { name: /Begin Mission/i })
    expect(btn).toBeInTheDocument()
  })

  it('navigates to /select-planet when Begin Mission is clicked', () => {
    mockNavigate.mockClear()
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /Begin Mission/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/select-planet')
  })

  it('renders a visually-hidden h1 for screen readers', () => {
    renderScreen()
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveClass('sr-only')
    expect(h1).toHaveTextContent('Space Hackerz Mission Control')
  })
})
