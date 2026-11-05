// src/features/game/GameEventModal.tsx
// Full-screen decision modal for event resolution.
// Reads eventId + missionId from URL params, looks up the event from
// LUNAR_EVENTS / MARTIAN_EVENTS, and resolves via useMissionControl.

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LUNAR_EVENTS } from '../../simulation/events/lunar-events'
import { MARTIAN_EVENTS } from '../../simulation/events/martian-events'
import { useMissionControl } from '@/hooks/useMissionControl'
import { getAudioManager } from '@/services/audio-manager'
import type { EventDefinition } from '@simulation/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface GameEventModalProps {
  // intentionally empty — reads from URL params
}

// ── Event lookup ──────────────────────────────────────────────────────────────

const ALL_EVENTS: readonly EventDefinition[] = [...LUNAR_EVENTS, ...MARTIAN_EVENTS]

function findEvent(eventId: string): EventDefinition | undefined {
  return ALL_EVENTS.find((e) => e.id === eventId)
}

// ── Affected system badge ─────────────────────────────────────────────────────

function SystemBadge({ system }: { readonly system: string }): JSX.Element {
  const labels: Record<string, string> = {
    oxygen: '🫧 Oxygen',
    water: '💧 Water',
    food: '🌱 Food',
    energy: '⚡ Power',
    radiation: '☢️ Radiation',
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/30 rounded-full px-2 py-0.5">
      {labels[system] ?? system}
    </span>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function GameEventModal(_props: GameEventModalProps): JSX.Element {
  const { eventId, missionId } = useParams<{ eventId: string; missionId: string }>()
  const navigate = useNavigate()
  const { resolveEvent } = useMissionControl()

  const [showAstroAI, setShowAstroAI] = useState(false)
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  const [consequence, setConsequence] = useState<string | null>(null)

  const event = eventId ? findEvent(eventId) : undefined

  function handleChoiceSelect(choiceId: string, choiceLabel: string): void {
    if (!eventId || !missionId) return
    setSelectedChoiceId(choiceId)
    getAudioManager().playSound('click')
    resolveEvent(eventId, choiceId)
    setConsequence(`Decision recorded: "${choiceLabel}" — consequences will affect your mission.`)
    // Navigate back after 1.5 s
    setTimeout(() => {
      navigate(`/game/play/${missionId}`)
    }, 1500)
  }

  if (!event) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Event"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      >
        <div className="game-card p-6 text-center">
          <p className="text-white mb-4">Event not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="game-btn-teal"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isCritical = event.affectedSystems.includes('oxygen') || event.affectedSystems.includes('energy')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      {/* Modal content */}
      <div className="w-full max-w-md mx-auto my-4 px-4 flex flex-col gap-4">
        {/* Header */}
        <div className="game-card p-5">
          {/* Event title */}
          <h1
            className={`text-lg font-black mb-2 ${isCritical ? 'text-[#EF4444]' : 'text-[#F5A623]'}`}
          >
            {isCritical ? '🚨' : '⚠️'} {event.title}
          </h1>

          {/* Affected systems */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {event.affectedSystems.map((sys) => (
              <SystemBadge key={sys} system={sys} />
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-white leading-relaxed">{event.description}</p>
        </div>

        {/* Consequence banner */}
        {consequence && (
          <div
            role="status"
            className="bg-[#10B981]/15 border border-[#10B981] rounded-xl px-4 py-3 text-sm text-[#10B981] font-semibold"
          >
            ✅ {consequence}
          </div>
        )}

        {/* Choices */}
        {!consequence && (
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-[#C4B5FD] font-bold">
              Choose your response:
            </p>
            {event.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoiceSelect(choice.id, choice.label)}
                disabled={selectedChoiceId !== null}
                aria-pressed={selectedChoiceId === choice.id}
                className={[
                  'game-card p-4 text-left transition-all duration-150 border-2 rounded-2xl',
                  selectedChoiceId === choice.id
                    ? 'border-[#1FC8C0]'
                    : 'border-transparent hover:border-[#7C3AED]/60 hover:scale-[1.02]',
                  selectedChoiceId !== null && selectedChoiceId !== choice.id
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer',
                ].join(' ')}
              >
                <p className="text-sm font-bold text-white mb-1">{choice.label}</p>
                <p className="text-xs text-[#C4B5FD] leading-relaxed">{choice.description}</p>
                {choice.isOptimal && (
                  <span className="mt-2 inline-block text-[9px] uppercase tracking-wide text-[#10B981] border border-[#10B981]/30 rounded-full px-2 py-0.5">
                    ✓ Recommended
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Astro-AI consult */}
        <div>
          <button
            onClick={() => setShowAstroAI(!showAstroAI)}
            className="text-sm text-[#1FC8C0] hover:text-white transition-colors font-semibold flex items-center gap-1"
          >
            🤖 {showAstroAI ? 'Hide' : 'Consult'} Astro-AI
          </button>
          {showAstroAI && (
            <div className="mt-2 bg-[#1FC8C0]/10 border border-[#1FC8C0]/30 rounded-xl p-4">
              <p className="text-xs text-white leading-relaxed">
                {event.scientificExplanation}
              </p>
            </div>
          )}
        </div>

        {/* Cancel / go back */}
        {!consequence && (
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-[#C4B5FD] hover:text-white transition-colors py-2 text-center"
          >
            ← Back without deciding
          </button>
        )}
      </div>
    </div>
  )
}
