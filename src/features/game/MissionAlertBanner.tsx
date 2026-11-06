// src/features/game/MissionAlertBanner.tsx
// Top-right event notification banner for the 3D gameplay view.
// Updated to Space Hackerz pixel-perfect style.
import { useState, useEffect } from 'react'
import { getEventDefinition } from '@/features/events/event-registry'

interface MissionAlertBannerProps {
  readonly eventId: string | null
  readonly day: number
}

export function MissionAlertBanner({
  eventId,
  day: _day,
}: MissionAlertBannerProps): JSX.Element | null {
  const [dismissed, setDismissed] = useState(false)
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  const event = eventId !== null ? getEventDefinition(eventId) : undefined
  // Treat an event as critical when it affects 2+ systems (no severity field on EventDefinition)
  const isCritical = (event?.affectedSystems.length ?? 0) >= 2

  // Reset dismissed state when a new event arrives
  useEffect(() => {
    if (eventId !== lastEventId) {
      setDismissed(false)
      setLastEventId(eventId)
    }
  }, [eventId, lastEventId])

  // Auto-dismiss non-critical events after 8 s
  useEffect(() => {
    if (!isCritical && event !== undefined) {
      const t = setTimeout(() => setDismissed(true), 8000)
      return () => clearTimeout(t)
    }
    return undefined
  }, [event, isCritical])

  if (event === undefined || dismissed) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: 16,
        right: 72,
        zIndex: 50,
        background: 'rgba(139,69,19,0.9)',
        border: '1px solid rgba(245,166,35,0.6)',
        borderRadius: 16,
        padding: '12px 16px',
        maxWidth: 240,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        animation: 'alertSlideIn 0.4s ease',
      }}
    >
      {/* Icon + title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>
          {isCritical ? '🚨' : '⛈️'}
        </span>
        <p
          style={{
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
            fontFamily: 'Nunito, sans-serif',
            margin: 0,
          }}
        >
          {isCritical ? 'CRITICAL ALERT!' : 'New Event!'}
        </p>
        {!isCritical && (
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss alert"
            style={{
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              padding: 0,
              lineHeight: 1,
              marginLeft: 'auto',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Description text */}
      <p
        style={{
          color: '#FFD9A0',
          fontSize: 13,
          fontFamily: 'Nunito, sans-serif',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {event.title}
      </p>

      <style>{`
        @keyframes alertSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
