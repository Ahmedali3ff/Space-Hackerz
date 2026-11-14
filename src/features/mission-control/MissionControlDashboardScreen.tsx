import { Navigate, useNavigate } from 'react-router-dom'
import { MISSIONS } from '@data/missions/mission-definitions'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { useMissionStore } from '@store/mission-store'

const VIRTUAL_RANKING = [
  { name: 'Luna Walker', stars: 420, level: 8, title: 'Mars Pioneer' },
  { name: 'Nova Ray', stars: 360, level: 6, title: 'Orbital Captain' },
  { name: 'Orbit Finch', stars: 290, level: 5, title: 'Habitat Builder' },
]

function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase() || 'EX'
}

export function MissionControlDashboardScreen(): JSX.Element {
  const navigate = useNavigate()
  const commanderName = useMissionProgressStore((s) => s.commanderName)
  const currentLevel = useMissionProgressStore((s) => s.currentLevel)
  const totalStars = useMissionProgressStore((s) => s.totalStars)
  const currentMissionId = useMissionProgressStore((s) => s.currentMissionId) ?? 'm01'
  const getMissionStatus = useMissionProgressStore((s) => s.getMissionStatus)
  const selectPlanet = useMissionStore((s) => s.selectPlanet)
  const setCrewSize = useMissionStore((s) => s.setCrewSize)

  if (!commanderName.trim()) {
    return <Navigate to="/" replace />
  }

  const activeMission = MISSIONS.find((mission) => mission.id === currentMissionId) ?? MISSIONS[0]
  const completedCount = MISSIONS.filter((mission) => getMissionStatus(mission.id) === 'completed').length
  const playerRank = Math.max(4, 40 - currentLevel * 3 - Math.floor(totalStars / 50))
  const startCurrentMission = (): void => {
    selectPlanet(activeMission.planet)
    setCrewSize(4)
    navigate(`/game/cinematic/${activeMission.id}`)
  }

  return (
    <div className="sh-control-page">
      <header className="sh-control-topbar">
        <button className="sh-control-brand" type="button" onClick={() => navigate('/')}>
          <span>✦</span> SPACE HACKERZ
        </button>
        <nav className="sh-control-nav" aria-label="Mission navigation">
          <button className="active" type="button">MISSION CONTROL</button>
          <button type="button" onClick={() => navigate('/discoveries')}>MY DISCOVERIES</button>
          <button type="button" onClick={() => navigate('/spaceship')}>MY SPACESHIP</button>
          <button type="button" onClick={() => navigate('/explorers')}>EXPLORERS</button>
        </nav>
        <div className="sh-control-profile">
          <span className="sh-star-chip">★ {totalStars}</span>
          <span className="sh-avatar">{initials(commanderName)}</span>
          <span><strong>{commanderName}</strong><small>Level {currentLevel} · Space explorer</small></span>
        </div>
      </header>

      <div className="sh-control-layout">
        <aside className="sh-control-rail">
          <button className="active" type="button"><span>◉</span>Explore</button>
          <button type="button" onClick={() => navigate('/campaign-map')}><span>⌘</span>Star map</button>
          <button type="button" onClick={() => navigate('/explorers')}><span>♜</span>Ranking</button>
          <button type="button" onClick={() => navigate('/discoveries')}><span>▤</span>Space log</button>
          <div className="sh-rail-spacer" />
          <button type="button" onClick={() => navigate('/game-settings')}><span>?</span>Help</button>
        </aside>

        <main className="sh-control-main">
          <div className="sh-control-heading">
            <div><p className="sh-control-kicker">SOLAR SYSTEM ADVENTURE</p><h1>Ready for a little Mars magic, {commanderName}?</h1></div>
            <span className="sh-live-badge"><i /> Mission in progress</span>
          </div>

          <section className="sh-control-grid">
            <article className="sh-active-mission">
              <div className="sh-mission-copy">
                <p className="sh-control-kicker">MISSION {String(activeMission.number).padStart(2, '0')} / {activeMission.subtitle.toUpperCase()}</p>
                <h2>{activeMission.title}</h2>
                <p>{activeMission.description}</p>
                <div className="sh-mission-meta"><span>◷ {activeMission.duration} SOLS</span><span>◈ {activeMission.difficultyLabel ?? activeMission.difficulty}</span><span>★ {activeMission.rewards.stars} stars</span></div>
                <button className="sh-orange-cta" type="button" onClick={startCurrentMission}>START LEVEL {activeMission.number} <span>↗</span></button>
              </div>
              <div className={`sh-dashboard-planet ${activeMission.planet}`} aria-label={`${activeMission.planet} mission visual`}><span /><b>{activeMission.planet === 'moon' ? 'LUNA' : 'MARS'}</b></div>
            </article>

            <aside className="sh-control-side">
              <div className="sh-side-card">
                <div className="sh-side-title"><span>▣</span><strong>Your mission</strong><em>LIVE</em></div>
                <p className="sh-side-muted">{activeMission.title}</p>
                <div className="sh-progress-label"><span>Mission progress</span><b>{Math.round((completedCount / MISSIONS.length) * 100)}%</b></div>
                <div className="sh-progress"><span style={{ width: `${Math.max(8, (completedCount / MISSIONS.length) * 100)}%` }} /></div>
                <ul className="sh-objective-list">
                  {activeMission.tasks.slice(0, 3).map((task, index) => <li key={task.id} className={index === 0 ? 'current' : ''}><span>{index === 0 ? '●' : '○'}</span><div><strong>{task.label}</strong><small>{index === 0 ? 'Ready to explore' : 'Unlocks as you progress'}</small></div></li>)}
                </ul>
                <button className="sh-text-cta" type="button" onClick={() => navigate('/campaign-map')}>View mission map ↗</button>
              </div>
              <div className="sh-side-card sh-ranking-card">
                <div className="sh-side-title"><span>♛</span><strong>Online ranking</strong><em>SIMULATED</em></div>
                <p className="sh-side-muted">Your local score is synced to this live board.</p>
                {VIRTUAL_RANKING.slice(0, 3).map((entry, index) => <div className="sh-rank-row" key={entry.name}><b>{index + 1}</b><span className="sh-rank-avatar">{initials(entry.name)}</span><strong>{entry.name}</strong><em>★ {entry.stars}</em></div>)}
                <div className="sh-rank-row you"><b>#{playerRank}</b><span className="sh-rank-avatar">{initials(commanderName)}</span><strong>{commanderName} <small>YOU</small></strong><em>★ {totalStars}</em></div>
                <button className="sh-text-cta" type="button" onClick={() => navigate('/explorers')}>Open full ranking ↗</button>
              </div>
            </aside>
          </section>

          <section className="sh-journey-section"><div className="sh-journey-heading"><h2>Your cosmic journey</h2><span>{completedCount} of {MISSIONS.length} missions complete</span><button type="button" onClick={() => navigate('/campaign-map')}>View star map ↗</button></div><div className="sh-journey-grid">{MISSIONS.slice(0, 3).map((mission) => { const status = getMissionStatus(mission.id); const isCurrent = status === 'active'; return <button key={mission.id} type="button" className={`sh-journey-card ${isCurrent ? 'current' : ''} ${status}`} disabled={status === 'locked'} onClick={() => isCurrent && navigate(`/game/cinematic/${mission.id}`)}><span className="sh-journey-icon">{status === 'completed' ? '✓' : status === 'locked' ? '⌑' : '◈'}</span><div><small>{status === 'completed' ? 'MISSION COMPLETE' : isCurrent ? 'YOU ARE HERE' : 'UNLOCKS AFTER THE MOON'}</small><h3>{mission.title}</h3><p>{mission.subtitle}</p></div><strong>{status === 'locked' ? '⌑' : '→'}</strong></button> })}</div></section>
        </main>
      </div>
    </div>
  )
}
