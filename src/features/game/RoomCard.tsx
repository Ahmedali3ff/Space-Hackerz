// src/features/game/RoomCard.tsx
// Extracted sub-component for interactive room cards used by GameplayScreen.
// Each room is a keyboard-accessible button with status indicator + icon.

// ── Props ─────────────────────────────────────────────────────────────────────

export interface RoomCardProps {
  readonly roomId: string
  readonly name: string
  readonly icon: string
  readonly statusColor: 'good' | 'warn' | 'crit' | 'neutral'
  readonly isSelected: boolean
  readonly onClick: () => void
}

// ── Status dot colors ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<RoomCardProps['statusColor'], string> = {
  good: 'bg-[#10B981]',
  warn: 'bg-[#F5A623]',
  crit: 'bg-[#EF4444] animate-pulse',
  neutral: 'bg-[#6B7280]',
}

const STATUS_LABEL: Record<RoomCardProps['statusColor'], string> = {
  good: 'Nominal',
  warn: 'Warning',
  crit: 'Critical',
  neutral: 'Idle',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RoomCard({
  roomId,
  name,
  icon,
  statusColor,
  isSelected,
  onClick,
}: RoomCardProps): JSX.Element {
  return (
    <button
      id={`room-${roomId}`}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`${name} — ${STATUS_LABEL[statusColor]}`}
      className={[
        'relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200',
        'cursor-pointer border focus-visible:outline-2 focus-visible:outline-[#1FC8C0]',
        isSelected
          ? 'bg-[#1a1040] border-[#7C3AED] shadow-[0_0_20px_rgba(124,58,237,0.4)]'
          : 'game-card hover:border-[#7C3AED]/60 hover:scale-[1.03]',
      ].join(' ')}
    >
      {/* Status dot */}
      <span
        className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${STATUS_COLORS[statusColor]}`}
        aria-hidden="true"
      />

      {/* Room icon */}
      <span className="text-3xl" role="img" aria-label={name}>
        {icon}
      </span>

      {/* Room name */}
      <span className="text-xs font-bold text-white text-center leading-tight">
        {name}
      </span>

      {/* Status label */}
      <span
        className={[
          'text-[10px] font-semibold uppercase tracking-wide',
          statusColor === 'good'
            ? 'text-[#10B981]'
            : statusColor === 'warn'
            ? 'text-[#F5A623]'
            : statusColor === 'crit'
            ? 'text-[#EF4444]'
            : 'text-[#6B7280]',
        ].join(' ')}
      >
        {STATUS_LABEL[statusColor]}
      </span>
    </button>
  )
}
