/**
 * Art manifest.
 *
 * The game runs entirely on placeholder shapes until real files exist. Nothing
 * here is required — every consumer checks whether a texture actually loaded and
 * falls back to the placeholder if not. So art can land one unit at a time.
 *
 * To add a unit sprite:
 *   1. Drop the PNG at public/assets/units/<id>.png (see ASSETS.md for specs)
 *   2. Uncomment or add its line in UNIT_SPRITES below
 * That is the whole integration step.
 */
export interface SpriteAsset {
  key: string;
  path: string;
}

/** Texture key for a unit's sprite. Units look themselves up by this. */
export function unitSpriteKey(unitId: string): string {
  return 'unit-' + unitId;
}

/** Texture key for one parallax layer of a biome. */
export function biomeLayerKey(biomeId: string, index: number): string {
  return 'biome-' + biomeId + '-' + index;
}

/**
 * Unit and boss sprites. All drawn on a 256x256 transparent canvas, feet on the
 * bottom edge, facing RIGHT — the code mirrors them for the enemy side.
 */
export const UNIT_SPRITES: readonly SpriteAsset[] = [
  // { key: unitSpriteKey('militia'), path: 'assets/units/militia.png' },
  // { key: unitSpriteKey('spearman'), path: 'assets/units/spearman.png' },
  // { key: unitSpriteKey('archer'), path: 'assets/units/archer.png' },
  // { key: unitSpriteKey('berserker'), path: 'assets/units/berserker.png' },
  // { key: unitSpriteKey('shieldbearer'), path: 'assets/units/shieldbearer.png' },
  // { key: unitSpriteKey('maul'), path: 'assets/units/maul.png' },
  // { key: unitSpriteKey('knight'), path: 'assets/units/knight.png' },
  // { key: unitSpriteKey('seer'), path: 'assets/units/seer.png' },
  // { key: unitSpriteKey('hero'), path: 'assets/units/hero.png' },
  // { key: unitSpriteKey('valkyrie'), path: 'assets/units/valkyrie.png' },
  // { key: unitSpriteKey('reaper'), path: 'assets/units/reaper.png' },
  // { key: unitSpriteKey('jotunn'), path: 'assets/units/jotunn.png' },
  // { key: unitSpriteKey('draugr'), path: 'assets/units/draugr.png' },
  // { key: unitSpriteKey('thrall'), path: 'assets/units/thrall.png' },
  // { key: unitSpriteKey('bulwark'), path: 'assets/units/bulwark.png' },
  // { key: unitSpriteKey('executioner'), path: 'assets/units/executioner.png' },
  // { key: unitSpriteKey('gorge'), path: 'assets/units/gorge.png' },
];

/**
 * Parallax backdrops. Each biome wants three horizontally TILEABLE strips —
 * 1024x420, seamless left-to-right. Tiling means one small file covers the whole
 * 2800px battlefield instead of a huge image.
 */
export const BIOME_LAYERS: readonly SpriteAsset[] = [
  // { key: biomeLayerKey('ironwood', 0), path: 'assets/biomes/ironwood-far.png' },
  // { key: biomeLayerKey('ironwood', 1), path: 'assets/biomes/ironwood-mid.png' },
  // { key: biomeLayerKey('ironwood', 2), path: 'assets/biomes/ironwood-near.png' },
];

export const ALL_ASSETS: readonly SpriteAsset[] = [...UNIT_SPRITES, ...BIOME_LAYERS];
