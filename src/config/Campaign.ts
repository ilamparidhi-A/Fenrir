import type { WaveEntry } from './Balance';

/**
 * The campaign, as data. Designing a level must never mean touching code —
 * everything a stage is lives in this file.
 *
 * Act rhythm (see CONTENT.md): 1 introduce · 2 combine · 3 pressure ·
 * 4 teach the boss mechanic in miniature · 5 boss.
 */
export interface StageDef {
  id: string;
  act: number;
  /** 1..5 within the act. */
  index: number;
  name: string;
  biome: string;
  isBoss: boolean;
  enemyLairHp: number;
  /** Base runes for a first clear, before the star bonus. */
  reward: number;
  /** Unit id granted on first clear. */
  unlocks?: string;
  waves: readonly WaveEntry[];
}

/** Build a run of spawns: `run(4000, 3500, 'militia', 'archer')`. */
function run(startMs: number, gapMs: number, ...unitIds: string[]): WaveEntry[] {
  return unitIds.map((unitId, i) => ({ atMs: startMs + i * gapMs, unitId }));
}

function merge(...groups: WaveEntry[][]): WaveEntry[] {
  return groups.flat().sort((a, b) => a.atMs - b.atMs);
}

/** Units the player starts with. Everything else is earned. */
export const STARTING_UNITS: readonly string[] = ['militia', 'spearman'];

export const STAGES: readonly StageDef[] = [
  // ---------------------------------------------------------------- Act I ---
  {
    id: 'a1s1',
    act: 1,
    index: 1,
    name: 'Loosed',
    biome: 'ironwood',
    isBoss: false,
    enemyLairHp: 900,
    reward: 90,
    waves: run(4000, 5000, 'militia', 'militia', 'militia', 'militia'),
  },
  {
    id: 'a1s2',
    act: 1,
    index: 2,
    name: 'The Hunt Begins',
    biome: 'ironwood',
    isBoss: false,
    enemyLairHp: 1100,
    reward: 110,
    unlocks: 'archer',
    waves: merge(
      run(3500, 4200, 'militia', 'militia', 'spearman'),
      run(16000, 5000, 'spearman', 'militia', 'spearman')
    ),
  },
  {
    id: 'a1s3',
    act: 1,
    index: 3,
    name: 'Blackbark Hollow',
    biome: 'ironwood',
    isBoss: false,
    enemyLairHp: 1400,
    reward: 140,
    unlocks: 'berserker',
    waves: merge(
      run(3000, 3600, 'militia', 'spearman', 'archer', 'militia'),
      run(20000, 4200, 'archer', 'spearman', 'militia', 'archer')
    ),
  },
  {
    id: 'a1s4',
    act: 1,
    index: 4,
    name: 'Shieldwall',
    biome: 'ironwood',
    isBoss: false,
    enemyLairHp: 1500,
    reward: 160,
    unlocks: 'maul',
    // First taste of shielded armour — lethal only at the boss, not here.
    waves: merge(
      run(3000, 4000, 'militia', 'shieldbearer', 'archer'),
      run(18000, 4800, 'shieldbearer', 'spearman', 'archer', 'shieldbearer')
    ),
  },
  {
    id: 'a1s5',
    act: 1,
    index: 5,
    name: 'The Bulwark',
    biome: 'ironwood',
    isBoss: true,
    enemyLairHp: 1800,
    reward: 260,
    unlocks: 'valkyrie',
    waves: merge(
      run(4000, 5200, 'shieldbearer', 'shieldbearer', 'archer'),
      run(22000, 6000, 'shieldbearer', 'spearman', 'shieldbearer')
    ),
  },

  // --------------------------------------------------------------- Act II ---
  {
    id: 'a2s1',
    act: 2,
    index: 1,
    name: 'Salt and Ash',
    biome: 'coast',
    isBoss: false,
    enemyLairHp: 1700,
    reward: 180,
    waves: merge(
      run(3000, 3800, 'militia', 'berserker', 'archer', 'berserker'),
      run(21000, 4400, 'spearman', 'berserker', 'archer')
    ),
  },
  {
    id: 'a2s2',
    act: 2,
    index: 2,
    name: 'The Wrecked Keels',
    biome: 'coast',
    isBoss: false,
    enemyLairHp: 1900,
    reward: 200,
    unlocks: 'knight',
    waves: merge(
      run(3000, 3600, 'berserker', 'spearman', 'maul', 'archer'),
      run(20000, 4000, 'maul', 'berserker', 'archer', 'spearman')
    ),
  },
  {
    id: 'a2s3',
    act: 2,
    index: 3,
    name: 'Longhouse Burning',
    biome: 'coast',
    isBoss: false,
    enemyLairHp: 2200,
    reward: 230,
    unlocks: 'shieldbearer',
    waves: merge(
      run(2600, 3200, 'berserker', 'archer', 'knight', 'berserker'),
      run(18000, 3800, 'knight', 'maul', 'archer', 'berserker', 'spearman')
    ),
  },
  {
    id: 'a2s4',
    act: 2,
    index: 4,
    name: 'The Headsman',
    biome: 'coast',
    isBoss: false,
    enemyLairHp: 2300,
    reward: 250,
    unlocks: 'seer',
    // A small enemy that targets your strongest unit — the boss mechanic, survivable.
    waves: merge(
      run(3000, 3400, 'maul', 'archer', 'maul', 'knight'),
      run(20000, 4200, 'maul', 'knight', 'maul', 'archer')
    ),
  },
  {
    id: 'a2s5',
    act: 2,
    index: 5,
    name: 'The Executioner',
    biome: 'coast',
    isBoss: true,
    enemyLairHp: 2600,
    reward: 380,
    unlocks: 'reaper',
    waves: merge(
      run(4000, 4600, 'maul', 'knight', 'shieldbearer'),
      run(24000, 5200, 'maul', 'maul', 'knight', 'shieldbearer')
    ),
  },

  // -------------------------------------------------------------- Act III ---
  {
    id: 'a3s1',
    act: 3,
    index: 1,
    name: 'The Rainbow Road',
    biome: 'bifrost',
    isBoss: false,
    enemyLairHp: 2600,
    reward: 280,
    waves: merge(
      run(2800, 3200, 'knight', 'seer', 'archer', 'knight'),
      run(18000, 3600, 'seer', 'knight', 'shieldbearer', 'archer', 'seer')
    ),
  },
  {
    id: 'a3s2',
    act: 3,
    index: 2,
    name: 'The Watcher’s Gate',
    biome: 'bifrost',
    isBoss: false,
    enemyLairHp: 2900,
    reward: 310,
    waves: merge(
      run(2600, 3000, 'shieldbearer', 'seer', 'knight', 'maul'),
      run(18000, 3400, 'knight', 'seer', 'shieldbearer', 'maul', 'knight')
    ),
  },
  {
    id: 'a3s3',
    act: 3,
    index: 3,
    name: 'Gold and Ruin',
    biome: 'bifrost',
    isBoss: false,
    enemyLairHp: 3200,
    reward: 340,
    unlocks: 'jotunn',
    waves: merge(
      run(2400, 2800, 'knight', 'knight', 'seer', 'maul', 'shieldbearer'),
      run(17000, 3200, 'seer', 'knight', 'maul', 'knight', 'seer', 'shieldbearer')
    ),
  },
  {
    id: 'a3s4',
    act: 3,
    index: 4,
    name: 'What Feeds on the Fallen',
    biome: 'bifrost',
    isBoss: false,
    enemyLairHp: 3400,
    reward: 370,
    // Introduces a small enemy that heals from nearby deaths. Survivable, instructive.
    waves: merge(
      run(2600, 2800, 'berserker', 'militia', 'knight', 'militia', 'seer'),
      run(17000, 3000, 'militia', 'militia', 'knight', 'seer', 'militia', 'maul')
    ),
  },
  {
    id: 'a3s5',
    act: 3,
    index: 5,
    name: 'The Gorge',
    biome: 'bifrost',
    isBoss: true,
    enemyLairHp: 4000,
    reward: 600,
    unlocks: 'draugr',
    waves: merge(
      run(4000, 4000, 'militia', 'militia', 'knight', 'seer'),
      run(24000, 4400, 'militia', 'militia', 'maul', 'knight', 'seer', 'militia')
    ),
  },
];

export const STAGES_BY_ID: Record<string, StageDef> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
);

export const FIRST_STAGE_ID = STAGES[0]!.id;

export const ACTS: readonly number[] = [...new Set(STAGES.map((s) => s.act))];

export function stagesInAct(act: number): readonly StageDef[] {
  return STAGES.filter((s) => s.act === act);
}

/** The stage before this one in campaign order, or null for the first. */
export function previousStage(stageId: string): StageDef | null {
  const i = STAGES.findIndex((s) => s.id === stageId);
  return i > 0 ? STAGES[i - 1]! : null;
}
