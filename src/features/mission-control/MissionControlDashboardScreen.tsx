import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { MISSIONS } from '@data/missions/mission-definitions'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { useMissionStore } from '@store/mission-store'
import { useMissionOperationsStore } from '@store/mission-operations-store'
import { AstroAIPanel } from './AstroAIPanel'

function initials(name: string): string { return name.trim().slice(0, 2).toUpperCase() || 'EX' }
function pct(value: number): number { return Math.max(0, Math.min(100, Math.round(value))) }

export function MissionControlDashboardScreen(): JSX.Element {
  const navigate = useNavigate()
  const commanderName = useMissionProgressStore((s) => s.commanderName)
  const currentLevel = useMissionProgressStore((s) => s.currentLevel)
  const totalStars = useMissionProgressStore((s) => s.totalStars)
  const currentMissionId = useMissionProgressStore((s) => s.currentMissionId) ?? 'm01'
  const getMissionStatus = useMissionProgressStore((s) => s.getMissionStatus)
  const selectPlanet = useMissionStore((s) => s.selectPlanet)
  const setCrewSize = useMissionStore((s) => s.setCrewSize)
  const operationResources = useMissionOperationsStore((s) => s.resources)
  const operationStatus = useMissionOperationsStore((s) => s.status)
  const operationScore = useMissionOperationsStore((s) => s.score)
  const startOperation = useMissionOperationsStore((s) => s.start)
  const [refreshedAt, setRefreshedAt] = useState(() => new Date())
  const [isSimulating, setIsSimulating] = useState(false)
  const [showAI, setShowAI] = useState(false)

  if (!commanderName.trim()) return <Navigate to="/" replace />

  const activeMission = MISSIONS.find((mission) => mission.id === currentMissionId) ?? MISSIONS[0]
  const completedCount = MISSIONS.filter((mission) => getMissionStatus(mission.id) === 'completed').length
  const playerRank = Math.max(4, 40 - currentLevel * 3 - Math.floor(totalStars / 50))
  const startCurrentMission = (): void => {
    selectPlanet(activeMission.planet)
    setCrewSize(4)
    if (activeMission.levelId) startOperation(activeMission.levelId)
    navigate(`/game/cinematic/${activeMission.id}`)
  }
  const refreshTelemetry = (): void => setRefreshedAt(new Date())
  const runSimulation = (): void => {
    setIsSimulating(true)
    window.setTimeout(() => { setIsSimulating(false); setRefreshedAt(new Date()) }, 1400)
  }
  const generateReport = (): void => {
    const report = [`SPACE HACKERZ MISSION CONTROL`, `Commander: ${commanderName}`, `Mission: ${activeMission.title}`, `Score: ${operationScore}`, `System status: ${operationStatus.toUpperCase()}`, `Oxygen: ${pct(operationResources.oxygen)}%`, `Water: ${pct(operationResources.water)}%`, `Food: ${pct(operationResources.food)}%`, `Energy: ${pct(operationResources.energy)}%`].join('\n')
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain' }))
    const link = document.createElement('a'); link.href = url; link.download = 'space-hackerz-mission-report.txt'; link.click(); URL.revokeObjectURL(url)
  }
  const systems = useMemo(() => [
    { label: 'Life support', value: pct(operationResources.oxygen), color: 'green' },
    { label: 'Water recycling', value: pct(operationResources.water), color: 'cyan' },
    { label: 'Food reserves', value: pct(operationResources.food), color: 'purple' },
    { label: 'Power systems', value: pct(operationResources.energy), color: operationResources.energy < 30 ? 'red' : 'green' },
  ], [operationResources])

  useEffect(() => { if (isSimulating) return undefined; const id = window.setInterval(refreshTelemetry, 30000); return () => window.clearInterval(id) }, [isSimulating])

  return <div className="sh-control-page sh-ops-dashboard">
    <header className="sh-control-topbar">
      <button className="sh-control-brand" type="button" onClick={() => navigate('/')}><span>✦</span> SPACE HACKERZ</button>
      <nav className="sh-control-nav" aria-label="Mission navigation"><button className="active" type="button">MISSION CONTROL</button><button type="button" onClick={() => navigate('/discoveries')}>MY DISCOVERIES</button><button type="button" onClick={() => navigate('/spaceship')}>MY SPACESHIP</button><button type="button" onClick={() => navigate('/explorers')}>EXPLORERS</button></nav>
      <div className="sh-control-profile"><span className="sh-star-chip">★ {totalStars}</span><span className="sh-avatar">{initials(commanderName)}</span><span><strong>{commanderName}</strong><small>Level {currentLevel} · Space explorer</small></span></div>
    </header>
    <div className="sh-control-layout">
      <aside className="sh-control-rail"><button className="active" type="button"><span>◉</span>Explore</button><button type="button" onClick={() => navigate('/campaign-map')}><span>⌘</span>Star map</button><button type="button" onClick={() => navigate('/explorers')}><span>♜</span>Ranking</button><button type="button" onClick={() => navigate('/discoveries')}><span>▤</span>Space log</button><div className="sh-rail-spacer" /><button type="button" onClick={() => navigate('/game-settings')}><span>?</span>Settings</button></aside>
      <main className="sh-control-main">
        <div className="sh-ops-statusline"><span><i /> SYSTEM STATUS: <b>NOMINAL</b></span><small>LAST SYNC {refreshedAt.toLocaleTimeString()}</small><button type="button" onClick={refreshTelemetry}>↻ REFRESH DATA</button></div>
        <div className="sh-control-heading"><div><p className="sh-control-kicker">MISSION OPERATIONS / LIVE SIMULATOR</p><h1>Mission control, {commanderName}.</h1></div><span className="sh-live-badge"><i /> {isSimulating ? 'SIMULATION RUNNING' : 'MISSION IN PROGRESS'}</span></div>
        <section className="sh-ops-grid">
          <article className="sh-ops-panel sh-ops-system-panel"><div className="sh-ops-panel-heading"><div><p className="sh-ops-label">SYSTEM TELEMETRY</p><h2>Habitat status</h2></div><span className="sh-ops-green-dot">● LIVE</span></div><div className="sh-system-cards">{systems.map((system) => <div className={`sh-system-card ${system.color}`} key={system.label}><span className="sh-system-icon">{system.label === 'Life support' ? '◉' : system.label === 'Water recycling' ? '◇' : system.label === 'Food reserves' ? '✣' : '⚡'}</span><small>{system.label}</small><strong>{system.value}%</strong><div><i style={{ width: `${system.value}%` }} /></div><em>{system.value > 70 ? 'NOMINAL' : system.value > 30 ? 'WATCH' : 'CRITICAL'}</em></div>)}</div></article>
          <article className="sh-ops-panel sh-spacecraft-panel"><div className="sh-ops-panel-heading"><div><p className="sh-ops-label">ACTIVE SPACECRAFT</p><h2>ASTRA-01</h2></div><button className="sh-kebab" type="button" onClick={refreshTelemetry}>⋮</button></div><p className="sh-muted">Crewed habitat · {activeMission.planet.toUpperCase()} orbit</p><div className="sh-readiness"><div><small>MISSION READINESS</small><strong>{Math.round(systems.reduce((sum, item) => sum + item.value, 0) / systems.length)}%</strong></div><div className="sh-readiness-ring"><span>{currentLevel}</span><small>LEVEL</small></div></div><div className="sh-spacecraft-metrics"><span><small>OBJECTIVES</small><b>{completedCount}/{MISSIONS.length}</b></span><span><small>MISSION SCORE</small><b>{operationScore}</b></span><span><small>CREW</small><b>04</b></span></div></article>
          <article className="sh-ops-panel sh-pipeline-panel"><div className="sh-ops-panel-heading"><div><p className="sh-ops-label">PIPELINE MONITOR</p><h2>Operations at a glance</h2></div><span className="sh-alert-badge">{activeMission.tasks.length} TASKS</span></div>{activeMission.tasks.slice(0, 3).map((task, index) => <button className="sh-pipeline-row" type="button" key={task.id} onClick={startCurrentMission}><span className={`sh-pipeline-status ${index === 0 ? 'warning' : 'ready'}`}>{index === 0 ? '!' : '✓'}</span><span><strong>{task.label}</strong><small>{index === 0 ? 'READY FOR FIELD ACTION' : 'LOCKED UNTIL PREVIOUS STEP'}</small></span><em>{index === 0 ? 'ACTIVE' : 'QUEUED'} ›</em></button>)}<button className="sh-neutral-button" type="button" onClick={runSimulation}>{isSimulating ? 'SIMULATION RUNNING...' : 'RUN SYSTEM SIMULATION'}</button></article>
          <article className="sh-ops-panel sh-chart-panel"><div className="sh-ops-panel-heading"><div><p className="sh-ops-label">SPACECRAFT SYSTEMS</p><h2>Performance trend</h2></div><span className="sh-chart-legend"><i />LIVE</span></div><div className="sh-chart"><div className="sh-chart-grid" />{systems.map((system, index) => <div className={`sh-chart-line line-${index}`} key={system.label} style={{ height: `${Math.max(18, system.value)}%` }}><span>{system.value}%</span></div>)}</div><div className="sh-chart-labels"><span>OXYGEN</span><span>WATER</span><span>FOOD</span><span>POWER</span></div></article>
          <article className="sh-ops-panel sh-ai-panel"><div className="sh-ops-panel-heading"><div><p className="sh-ops-label sh-purple-text">AI SUGGESTION</p><h2>Astro co-pilot</h2></div><span className="sh-ai-orb">✦</span></div><p>Telemetry is stable. Astro can explain the next safest action using your live mission context.</p><button className="sh-purple-button" type="button" onClick={() => setShowAI(true)}>ASK ASTRO AI <span>→</span></button></article>
          <article className="sh-ops-panel sh-detail-panel"><div className="sh-ops-panel-heading"><div><p className="sh-ops-label">MISSION BRIEF</p><h2>{activeMission.title}</h2></div><span className="sh-alert-badge">ONLINE RANK #{playerRank}</span></div><p className="sh-muted">{activeMission.description}</p><div className="sh-detail-actions"><button className="sh-white-button" type="button" onClick={startCurrentMission}>RUN MISSION <span>▶</span></button><button className="sh-outline-button" type="button" onClick={generateReport}>GENERATE REPORT</button></div></article>
        </section>
        <section className="sh-journey-section sh-ops-journey"><div className="sh-journey-heading"><h2>Mission queue</h2><span>{completedCount} of {MISSIONS.length} complete</span><button type="button" onClick={() => navigate('/campaign-map')}>OPEN STAR MAP →</button></div><div className="sh-journey-grid">{MISSIONS.slice(0, 3).map((mission) => { const status = getMissionStatus(mission.id); return <button key={mission.id} type="button" className={`sh-journey-card ${status === 'active' ? 'current' : ''} ${status}`} disabled={status === 'locked'} onClick={() => status === 'active' && navigate(`/game/cinematic/${mission.id}`)}><span className="sh-journey-icon">{status === 'completed' ? '✓' : status === 'locked' ? '⊘' : '◈'}</span><div><small>{status === 'completed' ? 'MISSION COMPLETE' : status === 'active' ? 'READY TO DEPLOY' : 'LOCKED'}</small><h3>{mission.title}</h3><p>{mission.subtitle}</p></div><strong>→</strong></button> })}</div></section>
      </main>
    </div>
    {showAI ? <div className="sh-ai-modal" role="dialog" aria-modal="true"><div className="sh-ai-modal-card"><button className="sh-ai-close" type="button" onClick={() => setShowAI(false)}>×</button><AstroAIPanel /></div></div> : null}
  </div>
}
