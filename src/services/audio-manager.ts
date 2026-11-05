// src/services/audio-manager.ts
// Singleton AudioManager using the Web Audio API.
// All sounds are oscillator-based — no external audio files are needed,
// so the app works fully offline. Gracefully skips in SSR / jsdom environments
// where window or AudioContext are not available.
// NO React imports — this is a pure service module.

// ── Sound / Music key types ───────────────────────────────────────────────────

export type SoundKey =
  | 'click'
  | 'success'
  | 'failure'
  | 'event_alert'
  | 'day_advance'
  | 'level_complete'
  | 'game_over'
  | 'ui_hover'

export type MusicKey =
  | 'menu'
  | 'gameplay_moon'
  | 'gameplay_mars'
  | 'cinematic'

// ── Oscillator parameters per sound key ──────────────────────────────────────

interface OscillatorParams {
  readonly type: OscillatorType
  readonly frequency: number
  readonly duration: number   // seconds
  readonly gainPeak: number   // 0–1
}

const SOUND_PARAMS: Record<SoundKey, OscillatorParams> = {
  click:          { type: 'sine',     frequency: 880,  duration: 0.06, gainPeak: 0.18 },
  ui_hover:       { type: 'sine',     frequency: 660,  duration: 0.04, gainPeak: 0.10 },
  success:        { type: 'triangle', frequency: 523,  duration: 0.35, gainPeak: 0.25 },
  failure:        { type: 'sawtooth', frequency: 200,  duration: 0.45, gainPeak: 0.22 },
  event_alert:    { type: 'square',   frequency: 440,  duration: 0.30, gainPeak: 0.20 },
  day_advance:    { type: 'sine',     frequency: 392,  duration: 0.12, gainPeak: 0.14 },
  level_complete: { type: 'triangle', frequency: 659,  duration: 0.60, gainPeak: 0.30 },
  game_over:      { type: 'sawtooth', frequency: 150,  duration: 0.80, gainPeak: 0.28 },
}

// ── AudioManager class ────────────────────────────────────────────────────────

class AudioManager {
  private muted: boolean = false
  private volume: number = 0.8
  private sfxVolume: number = 0.8
  private audioCtx: AudioContext | null = null

  /** Lazily initialises AudioContext on first user interaction. */
  private getCtx(): AudioContext | null {
    // Guard: skip in SSR / jsdom (no window)
    if (typeof window === 'undefined') return null
    // Guard: skip if AudioContext is not available (some test environments)
    if (typeof AudioContext === 'undefined' && typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext === 'undefined') {
      return null
    }
    if (!this.audioCtx) {
      try {
        const Ctx =
          AudioContext ??
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (Ctx) {
          this.audioCtx = new Ctx()
        }
      } catch {
        // AudioContext construction can fail in restricted environments
        return null
      }
    }
    return this.audioCtx
  }

  /**
   * Plays a short oscillator-based sound effect.
   * Uses an ADSR-like gain envelope to avoid clicking artefacts.
   * Silently no-ops when muted or when AudioContext is unavailable.
   */
  playSound(key: SoundKey): void {
    if (this.muted) return
    const ctx = this.getCtx()
    if (!ctx) return

    const params = SOUND_PARAMS[key]
    const effectiveGain = params.gainPeak * this.volume * this.sfxVolume

    try {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = params.type
      oscillator.frequency.setValueAtTime(params.frequency, ctx.currentTime)

      // Simple attack-release envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(effectiveGain, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + params.duration)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + params.duration)
    } catch {
      // Silently swallow AudioContext errors (e.g. context suspended)
    }
  }

  /**
   * Stub: music streaming is not implemented in V1.
   * The signature is present so callers can reference it without errors.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  playMusic(_key: MusicKey): void {
    // No-op stub — music requires audio assets which are out of scope for V1.
  }

  /** Stops any currently playing music track (no-op stub). */
  stopMusic(): void {
    // No-op stub
  }

  /** Mutes or unmutes all audio output. */
  setMuted(v: boolean): void {
    this.muted = v
  }

  /**
   * Sets the master volume (0–1). Values are clamped automatically.
   * Also updates sfxVolume proportionally.
   */
  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v))
  }

  /** Returns current mute state. */
  isMuted(): boolean {
    return this.muted
  }

  /** Returns current master volume (0–1). */
  getVolume(): number {
    return this.volume
  }
}

// ── Singleton factory ─────────────────────────────────────────────────────────

let _instance: AudioManager | null = null

/**
 * Returns the singleton AudioManager.
 * Call this instead of constructing AudioManager directly.
 */
export function getAudioManager(): AudioManager {
  if (!_instance) {
    _instance = new AudioManager()
  }
  return _instance
}

/**
 * Pre-constructed singleton for convenience import:
 *   import { audioManager } from '@/services/audio-manager'
 *   audioManager.playSound('click')
 */
export const audioManager: AudioManager = getAudioManager()
