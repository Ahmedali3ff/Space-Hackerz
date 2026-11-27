// Interactive 20-level campaign map grouped into five chapters, with progress, rank and a Continue action.
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Star } from '@phosphor-icons/react'
import { MISSIONS } from '@data/missions/mission-definitions'
import type { MissionDefinition } from '@data/missions/mission-definitions'
import { CHAPTERS } from '@data/missions/chapters'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { RankProgress } from '@/components/game/RankProgress'
import type { MissionStatus } from '@data/missions/mission-progress'

export function CampaignMapScreen(): JSX.Element {
  const navigate = useNavigate()
  const getMissionStatus = useMissionProgressStore((s) => s.getMissionStatus)
  const missions = useMissionProgressStore((s) => s.missions) ?? {}
  const totalXP = useMissionProgressStore((s) => s.totalXP) ?? 0
  const totalStars = useMissionProgressStore((s) => s.totalStars) ?? 0
  const currentMissionId = useMissionProgressStore((s) => s.currentMissionId)

  const statusOf = (id: string): MissionStatus => getMissionStatus(id)
  const completedCount = MISSIONS.filter((m) => statusOf(m.id) === 'completed').length
  const percentDone = Math.round((completedCount / MISSIONS.length) * 100)

  const continueMission = useMemo(() => {
    const current = MISSIONS.find((m) => m.id === currentMissionId)
    if (current && getMissionStatus(current.id) === 'active') return current
    return MISSIONS.find((m) => getMissionStatus(m.id) === 'active')
  }, [currentMissionId, getMissionStatus])

  return (
    <div className="game-bg min-h-screen">
      <div className="star-field" aria-hidden="true" />
      <header className="relative z-10 flex items-center justify-between px-4 pb-2 pt-4">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 text-[#C4B5FD] hover:text-white" aria-label="Back to home">
          <ArrowLeft size={20} /> <span className="text-sm font-bold">Home</span>
        </button>
        <h1 className="text-lg font-black text-white">Campaign</h1>
        <span className="flex items-center gap-1 text-xs font-bold text-[#F5A623]" aria-label={`${totalStars} of ${MISSIONS.length * 3} stars`}>
          <Star size={14} weight="fill" /> {totalStars}/{MISSIONS.length * 3}
        </span>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-24">
        <div className="mb-6 grid gap-3 md:grid-cols-2">
          <RankProgress totalXP={totalXP} />
          <section aria-label="Campaign progress" className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4B5FD]">Campaign progress</p>
              <p className="text-xs font-bold text-white">{completedCount} / {MISSIONS.length} missions</p>
            </div>
            <div role="progressbar" aria-label="Campaign completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentDone} className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#1FC8C0] transition-all duration-700" style={{ width: `${percentDone}%` }} />
            </div>
            {continueMission ? (
              <button type="button" onClick={() => navigate(`/game/cinematic/${continueMission.id}`)} className="mt-3 w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] py-2.5 text-sm font-bold text-white hover:scale-[1.02]">
                ▶ Continue: Level {continueMission.number}
              </button>
            ) : (
              <p className="mt-3 text-center text-xs font-bold text-[#F5A623]">🏆 Campaign complete. Replay any level to improve your stars.</p>
            )}
          </section>
        </div>

        {CHAPTERS.map((chapter) => {
          const chapterMissions = chapter.missionIds.map((id) => MISSIONS.find((m) => m.id === id)).filter((m): m is MissionDefinition => m !== undefined)
          const done = chapterMissions.filter((m) => statusOf(m.id) === 'completed').length
          return (
            <section key={chapter.id} aria-labelledby={`chapter-${chapter.id}`} className="mb-8">
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4B5FD]">Chapter {chapter.id} · {done}/{chapterMissions.length}</p>
                <h2 id={`chapter-${chapter.id}`} className="text-base font-black text-white"><span aria-hidden="true">{chapter.emoji} </span>{chapter.title}</h2>
                <p className="text-xs text-[#9CA3AF]">{chapter.tagline}</p>
              </div>
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {chapterMissions.map((mission) => {
                  const status = statusOf(mission.id)
                  const locked = status === 'locked'
                  const completed = status === 'completed'
                  const stars = missions[mission.id]?.earnedStars ?? 0
                  return (
                    <li key={mission.id}>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => navigate(`/game/cinematic/${mission.id}`)}
                        aria-label={`${mission.title} — ${status}`}
                        aria-current={status === 'active' ? 'step' : undefined}
                        className={`flex w-full flex-col items-center gap-2 rounded-2xl border p-4 text-center ${locked ? 'cursor-not-allowed border-[#2a2a4a] bg-[#0F1428] opacity-50' : 'cursor-pointer border-white/10 bg-black/30 hover:scale-[1.03]'}`}
                      >
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl font-black ${locked ? 'bg-[#1a1a3a] text-[#6B7280]' : completed ? 'bg-[#F5A623] text-[#0A0E1A]' : 'bg-[#7C3AED] text-white'}`}>
                          {locked ? <Lock size={18} aria-hidden="true" /> : mission.number}
                        </span>
                        <span className={`text-xs font-bold leading-tight ${locked ? 'text-[#6B7280]' : completed ? 'text-[#F5A623]' : 'text-white'}`}>{mission.title}</span>
                        <span className="text-[10px] text-[#C4B5FD]">{mission.difficultyLabel ?? mission.difficulty}</span>
                        {completed && <span aria-label={`${stars} of 3 stars`} className="text-[11px] text-[#F5A623]">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>}
                        {status === 'active' && <span className="rounded-full bg-[#1FC8C0]/20 px-2 py-0.5 text-[10px] font-bold text-[#1FC8C0]">READY</span>}
                        {locked && <span className="text-[10px] text-[#6B7280]">Finish mission {mission.number - 1} first</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </main>
    </div>
  )
}
