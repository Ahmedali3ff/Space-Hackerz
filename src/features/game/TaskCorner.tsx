// src/features/game/TaskCorner.tsx
// Bottom-right objectives widget — shows mission objectives + active threats.
import type { ResourceSnapshot } from '@simulation/types'
import { getEventDefinition } from '@/features/events/event-registry'

interface TaskCornerProps {
  readonly currentResources: ResourceSnapshot
  readonly initialResources: ResourceSnapshot
  readonly currentDay: number
  readonly totalDays: number
  readonly activeEventIds: readonly string[]
  readonly activeFaultStates: readonly string[]
}

interface Objective {
  readonly label: string
  readonly value: number
  readonly threshold: number
  readonly isComplete: boolean
}

export function TaskCorner({
  currentResources,
  initialResources,
  currentDay,
  totalDays,
  activeEventIds,
  activeFaultStates,
}: TaskCornerProps): JSX.Element {
  function pct(v: number, max: number): number {
    return max > 0 ? (v / max) * 100 : 0
  }

  const objectives: readonly Objective[] = [
    {
      label: 'Survive all days',
      value: (currentDay / totalDays) * 100,
      threshold: 0,
      isComplete: currentDay >= totalDays,
    },
    {
      label: 'Oxygen > 15%',
      value: pct(currentResources.oxygen_kg, initialResources.oxygen_kg),
      threshold: 15,
      isComplete: false,
    },
    {
      label: 'Water > 10%',
      value: pct(currentResources.water_kg, initialResources.water_kg),
      threshold: 10,
      isComplete: false,
    },
    {
      label: 'Food > 10%',
      value: pct(currentResources.food_kg, initialResources.food_kg),
      threshold: 10,
      isComplete: false,
    },
    {
      label: 'Energy > 5%',
      value: pct(currentResources.energy_kWh, initialResources.energy_kWh),
      threshold: 5,
      isComplete: false,
    },
  ]

  const hasCritical = objectives.some(
    (o) => !o.isComplete && o.threshold > 0 && o.value < o.threshold + 5,
  )

  const firstEvent =
    activeEventIds.length > 0 ? getEventDefinition(activeEventIds[0]) : undefined

  return (
    <div
      aria-label="Mission objectives"
      className="sh-task-corner"
      style={{
        position: 'fixed',
        bottom: 90,
        right: 16,
        zIndex: 20,
        width: 230,
        background: 'rgba(10,14,26,0.88)',
        border: `1px solid ${hasCritical ? '#EF4444' : 'rgba(31,200,192,0.4)'}`,
        borderRadius: 14,
        backdropFilter: 'blur(10px)',
        animation: hasCritical ? 'cornerPulse 1s ease-in-out infinite' : 'none',
        boxShadow: hasCritical
          ? '0 0 12px rgba(239,68,68,0.3)'
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '8px 12px',
        }}
      >
        <span
          style={{
            color: '#1FC8C0',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          📋 Mission Objectives
        </span>
      </div>

      {/* Objectives list */}
      <div
        style={{
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {/* Day progress */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 11,
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            📅 Day {currentDay} / {totalDays}
          </span>
          <span style={{ color: '#1FC8C0', fontSize: 10, fontWeight: 700 }}>
            {currentDay >= totalDays ? '✅' : '⏳'}
          </span>
        </div>

        {/* Resource objectives */}
        {objectives.slice(1).map((obj) => {
          const warn = obj.value < obj.threshold + 5 && obj.value >= obj.threshold
          const crit = obj.value < obj.threshold
          const barColor = crit ? '#EF4444' : warn ? '#F5A623' : '#1FC8C0'
          const icon = crit ? '🚨' : warn ? '⚠️' : '✅'

          return (
            <div key={obj.label}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 10,
                    fontFamily: 'Nunito, sans-serif',
                  }}
                >
                  {obj.label}
                </span>
                <span style={{ fontSize: 10 }}>
                  {icon}{' '}
                  <span style={{ color: barColor, fontWeight: 700 }}>
                    {Math.round(obj.value)}%
                  </span>
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(obj.value)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={obj.label}
                style={{
                  height: 4,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: barColor,
                    width: `${Math.min(100, Math.max(0, obj.value))}%`,
                    transition: 'width 0.5s ease, background 0.3s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Active event threat */}
      {firstEvent !== undefined && (
        <div
          style={{
            borderTop: '1px solid rgba(239,68,68,0.3)',
            padding: '8px 12px',
          }}
        >
          <p
            style={{
              color: '#F59E0B',
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'Nunito, sans-serif',
              marginBottom: 4,
            }}
          >
            ⚡ Active Threat
          </p>
          <p
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 10,
              fontFamily: 'Nunito, sans-serif',
              lineHeight: 1.4,
            }}
          >
            {firstEvent.title}
          </p>
        </div>
      )}

      {/* Fault state warning */}
      {activeFaultStates.length > 0 && (
        <div
          role="alert"
          style={{
            borderTop: '1px solid rgba(239,68,68,0.4)',
            padding: '8px 12px',
            background: 'rgba(239,68,68,0.1)',
          }}
        >
          <p
            style={{
              color: '#EF4444',
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'Nunito, sans-serif',
              animation: 'cornerPulse 0.8s ease-in-out infinite',
            }}
          >
            🚨 {activeFaultStates[0].replace(/_/g, ' ')}
          </p>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 9,
              fontFamily: 'Nunito, sans-serif',
              marginTop: 2,
            }}
          >
            Resolve this or lose the mission!
          </p>
        </div>
      )}

      <style>{`
        @keyframes cornerPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
