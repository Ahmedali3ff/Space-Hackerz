// src/game/config/PhaserConfig.ts
import Phaser from 'phaser'
import { MainGameScene } from '../scenes/MainGameScene'

export function createPhaserConfig(
  parent: HTMLElement,
  width: number,
  height: number,
  planetId: 'moon' | 'mars'
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: planetId === 'mars' ? '#1a0808' : '#0A0E1A',
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [MainGameScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    audio: { disableWebAudio: false },
  }
}
