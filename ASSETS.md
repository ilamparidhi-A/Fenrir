# Ashenfront — Asset Specification

Everything needed to generate, cut and drop art into the game. The code already
accepts it: see `src/config/Assets.ts`.

**The pipeline is live.** Every consumer checks whether a texture actually loaded
and falls back to placeholder shapes if not, so art can land **one unit at a
time** without ever breaking the build.

To add a unit:

1. Save the PNG to `public/assets/units/<id>.png`
2. Uncomment its line in `UNIT_SPRITES` in `src/config/Assets.ts`

That is the whole integration step.

---

## What AI does well here, and what it doesn't

Worth being clear-eyed, because it changes the workflow.

**Good at:** parallax backgrounds, UI panels and frames, ability icons, one-off
bosses, key art and the portal thumbnail. Anything where each image stands alone.

**Bad at:** *consistency across a set*. Twelve units that read as the same world,
same scale, same camera angle, same light source, same line weight. Generated
independently they will drift, and a roster that drifts looks amateur even when
each individual sprite is good. The fix is the locked style block below plus a
reference image — not better prompting.

**Cannot do at all:** rigged animation. Image tools produce a flat picture, not a
walk cycle.

### The animation answer

Do **not** try to generate frame-by-frame walk cycles. Consistency across frames
is far harder than across units, and it bloats the bundle past portal budgets.

Instead: **one clean side-profile per unit, animated procedurally in code.** The
game already does hit flashes, lunges, spawn pops, death tumbles, knockback and
squash — a single well-drawn pose picks all of that up for free, and it's what
the `Unit` sprite path is built for.

If a unit later deserves real animation, cut that one sprite into parts (head,
torso, weapon arm, legs) and rig it in Spine or DragonBones. That's a per-unit
upgrade you can do later, not a prerequisite.

---

## The locked style block

**Paste this verbatim into every unit prompt.** Do not paraphrase it between
units — the drift you're preventing comes from small wording changes.

> 2D game sprite for a side-scrolling battle game. **Strict orthographic side
> view — the body, hips, shoulders and feet all face right in pure profile, NOT
> three-quarter, NOT angled toward the viewer.** Dark Norse low-fantasy.
> **Simplified flat cel-shaded illustration with 3-4 shading tones only —
> readable as a clear silhouette at 64 pixels tall. Not painterly, not
> photorealistic, minimal fine texture detail.** Muted desaturated palette: cold
> blue-greys, iron black, weathered leather brown, one restrained accent colour.
> Single soft light source from upper left. Grounded and gritty, not heroic or
> cartoonish. Neutral walking stance, feet close together, NOT a wide combat
> stance. Full body head to feet, **feet flush against the very bottom edge of
> the canvas with no margin below**. **Fully transparent background (alpha
> channel) — not white, not a checkerboard.** No text, no logo, no border, no
> ground shadow, no background scenery.

**Generate one unit first** — the Militia. Once it looks right, feed it back as a
reference image for every subsequent unit ("match the style of this reference").
That single step does more for consistency than anything else.

### The 64-pixel test

Before accepting any sprite, shrink it to 64 pixels tall and look at it. If you
cannot immediately tell what the unit is and what it is holding, the art is
over-rendered — no matter how good it looks at full size. Concept-art detail is
actively harmful at sprite scale; silhouette and colour blocking are what read.

If a generator keeps returning three-quarter views, adding "profile view like an
Egyptian wall painting" or "perfectly flat side elevation, like a technical
drawing" tends to force it.

---

## Unit sprites

**Canvas:** 256 × 256, transparent PNG
**Pose:** facing right, feet exactly on the bottom edge, character filling the
full canvas height
**Why:** the code scales by `def.height / image.height`, so filling the canvas
consistently is what preserves relative sizes between units. A Jötunn and a
Militia are both drawn full-canvas; the code makes one 88px and the other 46px.

The engine mirrors sprites for the enemy side, so **draw each unit once**.

| Unit | Prompt seed (append the style block) |
| --- | --- |
| **Militia** | ragged peasant levy, padded jerkin, short sword, small round shield, nervous stance |
| **Spearman** | light skirmisher, long spear held two-handed, leather armour, braced forward |
| **Archer** | unarmoured hunter, hood, longbow drawn, quiver at hip, lean |
| **Berserker** | bare-chested wild warrior, wolf pelt, two hand axes, mid-snarl, fast and reckless |
| **Shieldbearer** | heavy infantry behind an enormous rectangular tower shield, braced, almost no weapon visible |
| **Maul** | broad smith-warrior, huge two-handed warhammer raised, iron plates, slow and immense |
| **Knight** | full plate, kite shield, longsword, disciplined upright stance |
| **Seer** | robed rune-caster, staff, glowing pale runes, hood shadowing the face, frail |
| **Fenrir** *(hero)* | tall wolf-blooded warrior in human form, torn dark cloak, a length of broken silver chain wrapped around one forearm, wolf-grey hair, commanding |
| **Valkyrie** | winged shieldmaiden, spear and small round shield, feathered wings half-spread, pale gold armour |
| **Reaper** | gaunt hooded figure, long curved scythe, tattered dark robe, no visible face |
| **Jötunn** | colossal frost giant, ice-crusted skin, immense stone club, hunched and heavy |
| **Draugr Jarl** | undead barrow-king, corroded mail, rusted sword, cold green grave-light in the eye sockets |
| **Thrall** | shambling risen corpse, ragged, unarmed or broken weapon, frail |
| **The Bulwark** *(boss)* | enormous armoured construct that is mostly shield, sealed helm, immovable, moss and iron |
| **The Executioner** *(boss)* | towering hooded headsman, oversized two-handed cleaver, blood-dark leather |
| **The Gorge** *(boss)* | bloated devouring horror, too many mouths, distended and hungry, sickly violet |

> Bosses should read as **2–3× the height** of a line unit in the source art too,
> not just via scaling. Draw them heavier and broader.

---

## Biome backdrops

**Canvas:** 1024 × 420, PNG, **horizontally tileable** (seamless left edge to
right edge)
**Why tileable:** one small file covers the whole 2800px battlefield. A single
huge image would blow the bundle budget.

Three layers per biome, back to front. Ask explicitly for a **seamless
horizontally tiling** image, and check the seam before shipping.

| Biome | Layer 0 (far) | Layer 1 (mid) | Layer 2 (near) |
| --- | --- | --- | --- |
| **Iron Wood** | distant black-barked forest ridge in cold fog | denser iron-bark treeline, low mist | near tree trunks and undergrowth silhouette |
| **Broken Coast** | grey stormy sea horizon under rain | wrecked longship keels and rocks | burning longhouse ruins in silhouette |
| **Bifröst** | aurora and void, distant Asgard spires | crystalline rainbow bridge structure | broken gold masonry silhouette |
| **Niflheim** | white-out blizzard, near-featureless | ice ridges barely visible through snow | frozen jagged foreground |

Each layer wants **decreasing detail and increasing darkness toward the front** —
far layers hazy and light, near layers near-silhouette. That's what sells depth,
and the current vector placeholders already follow it.

---

## Screens and UI

| Asset | Size | Notes |
| --- | --- | --- |
| Main menu backdrop | 1280 × 720 | Fenrir with the broken chain; leave the upper-middle clear for the title |
| Map backdrop | 1280 × 720 | Norse map parchment feel, dark, low contrast — nodes draw on top |
| Barracks backdrop | 1280 × 720 | Forge or barrow interior, dark, heavily vignetted |
| UI panel frame | 9-slice, 128 × 128 | Iron and leather; corners must survive stretching |
| Ability icons | 128 × 128 | War Cry, Volley, Rally, Mend — must read at 48px |
| Damage-type icons | 64 × 64 | Slash, Pierce, Blunt, Magic |
| **Portal thumbnail** | 512 × 384 | **See below** |
| Play Store icon | 512 × 512 | |
| Play feature graphic | 1024 × 500 | |

> ### The thumbnail is the marketing
>
> On CrazyGames and Poki, the thumbnail plus the title *is* the entire funnel.
> Generate **ten variants and pick hard.** It will out-earn any three unit
> sprites. Fenrir mid-roar with the chain, high contrast, readable at 200px wide.

---

## Before you ship any of it

- **Licensing.** Verify the current commercial-use terms of whichever tool you
  use — they change, and we ship on portals *and* an app store. Check before
  generating a whole roster, not after.
- **Google Play requires AI-content disclosure.** Declare it in the listing.
- **Portal policies vary** on AI assets. Check CrazyGames and Poki before submitting.
- **Keep `CREDITS.md` from day one**, listing every asset, its source and its
  licence. Reconstructing this later is miserable.
- **Watch the bundle.** Currently ~358 KB gzipped, which is a large part of why
  we're on Phaser. Run every PNG through compression and re-check `npm run build`
  after each batch. Portal load time is a hard constraint, not a nice-to-have.

---

## Suggested order

1. **Militia** alone — establish the style, keep it as the reference image
2. Remaining 7 line units, each generated against that reference
3. **Fenrir** — the one the player stares at all game
4. One full biome (3 layers) — proves the backdrop pipeline end to end
5. Portal thumbnail + main menu backdrop
6. Legendaries, then bosses
7. Remaining biomes, then UI frames and icons

Stop after step 1 and look at it in-game before generating anything else. The
pipeline makes that a two-minute loop, and it's much cheaper to discover a style
problem on one sprite than on thirteen.
