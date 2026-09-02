import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../config/GameConfig';
import { ALL_ASSETS, UNIT_SPRITES, type UnitAnimState } from '../config/Assets';

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
      if (asset.sheet) this.load.spritesheet(asset.key, asset.path, asset.sheet);
      else this.load.image(asset.key, asset.path);
    }
  }

  create(): void {
    this.registerUnitAnimations();
    this.scene.start('MainMenu');
  }

  /** Turn each pack's frame ranges into Phaser animations, once, up front. */
  private registerUnitAnimations(): void {
    for (const asset of UNIT_SPRITES) {
      if (!asset.anims || !this.textures.exists(asset.key)) continue;

      for (const [state, range] of Object.entries(asset.anims)) {
        if (!range) continue;
        const [start, end] = range as readonly [number, number];
        const key = asset.key + '-' + (state as UnitAnimState);
        if (this.anims.exists(key)) continue;

        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(asset.key, { start, end }),
          frameRate: asset.frameRate ?? 10,
          // Death plays once and holds on its last frame; everything else loops.
          repeat: state === 'die' ? 0 : -1,
        });
      }
    }
  }
}
