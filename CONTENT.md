# Ashenfront — Content Bible

What the campaign is made of: acts, scenery, bosses, legendary units, achievements.

Names are placeholders throughout — the story writer renames. **Mechanics are the
part that matters**, and they are the part designed here.

---

## The goal: units people still remember in ten years

Epic War 5's Lord of Hell, Angel, and Reaper are remembered a decade later. Not
because their numbers were large — because each did something **no other unit
could do**. That is the entire brief.

A legendary unit needs four things:

1. **A signature mechanic** — one rule that is uniquely its own
2. **A silhouette** — recognisable at a glance in a 30-unit brawl
3. **A moment** — something visible happens when it acts
4. **Scarcity** — expensive and slow to field, so its arrival is an event

If a unit is only "a knight with bigger numbers", it is not legendary and should
be cut.

---

## Legendary units

Four. Each is unlocked by beating the boss it is thematically bound to — you take
the thing that beat you and turn it on the next enemy. All are late-game
expensive, with long deploy cooldowns, so fielding one is a decision.

### 1. The Valkyrie — *unlocked: Act I*
**Signature: flies, and raises the fallen.**
Ignores ground blocking entirely — walks over your own queued line straight to
the front, which no other unit can do. Every few seconds, revives one fallen ally
at half health where it died.

*Why it sticks:* it breaks the game's most basic rule (units queue up), and it
undoes death. Players will build whole compositions around feeding it casualties.

### 2. The Reaper — *unlocked: Act II*
**Signature: executes.**
Any enemy that drops below 20% health inside its reach dies instantly, regardless
of remaining HP, armour, or size. Bosses are capped — they take a large flat hit
instead of dying outright.

*Why it sticks:* an instant kill is the single most memorable thing a unit can do.
The number on the screen stops mattering. Players will hold it back specifically
to snipe a wounded giant.

### 3. The Jötunn — *unlocked: Act III*
**Signature: nothing stands near it.**
Colossal and slow. Every hit knocks its target back hard; every fourth hit slams
the ground and staggers everything in a wide radius, friend and foe alike.

*Why it sticks:* pure screen presence, and the friendly-fire stagger makes it a
genuine trade-off rather than a straight upgrade.

### 4. The Draugr Jarl — *unlocked: final*
**Signature: the enemy dead serve you.**
Every enemy that dies within its radius rises as a weak thrall fighting for you.
Thralls are frail and expire on a timer, but they cost nothing.

*Why it sticks:* it turns the enemy's own army into yours. Against a big wave it
snowballs visibly, and the player did that.

> Note how each one is the **inverse of a boss mechanic**. The Gorge heals from
> deaths near it; the Draugr Jarl profits from them. That symmetry is deliberate —
> beating a boss should feel like taking its power.

---

## Acts, scenery, and bosses

Three acts, five stages each, plus optional trials. Every act ends with a puzzle
boss that demands mastery of one system, and each boss punishes a habit the
*previous* act taught.

The escalation is: **composition → positioning → restraint.**

### Act I — Járnviðr, the Iron Wood
*Scenery:* black iron-barked trees, low fog, cold blue-green palette, moonlight.
Newly loose and hunted; the fights are small and close.

**Boss — The Bulwark.** A wall. Shielded armour, enormous health, barely attacks.
Arrows and spears simply bounce (pierce is 0.45× into shielded).

- **Punishes:** the archer-and-spearman comfort composition the act taught you
- **Demands:** blunt damage — Maul and Shieldbearer — i.e. read the counter matrix
- **Teaches:** composition is the decision

### Act II — The Broken Coast
*Scenery:* grey sea, rain, burning longhouses, wrecked keels in the sand. Warmer
ruin-orange against cold grey.

**Boss — The Executioner.** Slow, enormous single-target damage, and it always
swings at the **highest-health target in reach** — which is your champion.

- **Punishes:** leading with your hero, which has worked for eleven stages
- **Demands:** Hold or Fall back the champion; feed it cheap bodies instead
- **Teaches:** positioning is the decision

### Act III — The Bifröst and Asgard
*Scenery:* crystalline bridge over void, aurora, gold ruin. Bright and hostile —
a deliberate break from the dark palette of Acts I and II.

**Final boss — The Gorge.** Heals for every unit that dies inside its radius. Slow.

- **Punishes:** chaff spam — *the celebrated Epic War Colossus answer*. A veteran
  who opens with massed cheap units feeds it and loses.
- **Demands:** deny it kills. Champion held out of range, ranged damage from
  outside the radius, fall back rather than trade bodies.
- **Teaches:** restraint is the decision — the hardest ask in the genre, and the
  right note to end on.

### Trials — Niflheim
*Scenery:* white-out ice, near-monochrome.
Optional challenge stages outside the campaign. Harsher rules, better rewards.
This is where the "one fight everyone looks up" lives.

---

## Stage rhythm within an act

| Stage | Role |
| --- | --- |
| 1 | Introduce the act's new enemy unit, gently |
| 2 | Widen the field; two enemy types in combination |
| 3 | Pressure test — the first stage that can genuinely be lost |
| 4 | Teach the boss's mechanic in miniature, on a small enemy |
| 5 | **Boss** |

Stage 4 is the important one. The boss must never be the first time the player
sees its mechanic — it should be the first time the mechanic is *lethal*.

---

## Enemy commander AI ("battle IQ")

Enemies currently spawn from a fixed timetable. That is fine for a slice and
insufficient for a campaign. Planned, in order of value:

1. **Counter-picking** — the commander sees your last few deploys and answers
   them. Stack archers and it fields shields.
2. **Fury budgeting** — it banks resource and spends it in pushes rather than
   dribbling units out, so battles have surges and lulls.
3. **Line discipline** — ranged units held behind the melee line instead of
   walking into it.
4. **Boss phases** — behaviour changes at health thresholds, telegraphed.
5. **Difficulty via *behaviour*, not stat multipliers.** A harder enemy should
   play better, not simply have more health. Stat-inflation difficulty is what
   made the original's late game a slog.

---

## Achievements

Rewards runes, so they feed progression rather than sitting inert.

**Progress:** clear each act (×3) · clear the campaign · 3-star every stage in an
act (×3) · clear every trial

**Mastery:** win without deploying a single unit beyond the starting fury ·
win with the champion never falling · 3-star a boss on the first attempt ·
win a stage using only one damage type · clear a boss without losing a unit

**Discovery:** unlock all four legendaries · max one chain link · max one unit ·
field all eight units in a single battle

**The bragging ones:** beat The Gorge without deploying chaff · beat The
Executioner without the champion ever entering its reach · clear a trial at 3x
speed without pausing

That last group is the set people screenshot. They should be genuinely hard and
named memorably.

---

## Open content questions

- Do legendaries occupy a separate deploy slot, or share the eight-unit bar?
- Are trials unlocked by progress or by star count?
- Does the Draugr Jarl's thrall cap need to scale, or is a hard cap cleaner?
- How many enemy-only units per act — three feels right, but unverified.
