// src/components/common/TaskChecklistItem.tsx
// Task row with complete / active / locked states.
// Uses Phosphor icons: CheckCircle (complete), Circle (active), Lock (locked).
// Locked items are disabled. Active items have a pulsing teal indicator.

import { CheckCircle, Circle, Lock } from '@phosphor-icons/react'

type TaskState = 'complete' | 'active' | 'locked'

interface TaskChecklistItemProps {
  readonly label: string
  readonly description?: string
  readonly state: TaskState
  readonly onComplete?: () => void
}

export function TaskChecklistItem({
  label,
  description,
  state,
  onComplete,
}: TaskChecklistItemProps): JSX.Element {
  const isLocked = state === 'locked'
  const isComplete = state === 'complete'
  const isActive = state === 'active'

  const handleClick = (): void => {
    if (isActive && onComplete !== undefined) {
      onComplete()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if ((e.key === 'Enter' || e.key === ' ') && isActive && onComplete !== undefined) {
      e.preventDefault()
      onComplete()
    }
  }

  const rowClass = [
    'flex items-start gap-3 p-3 rounded-xl transition-colors',
    isLocked ? 'opacity-50 cursor-not-allowed' : '',
    isActive && onComplete !== undefined ? 'cursor-pointer hover:bg-spaceplus-accent-tealLight/40' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rowClass}
      role={isActive && onComplete !== undefined ? 'button' : undefined}
      tabIndex={isActive && onComplete !== undefined ? 0 : undefined}
      aria-disabled={isLocked}
      aria-label={`${label} — ${state}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* State icon */}
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {isComplete && (
          <CheckCircle size={20} weight="fill" className="text-spaceplus-status-success" />
        )}
        {isActive && (
          <Circle size={20} weight="fill" className="text-spaceplus-accent-teal animate-pulse" />
        )}
        {isLocked && (
          <Lock size={20} weight="fill" className="text-spaceplus-text-muted" />
        )}
      </span>

      {/* Text */}
      <div className="flex flex-col gap-0.5">
        <span
          className={`text-sm font-medium ${isComplete ? 'line-through text-spaceplus-text-secondary' : isLocked ? 'text-spaceplus-text-muted' : 'text-spaceplus-text-heading'}`}
        >
          {label}
        </span>
        {description !== undefined ? (
          <span className="text-xs text-spaceplus-text-secondary">{description}</span>
        ) : null}
      </div>
    </div>
  )
}
