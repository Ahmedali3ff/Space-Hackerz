import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMissionStore } from '@store/mission-store'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { HowToPlayModal } from './HowToPlayModal'
import type { PlanetId } from '@simulation/types'

const PLANETS: readonly { id: PlanetId; label: string; code: string }[] = [
  { id: 'mars', label: 'MARS', code: 'M-01' },
  { id: 'moon', label: 'LUNA', code: 'L-01' },
]

export function MainMenuScreen(): JSX.Element {
  const navigate = useNavigate()
  const selectedPlanetId = useMissionStore((state) => state.selectedPlanetId)
  const selectPlanet = useMissionStore((state) => state.selectPlanet)
  const setCrewSize = useMissionStore((state) => state.setCrewSize)
  const commanderName = useMissionProgressStore((state) => state.commanderName)
  const setCommanderName = useMissionProgressStore((state) => state.setCommanderName)
  const [name, setName] = useState(commanderName)
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const activePlanet: PlanetId = selectedPlanetId ?? 'mars'

  useEffect(() => {
    if (selectedPlanetId === null) selectPlanet('mars')
  }, [selectedPlanetId, selectPlanet])

  function beginMission(): void {
    const cleanName = name.trim()
    if (!cleanName) return
    setCommanderName(cleanName)
    if (selectedPlanetId === null) selectPlanet(activePlanet)
    setCrewSize(4)
    navigate('/mission-hub')
  }

  return (
    <main className="sh-explorer-home">
      <div className="sh-home-stars" aria-hidden="true" />
      <div className="sh-home-grid" aria-hidden="true" />
      <header className="sh-home-nav">
        <div className="sh-home-brand"><span className="sh-brand-mark">✦</span> SPACE HACKERZ</div>
        <nav aria-label="Main navigation">
          <button className="active">HOME</button>
          <button type="button" onClick={() => setShowHowToPlay(true)}>ABOUT US</button>
          <button type="button" onClick={() => navigate('/campaign-map')}>COLONIES</button>
          <button type="button" onClick={() => navigate('/select-planet')}>PLANETS</button>
        </nav>
        <span className="sh-home-status"><i /> SIGNAL 100%</span>
      </header>

      <aside className="sh-planet-rail" aria-label="Planet selection">
        {PLANETS.map((planet) => (
          <button
            key={planet.id}
            type="button"
            className={activePlanet === planet.id ? 'selected' : ''}
            onClick={() => selectPlanet(planet.id)}
            aria-label={`Select ${planet.label}`}
          >
            <span className={`sh-planet-thumb ${planet.id}`} />
            <small>{planet.code}</small>
          </button>
        ))}
      </aside>

      <section className="sh-home-hero">
        <p className="sh-home-kicker">EXPLORE THE RED PLANET</p>
        <h1>{activePlanet === 'mars' ? 'MARS' : 'LUNA'}</h1>
        <p className="sh-home-subtitle">THE NEXT FRONTIER IS WAITING</p>

        <div className={`sh-hero-planet ${activePlanet}`} aria-label={`${activePlanet} planet`}>
          <div className="sh-planet-glow" />
          <div className="sh-planet-crater crater-one" />
          <div className="sh-planet-crater crater-two" />
          <div className="sh-planet-crater crater-three" />
        </div>

        <div className="sh-home-data data-left">
          <span>MOONS</span><b>{activePlanet === 'mars' ? 'PHOBOS, DEIMOS' : 'ONE MOON'}</b>
          <span>RADIUS</span><b>{activePlanet === 'mars' ? '3,390 KM' : '1,737 KM'}</b>
          <span>ORBITAL PERIOD</span><b>{activePlanet === 'mars' ? '687 DAYS' : '27 DAYS'}</b>
        </div>
        <div className="sh-home-data data-right">
          <span>GRAVITY</span><b>{activePlanet === 'mars' ? '3.71 M/S²' : '1.62 M/S²'}</b>
          <span>MISSION WINDOW</span><b>30 SOLS</b>
        </div>

        <div className="sh-home-cta">
          <p>TOUCH DOWN ON {activePlanet === 'mars' ? 'MARS' : 'THE MOON'}:<br /><strong>YOUR HABITAT AWAITS YOUR COMMAND.</strong></p>
          <label htmlFor="explorer-name">NAME OF EXPLORER</label>
          <div className="sh-name-row">
            <input id="explorer-name" value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') beginMission() }} placeholder="ENTER YOUR NAME" maxLength={24} autoComplete="off" />
            <button type="button" onClick={beginMission} disabled={name.trim().length === 0}>LET&apos;S DIVE <span>↗</span></button>
          </div>
        </div>
      </section>

      <div className="sh-home-pager" aria-hidden="true"><b>01</b><span /><small>02</small><small>03</small></div>
      <button className="sh-home-help" type="button" onClick={() => setShowHowToPlay(true)} aria-label="Open mission brief">?</button>
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </main>
  )
}
