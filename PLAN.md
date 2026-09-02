# Ashenfront — Build Plan

Living tracker. Update checkboxes as things land; keep **Now** pointing at the one
thing in flight.

**Now:** Phase 5c — enemy commander AI, then achievements. Bosses, legendaries,
campaign and map are all in.

**Genre:** Real-time strategy — specifically the *lane battler / tug-of-war RTS*
subgenre (Epic War, Stick War, Age of War, Art of War: Legions). Ships under
**Strategy** on Google Play and **Strategy / Tower Defense** on web portals.
Strategy is one of the strongest-growing mobile categories, which is good for us
on Play tags and bad for us on paid UA — see the web-first note below.

**Content bible:** [CONTENT.md](CONTENT.md) — legendary units, acts, scenery,
bosses, enemy AI, achievements. Read it before designing anything content-shaped.

**Strategy reminder:** web portals first (CrazyGames / Poki / itch), Google Play
second via Capacitor. Portal constraints — small bundle, fast load, pause when
hidden — are hard requirements. Art pipeline lives in [README.md](README.md).

---

## Design pillars

### 1. Bosses are puzzles, not stat checks

This is the most important design decision in the project.

Epic War 5's **Colossus** is why that game is still discussed 14 years later. It
cannot be beaten by grinding upgrades. It is beaten by inverting everything the
previous 20 stages taught you: send cheap chaff to stagger it instead of your best
melee, lean on ranged damage, wall it to buy time, and hold your hero *back*
instead of leading with it. Players who brute-force it lose at every upgrade
level. Most go looking for a walkthrough.

That failure rate is a feature. It is the strongest retention and word-of-mouth
mechanic the genre has:

- Victory feels *earned*, so it is remembered and talked about
- "How to beat X" becomes search traffic and YouTube coverage — free marketing we
  cannot buy, and the exact reason this project exists
- It gives a community something to argue about

**Rule:** at least one boss per act must be winnable at *any* upgrade level with
the right tactic, and unwinnable at *every* upgrade level with the wrong one.
**Design the counter-tactic first, then build the boss that demands it.**

**And they must not be reruns of Epic War's fights.** Rebuilding the Colossus
beat-for-beat would read as a cheap copy to exactly the players most likely to
find us. The principle carries over; the mechanics must be our own. The strongest
version of that: build a boss where **the famous Colossus tactic actively loses.**
A veteran who opens with massed cheap chaff should be punished for it.

The three bosses, in order. Each demands mastery of one system, and each punishes
a habit the *previous* act taught. The escalation is **composition → positioning →
restraint**, and The Gorge is the finale.

| Boss | Punishes | Counter-tactic it forces |
| --- | --- | --- |
| **I — The Bulwark** — shielded, vast HP, barely attacks | The archer/spearman comfort composition | Bring blunt. Read the counter matrix. |
| **II — The Executioner** — always swings at the highest-health target in reach | Leading with your champion, which has worked for eleven stages | Hold or Fall back the hero; feed it cheap bodies |
| **III — The Gorge** *(final)* — heals for every unit that dies inside its radius | Chaff spam — *the celebrated Epic War answer*. Feeding it bodies is how you lose. | Deny it kills: champion out of range, ranged damage from outside, fall back rather than trade |

Every one of these makes the player's *default* strategy actively lose. That is
the whole trick.

### 2. A decision every five seconds

Mana regen and cooldowns must be tuned so the player is never idle and never able
to spam. Free hero abilities exist so there is always something to press even when
mana-starved.

### 3. Readable at a glance

Team colour, health bars, damage numbers, buff outlines. The player must parse a
20-unit brawl instantly. This is why placeholder art is *usable*, not just a
stand-in.

### 4. Placeholder art until the loop is validated

Art is 60–70% of project cost. Prove it is fun as rectangles first.

---

## Phase 1 — Core loop ✅

- [x] Phaser 3 + TypeScript + Vite, relative `base` for portals/Capacitor
- [x] Lane sim: march, formation queueing, target acquisition, attack
- [x] Castles with HP, win/lose resolution
- [x] Mana economy + per-unit deploy cooldowns
- [x] Timed enemy wave scheduler
- [x] HUD on a parallel scene
- [x] Data-driven unit definitions
- [x] Team-coloured units
- [x] Parallax ridge backdrop

## Phase 2 — Heroes, abilities, feel ✅

- [x] Hero: high stats, free at start, respawns on a timer
- [x] Ability system with cooldowns, shared by hero ability and spells
- [x] War Cry — shockwave damage + knockback
- [x] Volley — click-to-target arrow rain
- [x] Rally — party-wide damage/speed buff
- [x] Mend — area heal
- [x] VFX module: rings, damage numbers, screen shake, cast banners
- [x] Hitstop on heavy impacts
- [x] Spell bar with cooldown sweeps + targeting reticle

## Phase 3 — Progression & meta ✅ (unlocks deferred)

- [x] `SaveSystem`: localStorage, versioned schema, migration path
- [x] Gold + XP awarded per stage, scaled to performance
- [x] Upgrade tree: unit levels, mana regen, castle HP, hero stats
- [ ] Unit unlock gating tied to campaign progress *(deferred — needs Phase 5)*
- [x] Star rating per stage (3 stars: win / speed / castle untouched)
- [x] Replay stages for reduced rewards

## Phase 3.5 — Combat depth & tempo ✅

The two things Epic War 5 actually got wrong, fixed.

- [x] Damage/armour counter matrix — slash, pierce, blunt, magic vs unarmoured,
      light, heavy, shielded. No single stack is ever correct any more.
- [x] Roster expanded 4 → 8 units, each built around a (damage, armour) pair
- [x] Damage numbers coloured and sized by effectiveness — counters are legible
      without a tutorial
- [x] Damage-type colour stripes on the deploy bar
- [x] Hover tooltips: role, damage type, armour type
- [x] Battle speed control (1x / 2x / 3x) — the "this takes a loooong while" fix
- [x] Pause (button + spacebar) with a dimming veil
- [x] HUD relaid out: fury top-left, tempo top-right, 8 deploy + 4 spells bottom
- [x] **Side-scrolling battlefield** — world is 2800px against a 1280px viewport,
      so the player chooses where to look, as in the original
- [x] Camera: A/D + arrow keys to pan, auto-follow on the front line, manual
      pan drops follow, `Cam: auto/free` toggle
- [x] Three parallax ridge layers at 0.25 / 0.45 / 0.7 scroll factors, plus
      distance posts so motion reads against the ground
- [x] Minimap: whole field, unit dots, hero marker, viewport box, click to jump
- [x] **Champion orders** — Advance (X) / Hold (C) / Fall back (Z). Movement
      commands drive the hero *only*; deployed troops always advance on their own.
      You commit troops by choosing what to deploy, not by steering them.
- [x] Retreating means disengaging, so pulling the hero back costs you its damage
- [x] **Rank depth** — units occupy 3 parallel lanes instead of a single-file
      column. Peak simultaneous engagement went from 1 unit to 5, and the line
      reads as a crowd. Blocking is per-rank; the champion always takes the
      frontmost rank so it is never buried behind its own troops.
- [x] **Mouse and touch camera**: drag the field to pan, mouse edge-scroll, wheel
      to pan. Same code path on touch, which is what makes it playable on a phone.

## Phase 4 — Screens & flow 🔨

The game is currently two screens. It needs eleven. Full inventory below.

- [ ] Screen router / transition system (fade, no hard cuts)
- [ ] Main menu pass: art, animated backdrop, continue vs new game
- [x] Stage select **map screen** — node graph, unlock states, star display
- [ ] Pre-battle loadout: pick units and spells for the stage
- [ ] Pause overlay: resume, restart, settings, quit
- [ ] Results screen: stars, gold/XP earned, rewards, next-stage CTA
- [ ] Barracks / upgrade screen
- [ ] Unit codex — stats, counters, lore
- [ ] Settings: music, SFX, quality, language
- [ ] Credits screen (**required** if any CC-BY assets ship)
- [ ] Onboarding: first-stage tutorial prompts

## Phase 5 — Campaign & level design ✅ (trials + survival pending)

- [x] Stage definitions as **data** in `config/Campaign.ts` — no code change to add a level
- [x] Stage schema: waves, biome, lair HP, rewards, unit unlocks, boss flag
- [x] 3 acts × 5 stages = 15 stages authored
- [x] **Biomes as data** (`config/Biomes.ts`) — Iron Wood, Broken Coast, Bifröst,
      Niflheim. Sky, ground, and three parallax ridge layers per biome.
- [x] Per-stage star records, stage gating, unit unlocks on first clear
- [x] Save schema v2 with a working v1 migration
- [x] **3 puzzle bosses** as real entities — The Bulwark, The Executioner, The Gorge
- [x] Boss traits: regeneration, toughest-target hunting, heal-on-nearby-death
- [x] Bosses enter partway through the fight, with a banner and a HUD health bar
- [x] Felling the boss wins the stage outright — no walk to the keep afterwards
- [x] **4 legendary units** — Valkyrie, Reaper, Jötunn, Draugr Jarl (CONTENT.md)
- [x] Data-driven `UnitTraits`: flight, execute, knockback, area slam, revive
      aura, raise-dead aura, lifespan. A legendary is a data entry, not a class.
- [x] `elite` flag — heroes, bosses and legendaries cannot be instant-killed;
      execute deals heavy flat damage to them instead
- [x] Thralls: free, frail, expire on a timer
- [x] Deploy bar sizes itself to however many units are owned (8 → 12)
- [x] Barracks widened to three columns for the full roster
- [ ] Difficulty curve pass once bosses exist
- [ ] Trial stages in Niflheim
- [ ] Endless survival mode — a top request on the original

## Phase 5c — Enemy commander AI ("battle IQ") 🔨

- [ ] Counter-picking: the commander answers what you have been deploying
- [ ] Fury budgeting so battles have surges and lulls, not a constant dribble
- [ ] Line discipline: ranged held behind melee
- [ ] Boss phase behaviour at health thresholds, telegraphed
- [ ] Difficulty through **behaviour, not stat multipliers**

## Phase 5d — Achievements

- [ ] Achievement system + persistence, awarding runes
- [ ] Progress, mastery, discovery, and bragging tiers (CONTENT.md)
- [ ] Achievement screen

## Phase 6 — Art assets

Tracked in the manifest below. Sequence: placeholders → validate the loop →
commission. Never commission before validation.

- [ ] Lock the art direction (one reference sheet before any commission)
- [ ] Choose rig tool — Spine Essential $99 vs DragonBones free
- [ ] Commission unit roster
- [ ] Commission hero + boss rigs
- [ ] Biome backgrounds
- [ ] UI kit + ability icons
- [ ] **Portal thumbnail + store key art** — see note in manifest, this is marketing
- [ ] `CREDITS.md` maintained from day one

## Phase 7 — Audio

- [ ] Audio manager: music bus, SFX bus, ducking, per-bus volume in settings
- [ ] Music tracks per the manifest below
- [ ] SFX pass per the manifest below
- [ ] Mute-on-hide (portals require it; browsers punish autoplay audio)
- [ ] Licence check on every file before it ships

## Phase 8 — Ship

- [ ] Mobile input pass + responsive layout at phone aspect ratios
- [ ] Performance: sprite pooling, texture atlas, bundle audit
- [ ] CrazyGames SDK (rewarded video, interstitials between stages)
- [ ] Poki SDK build
- [ ] Capacitor wrap; **lock `PACKAGE_ID` before first Play upload — permanent**
- [ ] Store listing: icon, feature graphic, screenshots, description
- [ ] Privacy policy + AI-content disclosure if any AI assets ship

---

## Asset manifest — art

Status: ⬜ not started · 🟨 placeholder in place · ✅ final

| Group | Count | Status | Est. cost | Notes |
| --- | --- | --- | --- | --- |
| Unit rigs | 12 | 🟨 rectangles | $80–250 ea → **$1.0–3.0k** | Spine, ~5 anims each: idle, walk, attack, hurt, die |
| Hero rigs | 2 | 🟨 rectangle + crest | $250–400 ea | More anims: ability cast, victory pose |
| Boss rigs | 3 | ⬜ | $300–600 ea | Multi-phase; needs a stagger/vulnerable state |
| Castles | 2 × 3 damage tiers | 🟨 rectangles | $200–500 total | Visible damage states sell the tug-of-war |
| Biome backgrounds | 4 biomes × 3 layers | 🟨 vector ridges | $60–150 per layer | Parallax; keep layers separate |
| VFX sheets | ~15 | 🟨 code-drawn | pack or DIY | Sparks, dust, blood, magic, arrows |
| UI kit | 1 | 🟨 rectangles | $50–200 pack | Buttons, panels, frames, bars |
| Ability icons | 12 | ⬜ | $15–40 ea | Must read at 64px |
| Map screen art | 1 | ⬜ | $150–400 | Node map + biome illustration |
| Logo / key art | 1 | ⬜ | $150–500 | Drives the portal thumbnail |
| Store assets | icon, feature graphic, 8 screenshots | ⬜ | — | Play listing requirements |

**Total art budget estimate: roughly $3,000–7,000** for a fully commissioned look,
or a few hundred using asset packs. Decide which after validation, not before.

> **The portal thumbnail is not an afterthought — it *is* the marketing.** On
> CrazyGames and Poki, the thumbnail and title are the entire funnel. Budget real
> money and iteration for that single image; it will out-earn any three unit rigs.

## Asset manifest — audio

Roughly 5–10% of the art budget. Not the bottleneck.

| Track | Use | Length |
| --- | --- | --- |
| Main theme | Menu + map | 60–90s loop |
| Battle I / II / III | One per biome | 90–120s loop each |
| Boss theme | Boss + trial stages | 90–120s loop |
| Barracks ambient | Upgrade screen | 60s loop |
| Victory sting | Results | 3–5s |
| Defeat sting | Results | 3–5s |

**SFX (~20):** melee hit, arrow loose, arrow impact, spell cast ×4, unit spawn,
unit death ×2, hero ability, castle hit, castle destroyed, boss roar, boss stagger,
UI click, UI refuse, coin, level-up, star earned, wave incoming.

**Sources:** Sonniss GDC bundles (free, royalty-free, professional) for SFX;
incompetech / FreePD (CC-BY) or a $100–300 GameDev Market pack for music.
Verify commercial licence on every file — we ship on portals *and* an app store.

## Screen inventory

| Screen | Status |
| --- | --- |
| Boot / preload | ✅ |
| Main menu | 🟨 styled, shows runes/record; needs art |
| Stage select map | ✅ |
| Pre-battle loadout | ⬜ |
| Battle HUD | ✅ |
| Pause overlay | ⬜ |
| Results / rewards | ✅ stars, runes, next-action buttons |
| Barracks / upgrades | ✅ |
| Unit codex | ⬜ |
| Settings | ⬜ |
| Credits | ⬜ |

---

## Decisions on record

| Decision | Rationale |
| --- | --- |
| Phaser over Unity | Dual web+Play target. Unity WebGL is 8 MB+ and 10–50× slower to load; portals effectively reject it. Bundle is ~346 KB gzipped. |
| Web portals before Play | Play's strategy category needs a UA budget; the browser audience for this genre has been unserved since Flash died in 2020. |
| Placeholder art until validated | Art is 60–70% of project cost. |
| Balance in data, not code | Adding a unit = an entry in `UNIT_DEFS`. Stages will be JSON. |
| Bosses as puzzles | See pillar 1. This is the retention and marketing engine. |
| Counter matrix over raw stats | Epic War 5's optimal play was "spam the best unit you can afford". Counters make composition the decision instead. Verified swing: maul vs shieldbearer does 6.5x an archer's damage into the same target. |
| Speed controls from day one | The single most-cited complaint about the original was that fights dragged. Costs nothing to fix; modern players will not sit through it. |
| Scrolling world over fixed view | A battlefield that fits on one screen feels small. 2800px world with parallax and a minimap; the player decides where to look. |
| The Gorge is the final boss | Ending on "restraint" is the hardest ask and the strongest note. Acts I and II teach composition and positioning first. |
| Legendaries need signature mechanics | People remember Epic War's Lord of Hell, Angel, and Reaper because each did something unique — not because the numbers were big. A unit that is only "a knight with more HP" gets cut. |
| Bosses are traits too | The Bulwark is regeneration + shielded armour; the Executioner is one targeting rule; the Gorge is one death-aura. Measured: 4 archers strip 31 HP from the Bulwark in 15s (-2 net dps against its regen), 4 mauls strip 1349 (-90 net dps). A 45x gap that no amount of upgrading closes — which is the pillar working. |
| Legendaries are traits, not classes | Each is a `UnitTraits` entry on a normal `UnitDef`. Adding a fifth legendary is data. Verified: flight, execute, revive, raise and slam all work off that one system. |
| Elites cannot be executed | The Reaper deleting a boss outright would make every boss fight trivial. Elites take 3x flat damage in place of the instant kill. |
| Three ranks, not one file | Single-file queueing meant a 20-unit army had exactly one unit fighting, and it looked like a row of boxes. Lanes fix both the look and the maths. |
| Orders steer the hero, not the army | Troops are committed by what you deploy; the champion is the piece you actually pilot. Keeps the input surface small and the deploy decision meaningful. |
| Pointer-first camera | Keyboard-only panning is bad on desktop and impossible on touch. Drag/edge/wheel all land on the same handler as the Play build's touch input. |
| Hero respawns, not permadeath | Direct fix for the top complaint about Epic War 5. |
| Name: Ashenfront | **Under review** — see STORY.md. The Norse setting arrived after the name; a Norse-rooted title would serve it better. |
| Story: Fenrir bound by Gleipnir | See [STORY.md](STORY.md). Gleipnir's six impossible ingredients are the six upgrade branches — progression *is* the character arc. |

## Open questions

- Roster is at 8 (militia, spearman, archer, berserker, shieldbearer, maul,
  knight, seer). Still open: cavalry (fast flanker), siege (outranges), healer,
  flying (ignores ground blocking). Names are placeholders for the story writer.
- Which 3 puzzle bosses ship, and in what act order?
- Monetisation on Play: rewarded video for revive/double-loot is the natural fit.
  IAP model still undecided.
- Campaign shape: linear-with-replay, or a branching map?
- Art direction: dark low-fantasy (current palette) or brighter stylised? Decides
  every commission that follows.
