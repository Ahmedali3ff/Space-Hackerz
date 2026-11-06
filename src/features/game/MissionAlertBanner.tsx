// src/features/game/MissionAlertBanner.tsx
// Top-right event notification banner for the 3D gameplay view.
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
        position: 'absolute',
        top: 16,
        right: 72,
        zIndex: 20,
        background: isCritical ? 'rgba(239,68,68,0.92)' : 'rgba(180,83,9,0.92)',
        border: `1px solid ${isCritical ? '#EF4444' : '#F59E0B'}`,
        borderRadius: 16,
        padding: '12px 16px',
        maxWidth: 290,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        animation: 'alertSlideIn 0.4s ease',
      }}
    >
      <span style={{ fontSize: 24, flexShrink: 0 }}>
        {isCritical ? '🚨' : '⛈️'}
      </span>
      <div style={{ flex: 1 }}>
        <p
          style={{
            color: 'white',
            fontWeight: 700,
            fontSize: 13,
            fontFamily: 'Nunito, sans-serif',
            marginBottom: 2,
          }}
        >
          {isCritical ? 'CRITICAL ALERT!' : 'New Event!'}
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 12,
            fontFamily: 'Nunito, sans-serif',
            marginBottom: 2,
          }}
        >
          {event.title}
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 11,
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          Click a building to respond
        </p>
      </div>
      {!isCritical && (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss alert"
          style={{
            color: 'rgba(255,255,255,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
            padding: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}

      <style>{`
        @keyframes alertSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
