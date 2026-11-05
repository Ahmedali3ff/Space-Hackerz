// src/features/mission-control/AstroAIPanel.tsx
// Wires AstroAssistant to the hint-button UI.
// Instantiates the assistant once via useMemo; consumes context via useAstroContext.
// Single "A little hint, Astro?" button — becomes "Ask another hint" after first response.

import { useState, useMemo } from 'react'
import { AstroAssistant } from '@ai/astro-assistant'
import type { AstroResponse } from '@ai/schemas/astro-response.schema'
import { useAstroContext } from '@/hooks/useAstroContext'
import { Card } from '@/components/common/Card'
import { PrimaryButton } from '@/components/common/PrimaryButton'

interface AstroAIPanelProps {}

export function AstroAIPanel(_props: AstroAIPanelProps): JSX.Element {
  // Instantiate assistant exactly once per component lifetime via useMemo.
  const assistant = useMemo(
    () =>
      new AstroAssistant({
        apiKey: import.meta.env.VITE_AI_API_KEY as string | undefined,
        apiEndpoint: import.meta.env.VITE_AI_API_ENDPOINT as string | undefined,
        model: import.meta.env.VITE_AI_MODEL as string | undefined,
      }),
    [],
  )

  const context = useAstroContext()

  const [messages, setMessages] = useState<AstroResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isOffline = !assistant.isAvailable()
  const hasResponded = messages.length > 0
  const buttonLabel = hasResponded ? 'Ask another hint' : 'A little hint, Astro?'

  async function handleHint(): Promise<void> {
    if (context === null || isLoading) return
    setIsLoading(true)
    try {
      const response = await assistant.explainEvent(context)
      setMessages((prev) => [...prev, response])
    } finally {
      setIsLoading(false)
    }
  }

  function onHint(): void {
    void handleHint()
  }

  return (
    <Card accent="teal" className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display2 text-lg font-semibold text-[#1A1D2E]">Astro-AI</h2>
          <p className="text-xs text-[#9CA3AF]">Your mission co-pilot</p>
        </div>
        {isOffline ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-semibold text-[#F59E0B]">
            📡 Offline mode — using knowledge base
          </span>
        ) : null}
      </div>

      {/* Message list */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Astro-AI messages"
        className="flex flex-col gap-3 max-h-64 overflow-y-auto"
      >
        {messages.length === 0 && !isLoading ? (
          <p className="text-sm text-[#9CA3AF]">Ask me anything about your mission!</p>
        ) : null}

        {messages.map((msg, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-xl bg-[#E8FAF9] border border-[#1FC8C0]/20 p-3"
          >
            {/* Explanation — dark body text */}
            <p className="text-sm leading-relaxed text-[#1A1D2E]">{msg.explanation}</p>

            {/* Science fact — italic gray with prefix */}
            {msg.scienceFact !== undefined ? (
              <p className="text-xs italic text-[#6B7280]">
                🔬 Science fact: {msg.scienceFact}
              </p>
            ) : null}

            {/* Suggestion — teal text with arrow prefix */}
            {msg.suggestion !== undefined ? (
              <p className="text-xs font-semibold text-[#1FC8C0]">
                → Try this: {msg.suggestion}
              </p>
            ) : null}
          </div>
        ))}

        {/* Loading state — teal pulsing dot + text */}
        {isLoading ? (
          <div
            className="flex items-center gap-2 text-sm text-[#1FC8C0]"
            aria-label="Astro is thinking"
          >
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#1FC8C0] animate-pulse"
              aria-hidden="true"
            />
            <span>Astro is thinking...</span>
          </div>
        ) : null}
      </div>

      {/* Hint button */}
      <div>
        <PrimaryButton
          variant="hint"
          size="md"
          disabled={isLoading || context === null}
          onClick={onHint}
          ariaLabel={buttonLabel}
        >
          {buttonLabel}
        </PrimaryButton>
        {context === null ? (
          <p className="mt-1 text-xs text-[#9CA3AF] text-center">
            Start your mission to consult Astro-AI.
          </p>
        ) : null}
      </div>
    </Card>
  )
}
