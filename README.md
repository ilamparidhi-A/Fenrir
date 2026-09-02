# Ashenfront

A side-scrolling lane battler in the spirit of Epic War 5 — deploy units from your
keep, march them right, break the enemy castle before they break yours.

Phaser 3 + TypeScript + Vite. One codebase ships to **web portals** and, via
Capacitor, to **Google Play**.

## Quick start

```bash
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload on http://localhost:5173 |
| `npm run typecheck` | Strict TS check, no emit |
| `npm run build` | Typecheck + production bundle into `dist/` |
| `npm run preview` | Serve the built bundle locally |

Current bundle: **~344 KB gzipped**. Portal budgets are the hard constraint here —
keep an eye on this number, it is the main reason we are not on Unity.

## Layout

```
src/
  config/GameConfig.ts   Branding + world geometry. Rename the game HERE.
  config/Balance.ts      Unit stats, mana curve, enemy waves. Tune the game HERE.
  entities/Unit.ts       One soldier: movement, targeting, attack, death.
  entities/Castle.ts     Player/enemy keep with HP.
  systems/ManaSystem.ts  Deploy resource.
  systems/SpawnSystem.ts Timed enemy wave scheduler.
  scenes/BattleScene.ts  The lane: backdrop, sim loop, win/lose.
  scenes/UIScene.ts      HUD. Runs parallel so it never shakes with the camera.
```

Balance lives in **data, not code**. Adding a unit is an entry in `UNIT_DEFS` plus
its id in `ROSTER`. Designing a stage will be a JSON file, never a code change.

---

# The art pipeline

Art is 60–70% of the real cost of this project. Read this before spending money.

## 1. The decision that matters: skeletal, not frame-by-frame

**Frame-by-frame** means every animation frame is a drawn image. 12 units x 5
animations x 8 frames = ~500 drawings. Expensive to make, expensive to change,
and it bloats the bundle past what portals accept.

**Skeletal** means each character is drawn *once* as separate parts — head,
torso, arms, legs, weapon — then rigged to a bone skeleton and animated by moving
bones. One drawing yields unlimited animations. The export is a JSON file plus a
single texture atlas, which is tiny.

Use skeletal. Concretely:

| Tool | Cost | Notes |
| --- | --- | --- |
| **Spine** | $99 Essential / $373 Pro | Industry standard, official Phaser plugin. Essential is enough to start; Pro adds mesh deformation and skins. |
| **DragonBones** | Free | Workable, but effectively unmaintained. Fine to prototype with. |

Skins are the reason Pro eventually pays for itself: one rig, swapped armour and
weapons, gives you tiered unit variants for near-zero extra art.

## 2. Where the art actually comes from

Four realistic paths, roughly in order of cost:

1. **Asset packs** — itch.io, CraftPix, GameDev Market. $20–100/pack, available
   today. Downside: generic, and other games use the same art. Perfect for
   placeholders, risky as your final look.
2. **Commission an artist** — ArtStation, Reddit `r/gameDevClassifieds`, Fiverr.
   Budget **$80–250 per rigged unit** with a handful of animations. A 12-unit
   roster lands around **$1,000–3,000**. Best ratio of quality to
   differentiation, and the art is exclusively yours.
3. **AI-assisted** — good for concept exploration, backgrounds, and textures.
   Weak at keeping a *consistent* character set across 12 units, which is exactly
   what this genre needs. Note that Google Play requires AI-content disclosure,
   and portal policies vary.
4. **Draw it yourself** — viable if you already can. Months of learning if not.

## 3. The sequence — this is the part that saves money

> **Never commission art for a design you have not proven is fun.**

1. Build with the placeholder rectangles that are in the repo right now.
2. Tune `Balance.ts` until the battles feel good with *ugly* art.
3. Put it in front of real players. If it is not fun as rectangles, art will not
   save it — it will just make it expensive.
4. *Then* commission the real roster.

The code is already built for this. All placeholder art is confined to the
`Unit` constructor in `src/entities/Unit.ts`, marked with a comment block. When
real art arrives, that constructor is the only thing that changes — swap the
three rectangles for a Spine object and keep the same public API.

## 4. "Better graphics" is mostly code, not drawings

The highest-leverage insight for this genre: Epic War 5 looked good because of
**composition and effects**, not because each sprite was a masterpiece. A modest
sprite with great effects beats a great sprite with none.

These are all programmer-side and cost no art budget:

- Multi-layer parallax backdrops (already scaffolded — see `addRidge`)
- Particle VFX: hit sparks, dust on footfall, blood, magic
- **Hitstop** — freeze both units for ~60ms on impact. Single biggest
  "game feels expensive" trick there is.
- Screen shake on heavy hits and castle damage
- Floating damage numbers
- Death dissolves and ragdoll tumbles
- Colour grading, vignette, and bloom via WebGL shaders
- Squash-and-stretch on spawn and landing

Spend effort here before spending money on art.

## 5. Music and sound

Audio is roughly **5–10% of the art budget**. It is not your problem; art is.

A full game needs about 5–8 tracks: menu, 2–3 battle, boss, victory, defeat.

- **Music** — Kevin MacLeod / incompetech and FreePD (free, CC-BY or public
  domain), or a paid pack from GameDev Market for $100–300 total. Subscription
  libraries like Epidemic Sound or Artlist run ~$15–25/mo.
- **SFX** — the **Sonniss GDC bundles** are enormous, genuinely professional, and
  royalty-free. Start there. freesound.org is good but licences vary per file.
- **AI music** (Suno, Udio) — commercial-use terms for games are still murky.
  Check the current licence before shipping, not after.

## 6. Licensing — check before you download

You are shipping commercially, on portals *and* an app store. That means:

- The licence must permit **commercial use** and **redistribution**. A lot of
  itch.io packs are non-commercial only.
- **CC-BY requires attribution** — build a credits screen and keep it current
  from day one, not the week before launch.
- Keep a `CREDITS.md` listing every asset, its source, and its licence. Sorting
  this out retroactively is miserable.

---

## Roadmap

- [x] Core lane loop: deploy, march, engage, castle damage, win/lose
- [x] Mana economy and per-unit deploy cooldowns
- [x] Timed enemy waves
- [ ] Hero unit with an active ability
- [ ] Spell casting (targeted, on a cooldown)
- [ ] Between-stage upgrade tree with persistent save
- [ ] Stage data moved to JSON + 15-stage campaign
- [ ] VFX pass (hitstop, particles, damage numbers)
- [ ] Real art: Spine rigs replacing placeholders
- [ ] Audio pass
- [ ] Portal build (CrazyGames / Poki SDK integration)
- [ ] Capacitor wrap for Google Play

## Naming note

`GAME_NAME` and `PACKAGE_ID` both live in `src/config/GameConfig.ts`.

The Android package id is **permanent once the first build is uploaded to Google
Play** and can never be changed afterwards. Lock the name before that upload.

Avoid "Clash" in the title — Supercell defends that trademark aggressively, and
it is a real rejection risk on Play.
