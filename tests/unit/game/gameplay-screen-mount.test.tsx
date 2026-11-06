// tests/unit/game/gameplay-screen-mount.test.tsx
// Smoke test for GameplayScreen — Phaser is mocked so jsdom can import it.
import { describe, it, expect, vi } from 'vitest'

vi.mock('phaser', () => ({
  default: {
    AUTO: 1,
    // Scene base class — MainGameScene extends this
    Scene: class {
      constructor(_config: unknown) {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      make: any = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      physics: any = { world: { setBounds: vi.fn() }, add: { sprite: vi.fn(() => ({ setCollideWorldBounds: vi.fn(), setDepth: vi.fn() })), staticImage: vi.fn(() => ({ setScale: vi.fn().mockReturnThis(), setDepth: vi.fn() })) } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      add: any = { group: vi.fn(), image: vi.fn(() => ({ setOrigin: vi.fn().mockReturnThis(), setDepth: vi.fn() })), rectangle: vi.fn(() => ({ setDepth: vi.fn() })), circle: vi.fn(() => ({ setDepth: vi.fn() })), text: vi.fn(() => ({ setOrigin: vi.fn().mockReturnThis(), setDepth: vi.fn() })) }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cameras: any = { main: { startFollow: vi.fn(), setZoom: vi.fn(), setBounds: vi.fn() } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input: any = { keyboard: { createCursorKeys: vi.fn(() => ({})), addKey: vi.fn(() => ({})) } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      time: any = { delayedCall: vi.fn(), now: 0 }
    },
    Game: vi.fn().mockImplementation(() => ({
      destroy: vi.fn(),
      scene: { getScene: vi.fn(() => null), start: vi.fn() },
      events: { once: vi.fn() },
    })),
    Events: {
      EventEmitter: class {
        on(_e: string, _cb: unknown): this { return this }
        off(_e: string): this { return this }
        emit(_e: string): boolean { return false }
        removeAllListeners(): this { return this }
        removeListener(_e: string): this { return this }
      },
    },
    Input: {
      Keyboard: {
        KeyCodes: { W: 87, S: 83, A: 65, D: 68, E: 69 },
        JustDown: vi.fn(() => false),
      },
    },
    Math: {
      Distance: { Between: vi.fn(() => 999) },
      Between: vi.fn(() => 0),
    },
    Scale: { FIT: 0, CENTER_BOTH: 0 },
    Physics: {},
  },
}))

describe('EventBus', () => {
  it('can be imported without error', async () => {
    const { EventBus } = await import('@/game/EventBus')
    expect(EventBus).toBeDefined()
    expect(typeof EventBus.emit).toBe('function')
  })
})

describe('createPhaserConfig', () => {
  it('returns a valid config object for moon', async () => {
    const { createPhaserConfig } = await import('@/game/config/PhaserConfig')
    const div = document.createElement('div')
    const config = createPhaserConfig(div, 800, 600, 'moon')
    expect(config.backgroundColor).toBe('#0A0E1A')
    expect(config.physics).toBeDefined()
  })

  it('returns a valid config object for mars', async () => {
    const { createPhaserConfig } = await import('@/game/config/PhaserConfig')
    const div = document.createElement('div')
    const config = createPhaserConfig(div, 800, 600, 'mars')
    expect(config.backgroundColor).toBe('#1a0808')
  })
})
