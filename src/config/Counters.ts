import type { ArmorType, DamageType } from '../types';

/**
 * The counter matrix — the single biggest gameplay upgrade over Epic War 5.
 *
 * In the original, every price point had one dominant unit, so the optimal play
 * was "spam the best thing you can afford". Here every damage type has something
 * it shreds and something it bounces off, so a stack of one unit always loses to
 * a composition that answers it.
 *
 * Read as: COUNTERS[attacker damage type][defender armour type] = multiplier.
 */
export const COUNTERS: Record<DamageType, Record<ArmorType, number>> = {
  // Cleaves flesh, turns on plate.
  slash: { unarmored: 1.35, light: 1.15, heavy: 0.6, shielded: 0.75 },
  // Finds the gaps in armour, but a raised shield stops it dead.
  pierce: { unarmored: 1.0, light: 1.2, heavy: 1.4, shielded: 0.45 },
  // Too slow to catch skirmishers; caves in anything that stands its ground.
  blunt: { unarmored: 0.75, light: 0.9, heavy: 1.3, shielded: 1.55 },
  // Ignores armour entirely. Never a hard counter, never countered.
  magic: { unarmored: 1.15, light: 1.15, heavy: 1.15, shielded: 1.15 },
};

export function counterMultiplier(damage: DamageType, armor: ArmorType): number {
  return COUNTERS[damage][armor];
}

/** Effectiveness bands, used to colour damage numbers so counters are readable. */
export const EFFECTIVE_THRESHOLD = 1.15;
export const RESISTED_THRESHOLD = 0.9;

export const ARMOR_LABEL: Record<ArmorType, string> = {
  unarmored: 'Unarmoured',
  light: 'Light',
  heavy: 'Heavy',
  shielded: 'Shielded',
};

export const DAMAGE_LABEL: Record<DamageType, string> = {
  slash: 'Slash',
  pierce: 'Pierce',
  blunt: 'Blunt',
  magic: 'Magic',
};

/** Colour per damage type, so the deploy bar teaches the matrix at a glance. */
export const DAMAGE_TINT: Record<DamageType, number> = {
  slash: 0xd9705a,
  pierce: 0x8fd6a0,
  blunt: 0xb06a3c,
  magic: 0xa682d4,
};
