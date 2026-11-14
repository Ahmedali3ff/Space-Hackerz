import { useNavigate } from 'react-router-dom'
import { getAudioManager } from '@/services/audio-manager'
import { useState } from 'react'
import { usePreferencesStore } from '@store/preferences-store'

export function GameSettingsScreen(): JSX.Element {
  const navigate = useNavigate()
  const language = usePreferencesStore((state) => state.language)
  const theme = usePreferencesStore((state) => state.theme)
  const setLanguage = usePreferencesStore((state) => state.setLanguage)
  const setTheme = usePreferencesStore((state) => state.setTheme)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const isArabic = language === 'ar'
  const copy = isArabic
    ? { title: 'الإعدادات', subtitle: 'خصص تجربة الاستكشاف', appearance: 'المظهر', language: 'اللغة', theme: 'الوضع', light: 'فاتح', dark: 'داكن', audio: 'الصوت', volume: 'مستوى الصوت', mute: 'كتم كل الأصوات', back: 'رجوع', mouse: 'اسحب بالماوس للنظر · الأسهم للتحرك' }
    : { title: 'Settings', subtitle: 'Customize your exploration experience', appearance: 'Appearance', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', audio: 'Audio', volume: 'Volume', mute: 'Mute all sounds', back: 'Back', mouse: 'Drag with the mouse to look · Arrow keys to move' }

  function handleVolumeChange(value: number): void { setVolume(value); getAudioManager().setVolume(value) }
  function handleMuteToggle(): void { const next = !muted; setMuted(next); getAudioManager().setMuted(next) }

  return (
    <main className="sh-settings-page" dir={isArabic ? 'rtl' : 'ltr'}>
      <section className="sh-settings-card">
        <div className="sh-settings-header"><span className="sh-settings-icon">⚙</span><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
        <div className="sh-settings-section"><span className="sh-settings-label">{copy.appearance}</span>
          <div className="sh-settings-row"><div><strong>{copy.language}</strong><small>{isArabic ? 'العربية' : 'English'}</small></div><div className="sh-segmented"><button type="button" className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}>EN</button><button type="button" className={language === 'ar' ? 'selected' : ''} onClick={() => setLanguage('ar')}>عربي</button></div></div>
          <div className="sh-settings-row"><div><strong>{copy.theme}</strong><small>{theme === 'light' ? copy.light : copy.dark}</small></div><div className="sh-segmented"><button type="button" className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}>☀ {copy.light}</button><button type="button" className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}>☾ {copy.dark}</button></div></div>
          <p className="sh-control-tip">🖱 {copy.mouse}</p>
        </div>
        <div className="sh-settings-section"><span className="sh-settings-label">{copy.audio}</span><label className="sh-volume-label" htmlFor="settings-volume">{copy.volume}: {Math.round(volume * 100)}%</label><input id="settings-volume" type="range" min={0} max={1} step={0.05} value={volume} onChange={(event) => handleVolumeChange(Number(event.target.value))} /><div className="sh-settings-row"><strong>{copy.mute}</strong><button className={`sh-switch ${muted ? 'on' : ''}`} type="button" role="switch" aria-checked={muted} onClick={handleMuteToggle}><span /></button></div></div>
        <button className="sh-settings-back" type="button" onClick={() => navigate(-1)}>← {copy.back}</button>
      </section>
    </main>
  )
}
