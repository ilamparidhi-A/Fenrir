import Phaser from 'phaser';
import { progression } from '../systems/Progression';
import { CSS, GAME_HEIGHT, GAME_NAME, GAME_WIDTH, PALETTE } from '../config/GameConfig';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.sky);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, GAME_NAME.toUpperCase(), {
        fontFamily: 'Georgia, serif',
        fontSize: '76px',
        color: CSS.text,
      })
      .setOrigin(0.5)
      .setLetterSpacing(8);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 86,
        'They bound the wolf with a ribbon and called it mercy.',
        {
          fontFamily: 'Georgia, serif',
          fontSize: '19px',
          color: CSS.muted,
        }
      )
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 58, 'He kept the chain.', {
        fontFamily: 'Georgia, serif',
        fontSize: '19px',
        color: CSS.muted,
      })
      .setOrigin(0.5);

    this.menuButton(GAME_HEIGHT / 2 + 20, 'CAMPAIGN', () => this.scene.start('Map'));
    this.menuButton(GAME_HEIGHT / 2 + 96, 'BARRACKS', () => this.scene.start('Barracks'));

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 54, progression.runes + ' runes in hand', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: CSS.accent,
      })
      .setOrigin(0.5);

    if (progression.victories > 0) {
      this.add
        .text(
          GAME_WIDTH / 2,
          GAME_HEIGHT - 30,
          progression.clearedCount +
            ' / 15 stages cleared · ' +
            progression.victories +
            ' victories',
          {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: CSS.muted,
          }
        )
        .setOrigin(0.5);
    }
  }

  private menuButton(y: number, label: string, onClick: () => void): void {
    const box = this.add
      .rectangle(GAME_WIDTH / 2, y, 280, 60, PALETTE.accent, 0.15)
      .setStrokeStyle(2, PALETTE.accent)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, y, label, {
        fontFamily: 'Georgia, serif',
        fontSize: '26px',
        color: CSS.text,
      })
      .setOrigin(0.5);

    box.on('pointerover', () => box.setFillStyle(PALETTE.accent, 0.32));
    box.on('pointerout', () => box.setFillStyle(PALETTE.accent, 0.15));
    box.on('pointerup', onClick);
  }
}
