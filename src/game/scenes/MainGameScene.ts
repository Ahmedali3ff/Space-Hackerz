// src/game/scenes/MainGameScene.ts
import Phaser from 'phaser'
import { EventBus } from '../EventBus'

export class MainGameScene extends Phaser.Scene {
  // Use 'any' for Phaser internals where types are unavailable (allowed per coding standards for Phaser scene files)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private playerSprite: any = null
  private playerSpeed = 160
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cursors: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private wasd: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private eKey: any = null
  private planetId: 'moon' | 'mars' = 'moon'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildings: any = null
  private interactionZones: Array<{ buildingId: string; label: string; x: number; y: number }> = []
  private nearBuilding: string | null = null

  constructor() {
    super({ key: 'MainGameScene' })
  }

  // Helper: create an off-screen Graphics object for texture generation.
  // Phaser's type definition omits 'add' from graphics options in some versions;
  // we use a direct Graphics constructor call instead to avoid the type error.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private makeGfx(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).make.graphics({ add: false })
  }

  preload(): void {
    // ALL textures are generated programmatically — NO image files needed.
    // Astronaut (white helmet + blue suit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const astroGfx: any = this.makeGfx()
    astroGfx.fillStyle(0xffffff)
    astroGfx.fillCircle(16, 10, 10) // helmet
    astroGfx.fillStyle(0x1e40af)
    astroGfx.fillRect(8, 18, 16, 20) // suit body
    astroGfx.fillStyle(0xffffff)
    astroGfx.fillRect(4, 20, 6, 14)  // left arm
    astroGfx.fillRect(22, 20, 6, 14) // right arm
    astroGfx.fillRect(9, 36, 7, 12)  // left leg
    astroGfx.fillRect(16, 36, 7, 12) // right leg
    astroGfx.fillStyle(0xdc2626)
    astroGfx.fillRect(12, 20, 8, 5)  // NASA patch
    astroGfx.generateTexture('astronaut', 32, 50)
    astroGfx.destroy()

    // Habitat dome (gray dome)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domeGfx: any = this.makeGfx()
    domeGfx.fillStyle(0xd1d5db)
    domeGfx.fillEllipse(48, 48, 96, 80)
    domeGfx.fillStyle(0x9ca3af)
    domeGfx.fillRect(8, 50, 80, 30)
    domeGfx.fillStyle(0x60a5fa) // windows
    domeGfx.fillCircle(30, 38, 8)
    domeGfx.fillCircle(48, 30, 8)
    domeGfx.fillCircle(66, 38, 8)
    domeGfx.fillStyle(0x374151) // door
    domeGfx.fillRect(38, 55, 20, 25)
    domeGfx.generateTexture('dome', 96, 80)
    domeGfx.destroy()

    // Solar panel (blue cells + pole)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const solarGfx: any = this.makeGfx()
    solarGfx.fillStyle(0x1d4ed8)
    solarGfx.fillRect(0, 10, 80, 40)
    solarGfx.lineStyle(1, 0x3b82f6)
    for (let i = 0; i <= 4; i++) { solarGfx.strokeRect(i * 20, 10, 20, 40) }
    solarGfx.fillStyle(0x6b7280)
    solarGfx.fillRect(37, 50, 6, 30)
    solarGfx.generateTexture('solar-panel', 80, 80)
    solarGfx.destroy()

    // Satellite dish
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dishGfx: any = this.makeGfx()
    dishGfx.fillStyle(0xe5e7eb)
    dishGfx.fillEllipse(32, 20, 60, 30)
    dishGfx.fillStyle(0x9ca3af)
    dishGfx.fillRect(29, 20, 6, 30)
    dishGfx.fillRect(15, 47, 34, 6)
    dishGfx.generateTexture('dish', 64, 56)
    dishGfx.destroy()

    // Power generator (yellow box + lightning bolt)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const genGfx: any = this.makeGfx()
    genGfx.fillStyle(0xf59e0b)
    genGfx.fillRect(0, 10, 60, 50)
    genGfx.fillStyle(0xd97706)
    genGfx.fillRect(5, 5, 50, 10)
    genGfx.fillStyle(0xffffff)
    genGfx.fillTriangle(25, 15, 35, 15, 28, 30)
    genGfx.fillTriangle(22, 30, 32, 30, 25, 45)
    genGfx.generateTexture('generator', 60, 60)
    genGfx.destroy()

    // Moon ground tile (gray with craters)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moonGfx: any = this.makeGfx()
    moonGfx.fillStyle(0x6b7280)
    moonGfx.fillRect(0, 0, 64, 64)
    moonGfx.fillStyle(0x9ca3af, 0.3)
    moonGfx.fillCircle(15, 15, 8)
    moonGfx.fillCircle(45, 40, 5)
    moonGfx.fillCircle(30, 55, 10)
    moonGfx.generateTexture('moon-ground', 64, 64)
    moonGfx.destroy()

    // Mars ground tile (rust/red)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const marsGfx: any = this.makeGfx()
    marsGfx.fillStyle(0x92400e)
    marsGfx.fillRect(0, 0, 64, 64)
    marsGfx.fillStyle(0xb45309, 0.4)
    marsGfx.fillCircle(20, 20, 10)
    marsGfx.fillCircle(50, 45, 6)
    marsGfx.generateTexture('mars-ground', 64, 64)
    marsGfx.destroy()

    // Rock obstacle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rockGfx: any = this.makeGfx()
    rockGfx.fillStyle(0x4b5563)
    rockGfx.fillEllipse(20, 16, 40, 28)
    rockGfx.fillStyle(0x6b7280, 0.5)
    rockGfx.fillEllipse(12, 10, 16, 12)
    rockGfx.generateTexture('rock', 40, 32)
    rockGfx.destroy()
  }

  create(data: { planetId?: 'moon' | 'mars' }): void {
    this.planetId = data?.planetId ?? 'moon'
    const groundTex = this.planetId === 'mars' ? 'mars-ground' : 'moon-ground'

    // World bounds: 1600x1200
    this.physics.world.setBounds(0, 0, 1600, 1200)

    // Tile ground
    for (let x = 0; x < 1600; x += 64) {
      for (let y = 0; y < 1200; y += 64) {
        this.add.image(x, y, groundTex).setOrigin(0, 0).setDepth(0)
      }
    }

    // Sky strip at top
    const skyColor = this.planetId === 'mars' ? 0x431407 : 0x0a0e1a
    this.add.rectangle(800, 60, 1600, 120, skyColor).setDepth(0)

    // Earth visible on Moon missions
    if (this.planetId === 'moon') {
      this.add.circle(1300, 80, 70, 0x1d4ed8).setDepth(1)
      this.add.circle(1290, 70, 25, 0x166534).setDepth(2)
    }

    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = Phaser.Math.Between(0, 1600)
      const sy = Phaser.Math.Between(0, 100)
      this.add.circle(sx, sy, 1, 0xffffff, 0.8).setDepth(1)
    }

    // Buildings group
    this.buildings = this.add.group()
    this.buildHabitat()

    // Scatter rocks
    for (let i = 0; i < 12; i++) {
      const rx = Phaser.Math.Between(50, 1550)
      const ry = Phaser.Math.Between(200, 1150)
      this.add.image(rx, ry, 'rock').setDepth(3)
    }

    // Astronaut player sprite with physics
    this.playerSprite = this.physics.add.sprite(800, 800, 'astronaut')
    this.playerSprite.setCollideWorldBounds(true)
    this.playerSprite.setDepth(10)

    // Camera follows player
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1)
    this.cameras.main.setZoom(1.2)
    this.cameras.main.setBounds(0, 0, 1600, 1200)

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E)

    // EventBus listeners
    EventBus.on('planet-set', (d: { planetId: 'moon' | 'mars' }) => { this.planetId = d.planetId }, this)

    // Signal React that scene is ready
    this.time.delayedCall(100, () => { EventBus.emit('scene-ready', {}) })
  }

  private buildHabitat(): void {
    const buildings: Array<{
      x: number; y: number; texture: string; id: string; label: string; scale?: number
    }> = [
      { x: 700, y: 450, texture: 'dome',        id: 'life-support',    label: '🫁 Life Support',    scale: 1.5 },
      { x: 900, y: 450, texture: 'dome',        id: 'command-center',  label: '🖥️ Command Center',  scale: 1.3 },
      { x: 550, y: 550, texture: 'dome',        id: 'crew-quarters',   label: '👥 Crew Quarters',   scale: 1.2 },
      { x: 1050, y: 550, texture: 'dome',       id: 'water-recycling', label: '💧 Water Recycling', scale: 1.1 },
      { x: 400, y: 400, texture: 'solar-panel', id: 'solar-panels',    label: '☀️ Solar Panels',    scale: 1.4 },
      { x: 1150, y: 400, texture: 'solar-panel',id: 'solar-panels-2',  label: '☀️ Solar Array 2',   scale: 1.4 },
      { x: 800, y: 350, texture: 'dish',        id: 'communications',  label: '📡 Communications',  scale: 1.5 },
      { x: 300, y: 550, texture: 'generator',   id: 'power-room',      label: '⚡ Power Room',      scale: 1.3 },
      { x: 1200, y: 600, texture: 'generator',  id: 'hydroponics',     label: '🌱 Hydroponics',     scale: 1.2 },
    ]

    buildings.forEach((b) => {
      const img = this.physics.add.staticImage(b.x, b.y, b.texture)
      img.setScale(b.scale ?? 1).setDepth(4)
      this.buildings.add(img)

      // Label under building
      this.add.text(b.x, b.y + 52, b.label, {
        fontSize: '10px', color: '#1FC8C0',
        fontFamily: 'Nunito, sans-serif',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5, 0).setDepth(5)

      // Store interaction zone as a simple record (x/y/buildingId/label)
      this.interactionZones.push({ buildingId: b.id, label: b.label, x: b.x, y: b.y })
    })
  }

  update(): void {
    if (!this.playerSprite) return

    const speed = this.playerSpeed
    let vx = 0
    let vy = 0

    if (this.cursors?.left?.isDown || this.wasd?.left?.isDown)  { vx = -speed }
    else if (this.cursors?.right?.isDown || this.wasd?.right?.isDown) { vx = speed }
    if (this.cursors?.up?.isDown || this.wasd?.up?.isDown)   { vy = -speed }
    else if (this.cursors?.down?.isDown || this.wasd?.down?.isDown) { vy = speed }

    // Normalize diagonals
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707 }

    this.playerSprite.setVelocity(vx, vy)

    // Walking bob
    if (vx !== 0 || vy !== 0) {
      this.playerSprite.setAngle(Math.sin(this.time.now / 100) * 3)
    } else {
      this.playerSprite.setAngle(0)
    }

    // Proximity check for interaction zones
    this.nearBuilding = null
    let closestDist = 100

    for (const zone of this.interactionZones) {
      const dist = Phaser.Math.Distance.Between(
        this.playerSprite.x, this.playerSprite.y, zone.x, zone.y
      )
      if (dist < 90 && dist < closestDist) {
        closestDist = dist
        this.nearBuilding = zone.buildingId
      }
    }

    EventBus.emit('near-building', { buildingId: this.nearBuilding })

    // E key interaction
    if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.nearBuilding) {
      EventBus.emit('player-interacted', { buildingId: this.nearBuilding })
    }
  }

  shutdown(): void {
    EventBus.removeListener('planet-set')
  }
}
