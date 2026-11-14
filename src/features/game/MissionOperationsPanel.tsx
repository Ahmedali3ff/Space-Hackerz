import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMissionOperation } from '@data/missions/mission-operations'
import { useMissionOperationsStore, operationCanComplete } from '@store/mission-operations-store'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { useMissionStore } from '@store/mission-store'
import { getAudioManager } from '@/services/audio-manager'
import { EventBus } from '@/game/EventBus'

interface MissionOperationsPanelProps { readonly levelId: string; readonly onClose: () => void }

const resourceLabels = [
  ['oxygen', 'Oxygen', '#A855F7'], ['water', 'Water', '#3B82F6'], ['food', 'Food', '#22C55E'], ['energy', 'Energy', '#F59E0B'],
] as const
export const ACTION_BUILDINGS: Readonly<Record<string, string>> = {
  'inspect-oxygen': 'life-support', 'repair-filter': 'life-support', 'generate-oxygen': 'life-support', 'emergency-oxygen': 'life-support',
  'activate-power': 'power-room', 'stabilize-communication': 'communications', 'activate-life-support': 'life-support',
  'inspect-solar': 'solar-panels', 'activate-backup': 'power-room', 'reduce-consumption': 'command-center', 'repair-solar': 'solar-panels', 'restore-power': 'power-room',
  'recycle-water': 'water-recycling', 'activate-hydroponics': 'greenhouse', 'reduce-water': 'water-recycling', 'emergency-rationing': 'greenhouse',
  'dust-protection': 'airlock', 'protect-solar': 'solar-panels', 'reduce-energy': 'command-center', 'emergency-mode': 'command-center', 'repair-equipment': 'airlock',
  'scan-system': 'command-center', 'inspect-system': 'command-center', 'shutdown-system': 'command-center', 'repair-component': 'airlock', 'restart-system': 'command-center', 'verify-stability': 'command-center',
  'protect-crew': 'life-support', 'contact-control': 'communications',
}

export function MissionOperationsPanel({ levelId, onClose }: MissionOperationsPanelProps): JSX.Element {
  const navigate = useNavigate()
  const mission = getMissionOperation(levelId)
  const state = useMissionOperationsStore()
  const start = useMissionOperationsStore((store) => store.start)
  const applyAction = useMissionOperationsStore((store) => store.applyAction)
  const answerPuzzle = useMissionOperationsStore((store) => store.answerPuzzle)
  const reset = useMissionOperationsStore((store) => store.reset)
  const markWon = useMissionOperationsStore((store) => store.markWon)
  const completeMission = useMissionProgressStore((store) => store.completeMission)
  const crewSize = useMissionStore((store) => store.crewSize)
  const setCrewSize = useMissionStore((store) => store.setCrewSize)

  useEffect(() => {
    if (state.activeLevelId !== levelId) start(levelId)
  }, [levelId, state.activeLevelId, start])

  if (!mission) return <div role="dialog" aria-modal="true" className="sh-ops-modal"><div className="sh-ops-card"><p>Mission data unavailable.</p><button onClick={onClose}>Close</button></div></div>

  const canComplete = operationCanComplete(levelId, state)
  const finishMission = (): void => {
    if (!canComplete) return
    getAudioManager().playSound('level_complete')
    markWon()
    completeMission(mission.missionId, Math.min(3, Math.max(1, Math.round(state.score / 150))))
    onClose()
    navigate(`/level-complete/${mission.missionId}`)
  }

  if (state.status === 'lost') return <div role="dialog" aria-modal="true" className="sh-ops-modal"><section className="sh-ops-card sh-ops-game-over"><span className="sh-eyebrow">Mission failed</span><h2>GAME OVER</h2><p>Cause: <strong>{state.lossCause ?? 'Critical survival condition failed'}</strong></p><p>Mission duration: <strong>{Math.floor(state.missionTimeSeconds / 60).toString().padStart(2, '0')}:{(state.missionTimeSeconds % 60).toString().padStart(2, '0')}</strong></p><p>Score: <strong>{state.score}</strong></p><div className="sh-ops-footer"><button className="sh-ops-reset" onClick={() => { reset(); start(levelId) }}>Retry Mission</button><button className="sh-ops-complete" onClick={() => navigate('/campaign-map')}>Mission Map</button><button className="sh-ops-reset" onClick={onClose}>Review Mission</button></div></section></div>

  return (
    <div role="dialog" aria-modal="true" aria-label={`${mission.title} operations`} className="sh-ops-modal" onClick={onClose}>
      <section className="sh-ops-card" onClick={(event) => event.stopPropagation()}>
        <header className="sh-ops-header">
          <div><span className="sh-eyebrow">Mission operations · {mission.levelId.replace('level-', 'Level ')}</span><h2>{mission.title}</h2></div>
          <button className="sh-icon-btn" onClick={onClose} aria-label="Close operations">×</button>
        </header>
        <p className="sh-ops-situation">{mission.situation}</p>
        <p className="sh-ops-context">{mission.scientificContext}</p>
        <div className="sh-ops-stats">
          <span>Score <strong>{state.score}</strong></span><span className={state.timeRemainingSeconds < 30 ? 'sh-time-critical' : ''}>Time <strong>{Math.floor(state.timeRemainingSeconds / 60).toString().padStart(2, '0')}:{(state.timeRemainingSeconds % 60).toString().padStart(2, '0')}</strong></span><span>Decisions <strong>{state.decisionsMade}</strong></span>
        </div>
        <div className="sh-ops-resources" aria-label="Mission operation resources">
          {resourceLabels.map(([key, label, color]) => <div key={key}><div className="sh-ops-resource-label"><span>{label}</span><strong>{state.resources[key]}%</strong></div><div className="sh-ops-resource-track"><span style={{ width: `${state.resources[key]}%`, background: state.resources[key] < 15 ? '#EF4444' : color }} /></div></div>)}
        </div>
        <p className="sh-ops-objective"><strong>Objective:</strong> {mission.objective}</p>
        {mission.levelId === 'level-1' && <div className="sh-ops-crew"><span><strong>Crew size</strong><small>More crew means higher daily consumption.</small></span><div>{[1, 2, 3, 4, 5, 6].map((size) => <button key={size} className={crewSize === size ? 'selected' : ''} onClick={() => setCrewSize(size)}>{size}</button>)}</div></div>}
        <div className="sh-ops-actions">
          {mission.actions.map((action) => {
            const done = state.completedObjectiveIds.includes(action.objectiveId)
            const current = state.currentTaskId === action.id
            const disabled = done || !current
            return <button key={action.id} disabled={disabled} className={done ? 'sh-ops-action done' : current ? 'sh-ops-action current' : 'sh-ops-action locked'} onClick={() => { getAudioManager().playSound('click'); const buildingId = ACTION_BUILDINGS[action.id]; if (buildingId) { EventBus.emit('highlight-building', { buildingId, actionId: action.id }); onClose() } else { if (action.id === 'select-moon' || action.id === 'select-mars') useMissionStore.getState().selectPlanet(action.id === 'select-mars' ? 'mars' : 'moon'); applyAction(action.id); state.tick() } }}><span>{done ? '✓' : current ? '→' : '🔒'} {action.label}</span><small>{done ? 'Completed' : current ? `Go to ${ACTION_BUILDINGS[action.id]?.replace(/-/g, ' ') ?? 'the station'} to perform this task` : 'Complete the previous task first'}</small></button>
          })}
        </div>
        {mission.puzzles.map((puzzle) => <div className="sh-ops-puzzle" key={puzzle.id}><span className="sh-eyebrow">Scientific challenge</span><p>{puzzle.question}</p><div className="sh-ops-options">{puzzle.options.map((option) => <button key={option} disabled={state.completedPuzzleIds.includes(puzzle.id)} onClick={() => { getAudioManager().playSound('click'); answerPuzzle(puzzle.id, option) }}>{option}</button>)}</div></div>)}
        {state.feedback && <div role="status" className={`sh-ops-feedback ${state.feedback.tone}`}>{state.feedback.tone === 'positive' ? '✓ ' : state.feedback.tone === 'negative' ? '⚠ ' : '• '}{state.feedback.message}</div>}
        <div className="sh-ops-footer"><button className="sh-ops-reset" onClick={() => { reset(); start(levelId) }}>Restart Operations</button><button className="sh-ops-complete" disabled={!canComplete} onClick={finishMission}>{canComplete ? 'Complete Mission' : 'Complete objectives to finish'}</button></div>
      </section>
    </div>
  )
}
