// tests/unit/components/AstroPanel.test.tsx
// Verifies AstroPanel renders messages, typing indicator, and ask buttons.

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AstroPanel } from '@/components/feedback/AstroPanel'
import type { AstroResponse } from '@ai/schemas/astro-response.schema'

const mockMessages: AstroResponse[] = [
  {
    explanation: 'Your oxygen levels are holding steady.',
    scienceFact: 'Humans need about 0.84 kg of oxygen per day.',
    suggestion: 'Keep your life support running at full efficiency.',
    isGrounded: true,
  },
]

function renderPanel(
  messages: readonly AstroResponse[] = [],
  isLoading = false,
  onAsk = vi.fn(),
): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <AstroPanel
        messages={messages}
        isLoading={isLoading}
        onAsk={onAsk}
        reducedMotion={true} // use instant mode for deterministic tests
      />
    </MemoryRouter>,
  )
}

describe('AstroPanel', () => {
  it('renders the Astro-AI panel heading', () => {
    renderPanel()
    expect(screen.getByText('Astro-AI')).toBeInTheDocument()
  })

  it('shows empty state text when no messages', () => {
    renderPanel()
    expect(screen.getByText(/ask me anything/i)).toBeInTheDocument()
  })

  it('renders message explanation text', () => {
    renderPanel(mockMessages)
    expect(
      screen.getByText('Your oxygen levels are holding steady.'),
    ).toBeInTheDocument()
  })

  it('renders scienceFact when present', () => {
    renderPanel(mockMessages)
    expect(
      screen.getByText(/Humans need about 0\.84 kg of oxygen per day\./i),
    ).toBeInTheDocument()
  })

  it('renders suggestion when present', () => {
    renderPanel(mockMessages)
    expect(
      screen.getByText(/Keep your life support running at full efficiency\./i),
    ).toBeInTheDocument()
  })

  it('shows typing indicator when isLoading is true', () => {
    renderPanel([], true)
    expect(screen.getByText(/Astro-AI is thinking/i)).toBeInTheDocument()
  })

  it('renders all five ask buttons', () => {
    renderPanel()
    expect(screen.getByText('Explain Situation')).toBeInTheDocument()
    expect(screen.getByText('O₂ Status')).toBeInTheDocument()
    expect(screen.getByText('Water Status')).toBeInTheDocument()
    expect(screen.getByText('Food Status')).toBeInTheDocument()
    expect(screen.getByText('Power Status')).toBeInTheDocument()
  })

  it('disables ask buttons when isLoading is true', () => {
    renderPanel([], true)
    const buttons = screen
      .getAllByRole('button')
      .filter((b) => b.hasAttribute('disabled'))
    expect(buttons.length).toBeGreaterThan(0)
  })
})
