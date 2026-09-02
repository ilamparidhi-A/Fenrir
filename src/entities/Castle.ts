import Phaser from 'phaser';
import type { Team } from '../types';
import { CASTLE_HP } from '../config/Balance';
import { GROUND_Y, PALETTE } from '../config/GameConfig';

export class Castle extends Phaser.GameObjects.Container {
  public readonly team: Team;
  public readonly maxHp: number;
  public hp: number;

  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly body_: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, team: Team, maxHp: number = CASTLE_HP) {
    super(scene, x, GROUND_Y);
    this.team = team;
    this.maxHp = maxHp;
    this.hp = maxHp;

    const color = team === 'player' ? PALETTE.player : PALETTE.enemy;

    // Placeholder keep. Swap for a layered sprite + parallax banner later.
    this.body_ = scene.add.rectangle(0, -70, 120, 140, color, 0.28).setStrokeStyle(3, color);
    const battlement = scene.add.rectangle(0, -145, 140, 16, color, 0.55);

    const barBg = scene.add.rectangle(0, -165, 130, 9, 0x000000, 0.6);
    this.hpFill = scene.add.rectangle(-64, -165, 128, 7, PALETTE.hpGood).setOrigin(0, 0.5);

    this.add([this.body_, battlement, barBg, this.hpFill]);
    scene.add.existing(this);
  }

  get isDestroyed(): boolean {
    return this.hp <= 0;
  }

  takeDamage(amount: number): void {
    if (this.isDestroyed) return;
    this.hp = Math.max(0, this.hp - amount);
    const ratio = this.hp / this.maxHp;
    this.hpFill.width = 128 * ratio;
    this.hpFill.fillColor = ratio > 0.3 ? PALETTE.hpGood : PALETTE.enemy;

    this.scene.tweens.add({
      targets: this.body_,
      alpha: { from: 0.75, to: 0.28 },
      duration: 140,
    });
  }
}
