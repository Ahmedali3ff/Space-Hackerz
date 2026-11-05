// src/components/common/UserChip.tsx
// Rounded pill with a teal initial avatar + name + optional role.
// Used in navigation bars and crew selection screens.

type UserChipSize = 'sm' | 'md'

interface UserChipProps {
  readonly name: string
  readonly role?: string
  readonly size?: UserChipSize
}

const SIZE_MAP: Readonly<Record<UserChipSize, { avatar: string; text: string; pill: string }>> = {
  sm: {
    avatar: 'w-7 h-7 text-xs',
    text: 'text-xs',
    pill: 'gap-2 px-2 py-1',
  },
  md: {
    avatar: 'w-9 h-9 text-sm',
    text: 'text-sm',
    pill: 'gap-2.5 px-3 py-1.5',
  },
}

export function UserChip({ name, role, size = 'md' }: UserChipProps): JSX.Element {
  const { avatar, text, pill } = SIZE_MAP[size]
  const initial = name.trim().charAt(0).toUpperCase()

  return (
    <div
      className={`inline-flex items-center ${pill} rounded-full bg-spaceplus-card border border-spaceplus-border-light`}
      aria-label={role !== undefined ? `${name}, ${role}` : name}
    >
      {/* Teal initial avatar */}
      <span
        className={`inline-flex items-center justify-center ${avatar} rounded-full bg-spaceplus-accent-teal font-bold text-white select-none`}
        aria-hidden="true"
      >
        {initial}
      </span>
      {/* Name + optional role */}
      <span className={`font-medium ${text} text-spaceplus-text-heading`}>
        {name}
      </span>
      {role !== undefined ? (
        <span className={`${text} text-spaceplus-text-secondary`}>
          {role}
        </span>
      ) : null}
    </div>
  )
}
