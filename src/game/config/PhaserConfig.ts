// src/game/config/PhaserConfig.ts
import Phaser from 'phaser'
import { MainGameScene } from '../scenes/MainGameScene'

export function createPhaserConfig(
  parent: HTMLElement,
  _width: number,
  _height: number,
  planetId: 'moon' | 'mars',
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    // Use full window dimensions so the game fills the screen
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: planetId === 'mars' ? '#1a0808' : '#0A0E1A',
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [MainGameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,   // resize with browser window
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    audio: { disableWebAudio: false },
  }
}
