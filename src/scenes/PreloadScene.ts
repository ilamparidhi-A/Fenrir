import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../config/GameConfig';
import { ALL_ASSETS } from '../config/Assets';

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

    // Art is optional. Anything listed in the manifest loads here; anything
    // absent simply leaves the placeholder shapes in play.
    for (const asset of ALL_ASSETS) {
      this.load.image(asset.key, asset.path);
    }
  }

  create(): void {
    this.scene.start('MainMenu');
  }
}
