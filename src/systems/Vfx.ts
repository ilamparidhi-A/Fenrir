import Phaser from 'phaser';
import { GROUND_Y } from '../config/GameConfig';

/**
 * Presentation-only helpers. Nothing here touches simulation state — every
 * function spawns a self-destroying decoration and returns immediately.
 *
 * This module is where "better graphics" actually comes from in this genre.
 * A modest sprite with good effects beats a great sprite with none.
 */
export const Vfx = {
  /** Expanding ring. The workhorse for any area effect. */
  shockwave(scene: Phaser.Scene, x: number, y: number, radius: number, color: number): void {
    const ring = scene.add.circle(x, y, 12).setStrokeStyle(4, color, 1).setDepth(900);
    scene.tweens.add({
      targets: ring,
      radius,
      alpha: 0,
      duration: 420,
      ease: 'Cubic.Out',
      onUpdate: () => ring.setStrokeStyle(4, color, ring.alpha),
      onComplete: () => ring.destroy(),
    });
  },

  /** Rising, fading number. Reads damage without the player parsing health bars. */
  damageNumber(
    scene: Phaser.Scene,
    x: number,
    y: number,
    amount: number,
    color: string,
    emphasis = 1
  ): void {
    const label = scene.add
      .text(x + Phaser.Math.Between(-8, 8), y, String(Math.round(amount)), {
        fontFamily: 'Georgia, serif',
        fontSize: Math.round(19 * emphasis) + 'px',
        color,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(950);

    scene.tweens.add({
      targets: label,
      y: y - 42,
      alpha: 0,
      duration: 620,
      ease: 'Quad.Out',
      onComplete: () => label.destroy(),
    });
  },

  /** Arrows raining into a slice of the lane. */
  volley(scene: Phaser.Scene, x: number, radius: number, color: number): void {
    for (let i = 0; i < 16; i++) {
      const ax = x + Phaser.Math.Between(-radius, radius);
      const arrow = scene.add
        .rectangle(ax, GROUND_Y - 340, 3, 22, color, 0.95)
        .setAngle(18)
        .setDepth(920);

      scene.tweens.add({
        targets: arrow,
        y: GROUND_Y - Phaser.Math.Between(0, 24),
        duration: Phaser.Math.Between(230, 420),
        delay: i * 22,
        ease: 'Quad.In',
        onComplete: () => {
          scene.tweens.add({
            targets: arrow,
            alpha: 0,
            duration: 260,
            onComplete: () => arrow.destroy(),
          });
        },
      });
    }
  },

  /** Brief upward flash on a buffed or healed unit. */
  pulse(scene: Phaser.Scene, x: number, y: number, color: number): void {
    const glow = scene.add.circle(x, y, 18, color, 0.5).setDepth(880);
    scene.tweens.add({
      targets: glow,
      y: y - 30,
      alpha: 0,
      scale: 1.7,
      duration: 480,
      ease: 'Quad.Out',
      onComplete: () => glow.destroy(),
    });
  },

  /** Text that punches in at the centre of the lane — used for spell casts. */
  banner(scene: Phaser.Scene, x: number, text: string, color: string): void {
    const label = scene.add
      .text(x, GROUND_Y - 210, text, {
        fontFamily: 'Georgia, serif',
        fontSize: '30px',
        color,
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(960)
      .setScale(0.5);

    scene.tweens.add({ targets: label, scale: 1, duration: 200, ease: 'Back.Out' });
    scene.tweens.add({
      targets: label,
      alpha: 0,
      y: GROUND_Y - 260,
      delay: 520,
      duration: 400,
      onComplete: () => label.destroy(),
    });
  },
};
