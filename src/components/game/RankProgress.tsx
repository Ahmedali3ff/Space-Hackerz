// Rank badge and XP progress bar for the 20-level progression system. Pure presentational component.
import { getLevelForXP, getProgressToNextLevel, LEVELS, MAX_LEVEL } from '@data/levels/level-definitions'

interface RankProgressProps {
  readonly totalXP: number
  readonly className?: string
}

export function RankProgress({ totalXP, className = '' }: RankProgressProps): JSX.Element {
  const xp = Number.isFinite(totalXP) ? Math.max(0, totalXP) : 0
  const level = getLevelForXP(xp)
  const isMax = level.level >= MAX_LEVEL
  const next = isMax ? undefined : LEVELS[level.level]
  const percent = isMax ? 100 : Math.min(100, Math.max(0, getProgressToNextLevel(xp).percent))
  const remaining = next ? Math.max(0, next.xpRequired - xp) : 0

  return (
    <section aria-label={`Commander rank: level ${level.level} of ${MAX_LEVEL}, ${level.title}`} className={`rounded-2xl border border-white/10 bg-black/30 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl" style={{ background: `${level.color}33`, border: `2px solid ${level.color}` }}>
          {level.badgeEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4B5FD]">Level {level.level} / {MAX_LEVEL}</p>
          <p className="truncate text-base font-black text-white">{level.title}</p>
        </div>
        <p className="text-xs font-bold text-[#1FC8C0]">{xp} XP</p>
      </div>
      <div role="progressbar" aria-label="Progress to next rank" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${level.color}, #1FC8C0)` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-[#9CA3AF]">{next ? `${remaining} XP to ${next.title}` : 'Maximum rank reached. You are a Legend.'}</p>
    </section>
  )
}
