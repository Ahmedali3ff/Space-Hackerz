import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LumiChat } from '@/components/lumi/LumiChat'

function ask(text: string): void {
  const input = screen.getByLabelText('Ask Lumi')
  fireEvent.change(input, { target: { value: text } })
  fireEvent.submit(input.closest('form')!)
}

describe('LumiChat', () => {
  it('opens and answers a grounded question with source links', () => {
    render(<LumiChat />)
    fireEvent.click(screen.getByRole('button', { name: 'Open Lumi' }))
    ask('oxygen per person per day')
    expect(screen.getByText(/Daily O2 Consumption/)).toBeInTheDocument()
    expect(screen.getAllByRole('link').some((a) => a.getAttribute('href')?.startsWith('https://'))).toBe(true)
  })

  it('shows the refusal text for off-topic questions', () => {
    render(<LumiChat />)
    fireEvent.click(screen.getByRole('button', { name: 'Open Lumi' }))
    ask('best pizza recipe')
    expect(screen.getByText(/won't guess/)).toBeInTheDocument()
  })
})
