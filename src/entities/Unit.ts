import Phaser from 'phaser';
import type { CombatContext, Stance, Team, UnitDef, Unitish } from '../types';
import {
  CSS,
  ENEMY_CASTLE_X,
  LANE_COUNT,
  LANE_SCALE_MIN,
  PALETTE,
  PLAYER_CASTLE_X,
  laneY,
} from '../config/GameConfig';
import { Vfx } from '../systems/Vfx';
import {
  counterMultiplier,
  EFFECTIVE_THRESHOLD,
  RESISTED_THRESHOLD,
} from '../config/Counters';

/** What a unit can swing at: another unit, or a castle. */
interface AttackTarget {
  takeDamage(n: number, effectiveness?: number): void;
  def?: UnitDef;
  hp?: number;
  knockback?(distance: number): void;
}

/** Gap kept between queued-up friendly units so they don't stack on one pixel. */
const SPACING = 6;

/** Rally boosts damage by its full amount but movement by only this fraction of it. */
const BUFF_SPEED_SCALE = 0.6;

export class Unit extends Phaser.GameObjects.Container {
  /** Round-robin so ranks fill evenly instead of clumping. */
  private static laneCursor = 0;

  static resetLanes(): void {
    Unit.laneCursor = 0;
  }

  public readonly def: UnitDef;
  public readonly team: Team;
  public readonly lane: number;
  public hp: number;
  public isDead = false;
  /** Standing order, set by the player's army commands. */
  public stance: Stance = 'charge';

  /** Ticked by BattleScene for units with revive/raise auras. */
  public auraTimer = 0;

  private attackTimer = 0;
  private attackCount = 0;
  private ageMs = 0;
  private buffMs = 0;
  private buffAmount = 0;

  /** def.tint blended toward the team colour, so you can read friend from foe at a glance. */
  private readonly displayTint: number;
  private readonly teamColor: number;
  private readonly bodyRect: Phaser.GameObjects.Rectangle;
  private readonly weapon: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly hpBarWidth: number;
  /** Rank scale. Back ranks sit slightly smaller so overlap reads as depth. */
  private readonly baseScale: number;

  constructor(scene: Phaser.Scene, x: number, def: UnitDef, team: Team, lane?: number) {
    const assignedLane = lane ?? Unit.laneCursor++ % LANE_COUNT;
    super(scene, x, laneY(assignedLane));
    this.def = def;
    this.team = team;
    this.lane = assignedLane;
    this.hp = def.maxHp;

    const w = def.radius * 2;
    this.hpBarWidth = Math.max(24, w + 8);

    this.baseScale =
      LANE_SCALE_MIN + (1 - LANE_SCALE_MIN) * (assignedLane / Math.max(1, LANE_COUNT - 1));

    this.teamColor = team === 'player' ? PALETTE.player : PALETTE.enemy;

    // Blend toward the team colour so friend/foe reads instantly — but only
    // lightly for elites, whose own colour is how you recognise them.
    const teamPull = def.elite ? 18 : 38;
    const blended = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.IntegerToColor(def.tint),
      Phaser.Display.Color.IntegerToColor(this.teamColor),
      100,
      teamPull
    );
    this.displayTint = Phaser.Display.Color.GetColor(blended.r, blended.g, blended.b);

    // --- Placeholder art ---------------------------------------------------
    // Everything below is 3 rectangles. When real art lands this constructor is
    // the ONLY place that changes: swap for a Spine object, keep the same API.

    // Contact shadow. Cheap, and it is most of what makes overlapping units read
    // as standing at different depths rather than clipping through each other.
    const shadow = scene.add.ellipse(0, 3, def.radius * 2.6, 9, 0x000000, 0.38);

    this.bodyRect = scene.add
      .rectangle(0, -def.height / 2, w, def.height, this.displayTint)
      .setStrokeStyle(def.elite ? 3 : 2, def.elite ? 0xf2e6c8 : this.teamColor, def.elite ? 1 : 0.9);

    this.weapon = scene.add.rectangle(
      this.facing * (def.radius + 5),
      -def.height * 0.62,
      10,
      4,
      0xe8e2d4,
      0.9
    );

    const barBg = scene.add.rectangle(0, -def.height - 10, this.hpBarWidth, 5, 0x000000, 0.65);
    this.hpFill = scene.add
      .rectangle(-this.hpBarWidth / 2 + 1, -def.height - 10, this.hpBarWidth - 2, 3, PALETTE.hpGood)
      .setOrigin(0, 0.5);
    // -----------------------------------------------------------------------

    this.add([shadow, this.bodyRect, this.weapon, barBg, this.hpFill]);
    // Nearer ranks (larger y) draw in front of the ones behind them.
    this.setDepth(Math.round(this.y));
    scene.add.existing(this);

    // Spawn pop — cheap juice, big readability win.
    this.setScale(this.baseScale * 0.6);
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      scale: this.baseScale,
      alpha: 1,
      duration: 180,
      ease: 'Back.Out',
    });
  }

  /** +1 for player (walks right), -1 for enemy (walks left). */
  get facing(): number {
    return this.team === 'player' ? 1 : -1;
  }

  /** Y of roughly head height, for anchoring floating text and effects. */
  get headY(): number {
    return this.y - this.def.height - 18;
  }

  private get isBuffed(): boolean {
    return this.buffMs > 0;
  }

  private get damageOut(): number {
    return this.def.damage * (1 + (this.isBuffed ? this.buffAmount : 0));
  }

  private get moveSpeed(): number {
    return this.def.speed * (1 + (this.isBuffed ? this.buffAmount * BUFF_SPEED_SCALE : 0));
  }

  private refreshHpBar(): void {
    const ratio = Phaser.Math.Clamp(this.hp / this.def.maxHp, 0, 1);
    this.hpFill.width = (this.hpBarWidth - 2) * ratio;
    this.hpFill.fillColor = ratio > 0.35 ? PALETTE.hpGood : PALETTE.enemy;
  }

  takeDamage(amount: number, effectiveness = 1): void {
    if (this.isDead) return;
    this.hp -= amount;
    this.refreshHpBar();

    // Colour and size tell the player the counter landed, without a tutorial.
    let color: string = CSS.danger;
    let emphasis = 1;
    if (effectiveness >= EFFECTIVE_THRESHOLD) {
      color = CSS.accent;
      emphasis = 1.35;
    } else if (effectiveness <= RESISTED_THRESHOLD) {
      color = CSS.muted;
      emphasis = 0.8;
    }
    Vfx.damageNumber(this.scene, this.x, this.headY, amount, color, emphasis);

    this.bodyRect.setFillStyle(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (!this.isDead) this.bodyRect.setFillStyle(this.displayTint);
    });

    if (this.hp <= 0) this.die();
  }

  /** Set health without the damage/heal feedback. Used when reviving. */
  setHealth(value: number): void {
    this.hp = Phaser.Math.Clamp(value, 1, this.def.maxHp);
    this.refreshHpBar();
  }

  heal(amount: number): void {
    if (this.isDead || this.hp >= this.def.maxHp) return;
    const healed = Math.min(amount, this.def.maxHp - this.hp);
    this.hp += healed;
    this.refreshHpBar();
    Vfx.damageNumber(this.scene, this.x, this.headY, healed, CSS.heal);
    Vfx.pulse(this.scene, this.x, this.y - this.def.height / 2, PALETTE.hpGood);
  }

  /** Rally. `amount` is a fraction: 0.5 means +50% damage. */
  applyBuff(amount: number, durationMs: number): void {
    if (this.isDead) return;
    this.buffAmount = amount;
    this.buffMs = durationMs;
    this.bodyRect.setStrokeStyle(3, PALETTE.accent, 1);
    Vfx.pulse(this.scene, this.x, this.y - this.def.height / 2, PALETTE.accent);
  }

  /** Shove the unit backwards along the lane. Used by shockwaves. */
  knockback(distance: number): void {
    if (this.isDead) return;
    this.x -= this.facing * distance;
  }

  protected die(): void {
    if (this.isDead) return;
    this.isDead = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y + 8,
      angle: this.facing * 70,
      duration: 260,
      ease: 'Quad.In',
      onComplete: () => this.destroy(),
    });
  }

  /** How far back this unit may fall before its own keep stops it. */
  private get retreatLimit(): number {
    return this.team === 'player' ? PLAYER_CASTLE_X + 50 : ENEMY_CASTLE_X - 50;
  }

  tick(dtMs: number, ctx: CombatContext): void {
    if (this.isDead) return;

    this.attackTimer -= dtMs;

    // Summoned units expire rather than lingering forever.
    const lifespan = this.def.traits?.lifespanMs;
    if (lifespan) {
      this.ageMs += dtMs;
      if (this.ageMs >= lifespan) {
        this.die();
        return;
      }
    }

    // Regeneration. Chip damage from the wrong composition will never win.
    const regen = this.def.traits?.regenPerSecond;
    if (regen && this.hp < this.def.maxHp && !this.isDead) {
      this.hp = Math.min(this.def.maxHp, this.hp + regen * (dtMs / 1000));
      this.refreshHpBar();
    }

    if (this.buffMs > 0) {
      this.buffMs -= dtMs;
      if (this.buffMs <= 0) {
        this.bodyRect.setStrokeStyle(
          this.def.elite ? 3 : 2,
          this.def.elite ? 0xf2e6c8 : this.teamColor,
          this.def.elite ? 1 : 0.9
        );
      }
    }

    // Falling back means breaking off the fight. That is what makes it a decision.
    if (this.stance === 'retreat') {
      const limit = this.retreatLimit;
      const next = this.x - this.facing * this.moveSpeed * (dtMs / 1000);
      this.x = this.facing > 0 ? Math.max(limit, next) : Math.min(limit, next);
      return;
    }

    const target = this.findTarget(ctx.enemies);
    if (target) {
      this.tryAttack(target, ctx);
      return;
    }

    const castle = ctx.enemyCastle;
    if (!castle.isDestroyed && this.distanceTo(castle.x) <= this.def.attackRange) {
      this.tryAttack(castle, ctx);
      return;
    }

    if (this.stance === 'hold') return;

    if (!this.isBlocked(ctx.allies as readonly Unit[])) {
      this.x += this.facing * this.moveSpeed * (dtMs / 1000);
    }
  }

  private distanceTo(x: number): number {
    return Math.abs(x - this.x);
  }

  /**
   * Nearest living enemy ahead of (or overlapping) this unit, within range —
   * unless this unit hunts the toughest thing it can see instead, which is what
   * makes the Executioner a threat to your champion specifically.
   */
  private findTarget(enemies: readonly Unitish[]): Unitish | null {
    const huntToughest = this.def.traits?.targetsHighestHp === true;
    let best: Unitish | null = null;
    let bestScore = huntToughest ? -Infinity : Infinity;

    for (const e of enemies) {
      if (e.isDead) continue;
      const ahead = (e.x - this.x) * this.facing;
      if (ahead < -this.def.radius) continue; // already behind us
      const dist = Math.abs(e.x - this.x);
      if (dist > this.def.attackRange) continue;

      const score = huntToughest ? (e as Unit).hp : dist;
      if (huntToughest ? score > bestScore : score < bestScore) {
        bestScore = score;
        best = e;
      }
    }
    return best;
  }

  /**
   * Stop only for an ally in the *same rank*. Units in other lanes walk past,
   * which is what lets three fight abreast instead of one at a time.
   */
  private isBlocked(allies: readonly Unit[]): boolean {
    // Fliers walk straight over their own line — the Valkyrie's whole point.
    if (this.def.traits?.flying) return false;

    for (const a of allies) {
      if (a === this || a.isDead || a.lane !== this.lane) continue;
      const ahead = (a.x - this.x) * this.facing;
      if (ahead > 0 && ahead < this.def.radius + a.def.radius + SPACING) return true;
    }
    return false;
  }

  private tryAttack(target: AttackTarget, ctx?: CombatContext): void {
    if (this.attackTimer > 0) return;
    this.attackTimer = this.def.attackCooldown;
    this.attackCount += 1;

    // Castles have no armour type, so they take flat damage.
    const armor = target.def?.armorType;
    const multiplier = armor ? counterMultiplier(this.def.damageType, armor) : 1;
    const traits = this.def.traits;

    let damage = this.damageOut * multiplier;
    let executed = false;

    // Execute: below the threshold, HP stops mattering. Elites are immune and
    // take a heavy flat hit instead, so bosses cannot be deleted outright.
    if (traits?.executeBelow && target.def && typeof target.hp === 'number') {
      if (target.hp / target.def.maxHp <= traits.executeBelow) {
        if (target.def.elite) {
          damage = this.damageOut * 3;
        } else {
          damage = target.hp;
          executed = true;
        }
      }
    }

    target.takeDamage(damage, executed ? 2 : multiplier);

    if (executed) {
      Vfx.pulse(this.scene, this.x, this.y - this.def.height / 2, 0x000000);
    }

    if (traits?.knockbackOnHit) target.knockback?.(traits.knockbackOnHit);

    if (traits?.slamEvery && ctx && this.attackCount % traits.slamEvery === 0) {
      this.slam(ctx);
    }

    // Lunge — sells the hit without any art.
    this.scene.tweens.add({
      targets: this.weapon,
      x: this.facing * (this.def.radius + 16),
      duration: 90,
      yoyo: true,
      ease: 'Quad.Out',
    });
  }

  /**
   * Ground slam. Damages enemies and shoves *everyone* nearby, allies included —
   * the friendly stagger is what stops the Jotunn being a free upgrade.
   */
  private slam(ctx: CombatContext): void {
    const traits = this.def.traits!;
    const radius = traits.slamRadius ?? 140;

    Vfx.shockwave(this.scene, this.x, this.y - 24, radius, PALETTE.accent);

    for (const raw of ctx.enemies) {
      const e = raw as Unit;
      if (e.isDead || Math.abs(e.x - this.x) > radius) continue;
      e.takeDamage(traits.slamDamage ?? 30, 1.3);
      e.knockback(34);
    }

    for (const raw of ctx.allies) {
      const a = raw as Unit;
      if (a === this || a.isDead || Math.abs(a.x - this.x) > radius) continue;
      a.knockback(16);
    }
  }
}
