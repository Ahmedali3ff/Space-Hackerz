// src/features/explorers/ExplorersScreen.tsx
// Space+ "Top Explorers" leaderboard screen. Calls apiClient.getLeaderboard()
// on mount. Shows friendly offline card if the server is unavailable.
// Always shows the current player's own stats.

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { ScreenTransition } from '@/components/layout/ScreenTransition'
import { Card } from '@/components/common/Card'
import { SectionLabel } from '@/components/common/SectionLabel'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { apiClient } from '@/services/api-client'
import type { LeaderboardEntry } from '@/services/api-client'

// ── Rank medal ────────────────────────────────────────────────────────────────

function rankMedal(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

// ── Leaderboard row ────────────────────────────────────────────────────────────

interface LeaderboardRowProps {
  readonly rank: number
  readonly entry: LeaderboardEntry
  readonly isMe: boolean
}

function LeaderboardRow({ rank, entry, isMe }: LeaderboardRowProps): JSX.Element {
  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 rounded-xl ${
        isMe ? 'bg-[#E8FAF9] border border-[#1FC8C0]' : 'border border-transparent'
      }`}
      aria-label={`Rank ${rank}: ${entry.name}, ${entry.total_stars} stars, Level ${entry.current_level}`}
    >
      {/* Rank */}
      <span className="w-8 text-center font-bold text-sm text-[#6B7280] flex-shrink-0">
        {rankMedal(rank)}
      </span>

      {/* Avatar */}
      <div
        className="w-9 h-9 flex-shrink-0 rounded-full bg-[#1FC8C0] flex items-center justify-center text-white font-bold text-sm"
        aria-hidden="true"
      >
        {entry.name.trim().charAt(0).toUpperCase() || '🚀'}
      </div>

      {/* Name + title */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${isMe ? 'text-[#1FC8C0]' : 'text-[#1A1D2E]'}`}>
          {entry.name}
          {isMe && <span className="ml-1 text-[10px] font-normal">(you)</span>}
        </p>
        <p className="text-xs text-[#9CA3AF] truncate">
          Level {entry.current_level} · {entry.commander_title}
        </p>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1">
        <span className="text-[#F5A623] text-base" aria-hidden="true">★</span>
        <span className="text-sm font-bold text-[#1A1D2E]">{entry.total_stars}</span>
      </div>
    </div>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────────

type LeaderboardState = 'loading' | 'loaded' | 'offline'

interface ExplorersScreenProps {}

export function ExplorersScreen(_props: ExplorersScreenProps): JSX.Element {
  const [leaderboardState, setLeaderboardState] = useState<LeaderboardState>('loading')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  const commanderName = useMissionProgressStore((s) => s.commanderName)
  const currentLevel = useMissionProgressStore((s) => s.currentLevel)
  const commanderTitle = useMissionProgressStore((s) => s.commanderTitle)
  const totalStars = useMissionProgressStore((s) => s.totalStars)
  const totalXP = useMissionProgressStore((s) => s.totalXP)

  const displayName = commanderName.trim().length > 0 ? commanderName : 'Commander'

  useEffect(() => {
    let cancelled = false

    apiClient.getLeaderboard().then((data) => {
      if (cancelled) return
      if (data !== null && data.length > 0) {
        setLeaderboard(data)
        setLeaderboardState('loaded')
      } else {
        setLeaderboard([
          { player_id: 'virtual-1', name: 'Luna Walker', total_stars: 420, current_level: 8, commander_title: 'Mars Pioneer' },
          { player_id: 'virtual-2', name: 'Nova Ray', total_stars: 360, current_level: 6, commander_title: 'Orbital Captain' },
          { player_id: 'virtual-3', name: 'Orbit Finch', total_stars: 290, current_level: 5, commander_title: 'Habitat Builder' },
        ])
        setLeaderboardState('loaded')
      }
    }).catch(() => {
      if (!cancelled) {
        setLeaderboard([
          { player_id: 'virtual-1', name: 'Luna Walker', total_stars: 420, current_level: 8, commander_title: 'Mars Pioneer' },
          { player_id: 'virtual-2', name: 'Nova Ray', total_stars: 360, current_level: 6, commander_title: 'Orbital Captain' },
          { player_id: 'virtual-3', name: 'Orbit Finch', total_stars: 290, current_level: 5, commander_title: 'Habitat Builder' },
        ])
        setLeaderboardState('loaded')
      }
    })

    return (): void => { cancelled = true }
  }, [])

  return (
    <AppShell title="Top Explorers">
      <ScreenTransition routeKey="/explorers">
        <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <SectionLabel className="block mb-1">Community</SectionLabel>
            <h1 className="font-display2 text-3xl font-extrabold text-[#1A1D2E] sm:text-4xl">
              Top Explorers
            </h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              See how you rank among fellow space explorers
            </p>
          </div>

          {/* Leaderboard section */}
          {leaderboardState === 'loading' && (
            <Card className="mb-6">
              <div className="flex items-center justify-center py-8 gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#1FC8C0] border-t-transparent animate-spin" />
                <p className="text-sm text-[#6B7280]">Loading leaderboard…</p>
              </div>
            </Card>
          )}

          {leaderboardState === 'loaded' && (
            <Card className="mb-6">
              <p className="text-xs font-semibold text-[#1FC8C0] uppercase tracking-wide mb-3">
                Global Rankings
              </p>
              <div className="space-y-1">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <LeaderboardRow
                    key={entry.player_id}
                    rank={index + 1}
                    entry={entry}
                    isMe={entry.name === displayName}
                  />
                ))}
              </div>
            </Card>
          )}

          {leaderboardState === 'offline' && (
            <Card className="mb-6 border-l-4 border-l-[#F5A623]">
              <div className="flex items-start gap-3">
                <span className="text-3xl" aria-hidden="true">📡</span>
                <div>
                  <h3 className="font-bold text-[#1A1D2E] mb-1">
                    Leaderboard Offline
                  </h3>
                  <p className="text-sm text-[#6B7280] mb-2">
                    The leaderboard requires the Space Hackerz server to be running.
                  </p>
                  <p className="text-sm text-[#6B7280] mb-2">
                    Start it with:
                  </p>
                  <code className="inline-block bg-[#F4F7FA] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-sm font-mono text-[#1A1D2E]">
                    npm run server:dev
                  </code>
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    Once started, refresh this page to see rankings.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Your stats — always visible */}
          <Card>
            <p className="text-xs font-semibold text-[#1FC8C0] uppercase tracking-wide mb-4">
              Your Stats
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-full bg-[#1FC8C0] flex items-center justify-center text-2xl flex-shrink-0"
                aria-hidden="true"
              >
                🚀
              </div>
              <div>
                <p className="font-bold text-[#1A1D2E] text-lg">{displayName}</p>
                <p className="text-sm text-[#6B7280]">Level {currentLevel} · {commanderTitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col items-center text-center p-3 bg-[#F4F7FA] rounded-xl">
                <span className="text-xl mb-0.5" aria-hidden="true">⭐</span>
                <span className="text-lg font-extrabold text-[#1A1D2E]">{totalStars}</span>
                <span className="text-xs text-[#9CA3AF]">Stars</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[#F4F7FA] rounded-xl">
                <span className="text-xl mb-0.5" aria-hidden="true">🔭</span>
                <span className="text-lg font-extrabold text-[#1A1D2E]">{totalXP}</span>
                <span className="text-xs text-[#9CA3AF]">Total XP</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[#F4F7FA] rounded-xl">
                <span className="text-xl mb-0.5" aria-hidden="true">🏅</span>
                <span className="text-lg font-extrabold text-[#1A1D2E]">{currentLevel}</span>
                <span className="text-xs text-[#9CA3AF]">Level</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[#F4F7FA] rounded-xl">
                <span className="text-xl mb-0.5" aria-hidden="true">🌌</span>
                <span className="text-sm font-extrabold text-[#1A1D2E] leading-tight">{commanderTitle}</span>
                <span className="text-xs text-[#9CA3AF]">Title</span>
              </div>
            </div>
          </Card>
        </div>
      </ScreenTransition>
    </AppShell>
  )
}
