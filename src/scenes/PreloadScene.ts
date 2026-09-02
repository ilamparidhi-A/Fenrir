import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../config/GameConfig';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    const barW = 420;
    const x = GAME_WIDTH / 2 - barW / 2;
    const y = GAME_HEIGHT / 2;

    this.add.rectangle(GAME_WIDTH / 2, y, barW + 6, 26, 0x000000, 0.5);
    const fill = this.add.rectangle(x, y, 0, 20, PALETTE.accent).setOrigin(0, 0.5);

    this.load.on('progress', (p: number) => {
      fill.width = barW * p;
    });

    // No real assets yet — art drops into public/assets and gets loaded here.
  }

  create(): void {
    this.scene.start('MainMenu');
  }
}
