import Phaser from 'phaser';
import { Unit } from './Unit';
import { HERO_LANE, PALETTE } from '../config/GameConfig';
import type { UnitDef } from '../types';

/**
 * The player's champion. Free at battle start, far tougher than a line unit, and
 * the anchor for the hero ability.
 *
 * Heroes dying too easily was the most common complaint about Epic War 5, so this
 * one is not a permanent loss — BattleScene respawns it on a timer.
 */
export class Hero extends Unit {
  constructor(scene: Phaser.Scene, x: number, def: UnitDef) {
    // Frontmost rank: the champion is never buried behind its own line.
    super(scene, x, def, 'player', HERO_LANE);

    // Crest above the head, so the hero is instantly findable in a crowded lane.
    const crest = scene.add
      .triangle(0, -def.height - 26, 0, 12, 9, 0, 18, 12, PALETTE.accent)
      .setOrigin(0.5);
    this.add(crest);

    scene.tweens.add({
      targets: crest,
      y: crest.y - 5,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }
}
