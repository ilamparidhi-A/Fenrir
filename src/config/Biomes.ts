/**
 * Scenery is data. A stage names a biome; BattleScene paints it. Adding a new
 * setting is an entry here, never a code change.
 */
export interface RidgeLayer {
  color: number;
  /** Parallax depth: lower scrolls slower and reads as further away. */
  scrollFactor: number;
  baseY: number;
  amplitude: number;
  /** Seeds the silhouette so biomes don't share a skyline. */
  phase: number;
}

export interface BiomeDef {
  id: string;
  name: string;
  sky: number;
  ground: number;
  groundLine: number;
  ridges: readonly RidgeLayer[];
}

export const BIOMES: Record<string, BiomeDef> = {
  // Act I — cold, close, and hunted.
  ironwood: {
    id: 'ironwood',
    name: 'Járnviðr, the Iron Wood',
    sky: 0x141c1e,
    ground: 0x22261f,
    groundLine: 0x3e4636,
    ridges: [
      { color: 0x27373a, scrollFactor: 0.25, baseY: 330, amplitude: 120, phase: 0.7 },
      { color: 0x1c2828, scrollFactor: 0.45, baseY: 400, amplitude: 100, phase: 2.3 },
      { color: 0x111917, scrollFactor: 0.7, baseY: 468, amplitude: 78, phase: 4.1 },
    ],
  },

  // Act II — rain, grey sea, burning longhouses.
  coast: {
    id: 'coast',
    name: 'The Broken Coast',
    sky: 0x1e2229,
    ground: 0x2e2a24,
    groundLine: 0x4d463a,
    ridges: [
      { color: 0x39404b, scrollFactor: 0.25, baseY: 340, amplitude: 90, phase: 1.9 },
      { color: 0x2a2f38, scrollFactor: 0.45, baseY: 410, amplitude: 76, phase: 3.4 },
      { color: 0x191d23, scrollFactor: 0.7, baseY: 472, amplitude: 60, phase: 5.2 },
    ],
  },

  // Act III — bright and hostile, a deliberate break from the dark acts.
  bifrost: {
    id: 'bifrost',
    name: 'The Bifröst',
    sky: 0x241d3a,
    ground: 0x2b2440,
    groundLine: 0x6b5aa0,
    ridges: [
      { color: 0x4a3d72, scrollFactor: 0.25, baseY: 300, amplitude: 140, phase: 0.4 },
      { color: 0x352c55, scrollFactor: 0.45, baseY: 392, amplitude: 104, phase: 2.8 },
      { color: 0x1f1a33, scrollFactor: 0.7, baseY: 466, amplitude: 74, phase: 4.9 },
    ],
  },

  // Trials — near-monochrome white-out.
  niflheim: {
    id: 'niflheim',
    name: 'Niflheim',
    sky: 0x39424a,
    ground: 0x59626a,
    groundLine: 0x8a949c,
    ridges: [
      { color: 0x515b64, scrollFactor: 0.25, baseY: 322, amplitude: 108, phase: 1.2 },
      { color: 0x454e57, scrollFactor: 0.45, baseY: 398, amplitude: 88, phase: 3.9 },
      { color: 0x333b43, scrollFactor: 0.7, baseY: 468, amplitude: 66, phase: 5.7 },
    ],
  },
};

export const DEFAULT_BIOME = 'ironwood';
