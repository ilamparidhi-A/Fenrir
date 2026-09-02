const STORAGE_KEY = 'ashenfront.save';
const CURRENT_VERSION = 2;

export interface SaveData {
  version: number;
  runes: number;
  /** unitId -> level. Level 0 means owned but unimproved. */
  unitLevels: Record<string, number>;
  /** upgradeId -> level. */
  upgradeLevels: Record<string, number>;
  /** stageId -> best star count (0-3). Presence means the stage was cleared. */
  stageStars: Record<string, number>;
  /** Unit ids earned from stage clears. Starting units are implicit. */
  unlocked: string[];
  victories: number;
  defeats: number;
}

function defaults(): SaveData {
  return {
    version: CURRENT_VERSION,
    runes: 0,
    unitLevels: {},
    upgradeLevels: {},
    stageStars: {},
    unlocked: [],
    victories: 0,
    defeats: 0,
  };
}

/**
 * Migrate an older save forward. Each version gets its own step so a returning
 * player never loses progress when the schema changes.
 */
function migrate(raw: Partial<SaveData>): SaveData {
  const data = { ...defaults(), ...raw };

  // v1 had no campaign: no per-stage records and no unit gating.
  if ((raw.version ?? 1) < 2) {
    data.stageStars = {};
    data.unlocked = [];
  }

  // Guard against hand-edited or partially written saves.
  if (typeof data.stageStars !== 'object' || data.stageStars === null) data.stageStars = {};
  if (!Array.isArray(data.unlocked)) data.unlocked = [];

  data.version = CURRENT_VERSION;
  return data;
}

/**
 * localStorage wrapper. Every access is guarded: private windows, cleared site
 * data, and browsers configured to block storage all throw on access rather than
 * returning null, and a save failure must never break the game.
 */
export const SaveSystem = {
  load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults();
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      if (typeof parsed !== 'object' || parsed === null) return defaults();
      return migrate(parsed);
    } catch {
      return defaults();
    }
  },

  save(data: SaveData): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      // Storage unavailable. The session still plays; it just will not persist.
      return false;
    }
  },

  wipe(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to do */
    }
  },
};
