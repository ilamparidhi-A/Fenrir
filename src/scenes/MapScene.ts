import Phaser from 'phaser';
import { progression } from '../systems/Progression';
import { ACTS, stagesInAct, type StageDef } from '../config/Campaign';
import { BIOMES } from '../config/Biomes';
import { CSS, GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../config/GameConfig';

const NODE_R = 26;
const ACT_TOP = 168;
const ACT_GAP = 158;
const TRACK_X = 190;
const TRACK_W = GAME_WIDTH - TRACK_X - 150;

/**
 * The campaign map. One track per act, five nodes each, locked until the
 * previous stage is cleared. Stars show on cleared nodes.
 */
export class MapScene extends Phaser.Scene {
  constructor() {
    super('Map');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(PALETTE.sky);

    this.add
      .text(GAME_WIDTH / 2, 52, 'THE LONG MARCH', {
        fontFamily: 'Georgia, serif',
        fontSize: '38px',
        color: CSS.text,
      })
      .setOrigin(0.5)
      .setLetterSpacing(4);

    this.add
      .text(GAME_WIDTH / 2, 90, progression.runes + ' runes  ·  ' + progression.clearedCount + ' / 15 stages cleared', {
        fontFamily: 'Georgia, serif',
        fontSize: '15px',
        color: CSS.muted,
      })
      .setOrigin(0.5);

    ACTS.forEach((act, i) => this.buildAct(act, ACT_TOP + i * ACT_GAP));

    this.footerButton(GAME_WIDTH / 2 - 130, GAME_HEIGHT - 42, 'Barracks', () =>
      this.scene.start('Barracks')
    );
    this.footerButton(GAME_WIDTH / 2 + 130, GAME_HEIGHT - 42, 'Menu', () =>
      this.scene.start('MainMenu')
    );
  }

  private buildAct(act: number, y: number): void {
    const stages = stagesInAct(act);
    const biome = BIOMES[stages[0]!.biome];

    this.add.text(40, y - 34, 'ACT ' + toRoman(act), {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: CSS.text,
    });

    this.add.text(40, y - 6, biome?.name ?? '', {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: CSS.muted,
      wordWrap: { width: 140 },
    });

    // Connecting track behind the nodes.
    this.add
      .rectangle(TRACK_X, y, TRACK_W, 2, PALETTE.groundLine, 0.6)
      .setOrigin(0, 0.5);

    const step = TRACK_W / (stages.length - 1);
    stages.forEach((stage, i) => this.buildNode(stage, TRACK_X + i * step, y));
  }

  private buildNode(stage: StageDef, x: number, y: number): void {
    const unlocked = progression.isStageUnlocked(stage.id);
    const stars = progression.stageStars(stage.id);
    const cleared = stars > 0;

    const tint = stage.isBoss ? PALETTE.enemy : PALETTE.player;
    const fillAlpha = unlocked ? (cleared ? 0.5 : 0.24) : 0.08;

    const node = stage.isBoss
      ? this.add.star(x, y, 6, NODE_R * 0.55, NODE_R + 4, tint, fillAlpha)
      : this.add.circle(x, y, NODE_R, tint, fillAlpha);

    node.setStrokeStyle(unlocked ? 3 : 2, tint, unlocked ? 1 : 0.35);

    this.add
      .text(x, y, String(stage.index), {
        fontFamily: 'Georgia, serif',
        fontSize: '19px',
        color: unlocked ? CSS.text : CSS.muted,
      })
      .setOrigin(0.5);

    this.add
      .text(x, y + NODE_R + 16, unlocked ? stage.name : 'Locked', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: unlocked ? CSS.text : CSS.muted,
        align: 'center',
        wordWrap: { width: 120 },
      })
      .setOrigin(0.5, 0);

    // Earned stars sit above the node.
    if (cleared) {
      for (let i = 0; i < 3; i++) {
        this.add
          .star(x - 14 + i * 14, y - NODE_R - 14, 5, 3, 7, i < stars ? PALETTE.accent : 0x2f2a22)
          .setStrokeStyle(1, PALETTE.accent, i < stars ? 1 : 0.4);
      }
    }

    if (!unlocked) return;

    node.setInteractive({ useHandCursor: true });
    node.on('pointerover', () => node.setScale(1.12));
    node.on('pointerout', () => node.setScale(1));
    node.on('pointerup', () => this.scene.start('Battle', { stageId: stage.id }));
  }

  private footerButton(x: number, y: number, label: string, onClick: () => void): void {
    const box = this.add
      .rectangle(x, y, 200, 46, PALETTE.accent, 0.14)
      .setStrokeStyle(2, PALETTE.accent)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y, label, { fontFamily: 'Georgia, serif', fontSize: '18px', color: CSS.text })
      .setOrigin(0.5);

    box.on('pointerover', () => box.setFillStyle(PALETTE.accent, 0.32));
    box.on('pointerout', () => box.setFillStyle(PALETTE.accent, 0.14));
    box.on('pointerup', onClick);
  }
}

function toRoman(n: number): string {
  return ['', 'I', 'II', 'III', 'IV', 'V'][n] ?? String(n);
}
