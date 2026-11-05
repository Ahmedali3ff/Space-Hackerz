// src/features/mission-control/AstroAIPanel.tsx
// Wires AstroAssistant to the AstroPanel UI component.
// Instantiates the assistant once via useRef; consumes context via useAstroContext.
// Buttons are disabled when mission context is null (not yet active).

import { useState, useRef } from 'react'
import { AstroAssistant } from '@ai/astro-assistant'
import type { AstroResponse } from '@ai/schemas/astro-response.schema'
import { useAstroContext } from '@/hooks/useAstroContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AstroPanel } from '@/components/feedback/AstroPanel'
import type { AstroAskKind } from '@/components/feedback/AstroPanel'

interface AstroAIPanelProps {}

export function AstroAIPanel(_props: AstroAIPanelProps): JSX.Element {
  // Instantiate assistant exactly once per component lifetime.
  const assistantRef = useRef<AstroAssistant | null>(null)
  if (assistantRef.current === null) {
    assistantRef.current = new AstroAssistant({
      apiKey: import.meta.env.VITE_AI_API_KEY as string | undefined,
      apiEndpoint: import.meta.env.VITE_AI_API_ENDPOINT as string | undefined,
      model: import.meta.env.VITE_AI_MODEL as string | undefined,
    })
  }

  const context = useAstroContext()
  const { reducedMotion } = useReducedMotion()

  const [messages, setMessages] = useState<AstroResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)

  async function handleAsk(kind: AstroAskKind): Promise<void> {
    if (context === null || isLoading) return
    const assistant = assistantRef.current
    if (assistant === null) return

    setIsLoading(true)
    try {
      let response: AstroResponse
      if (kind === 'situation') {
        // explainEvent signature: (context: SimulationContext) => Promise<AstroResponse>
        response = await assistant.explainEvent(context)
      } else {
        // explainResourceChange signature: (context, resource) => Promise<AstroResponse>
        response = await assistant.explainResourceChange(context, kind)
      }
      setMessages((prev) => [...prev, response])
    } finally {
      setIsLoading(false)
    }
  }

  // Wrapper that converts async handler to void for the sync prop
  function onAsk(kind: AstroAskKind): void {
    void handleAsk(kind)
  }

  const isOffline =
    assistantRef.current !== null && !assistantRef.current.isAvailable()

  return (
    <div className="flex flex-col gap-2">
      {isOffline ? (
        <p className="text-xs text-text-muted">
          Astro-AI — Offline mode (knowledge base only)
        </p>
      ) : null}
      <AstroPanel
        messages={messages}
        isLoading={isLoading}
        onAsk={context !== null ? onAsk : (_k: AstroAskKind) => undefined}
        reducedMotion={reducedMotion}
      />
      {context === null ? (
        <p className="text-xs text-text-muted text-center">
          Start your mission to consult Astro-AI.
        </p>
      ) : null}
    </div>
  )
}
