import type { UnitDef } from '../types';

/**
 * The roster. Eight units, each defined by a (damage type, armour type) pair so
 * that no single stack is ever correct — see `Counters.ts`.
 *
 * Names are placeholders; the story writer will rename these. Roles and numbers
 * are the part that matters here.
 */
export const UNIT_DEFS: Record<string, UnitDef> = {
  militia: {
    id: 'militia',
    name: 'Militia',
    role: 'Cheap chaff. Bodies to hold a line.',
    cost: 20,
    maxHp: 90,
    damage: 9,
    attackRange: 42,
    attackCooldown: 700,
    speed: 62,
    radius: 14,
    height: 46,
    deployCooldown: 500,
    damageType: 'slash',
    armorType: 'light',
    tint: 0x4a9de0,
  },
  spearman: {
    id: 'spearman',
    name: 'Spearman',
    role: 'Reach and pierce. Answers heavy armour.',
    cost: 35,
    maxHp: 130,
    damage: 14,
    attackRange: 66,
    attackCooldown: 900,
    speed: 52,
    radius: 15,
    height: 52,
    deployCooldown: 900,
    damageType: 'pierce',
    armorType: 'light',
    tint: 0x6fb3e8,
  },
  archer: {
    id: 'archer',
    name: 'Archer',
    role: 'Long range, fragile. Useless into shields.',
    cost: 45,
    maxHp: 70,
    damage: 18,
    attackRange: 190,
    attackCooldown: 1200,
    speed: 48,
    radius: 13,
    height: 44,
    deployCooldown: 1400,
    damageType: 'pierce',
    armorType: 'unarmored',
    tint: 0x8fd6a0,
  },
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    role: 'Fast glass cannon. Dies to anything ranged.',
    cost: 50,
    maxHp: 110,
    damage: 30,
    attackRange: 44,
    attackCooldown: 550,
    speed: 88,
    radius: 14,
    height: 48,
    deployCooldown: 1800,
    damageType: 'slash',
    armorType: 'unarmored',
    tint: 0xd9705a,
  },
  shieldbearer: {
    id: 'shieldbearer',
    name: 'Shieldbearer',
    role: 'A wall. Barely hurts anything, stops arrows dead.',
    cost: 60,
    maxHp: 420,
    damage: 12,
    attackRange: 44,
    attackCooldown: 1300,
    speed: 30,
    radius: 19,
    height: 58,
    deployCooldown: 3000,
    damageType: 'blunt',
    armorType: 'shielded',
    tint: 0x9a9284,
  },
  maul: {
    id: 'maul',
    name: 'Maul',
    role: 'Shield-breaker. Slow, and whiffs on skirmishers.',
    cost: 70,
    maxHp: 240,
    damage: 34,
    attackRange: 48,
    attackCooldown: 1400,
    speed: 36,
    radius: 17,
    height: 58,
    deployCooldown: 2400,
    damageType: 'blunt',
    armorType: 'heavy',
    tint: 0xb06a3c,
  },
  knight: {
    id: 'knight',
    name: 'Knight',
    role: 'Durable frontline. Bounces off other plate.',
    cost: 80,
    maxHp: 320,
    damage: 26,
    attackRange: 46,
    attackCooldown: 1000,
    speed: 40,
    radius: 18,
    height: 60,
    deployCooldown: 2600,
    damageType: 'slash',
    armorType: 'heavy',
    tint: 0xc9a55c,
  },
  seer: {
    id: 'seer',
    name: 'Seer',
    role: 'Ignores armour entirely. Expensive and frail.',
    cost: 90,
    maxHp: 80,
    damage: 26,
    attackRange: 165,
    attackCooldown: 1600,
    speed: 44,
    radius: 13,
    height: 50,
    deployCooldown: 2800,
    damageType: 'magic',
    armorType: 'unarmored',
    tint: 0xa682d4,
  },
};


/**
 * Legendaries. Each is unlocked by beating the boss it is bound to, and each has
 * exactly one rule no ordinary unit has. Expensive, slow to field, so arriving is
 * an event. See CONTENT.md.
 */
export const LEGENDARY_DEFS: Record<string, UnitDef> = {
  valkyrie: {
    id: 'valkyrie',
    name: 'Valkyrie',
    role: 'Flies over your own line. Raises the fallen where they died.',
    cost: 130,
    maxHp: 260,
    damage: 30,
    attackRange: 72,
    attackCooldown: 900,
    speed: 70,
    radius: 16,
    height: 62,
    deployCooldown: 15000,
    damageType: 'slash',
    armorType: 'light',
    elite: true,
    traits: { flying: true, reviveEveryMs: 7000, reviveRadius: 280 },
    tint: 0xe6d9a8,
  },
  reaper: {
    id: 'reaper',
    name: 'Reaper',
    role: 'Anything below a fifth of its health simply dies.',
    cost: 150,
    maxHp: 220,
    damage: 34,
    attackRange: 64,
    attackCooldown: 1000,
    speed: 62,
    radius: 16,
    height: 64,
    deployCooldown: 17000,
    damageType: 'magic',
    armorType: 'light',
    elite: true,
    traits: { executeBelow: 0.2 },
    tint: 0x7d5a92,
  },
  jotunn: {
    id: 'jotunn',
    name: 'Jotunn',
    role: 'Nothing stands near it. Every fourth blow staggers the ground.',
    cost: 190,
    maxHp: 900,
    damage: 55,
    attackRange: 64,
    attackCooldown: 1500,
    speed: 28,
    radius: 26,
    height: 88,
    deployCooldown: 24000,
    damageType: 'blunt',
    armorType: 'heavy',
    elite: true,
    traits: { knockbackOnHit: 18, slamEvery: 4, slamRadius: 155, slamDamage: 45 },
    tint: 0x8fb4cc,
  },
  draugr: {
    id: 'draugr',
    name: 'Draugr Jarl',
    role: 'The enemy dead rise and serve you.',
    cost: 170,
    maxHp: 380,
    damage: 28,
    attackRange: 58,
    attackCooldown: 1100,
    speed: 44,
    radius: 18,
    height: 70,
    deployCooldown: 19000,
    damageType: 'blunt',
    armorType: 'heavy',
    elite: true,
    traits: { raiseRadius: 210 },
    tint: 0x7d9159,
  },
};

/** Summoned by the Draugr Jarl. Free, frail, and it does not last. */
export const THRALL_DEF: UnitDef = {
  id: 'thrall',
  name: 'Thrall',
  role: 'Risen dead. Fights briefly, then falls again.',
  cost: 0,
  maxHp: 45,
  damage: 7,
  attackRange: 40,
  attackCooldown: 800,
  speed: 66,
  radius: 12,
  height: 40,
  deployCooldown: 0,
  damageType: 'slash',
  armorType: 'unarmored',
  traits: { lifespanMs: 12000 },
  tint: 0x66794f,
};

export const LEGENDARY_ROSTER: readonly string[] = ['valkyrie', 'reaper', 'jotunn', 'draugr'];

/** Everything deployable, legendaries included. */
export const ALL_UNIT_DEFS: Record<string, UnitDef> = {
  ...UNIT_DEFS,
  ...LEGENDARY_DEFS,
  thrall: THRALL_DEF,
};

/** Deploy-bar order, cheapest first. */
export const ROSTER: readonly string[] = [
  'militia',
  'spearman',
  'archer',
  'berserker',
  'shieldbearer',
  'maul',
  'knight',
  'seer',
];

/**
 * The player's champion. Not in ROSTER — granted free at battle start rather
 * than deployed, and respawns instead of dying for good.
 */
export const HERO_DEF: UnitDef = {
  id: 'hero',
  name: 'Fenrir',
  role: 'Your champion. Falls, but always returns.',
  cost: 0,
  maxHp: 620,
  damage: 38,
  attackRange: 58,
  attackCooldown: 750,
  speed: 55,
  radius: 20,
  height: 72,
  deployCooldown: 0,
  damageType: 'slash',
  armorType: 'heavy',
  tint: 0xe8dcc0,
};

/** Seconds the player fights without a hero after it falls. */
export const HERO_RESPAWN_MS = 12000;

export const MANA = {
  start: 60,
  max: 220,
  /** Fury per second. The single most important balance number in the game. */
  regenPerSecond: 11,
} as const;

export const CASTLE_HP = 1500;

/** Battle speed multipliers the player can cycle through. */
export const SPEED_STEPS: readonly number[] = [1, 2, 3];

/** Enemy wave scripting for the slice. Real stages will load this from JSON. */
export interface WaveEntry {
  atMs: number;
  unitId: string;
}

export const ENEMY_WAVES: readonly WaveEntry[] = [
  { atMs: 3000, unitId: 'militia' },
  { atMs: 6000, unitId: 'militia' },
  { atMs: 10000, unitId: 'spearman' },
  { atMs: 14000, unitId: 'archer' },
  { atMs: 17000, unitId: 'berserker' },
  { atMs: 20000, unitId: 'spearman' },
  { atMs: 25000, unitId: 'shieldbearer' },
  { atMs: 29000, unitId: 'archer' },
  { atMs: 33000, unitId: 'maul' },
  { atMs: 37000, unitId: 'knight' },
  { atMs: 42000, unitId: 'seer' },
  { atMs: 45000, unitId: 'knight' },
  { atMs: 50000, unitId: 'shieldbearer' },
  { atMs: 54000, unitId: 'berserker' },
];

