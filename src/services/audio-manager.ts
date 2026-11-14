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

interface ToneStep extends OscillatorParams {
  readonly delay: number
}

const SOUND_PARAMS: Record<SoundKey, OscillatorParams> = {
  click:          { type: 'sine',     frequency: 740,  duration: 0.07, gainPeak: 0.11 },
  ui_hover:       { type: 'sine',     frequency: 520,  duration: 0.045, gainPeak: 0.06 },
  success:        { type: 'triangle', frequency: 523,  duration: 0.20, gainPeak: 0.18 },
  failure:        { type: 'sine',     frequency: 180,  duration: 0.28, gainPeak: 0.16 },
  event_alert:    { type: 'triangle', frequency: 440,  duration: 0.18, gainPeak: 0.14 },
  day_advance:    { type: 'sine',     frequency: 392,  duration: 0.16, gainPeak: 0.11 },
  level_complete: { type: 'triangle', frequency: 659,  duration: 0.22, gainPeak: 0.22 },
  game_over:      { type: 'sine',     frequency: 150,  duration: 0.35, gainPeak: 0.18 },
}

const SOUND_PATTERNS: Partial<Record<SoundKey, readonly ToneStep[]>> = {
  success: [
    { type: 'sine', frequency: 523, duration: 0.16, gainPeak: 0.14, delay: 0 },
    { type: 'sine', frequency: 659, duration: 0.20, gainPeak: 0.14, delay: 0.1 },
    { type: 'triangle', frequency: 784, duration: 0.28, gainPeak: 0.12, delay: 0.2 },
  ],
  level_complete: [
    { type: 'sine', frequency: 523, duration: 0.22, gainPeak: 0.14, delay: 0 },
    { type: 'sine', frequency: 659, duration: 0.22, gainPeak: 0.14, delay: 0.12 },
    { type: 'triangle', frequency: 784, duration: 0.32, gainPeak: 0.14, delay: 0.24 },
    { type: 'sine', frequency: 1046, duration: 0.5, gainPeak: 0.12, delay: 0.38 },
  ],
  failure: [
    { type: 'sine', frequency: 220, duration: 0.28, gainPeak: 0.13, delay: 0 },
    { type: 'sine', frequency: 165, duration: 0.42, gainPeak: 0.12, delay: 0.16 },
  ],
  event_alert: [
    { type: 'triangle', frequency: 440, duration: 0.12, gainPeak: 0.11, delay: 0 },
    { type: 'triangle', frequency: 554, duration: 0.16, gainPeak: 0.10, delay: 0.14 },
  ],
}

// ── AudioManager class ────────────────────────────────────────────────────────

class AudioManager {
  private muted: boolean = false
  private volume: number = 0.8
  private sfxVolume: number = 0.8
  private audioCtx: AudioContext | null = null
  private musicNodes: OscillatorNode[] = []
  private musicGain: GainNode | null = null

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

    const pattern = SOUND_PATTERNS[key] ?? [{ ...SOUND_PARAMS[key], delay: 0 }]

    try {
      pattern.forEach((params) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        const start = ctx.currentTime + params.delay
        const effectiveGain = params.gainPeak * this.volume * this.sfxVolume
        oscillator.type = params.type
        oscillator.frequency.setValueAtTime(params.frequency, start)
        gainNode.gain.setValueAtTime(0, start)
        gainNode.gain.linearRampToValueAtTime(effectiveGain, start + 0.012)
        gainNode.gain.exponentialRampToValueAtTime(0.001, start + params.duration)
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        oscillator.start(start)
        oscillator.stop(start + params.duration)
      })
    } catch {
      // Silently swallow AudioContext errors (e.g. context suspended)
    }
  }

  /**
   * Stub: music streaming is not implemented in V1.
   * The signature is present so callers can reference it without errors.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  playMusic(key: MusicKey): void {
    if (this.muted || this.musicNodes.length > 0) return
    const ctx = this.getCtx()
    if (!ctx) return

    const root = key === 'gameplay_mars' ? 110 : key === 'gameplay_moon' ? 146.83 : key === 'cinematic' ? 123.47 : 98
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.035 * this.volume, ctx.currentTime + 1.2)
    gain.connect(ctx.destination)

    const notes = [root, root * 1.5]
    this.musicNodes = notes.map((frequency, index) => {
      const oscillator = ctx.createOscillator()
      oscillator.type = index === 0 ? 'sine' : 'triangle'
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
      oscillator.detune.setValueAtTime(index === 0 ? 0 : 7, ctx.currentTime)
      oscillator.connect(gain)
      oscillator.start()
      return oscillator
    })
    this.musicGain = gain
  }

  /** Stops any currently playing ambient mission bed. */
  stopMusic(): void {
    const ctx = this.audioCtx
    if (!ctx || this.musicNodes.length === 0) return
    const nodes = this.musicNodes
    const gain = this.musicGain
    if (gain) {
      gain.gain.cancelScheduledValues(ctx.currentTime)
      gain.gain.setValueAtTime(Math.max(0.001, gain.gain.value), ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    }
    nodes.forEach((node) => {
      try { node.stop(ctx.currentTime + 0.28) } catch { /* already stopped */ }
    })
    this.musicNodes = []
    this.musicGain = null
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
