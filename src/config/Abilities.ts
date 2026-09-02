import type { AbilityDef } from '../types';

/**
 * The hero's innate ability. Free to cast — gated purely by its cooldown, so the
 * player always has something to do even when starved of mana.
 */
export const HERO_ABILITY: AbilityDef = {
  id: 'warcry',
  name: 'War Cry',
  kind: 'shockwave',
  cooldown: 11000,
  manaCost: 0,
  targeted: false,
  radius: 165,
  damage: 48,
  tint: 0xe0a44a,
};

/** Player spells, shown right-to-left in the spell bar. */
export const SPELLS: readonly AbilityDef[] = [
  {
    id: 'volley',
    name: 'Volley',
    kind: 'volley',
    cooldown: 9000,
    manaCost: 40,
    targeted: true,
    radius: 135,
    damage: 58,
    tint: 0x8fd6a0,
  },
  {
    id: 'rally',
    name: 'Rally',
    kind: 'rally',
    cooldown: 15000,
    manaCost: 55,
    targeted: false,
    amount: 0.5,
    duration: 6000,
    tint: 0xd08f4a,
  },
  {
    id: 'mend',
    name: 'Mend',
    kind: 'heal',
    cooldown: 13000,
    manaCost: 45,
    targeted: false,
    radius: 260,
    amount: 70,
    tint: 0x6ac46a,
  },
];

/** Everything the ability system needs to know about, in one list. */
export const ALL_ABILITIES: readonly AbilityDef[] = [HERO_ABILITY, ...SPELLS];
