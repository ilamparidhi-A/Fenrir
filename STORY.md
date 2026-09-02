# Ashenfront — Story & Setting

## Premise

You are **Fenrir**, in human form.

The Æsir feared a prophecy: that the wolf-son of Loki would one day tear down
Asgard and devour Odin himself. So they did not fight him. They *tricked* him.

Twice they came with chains — Leyding, then Drómi — dressed as tests of strength,
and twice he broke them and let them praise him for it. The third time they
brought **Gleipnir**: a ribbon, soft as silk, forged in secret by dwarves from six
impossible things — the footfall of a cat, the roots of a mountain, the sinews of
a bear, the breath of a fish, the beard of a woman, the spittle of a bird.

He suspected the trick. He agreed only if one of them would place a hand between
his jaws as a pledge of good faith. **Týr** did — knowing it was a lie.

The ribbon held. Týr lost his hand. And Fenrir was left bound to a rock with a
sword wedged in his jaws, for as long as the gods should last.

**This is the story of what he does when he gets loose.**

The chain that bound him does not fall away. He takes it with him. Gleipnir —
the unbreakable thing, made of impossibilities — becomes his weapon, and every
link he masters is a piece of the gods' own cruelty turned back on them.

## Why this premise works

- **Motivation is instant.** No exposition needed. He was betrayed; he is owed.
- **Escalation is built in.** The myth ends at Ragnarök. The campaign has a
  destination the player already knows and wants to reach.
- **The antagonists are famous.** Týr, Heimdall, Thor, Odin — recognisable, and
  each already carries a personal relationship to Fenrir.
- **The hook is mechanical, not just narrative.** Gleipnir-as-weapon is a system,
  not a cutscene.

## Character arc

| Act | Where | State of Fenrir |
| --- | --- | --- |
| **I — The Breaking** | Járnviðr, the Iron Wood | Newly loose, weak, hunted. Human form is a *wound*, not a gift — the gods' binding holds his true shape shut. |
| **II — The Long March** | Midgard, then Jötunheim | Gathering the wolves and giants the Æsir wronged. Gleipnir begins to answer him. |
| **III — Ragnarök** | The Bifröst, then Asgard | Full power. The chain is fully his. The prophecy comes due. |

The visual arc should track this: he starts looking human and ends looking like
the thing the gods were afraid of. Placeholder art already gives the hero a
distinct silhouette — the real rig should show this transformation across acts.

## Gleipnir as the progression system

The six impossible ingredients are six upgrade branches. Progression is
**Fenrir mastering the chain that held him**, which is thematically the same
action as getting stronger.

| Link | Branch | Effect |
| --- | --- | --- |
| Sinews of the Bear | Might | Hero health and damage |
| Roots of the Mountain | Endurance | Lair health |
| Footfall of the Cat | Hunger | Fury regeneration |
| Breath of the Fish | Depth | Maximum fury |
| Beard of a Woman | *reserved* | Future branch — the impossible ones stay locked longest |
| Spittle of a Bird | *reserved* | Future branch |

Four are implemented. The last two are deliberately held back — they are the
*most* impossible ingredients, so gating them behind late progression is both
mechanically sensible and true to the myth.

## Boss design and the myth

The puzzle-boss pillar (see [PLAN.md](PLAN.md)) fits this setting exactly. Each
Asgardian should punish a different learned habit:

- **Týr** — the god who put his hand in your mouth. Personal. He *knows* how you
  fight, because he is the only one who ever got close. Counters your default
  composition directly.
- **Heimdall** — sees everything coming. Punishes telegraphed, repeated pushes;
  rewards feints and split timing.
- **Jörmungandr / a Jötunn colossus** — the stat-check that is not a stat check.
  Stagger meter filled by hit *count*, not damage, so massed heavy units lose and
  cheap chaff wins.
- **Odin** — the final betrayal, answered.

## Naming note

**"Ashenfront" no longer fits this story.** It was chosen before the setting
existed. A Norse-rooted name would serve the game far better — candidates worth
checking for conflicts: *Gleipnir*, *Unbound*, *Chainbreaker*, *Fenrisúlfr*,
*The Sixth Link*.

`GAME_NAME` lives in `src/config/GameConfig.ts` and is a one-line change. This
should be decided before the first Google Play upload, since `PACKAGE_ID` is
permanent after that.
