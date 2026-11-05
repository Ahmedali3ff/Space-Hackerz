// src/components/feedback/AstroAIHint.tsx
// Lightbulb hint button that expands into an Astro-AI response panel.
// Uses AnimatePresence + motion.div from framer-motion for expand/collapse.
// Collapsed: shows a Lightbulb icon button labeled "Ask Astro-AI".
// Expanded: shows explanation + optional science fact in a teal-bordered card.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lightbulb, X } from '@phosphor-icons/react'

interface AstroAIHintProps {
  readonly label?: string
  readonly explanation?: string
  readonly scienceFact?: string
  readonly isLoading?: boolean
  readonly onAsk?: () => void
  readonly disabled?: boolean
}

export function AstroAIHint({
  label = 'Ask Astro-AI',
  explanation,
  scienceFact,
  isLoading = false,
  onAsk,
  disabled = false,
}: AstroAIHintProps): JSX.Element {
  const [expanded, setExpanded] = useState(false)

  const handleToggle = (): void => {
    if (disabled) return
    if (!expanded && onAsk !== undefined) {
      onAsk()
    }
    setExpanded((prev) => !prev)
  }

  const hasContent = explanation !== undefined || scienceFact !== undefined || isLoading

  return (
    <div className="flex flex-col gap-2">
      {/* Toggle button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={expanded}
        aria-label={expanded ? 'Close Astro-AI hint' : label}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-spaceplus-accent-teal bg-spaceplus-accent-tealLight text-spaceplus-accent-tealDark text-sm font-semibold transition-colors hover:bg-spaceplus-accent-teal hover:text-white disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spaceplus-accent-teal"
      >
        {expanded ? (
          <X size={16} weight="bold" aria-hidden="true" />
        ) : (
          <Lightbulb size={16} weight="fill" aria-hidden="true" />
        )}
        <span>{expanded ? 'Close hint' : label}</span>
      </button>

      {/* Expandable panel */}
      <AnimatePresence>
        {expanded && hasContent ? (
          <motion.div
            key="astro-hint-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="sp-card border-l-4 border-l-spaceplus-accent-teal p-4 flex flex-col gap-3">
              {isLoading ? (
                <div
                  className="flex items-center gap-2 text-sm text-spaceplus-accent-teal"
                  aria-label="Astro-AI is thinking"
                >
                  <Lightbulb size={16} weight="fill" className="animate-pulse" aria-hidden="true" />
                  <span className="animate-pulse">Astro-AI is thinking…</span>
                </div>
              ) : null}

              {explanation !== undefined && !isLoading ? (
                <p className="text-sm leading-relaxed text-spaceplus-text-body">
                  {explanation}
                </p>
              ) : null}

              {scienceFact !== undefined && !isLoading ? (
                <div className="rounded-lg bg-spaceplus-accent-tealLight px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-spaceplus-accent-tealDark mb-1">
                    Science Fact
                  </p>
                  <p className="text-sm text-spaceplus-text-body">{scienceFact}</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
