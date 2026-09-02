import Phaser from 'phaser';
import { BarracksScene } from './scenes/BarracksScene';
import { BattleScene } from './scenes/BattleScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { MapScene } from './scenes/MapScene';
import { PreloadScene } from './scenes/PreloadScene';
import { UIScene } from './scenes/UIScene';
import { progression } from './systems/Progression';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE } from './config/GameConfig';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: PALETTE.sky,
  scale: {
    // One design resolution, letterboxed to fit every phone and desktop.
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: { antialias: true, powerPreference: 'high-performance' },
  scene: [PreloadScene, MainMenuScene, MapScene, BattleScene, UIScene, BarracksScene],
});

// Dev-only handle for debugging from the browser console. Stripped from prod builds.
if (import.meta.env.DEV) {
  const w = window as unknown as Record<string, unknown>;
  w.game = game;
  w.progression = progression;
}
