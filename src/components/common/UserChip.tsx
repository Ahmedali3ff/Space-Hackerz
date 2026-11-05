// src/components/common/UserChip.tsx
// Rounded pill with a teal avatar + name + level/title subtitle.
// Shows rocket emoji 🚀 (or first letter of commander name) in the avatar.
// Matches the Space+ reference: 'Level 3 · Star Explorer' subtitle pattern.

type UserChipSize = 'sm' | 'md'

interface UserChipProps {
  readonly name: string
  readonly role?: string
  readonly level?: number
  readonly levelTitle?: string
  readonly size?: UserChipSize
}

const SIZE_MAP: Readonly<Record<UserChipSize, { avatar: string; nameText: string; subText: string; pill: string }>> = {
  sm: {
    avatar: 'w-7 h-7 text-xs',
    nameText: 'text-xs font-bold',
    subText: 'text-[10px]',
    pill: 'gap-2 px-2 py-1',
  },
  md: {
    avatar: 'w-9 h-9 text-sm',
    nameText: 'text-sm font-bold',
    subText: 'text-xs',
    pill: 'gap-2.5 px-3 py-1.5',
  },
}

export function UserChip({ name, role, level, levelTitle, size = 'md' }: UserChipProps): JSX.Element {
  const { avatar, nameText, subText, pill } = SIZE_MAP[size]
  const initial = name.trim().charAt(0).toUpperCase()

  // Build subtitle: level info takes priority over role
  const subtitle = level !== undefined && levelTitle !== undefined
    ? `Level ${level} · ${levelTitle}`
    : role

  // Avatar content: show rocket emoji if name is default/empty, otherwise first letter
  const avatarContent = name.trim().length === 0 || name === 'Commander' ? '🚀' : initial

  return (
    <div
      className={`inline-flex items-center ${pill} rounded-full bg-white border border-[#E5E7EB]`}
      aria-label={subtitle !== undefined ? `${name}, ${subtitle}` : name}
    >
      {/* Teal avatar circle */}
      <span
        className={`inline-flex items-center justify-center ${avatar} rounded-full bg-[#1FC8C0] font-bold text-white select-none`}
        aria-hidden="true"
      >
        {avatarContent}
      </span>
      {/* Name + subtitle */}
      <div className="flex flex-col">
        <span className={`${nameText} text-[#1A1D2E] leading-tight`}>
          {name}
        </span>
        {subtitle !== undefined ? (
          <span className={`${subText} text-[#6B7280] leading-tight`}>
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  )
}
