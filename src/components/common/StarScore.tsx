// src/components/common/StarScore.tsx
// Amber star icon + numeric score, used for mission ratings and rewards.
// Uses .sp-star-score CSS utility class.

import { Star } from '@phosphor-icons/react'

type StarScoreSize = 'sm' | 'md' | 'lg'

interface StarScoreProps {
  readonly score: number
  readonly maxScore?: number
  readonly size?: StarScoreSize
}

const SIZE_MAP: Readonly<Record<StarScoreSize, { icon: number; text: string }>> = {
  sm: { icon: 14, text: 'text-sm' },
  md: { icon: 18, text: 'text-base' },
  lg: { icon: 24, text: 'text-xl' },
}

export function StarScore({ score, maxScore, size = 'md' }: StarScoreProps): JSX.Element {
  const { icon, text } = SIZE_MAP[size]
  const label = maxScore !== undefined
    ? `Score: ${score} out of ${maxScore}`
    : `Score: ${score}`

  return (
    <span
      className={`sp-star-score ${text}`}
      aria-label={label}
    >
      <Star
        size={icon}
        weight="fill"
        color="#FFB300"
        aria-hidden="true"
      />
      <span>
        {maxScore !== undefined ? `${score} / ${maxScore}` : score}
      </span>
    </span>
  )
}
