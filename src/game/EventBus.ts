// src/game/EventBus.ts
// Typed event emitter for React ↔ Phaser communication.
// Uses Phaser's built-in EventEmitter so no extra deps are needed.
import Phaser from 'phaser'

// Singleton EventBus
export const EventBus = new Phaser.Events.EventEmitter()

// Events FROM React TO Phaser:
// 'resources-updated' — { oxygen: number, water: number, food: number, energy: number } (all 0–100%)
// 'event-triggered' — { id: string, title: string, severity: 'low'|'high' }
// 'event-resolved' — { id: string }
// 'day-advanced' — { day: number }
// 'fault-state' — { state: string }
// 'planet-set' — { planetId: 'moon'|'mars' }

// Events FROM Phaser TO React:
// 'player-interacted' — { buildingId: string }
// 'near-building' — { buildingId: string | null }
// 'scene-ready' — {}
// 'pause-requested' — {}
