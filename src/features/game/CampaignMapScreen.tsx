// src/features/game/CampaignMapScreen.tsx
// Interactive 8-level campaign mission map screen.
// Dark game theme with star-field overlay and teal/gold connecting lines.
// Clicking an active/completed node navigates to the cinematic intro.

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Star } from '@phosphor-icons/react'
import { MISSIONS } from '@data/missions/mission-definitions'
import { useMissionProgressStore } from '@store/mission-progress-store'
import type { MissionDefinition } from '@data/missions/mission-definitions'
import type { MissionStatus } from '@data/missions/mission-progress'

// ── Props ─────────────────────────────────────────────────────────────────────

interface CampaignMapScreenProps {
  // intentionally empty — screen reads from stores/router
}

// ── Sub-component: MissionNode ────────────────────────────────────────────────

interface MissionNodeProps {
  readonly mission: MissionDefinition
  readonly status: MissionStatus
  readonly isActive: boolean
  readonly onClick: () => void
}

function MissionNode({ mission, status, isActive, onClick }: MissionNodeProps): JSX.Element {
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'
  const isMoon = mission.planet === 'moon'

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      aria-label={`${mission.title} — ${status}`}
      className={[
        'relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 border text-left w-full',
        isLocked
          ? 'opacity-40 cursor-not-allowed bg-[#0F1428] border-[#2a2a4a]'
          : isCompleted
          ? 'game-card-gold cursor-pointer hover:scale-105'
          : 'game-card cursor-pointer hover:scale-105',
        isActive ? 'animate-[pulse-level-node_2s_ease-in-out_infinite]' : '',
      ].join(' ')}
    >
      {/* Level number badge */}
      <div
        className={[
          'text-2xl font-black w-10 h-10 rounded-full flex items-center justify-center',
          isLocked
            ? 'bg-[#1a1a3a] text-[#555]'
            : isCompleted
            ? 'bg-[#F5A623] text-[#0A0E1A]'
            : 'bg-[#7C3AED] text-white',
        ].join(' ')}
      >
        {isLocked ? <Lock size={18} /> : mission.number}
      </div>

      {/* Planet badge */}
      <span className="text-lg" aria-hidden="true">
        {isMoon ? '🌙' : '🔴'}
      </span>

      {/* Mission title */}
      <div className="text-center">
        <p
          className={[
            'text-xs font-bold leading-tight',
            isLocked ? 'text-[#555]' : isCompleted ? 'text-[#F5A623]' : 'text-white',
          ].join(' ')}
        >
          {mission.title}
        </p>
        <p className="text-[10px] text-[#C4B5FD] mt-0.5">
          {mission.difficultyLabel ?? mission.difficulty}
        </p>
      </div>

      {/* Stars if completed */}
      {isCompleted && (
        <div className="flex gap-0.5">
          {[1, 2, 3].map((s) => (
            <Star key={s} size={12} weight="fill" className="text-[#F5A623]" />
          ))}
        </div>
      )}

      {/* Active glow ring */}
      {isActive && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#1FC8C0] pointer-events-none" />
      )}
    </button>
  )
}

// ── Connection line SVG between nodes ────────────────────────────────────────

function ConnectorLine({ isUnlocked }: { readonly isUnlocked: boolean }): JSX.Element {
  return (
    <div className="flex justify-center items-center h-4 my-1">
      <svg width="2" height="16" aria-hidden="true">
        <line
          x1="1" y1="0" x2="1" y2="16"
          stroke={isUnlocked ? '#1FC8C0' : '#2a2a4a'}
          strokeWidth="2"
          strokeDasharray={isUnlocked ? undefined : '4 3'}
        />
      </svg>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function CampaignMapScreen(_props: CampaignMapScreenProps): JSX.Element {
  const navigate = useNavigate()
  const getMissionStatus = useMissionProgressStore((s) => s.getMissionStatus)
  const totalXP = useMissionProgressStore((s) => s.totalXP)
  const totalStars = useMissionProgressStore((s) => s.totalStars)

  function handleNodeClick(missionId: string, status: MissionStatus): void {
    if (status === 'locked') return
    navigate(`/game/cinematic/${missionId}`)
  }

  return (
    <div className="game-bg min-h-screen">
      {/* Star field overlay */}
      <div className="star-field" aria-hidden="true" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => navigate('/missions')}
          className="flex items-center gap-2 text-[#C4B5FD] hover:text-white transition-colors"
          aria-label="Back to missions"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Missions</span>
        </button>

        <h1 className="text-lg font-black text-white">Campaign</h1>

        {/* XP + stars counter */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-[#F5A623] flex items-center gap-1">
            <Star size={14} weight="fill" />
            {totalStars}
          </span>
          <span className="text-[#1FC8C0]">{totalXP} XP</span>
        </div>
      </header>

      {/* Mission nodes — 2-column grid for compact layout */}
      <main className="relative z-10 px-4 pb-8 overflow-y-auto">
        {/* Moon chapter label */}
        <p className="text-[10px] uppercase tracking-widest text-[#C4B5FD] font-bold mb-2 mt-2">
          🌙 Moon Missions
        </p>

        <div className="grid grid-cols-2 gap-3">
          {MISSIONS.slice(0, 3).map((mission, idx) => {
            const status = getMissionStatus(mission.id)
            const isActive = status === 'active'
            return (
              <React.Fragment key={mission.id}>
                <MissionNode
                  mission={mission}
                  status={status}
                  isActive={isActive}
                  onClick={() => handleNodeClick(mission.id, status)}
                />
                {/* Connector after m01 and m02 (vertical col 1) */}
                {idx === 1 && <div />}
              </React.Fragment>
            )
          })}
        </div>

        <ConnectorLine isUnlocked={getMissionStatus('m04') !== 'locked'} />

        {/* Mars chapter label */}
        <p className="text-[10px] uppercase tracking-widest text-[#C4B5FD] font-bold mb-2 mt-2">
          🔴 Mars Missions
        </p>

        <div className="grid grid-cols-2 gap-3">
          {MISSIONS.slice(3, 6).map((mission) => {
            const status = getMissionStatus(mission.id)
            const isActive = status === 'active'
            return (
              <MissionNode
                key={mission.id}
                mission={mission}
                status={status}
                isActive={isActive}
                onClick={() => handleNodeClick(mission.id, status)}
              />
            )
          })}
        </div>

        <ConnectorLine isUnlocked={getMissionStatus('m07') !== 'locked'} />

        {/* Advanced chapter label */}
        <p className="text-[10px] uppercase tracking-widest text-[#C4B5FD] font-bold mb-2 mt-2">
          ⭐ Expert Missions
        </p>

        <div className="grid grid-cols-2 gap-3">
          {MISSIONS.slice(6, 8).map((mission) => {
            const status = getMissionStatus(mission.id)
            const isActive = status === 'active'
            return (
              <MissionNode
                key={mission.id}
                mission={mission}
                status={status}
                isActive={isActive}
                onClick={() => handleNodeClick(mission.id, status)}
              />
            )
          })}
        </div>
      </main>
    </div>
  )
}
