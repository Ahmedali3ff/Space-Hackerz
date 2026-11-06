// tests/unit/services/audio-manager.test.ts
// Unit tests for AudioManager singleton service.
// jsdom does not provide AudioContext, so tests verify the graceful no-op
// behaviour in test environments — no throws allowed.

import { describe, it, expect, beforeEach } from 'vitest'
import { getAudioManager } from '@/services/audio-manager'

// ── Reset helper ──────────────────────────────────────────────────────────────
// Retrieve a fresh handle before each test; the singleton state persists, so
// we normalise muted/volume to known values manually.

beforeEach(() => {
  const am = getAudioManager()
  am.setMuted(false)
  am.setVolume(0.8)
})

// ── Factory ───────────────────────────────────────────────────────────────────

describe('AudioManager — getAudioManager', () => {
  it('getAudioManager returns an AudioManager instance', () => {
    const am = getAudioManager()
    expect(am).toBeTruthy()
    expect(typeof am.playSound).toBe('function')
  })
})

// ── playSound ─────────────────────────────────────────────────────────────────

describe('AudioManager — playSound', () => {
  it('playSound does not throw in test environment', () => {
    const am = getAudioManager()
    expect(() => am.playSound('click')).not.toThrow()
  })
})

// ── setMuted / isMuted ────────────────────────────────────────────────────────

describe('AudioManager — mute controls', () => {
  it('setMuted(true) makes isMuted() return true', () => {
    const am = getAudioManager()
    am.setMuted(true)
    expect(am.isMuted()).toBe(true)
  })

  it('setMuted(false) makes isMuted() return false', () => {
    const am = getAudioManager()
    am.setMuted(true)
    am.setMuted(false)
    expect(am.isMuted()).toBe(false)
  })
})

// ── setVolume ─────────────────────────────────────────────────────────────────

describe('AudioManager — setVolume', () => {
  it('setVolume(0.5) sets volume to 0.5', () => {
    const am = getAudioManager()
    am.setVolume(0.5)
    expect(am.getVolume()).toBe(0.5)
  })

  it('setVolume clamps to [0,1] — setVolume(1.5) sets to 1', () => {
    const am = getAudioManager()
    am.setVolume(1.5)
    expect(am.getVolume()).toBe(1)
  })

  it('setVolume clamps to [0,1] — setVolume(-0.5) sets to 0', () => {
    const am = getAudioManager()
    am.setVolume(-0.5)
    expect(am.getVolume()).toBe(0)
  })
})
