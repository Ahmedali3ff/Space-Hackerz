// src/features/game/ResourceHUD.tsx
// Top-left HUD overlay — four resource bars for the 3D gameplay view.
// Updated to Space Hackerz pixel-perfect style.

interface ResourceHUDProps {
  readonly water: number    // 0-100 percentage
  readonly food: number
  readonly oxygen: number
  readonly energy: number
}

interface ResourceRow {
  readonly icon: string
  readonly label: string
  readonly value: number
  readonly fillColor: string
}

export function ResourceHUD({ water, food, oxygen, energy }: ResourceHUDProps): JSX.Element {
  const rows: readonly ResourceRow[] = [
    { icon: '💧', label: 'Water',  value: water,  fillColor: '#3B9BFF' },
    { icon: '🍖', label: 'Food',   value: food,   fillColor: '#4CAF50' },
    { icon: '🫁', label: 'Oxygen', value: oxygen, fillColor: '#A855F7' },
    { icon: '⚡', label: 'Energy', value: energy, fillColor: '#FFB800' },
  ]

  return (
    <div
      aria-label="Resource status"
      className="sh-resource-hud"
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 20,
        width: 230,
        background: 'rgba(13,27,62,0.9)',
        border: '1px solid rgba(59,111,232,0.3)',
        borderRadius: 20,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div className="sh-resource-hud-header">
        <span>HABITAT STATUS</span>
        <span className="sh-live-pill"><i /> LIVE</span>
      </div>
      {rows.map((row) => {
        const pct = Math.round(Math.max(0, Math.min(100, row.value)))
        const isCritical = pct < 15
        const fillColor = isCritical ? '#EF4444' : row.fillColor

        return (
          <div key={row.label}>
            {/* Icon + label + percentage row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{row.icon}</span>
              <span
                style={{
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Nunito, sans-serif',
                  minWidth: 60,
                  flex: 1,
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Nunito, sans-serif',
                }}
                aria-label={`${row.label} ${pct}%`}
              >
                {pct}%
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="sh-resource-bar"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={row.label}
            >
              <div
                className="sh-resource-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: fillColor,
                  transition: 'width 0.6s ease, background 0.3s ease',
                  boxShadow: isCritical ? `0 0 8px ${fillColor}` : 'none',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
