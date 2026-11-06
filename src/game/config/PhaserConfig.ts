// src/game/config/PhaserConfig.ts
import Phaser from 'phaser'
import { MainGameScene } from '../scenes/MainGameScene'

export function createPhaserConfig(
  parent: HTMLElement,
  _width: number,
  _height: number,
  planetId: 'moon' | 'mars',
): Phaser.Types.Core.GameConfig {
  console.log('[createPhaserConfig] Creating config for parent:', parent)
  console.log('[createPhaserConfig] Window dimensions:', window.innerWidth, 'x', window.innerHeight)
  console.log('[createPhaserConfig] Planet ID:', planetId)
  
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
    // Make canvas visible and ensure it's added to the parent
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
  }
}
