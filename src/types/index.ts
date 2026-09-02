export type Team = 'player' | 'enemy';

/** What a unit's attacks are made of. Drives the counter matrix. */
export type DamageType = 'slash' | 'pierce' | 'blunt' | 'magic';

/** What a unit is protected by. Drives the counter matrix. */
export type ArmorType = 'unarmored' | 'light' | 'heavy' | 'shielded';

/**
 * Standing order for a unit.
 * - `charge`  advance and fight (default)
 * - `hold`    stand your ground, still fight anything in reach
 * - `retreat` disengage and fall back — you stop fighting, which is the cost
 */
export type Stance = 'charge' | 'hold' | 'retreat';

/**
 * What makes a legendary legendary. Each field is one rule no ordinary unit has.
 * A unit with no traits is an ordinary unit — see CONTENT.md.
 */
export interface UnitTraits {
  /** Ignores ally blocking entirely — walks over its own line. */
  flying?: boolean;
  /** Kills any target at or below this health fraction outright. */
  executeBelow?: number;
  /** Pushes its target back this far on every hit. */
  knockbackOnHit?: number;
  /** Every Nth attack also slams an area, staggering friend and foe. */
  slamEvery?: number;
  slamRadius?: number;
  slamDamage?: number;
  /** Revives one fallen ally within radius on this cadence. */
  reviveEveryMs?: number;
  reviveRadius?: number;
  /** Enemies dying within this radius rise as thralls under your command. */
  raiseRadius?: number;
  /** Expires after this long. Used by summoned units. */
  lifespanMs?: number;
  /** Regenerates this much health per second. Chip damage will never win. */
  regenPerSecond?: number;
  /** Swings at the toughest thing in reach rather than the nearest. */
  targetsHighestHp?: boolean;
  /** Heals whenever ANY unit dies within this radius. */
  healOnDeathRadius?: number;
  healOnDeathAmount?: number;
}

/** Static, data-driven definition of a unit type. Balance lives in data, not code. */
export interface UnitDef {
  id: string;
  name: string;
  /** Mana cost to deploy. */
  cost: number;
  maxHp: number;
  damage: number;
  /** Distance in px at which the unit stops and attacks. */
  attackRange: number;
  /** Milliseconds between attacks. */
  attackCooldown: number;
  /** Pixels per second. */
  speed: number;
  /** Half-width used for spacing and collision. */
  radius: number;
  /** Placeholder body height until real art lands. */
  height: number;
  /** Per-unit deploy cooldown in ms. */
  deployCooldown: number;
  damageType: DamageType;
  armorType: ArmorType;
  /** One-line role summary, shown in the deploy tooltip and codex. */
  role: string;
  tint: number;
  /** Heroes, bosses and legendaries. Immune to instant-kill effects. */
  elite?: boolean;
  traits?: UnitTraits;
}

export type AbilityKind = 'shockwave' | 'volley' | 'rally' | 'heal';

/** Hero abilities and player spells share one shape and one cooldown system. */
export interface AbilityDef {
  id: string;
  name: string;
  kind: AbilityKind;
  /** Milliseconds before it can be used again. */
  cooldown: number;
  /** Mana cost. Hero abilities are free (0) — they are gated by cooldown alone. */
  manaCost: number;
  /** The player must pick a point on the lane before this fires. */
  targeted: boolean;
  tint: number;
  /** Effect radius in px, for shockwave / volley / heal. */
  radius?: number;
  /** Flat damage, for shockwave / volley. */
  damage?: number;
  /** Heal amount, or buff fraction (0.5 = +50%), depending on kind. */
  amount?: number;
  /** Buff duration in ms, for rally. */
  duration?: number;
}

export interface CombatContext {
  allies: readonly Unitish[];
  enemies: readonly Unitish[];
  enemyCastle: Castleish;
}

/** Structural types keep systems decoupled from the concrete classes. */
export interface Unitish {
  x: number;
  team: Team;
  isDead: boolean;
  def: UnitDef;
  /** `effectiveness` is the counter multiplier, used only for damage-number styling. */
  takeDamage(amount: number, effectiveness?: number): void;
}

export interface Castleish {
  x: number;
  isDestroyed: boolean;
  takeDamage(amount: number): void;
}
