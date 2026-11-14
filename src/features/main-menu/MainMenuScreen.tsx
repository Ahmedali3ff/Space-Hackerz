import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMissionStore } from '@store/mission-store'
import { useMissionProgressStore } from '@store/mission-progress-store'
import { HowToPlayModal } from './HowToPlayModal'
import type { PlanetId } from '@simulation/types'
import { apiClient, ApiClientError, setAuthToken } from '@/services/api-client'

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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const activePlanet: PlanetId = selectedPlanetId ?? 'mars'

  useEffect(() => {
    if (selectedPlanetId === null) selectPlanet('mars')
  }, [selectedPlanetId, selectPlanet])

  async function beginMission(): Promise<void> {
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    if (authMode === 'register' && cleanName.length < 2) { setAuthError('Explorer name must contain at least 2 characters.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) { setAuthError('Enter a valid email address.'); return }
    if (password.length < 6) { setAuthError('Password must contain at least 6 characters.'); return }
    setAuthBusy(true); setAuthError('')
    try {
      const response = authMode === 'register' ? await apiClient.register({ name: cleanName, email: cleanEmail, password }) : await apiClient.login({ email: cleanEmail, password })
      setAuthToken(response.token)
      const player = response.account.player
      useMissionProgressStore.getState().switchAccount(response.account.id, player)
      const rows = await apiClient.getMyMissionProgress()
      if (rows) useMissionProgressStore.getState().hydrateMissions(rows)
      setCommanderName(player?.name ?? cleanName)
      if (selectedPlanetId === null) selectPlanet(activePlanet)
      setCrewSize(4)
      navigate('/mission-hub')
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) setAuthError('This email is already registered. Sign in instead.')
      else if (error instanceof ApiClientError && error.status === 401) setAuthError('Email or password is incorrect.')
      else if (error instanceof ApiClientError) setAuthError(error.message)
      else setAuthError('Could not reach Mission Control. Check your connection and try again.')
    } finally { setAuthBusy(false) }
  }

  return (
    <main className="sh-explorer-home">
      <div className="sh-home-stars" aria-hidden="true" />
      <div className="sh-home-grid" aria-hidden="true" />
      <header className="sh-home-nav">
        <div className="sh-home-brand"><img className="sh-home-logo" src="/assets/icons/space-hackerz-mark.svg" alt="" aria-hidden="true" /> <span>SPACE HACKERZ</span></div>
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
          <div className="sh-auth-tabs"><button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>CREATE ACCOUNT</button><button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>SIGN IN</button></div>
          <div className="sh-auth-form">
            {authMode === 'register' && <label htmlFor="explorer-name">NAME OF EXPLORER<input id="explorer-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="ENTER YOUR NAME" maxLength={24} autoComplete="name" /></label>}
            <label htmlFor="explorer-email">EMAIL<input id="explorer-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="EXPLORER@MISSION.COM" autoComplete="email" /></label>
            <label htmlFor="explorer-password">PASSWORD<div className="sh-password-field"><input id="explorer-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void beginMission() }} placeholder="MINIMUM 6 CHARACTERS" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'HIDE' : 'SHOW'}</button></div></label>
            <div className="sh-name-row">
            <button type="button" onClick={() => void beginMission()} disabled={authBusy}>{authBusy ? 'CONNECTING…' : 'LET’S DIVE'} <span>↗</span></button>
          </div>
          </div>
          {authError && <p className="sh-auth-error" role="alert">{authError}</p>}
        </div>
      </section>

      <div className="sh-home-pager" aria-hidden="true"><b>01</b><span /><small>02</small><small>03</small></div>
      <button className="sh-home-help" type="button" onClick={() => setShowHowToPlay(true)} aria-label="Open mission brief">?</button>
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </main>
  )
}
