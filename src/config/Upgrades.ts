/**
 * The six impossible ingredients of Gleipnir are the six upgrade branches.
 * Four are live; the last two — the most impossible of them — stay locked as
 * late-campaign content. See STORY.md.
 */
export interface GlobalUpgradeDef {
  id: string;
  /** The link of the chain. */
  name: string;
  /** What mastering it does, in the player's words. */
  description: string;
  baseCost: number;
  /** Cost multiplier per level owned. */
  costGrowth: number;
  maxLevel: number;
}

export const GLOBAL_UPGRADES: readonly GlobalUpgradeDef[] = [
  {
    id: 'might',
    name: 'Sinews of the Bear',
    description: '+10% hero health and damage',
    baseCost: 90,
    costGrowth: 1.65,
    maxLevel: 8,
  },
  {
    id: 'endurance',
    name: 'Roots of the Mountain',
    description: '+250 lair health',
    baseCost: 70,
    costGrowth: 1.55,
    maxLevel: 8,
  },
  {
    id: 'hunger',
    name: 'Footfall of the Cat',
    description: '+1.5 fury per second',
    baseCost: 110,
    costGrowth: 1.75,
    maxLevel: 6,
  },
  {
    id: 'depth',
    name: 'Breath of the Fish',
    description: '+30 maximum fury',
    baseCost: 60,
    costGrowth: 1.5,
    maxLevel: 8,
  },
];

/** Per-level effect magnitudes, kept next to the definitions they belong to. */
export const UPGRADE_EFFECTS = {
  /** Fractional hero bonus per level of `might`. */
  heroPowerPerLevel: 0.1,
  /** Flat lair HP per level of `endurance`. */
  castleHpPerLevel: 250,
  /** Fury per second per level of `hunger`. */
  furyRegenPerLevel: 1.5,
  /** Max fury per level of `depth`. */
  furyMaxPerLevel: 30,
} as const;

/** Unit levels scale both survivability and output, survivability slightly faster. */
export const UNIT_LEVEL_EFFECTS = {
  hpPerLevel: 0.12,
  damagePerLevel: 0.1,
  /** Cost of the next unit level: (base + deployCost x mult) x growth^level. */
  baseCost: 45,
  costPerDeployCost: 1.8,
  costGrowth: 1.55,
  maxLevel: 10,
} as const;

/** Runes awarded for finishing a battle, before the star bonus. */
export const REWARDS = {
  victoryBase: 120,
  perStar: 60,
  /** Losing still pays a little, so a failed attempt is never wasted time. */
  defeatConsolation: 35,
  /** Replaying a stage you have already 3-starred pays this fraction. */
  replayFraction: 0.4,
} as const;
