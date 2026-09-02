/**
 * Single source of truth for branding and world geometry.
 * Renaming the game = editing this file (plus index.html <title>).
 */

export const GAME_NAME = 'Ashenfront';

/**
 * Android package id. WARNING: this is PERMANENT once the first build is
 * uploaded to Google Play and can never be changed. Lock the name before then.
 */
export const PACKAGE_ID = 'com.ashenfront.game';

/** Viewport. Phaser scales this to fit any screen. */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/**
 * The battlefield is more than twice the viewport, so the camera scrolls and the
 * player has to choose where to look — as in Epic War. Fixed-view lane battlers
 * feel small; this is most of why.
 */
export const WORLD_WIDTH = 2800;

/** How fast A/D and the arrow keys pan the camera, in px per second. */
export const CAMERA_PAN_SPEED = 950;

/** Y coordinate the frontmost rank walks along. */
export const GROUND_Y = 560;

/**
 * Ranks. Units are spread across parallel lanes rather than queued single-file,
 * so several fight at once and the line reads as a crowd instead of a column.
 */
export const LANE_COUNT = 3;
export const LANE_SPACING = 18;

/** Back ranks render slightly smaller, so depth reads without a 3D projection. */
export const LANE_SCALE_MIN = 0.84;

/** Lane 0 is furthest from camera; the last lane sits on GROUND_Y. */
export function laneY(lane: number): number {
  return GROUND_Y - (LANE_COUNT - 1 - lane) * LANE_SPACING;
}

/** The champion always takes the frontmost rank so it is never buried. */
export const HERO_LANE = LANE_COUNT - 1;

/**
 * How large sprites render relative to a unit's logical height. Collision,
 * spacing and reach are unaffected — this only changes how big the art looks.
 *
 * Detailed art often needs more pixels than the logical size to stay readable;
 * raise this rather than changing `def.height`, which would alter balance.
 */
export const SPRITE_DISPLAY_SCALE = 1;

/** Castle positions along the lane. */
export const PLAYER_CASTLE_X = 110;
export const ENEMY_CASTLE_X = WORLD_WIDTH - 110;

/** Numeric colors, for Graphics / Rectangle / tint. */
export const PALETTE = {
  sky: 0x1b2432,
  ground: 0x2c2a26,
  groundLine: 0x4a453d,
  player: 0x4a9de0,
  enemy: 0xd8544f,
  hpGood: 0x6ac46a,
  accent: 0xe0a44a,
} as const;

/** CSS strings, for Text objects (Phaser wants '#rrggbb' there, not 0xrrggbb). */
export const CSS = {
  text: '#e8e2d4',
  muted: '#8a8272',
  accent: '#e0a44a',
  danger: '#d8544f',
  heal: '#6ac46a',
} as const;
