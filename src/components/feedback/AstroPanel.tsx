// src/components/feedback/AstroPanel.tsx
// Floating communications panel for the Astro-AI assistant.
// Space+ light theme — white card with teal accent.
// Exposes a role=log / aria-live=polite container for screen readers.
// Word-by-word reveal animates each new message; collapses to instant display
// when reducedMotion is true.  Five contextual ask buttons are provided.

import { useState, useEffect, useRef } from 'react'
import type { AstroResponse } from '@ai/schemas/astro-response.schema'
import { Card } from '@/components/common/Card'
import { PrimaryButton } from '@/components/common/PrimaryButton'

export type AstroAskKind = 'situation' | 'oxygen' | 'water' | 'food' | 'energy'

interface AstroPanelProps {
  readonly messages: readonly AstroResponse[]
  readonly isLoading: boolean
  readonly onAsk: (promptKind: AstroAskKind) => void
  readonly reducedMotion: boolean
}

// Word-by-word reveal for a single message text.
interface RevealedMessage {
  readonly full: string
  revealed: string
}

const ASK_BUTTONS: Array<{ kind: AstroAskKind; label: string }> = [
  { kind: 'situation', label: 'Explain Situation' },
  { kind: 'oxygen', label: 'O₂ Status' },
  { kind: 'water', label: 'Water Status' },
  { kind: 'food', label: 'Food Status' },
  { kind: 'energy', label: 'Power Status' },
]

const WORD_INTERVAL_MS = 10

export function AstroPanel({
  messages,
  isLoading,
  onAsk,
  reducedMotion,
}: AstroPanelProps): JSX.Element {
  // Track revealed state for each message index.
  const [revealed, setRevealed] = useState<RevealedMessage[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sync revealed array whenever messages length changes.
  useEffect(() => {
    setRevealed((prev) => {
      const next = messages.map((msg, i) => {
        if (i < prev.length) return prev[i]
        // New message: if reduced motion, show immediately; else start empty.
        return {
          full: msg.explanation,
          revealed: reducedMotion ? msg.explanation : '',
        }
      })
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, reducedMotion])

  // Animate word-by-word for any message whose revealed !== full.
  useEffect(() => {
    if (reducedMotion) return

    const animateNext = (): void => {
      setRevealed((prev) => {
        let changed = false
        const next = prev.map((item) => {
          if (item.revealed === item.full) return item
          const words = item.full.split(' ')
          const revWords = item.revealed === '' ? [] : item.revealed.split(' ')
          if (revWords.length >= words.length) return item
          changed = true
          return { ...item, revealed: words.slice(0, revWords.length + 1).join(' ') }
        })
        if (!changed && timerRef.current !== null) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        return next
      })
    }

    // Only start a new interval when there's something to animate.
    const hasUnfinished = revealed.some((r) => r.revealed !== r.full)
    if (hasUnfinished && timerRef.current === null) {
      timerRef.current = setInterval(animateNext, WORD_INTERVAL_MS)
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [revealed, reducedMotion])

  return (
    <Card accent="teal" className="flex flex-col gap-4">
      <header className="mb-1">
        <h2 className="font-display2 text-lg font-semibold text-spaceplus-text-heading">Astro-AI</h2>
      </header>

      {/* Messages */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Astro-AI messages"
        className="flex max-h-64 flex-col gap-3 overflow-y-auto"
      >
        {messages.length === 0 && !isLoading ? (
          <p className="text-sm text-spaceplus-text-muted">Ask me anything about your mission!</p>
        ) : null}

        {messages.map((msg, i) => {
          const text = reducedMotion
            ? msg.explanation
            : (revealed[i]?.revealed ?? '')

          return (
            <div
              key={i}
              className="flex flex-col gap-1.5 rounded-xl bg-spaceplus-accent-tealLight border border-spaceplus-border-light p-3"
            >
              <p className="text-sm leading-relaxed text-spaceplus-text-heading">{text}</p>

              {msg.scienceFact !== undefined ? (
                <div className="rounded border border-spaceplus-accent-teal/30 bg-spaceplus-accent-tealLight p-2">
                  <p className="text-xs text-spaceplus-accent-tealDark">
                    <span className="font-semibold uppercase tracking-wide">Science fact: </span>
                    {msg.scienceFact}
                  </p>
                </div>
              ) : null}

              {msg.suggestion !== undefined ? (
                <p className="text-xs italic text-spaceplus-text-secondary">💡 {msg.suggestion}</p>
              ) : null}
            </div>
          )
        })}

        {isLoading ? (
          <div
            className="flex items-center gap-1.5 text-sm text-spaceplus-accent-teal"
            aria-label="Astro-AI is thinking"
          >
            <span className="animate-pulse font-mono">Astro-AI is thinking</span>
            <span className="animate-bounce delay-75">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </div>
        ) : null}
      </div>

      {/* Ask buttons */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Ask Astro-AI">
        {ASK_BUTTONS.map(({ kind, label }) => (
          <PrimaryButton
            key={kind}
            variant="secondary"
            size="md"
            disabled={isLoading}
            onClick={() => { onAsk(kind) }}
          >
            {label}
          </PrimaryButton>
        ))}
      </div>
    </Card>
  )
}
