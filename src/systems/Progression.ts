import { SaveSystem, type SaveData } from './SaveSystem';
import {
  GLOBAL_UPGRADES,
  REWARDS,
  UNIT_LEVEL_EFFECTS,
  UPGRADE_EFFECTS,
  type GlobalUpgradeDef,
} from '../config/Upgrades';
import { ALL_UNIT_DEFS, CASTLE_HP, HERO_DEF, MANA } from '../config/Balance';
import { FIRST_STAGE_ID, STAGES_BY_ID, STARTING_UNITS, previousStage } from '../config/Campaign';
import type { UnitDef } from '../types';

/**
 * Owns the player's persistent power. Battles read effective stats from here
 * rather than from the raw balance tables, so an upgrade bought in the Barracks
 * is felt on the next deploy without any wiring in between.
 */
class ProgressionModel {
  private data: SaveData;

  constructor() {
    this.data = SaveSystem.load();
  }

  // --- read ---------------------------------------------------------------

  get runes(): number {
    return this.data.runes;
  }

  get victories(): number {
    return this.data.victories;
  }

  /** Best stars achieved anywhere, for the menu summary. */
  get bestStars(): number {
    const values = Object.values(this.data.stageStars);
    return values.length ? Math.max(...values) : 0;
  }

  get clearedCount(): number {
    return Object.keys(this.data.stageStars).length;
  }

  // --- campaign -----------------------------------------------------------

  stageStars(stageId: string): number {
    return this.data.stageStars[stageId] ?? 0;
  }

  isStageCleared(stageId: string): boolean {
    return this.stageStars(stageId) > 0;
  }

  /** A stage opens once the one before it has been cleared. */
  isStageUnlocked(stageId: string): boolean {
    if (stageId === FIRST_STAGE_ID) return true;
    const prev = previousStage(stageId);
    return prev ? this.isStageCleared(prev.id) : false;
  }

  /** The furthest stage the player can currently attempt. */
  nextStageId(): string {
    let last = FIRST_STAGE_ID;
    for (const id of Object.keys(STAGES_BY_ID)) {
      if (this.isStageUnlocked(id) && !this.isStageCleared(id)) return id;
      if (this.isStageCleared(id)) last = id;
    }
    return last;
  }

  isUnitUnlocked(unitId: string): boolean {
    return STARTING_UNITS.includes(unitId) || this.data.unlocked.includes(unitId);
  }

  unitLevel(unitId: string): number {
    return this.data.unitLevels[unitId] ?? 0;
  }

  upgradeLevel(upgradeId: string): number {
    return this.data.upgradeLevels[upgradeId] ?? 0;
  }

  // --- effective stats ----------------------------------------------------

  /** A unit's definition with its purchased levels folded in. */
  effectiveUnitDef(unitId: string): UnitDef | undefined {
    const base = ALL_UNIT_DEFS[unitId];
    if (!base) return undefined;
    return this.scaleUnit(base, this.unitLevel(unitId));
  }

  /** The hero scales off the `might` branch rather than a unit level. */
  effectiveHeroDef(): UnitDef {
    const bonus = 1 + this.upgradeLevel('might') * UPGRADE_EFFECTS.heroPowerPerLevel;
    return {
      ...HERO_DEF,
      maxHp: Math.round(HERO_DEF.maxHp * bonus),
      damage: Math.round(HERO_DEF.damage * bonus),
    };
  }

  private scaleUnit(base: UnitDef, level: number): UnitDef {
    if (level <= 0) return base;
    return {
      ...base,
      maxHp: Math.round(base.maxHp * (1 + level * UNIT_LEVEL_EFFECTS.hpPerLevel)),
      damage: Math.round(base.damage * (1 + level * UNIT_LEVEL_EFFECTS.damagePerLevel)),
    };
  }

  furyConfig(): { start: number; max: number; regen: number } {
    const depth = this.upgradeLevel('depth');
    const hunger = this.upgradeLevel('hunger');
    return {
      start: MANA.start,
      max: MANA.max + depth * UPGRADE_EFFECTS.furyMaxPerLevel,
      regen: MANA.regenPerSecond + hunger * UPGRADE_EFFECTS.furyRegenPerLevel,
    };
  }

  lairHp(): number {
    return CASTLE_HP + this.upgradeLevel('endurance') * UPGRADE_EFFECTS.castleHpPerLevel;
  }

  // --- costs --------------------------------------------------------------

  /** Cost of the next level for a unit, or null if it is maxed. */
  unitLevelCost(unitId: string): number | null {
    const base = ALL_UNIT_DEFS[unitId];
    if (!base) return null;
    const level = this.unitLevel(unitId);
    if (level >= UNIT_LEVEL_EFFECTS.maxLevel) return null;

    const flat = UNIT_LEVEL_EFFECTS.baseCost + base.cost * UNIT_LEVEL_EFFECTS.costPerDeployCost;
    return Math.round(flat * Math.pow(UNIT_LEVEL_EFFECTS.costGrowth, level));
  }

  /** Cost of the next level for a chain link, or null if it is maxed. */
  upgradeCost(upgradeId: string): number | null {
    const def = GLOBAL_UPGRADES.find((u) => u.id === upgradeId);
    if (!def) return null;
    const level = this.upgradeLevel(upgradeId);
    if (level >= def.maxLevel) return null;
    return Math.round(def.baseCost * Math.pow(def.costGrowth, level));
  }

  // --- write --------------------------------------------------------------

  buyUnitLevel(unitId: string): boolean {
    const cost = this.unitLevelCost(unitId);
    if (cost === null || this.data.runes < cost) return false;

    this.data.runes -= cost;
    this.data.unitLevels[unitId] = this.unitLevel(unitId) + 1;
    this.persist();
    return true;
  }

  buyUpgrade(upgradeId: string): boolean {
    const cost = this.upgradeCost(upgradeId);
    if (cost === null || this.data.runes < cost) return false;

    this.data.runes -= cost;
    this.data.upgradeLevels[upgradeId] = this.upgradeLevel(upgradeId) + 1;
    this.persist();
    return true;
  }

  /**
   * Record a finished stage. Returns the runes awarded and any unit unlocked by
   * a first clear, so the results screen can announce it.
   */
  recordStageResult(
    stageId: string,
    victory: boolean,
    stars: number
  ): { earned: number; unlocked: string | null } {
    const stage = STAGES_BY_ID[stageId];
    let earned: number;
    let unlocked: string | null = null;

    if (victory) {
      const base = stage ? stage.reward : REWARDS.victoryBase;
      const full = base + stars * REWARDS.perStar;

      // A stage already cleared at full marks pays a fraction on replay.
      const isReplay = this.stageStars(stageId) >= 3;
      earned = Math.round(isReplay ? full * REWARDS.replayFraction : full);

      const firstClear = !this.isStageCleared(stageId);
      this.data.stageStars[stageId] = Math.max(this.stageStars(stageId), stars);
      this.data.victories += 1;

      if (firstClear && stage?.unlocks && !this.data.unlocked.includes(stage.unlocks)) {
        this.data.unlocked.push(stage.unlocks);
        unlocked = stage.unlocks;
      }
    } else {
      earned = REWARDS.defeatConsolation;
      this.data.defeats += 1;
    }

    this.data.runes += earned;
    this.persist();
    return { earned, unlocked };
  }

  /** Debug/testing helper. Not reachable from the UI. */
  grantRunes(amount: number): void {
    this.data.runes += amount;
    this.persist();
  }

  reset(): void {
    SaveSystem.wipe();
    this.data = SaveSystem.load();
  }

  private persist(): void {
    SaveSystem.save(this.data);
  }
}

/** Shared across every scene. */
export const progression = new ProgressionModel();

export type { GlobalUpgradeDef };
