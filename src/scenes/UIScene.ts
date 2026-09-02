import Phaser from 'phaser';
import type { BattleScene } from './BattleScene';
import type { AbilityDef, Stance, UnitDef } from '../types';
import { HERO_ABILITY, SPELLS } from '../config/Abilities';
import { ARMOR_LABEL, DAMAGE_LABEL, DAMAGE_TINT } from '../config/Counters';
import { ALL_UNIT_DEFS, LEGENDARY_ROSTER, ROSTER } from '../config/Balance';
import { progression } from '../systems/Progression';
import {
  CSS,
  ENEMY_CASTLE_X,
  GAME_HEIGHT,
  GAME_WIDTH,
  PALETTE,
  PLAYER_CASTLE_X,
  WORLD_WIDTH,
} from '../config/GameConfig';

const FURY_BAR = { x: 24, y: 42, w: 250, h: 22 };
const MINIMAP = { x: 640, y: 42, w: 360, h: 36 };
const STANCE_X = 331;
const STANCE_STEP = 84;
const BAR_Y = GAME_HEIGHT - 58;
const BTN_H = 84;

const UNIT_MAX_BTN_W = 90;
const UNIT_GAP = 6;
const UNIT_START_X = 24;
/** Horizontal room the deploy bar may use before the spell bar begins. */
const DEPLOY_REGION_W = 860;

const ABIL_BTN_W = 76;
const ABIL_GAP = 8;
const ABIL_RIGHT = GAME_WIDTH - 24;

interface DeployButton {
  unitId: string;
  box: Phaser.GameObjects.Rectangle;
  cooldownVeil: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

interface AbilityButton {
  def: AbilityDef;
  box: Phaser.GameObjects.Rectangle;
  cooldownVeil: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  timer: Phaser.GameObjects.Text;
}

/** Runs in parallel with BattleScene so the HUD never shakes with the world camera. */
export class UIScene extends Phaser.Scene {
  private battle!: BattleScene;
  private furyFill!: Phaser.GameObjects.Rectangle;
  private furyText!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private speedLabel!: Phaser.GameObjects.Text;
  private pauseLabel!: Phaser.GameObjects.Text;
  private pauseVeil!: Phaser.GameObjects.Rectangle;

  private tipBox!: Phaser.GameObjects.Rectangle;
  private tipTitle!: Phaser.GameObjects.Text;
  private tipRole!: Phaser.GameObjects.Text;
  private tipTypes!: Phaser.GameObjects.Text;

  private minimap!: Phaser.GameObjects.Graphics;
  private stanceButtons: { stance: Stance; box: Phaser.GameObjects.Rectangle }[] = [];
  private followText!: Phaser.GameObjects.Text;

  private deployButtons: DeployButton[] = [];
  private abilityButtons: AbilityButton[] = [];

  constructor() {
    super('UI');
  }

  create(): void {
    this.battle = this.scene.get('Battle') as BattleScene;
    this.deployButtons = [];
    this.abilityButtons = [];
    this.stanceButtons = [];

    this.buildPauseVeil();
    this.buildFuryBar();
    this.buildTempoControls();
    this.buildDeployBar();
    this.buildAbilityBar();
    this.buildStanceBar();
    this.buildMinimap();
    this.buildTooltip();

    this.hint = this.add
      .text(GAME_WIDTH / 2, 78, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '19px',
        color: CSS.accent,
      })
      .setOrigin(0.5);
  }

  private buildPauseVeil(): void {
    this.pauseVeil = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45)
      .setDepth(-1)
      .setVisible(false);
  }

  private buildFuryBar(): void {
    const { x, y, w, h } = FURY_BAR;

    this.add
      .text(x, y - 28, 'FURY', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: CSS.muted,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(2);

    this.add.rectangle(x, y, w, h, 0x000000, 0.6).setOrigin(0, 0.5);
    this.furyFill = this.add.rectangle(x + 2, y, 0, h - 4, 0x5aa9d6).setOrigin(0, 0.5);
    this.furyText = this.add
      .text(x + w / 2, y, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '15px',
        color: CSS.text,
      })
      .setOrigin(0.5);
  }

  private buildTempoControls(): void {
    const y = FURY_BAR.y;

    this.speedLabel = this.tempoButton(ABIL_RIGHT - 38, y, '1x', () => {
      this.battle.cycleSpeed();
    });

    this.pauseLabel = this.tempoButton(ABIL_RIGHT - 124, y, 'Pause', () => {
      this.battle.togglePause();
    });

    this.followText = this.tempoButton(
      ABIL_RIGHT - 206,
      y,
      '',
      () => this.battle.setCameraFollow(!this.battle.cameraFollow),
      68
    );

    this.input.keyboard?.on('keydown-SPACE', () => this.battle.togglePause());
  }

  private tempoButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    width = 76
  ): Phaser.GameObjects.Text {
    const box = this.add
      .rectangle(x, y, width, 38, PALETTE.accent, 0.14)
      .setStrokeStyle(2, PALETTE.accent, 0.8)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Georgia, serif',
        fontSize: width < 76 ? '13px' : '17px',
        color: CSS.text,
      })
      .setOrigin(0.5);

    box.on('pointerover', () => box.setFillStyle(PALETTE.accent, 0.3));
    box.on('pointerout', () => box.setFillStyle(PALETTE.accent, 0.14));
    box.on('pointerdown', () => {
      onClick();
      this.tweens.add({ targets: box, scale: 0.92, duration: 80, yoyo: true });
    });

    return text;
  }

  private buildDeployBar(): void {
    // Legendaries join the bar as they are earned, and everything shrinks to fit.
    const visible = [
      ...ROSTER,
      ...LEGENDARY_ROSTER.filter((id) => progression.isUnitUnlocked(id)),
    ];

    const btnW = Math.min(
      UNIT_MAX_BTN_W,
      Math.floor((DEPLOY_REGION_W - UNIT_GAP * (visible.length - 1)) / visible.length)
    );
    const nameSize = btnW >= 82 ? '13px' : '10px';
    const costSize = btnW >= 82 ? '20px' : '16px';

    let x = UNIT_START_X + btnW / 2;

    for (const unitId of visible) {
      const def = ALL_UNIT_DEFS[unitId]!;
      const homeX = x;

      const box = this.add
        .rectangle(homeX, BAR_Y, btnW, BTN_H, def.tint, 0.16)
        .setStrokeStyle(2, def.tint)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(homeX, BAR_Y - 26, def.name, {
          fontFamily: 'Georgia, serif',
          fontSize: nameSize,
          color: def.elite ? CSS.accent : CSS.text,
        })
        .setOrigin(0.5);

      const label = this.add
        .text(homeX, BAR_Y + 8, String(def.cost), {
          fontFamily: 'Georgia, serif',
          fontSize: costSize,
          color: CSS.accent,
        })
        .setOrigin(0.5);

      // Damage-type stripe: the matrix, taught by colour rather than a manual.
      this.add.rectangle(homeX, BAR_Y + BTN_H / 2 - 7, btnW - 14, 5, DAMAGE_TINT[def.damageType]);

      const cooldownVeil = this.add
        .rectangle(homeX, BAR_Y + BTN_H / 2, btnW - 4, 0, 0x000000, 0.62)
        .setOrigin(0.5, 1);

      box.on('pointerdown', () => {
        if (!progression.isUnitUnlocked(unitId)) {
          this.refuse(box, homeX);
          return;
        }
        if (this.battle.deploy(unitId)) this.punch(box);
        else this.refuse(box, homeX);
      });
      box.on('pointerover', () => this.showTip(def, homeX));
      box.on('pointerout', () => this.hideTip());

      this.deployButtons.push({ unitId, box, cooldownVeil, label });
      x += btnW + UNIT_GAP;
    }
  }

  private buildAbilityBar(): void {
    const defs: readonly AbilityDef[] = [HERO_ABILITY, ...SPELLS];
    const totalW = defs.length * ABIL_BTN_W + (defs.length - 1) * ABIL_GAP;
    let x = ABIL_RIGHT - totalW + ABIL_BTN_W / 2;

    for (const def of defs) {
      const homeX = x;

      const box = this.add
        .rectangle(homeX, BAR_Y, ABIL_BTN_W, BTN_H, def.tint, 0.16)
        .setStrokeStyle(2, def.tint)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(homeX, BAR_Y - 24, def.name, {
          fontFamily: 'Georgia, serif',
          fontSize: '13px',
          color: CSS.text,
        })
        .setOrigin(0.5);

      const label = this.add
        .text(homeX, BAR_Y + 20, def.manaCost > 0 ? String(def.manaCost) : 'free', {
          fontFamily: 'Georgia, serif',
          fontSize: '15px',
          color: CSS.accent,
        })
        .setOrigin(0.5);

      const timer = this.add
        .text(homeX, BAR_Y - 2, '', {
          fontFamily: 'Georgia, serif',
          fontSize: '22px',
          color: CSS.text,
        })
        .setOrigin(0.5);

      const cooldownVeil = this.add
        .rectangle(homeX, BAR_Y + BTN_H / 2, ABIL_BTN_W - 4, 0, 0x000000, 0.62)
        .setOrigin(0.5, 1);

      box.on('pointerdown', () => {
        if (def.targeted) {
          if (this.battle.targetingAbility?.id === def.id) {
            this.battle.cancelTargeting();
            return;
          }
          if (this.battle.beginTargeting(def)) this.punch(box);
          else this.refuse(box, homeX);
          return;
        }

        if (this.battle.tryCast(def)) this.punch(box);
        else this.refuse(box, homeX);
      });

      this.abilityButtons.push({ def, box, cooldownVeil, label, timer });
      x += ABIL_BTN_W + ABIL_GAP;
    }
  }

  // --- tooltip -------------------------------------------------------------

  private buildTooltip(): void {
    const y = BAR_Y - BTN_H / 2 - 118;

    this.tipBox = this.add
      .rectangle(0, y, 320, 86, 0x0d1117, 0.95)
      .setStrokeStyle(2, PALETTE.accent, 0.7)
      .setVisible(false);

    this.tipTitle = this.add
      .text(0, y - 26, '', { fontFamily: 'Georgia, serif', fontSize: '17px', color: CSS.text })
      .setOrigin(0.5)
      .setVisible(false);

    this.tipRole = this.add
      .text(0, y - 2, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        color: CSS.muted,
        wordWrap: { width: 300 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.tipTypes = this.add
      .text(0, y + 26, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        color: CSS.accent,
      })
      .setOrigin(0.5)
      .setVisible(false);
  }

  private showTip(def: UnitDef, x: number): void {
    // Keep the panel on screen when hovering the leftmost buttons.
    const clampedX = Phaser.Math.Clamp(x, 170, GAME_WIDTH - 170);

    this.tipBox.x = clampedX;
    this.tipTitle.x = clampedX;
    this.tipRole.x = clampedX;
    this.tipTypes.x = clampedX;

    this.tipTitle.setText(def.name);
    this.tipRole.setText(def.role);
    this.tipTypes.setText(
      DAMAGE_LABEL[def.damageType] + ' damage   ·   ' + ARMOR_LABEL[def.armorType] + ' armour'
    );

    for (const o of [this.tipBox, this.tipTitle, this.tipRole, this.tipTypes]) o.setVisible(true);
  }

  private hideTip(): void {
    for (const o of [this.tipBox, this.tipTitle, this.tipRole, this.tipTypes]) o.setVisible(false);
  }

  // --- hero orders ---------------------------------------------------------

  private buildStanceBar(): void {
    const orders: { stance: Stance; label: string }[] = [
      { stance: 'charge', label: 'Advance' },
      { stance: 'hold', label: 'Hold' },
      { stance: 'retreat', label: 'Fall back' },
    ];

    this.add
      .text(STANCE_X - 39, FURY_BAR.y - 28, 'CHAMPION', {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: CSS.muted,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(2);

    let x = STANCE_X;
    for (const order of orders) {
      const box = this.add
        .rectangle(x, FURY_BAR.y, 78, 38, PALETTE.accent, 0.12)
        .setStrokeStyle(2, PALETTE.accent, 0.6)
        .setInteractive({ useHandCursor: true });

      this.add
        .text(x, FURY_BAR.y, order.label, {
          fontFamily: 'Georgia, serif',
          fontSize: '13px',
          color: CSS.text,
        })
        .setOrigin(0.5);

      box.on('pointerdown', () => this.battle.setHeroStance(order.stance));
      this.stanceButtons.push({ stance: order.stance, box });
      x += STANCE_STEP;
    }
  }

  // --- minimap -------------------------------------------------------------

  private buildMinimap(): void {
    this.add
      .rectangle(MINIMAP.x, MINIMAP.y, MINIMAP.w, MINIMAP.h, 0x000000, 0.55)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, PALETTE.groundLine, 0.9);

    this.minimap = this.add.graphics();

    // Click anywhere on the strip to jump the camera there.
    this.add
      .rectangle(MINIMAP.x, MINIMAP.y, MINIMAP.w, MINIMAP.h, 0x000000, 0.001)
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', (p: Phaser.Input.Pointer) => {
        const frac = Phaser.Math.Clamp((p.x - MINIMAP.x) / MINIMAP.w, 0, 1);
        this.battle.centerCameraOn(frac * WORLD_WIDTH);
      });
  }

  private drawMinimap(): void {
    const g = this.minimap;
    g.clear();

    const toX = (worldX: number) => MINIMAP.x + (worldX / WORLD_WIDTH) * MINIMAP.w;
    const top = MINIMAP.y - MINIMAP.h / 2;

    g.fillStyle(PALETTE.groundLine, 0.4);
    g.fillRect(MINIMAP.x, MINIMAP.y - 1, MINIMAP.w, 2);

    g.fillStyle(PALETTE.player, 1);
    g.fillRect(toX(PLAYER_CASTLE_X) - 2, top + 5, 5, MINIMAP.h - 10);
    g.fillStyle(PALETTE.enemy, 1);
    g.fillRect(toX(ENEMY_CASTLE_X) - 3, top + 5, 5, MINIMAP.h - 10);

    const hero = this.battle.hero;
    for (const u of this.battle.playerForces) {
      if (u.isDead) continue;
      g.fillStyle(u === hero ? PALETTE.accent : PALETTE.player, 1);
      g.fillRect(toX(u.x) - 1, MINIMAP.y - 8, 3, u === hero ? 16 : 7);
    }
    for (const u of this.battle.enemyForces) {
      if (u.isDead) continue;
      g.fillStyle(PALETTE.enemy, 1);
      g.fillRect(toX(u.x) - 1, MINIMAP.y + 1, 3, 7);
    }

    // Where the camera is looking.
    const vx = toX(this.battle.cameraScrollX);
    const vw = (GAME_WIDTH / WORLD_WIDTH) * MINIMAP.w;
    g.lineStyle(2, 0xe8e2d4, 0.85);
    g.strokeRect(vx, top + 1, vw, MINIMAP.h - 2);
  }

  private updateCommandButtons(): void {
    for (const b of this.stanceButtons) {
      const active = this.battle.heroStance === b.stance;
      b.box.setFillStyle(PALETTE.accent, active ? 0.42 : 0.12);
      b.box.setStrokeStyle(active ? 3 : 2, PALETTE.accent, active ? 1 : 0.6);
    }

    this.followText.setText(this.battle.cameraFollow ? 'Auto' : 'Free');
  }

  // --- feedback ------------------------------------------------------------

  private punch(box: Phaser.GameObjects.Rectangle): void {
    this.tweens.add({ targets: box, scale: 0.92, duration: 80, yoyo: true });
  }

  private refuse(box: Phaser.GameObjects.Rectangle, homeX: number): void {
    this.tweens.add({
      targets: box,
      x: { from: homeX - 5, to: homeX },
      duration: 90,
      ease: 'Bounce.Out',
    });
  }

  // --- frame ---------------------------------------------------------------

  override update(): void {
    const fury = this.battle.mana;
    if (!fury) return;

    this.furyFill.width = (FURY_BAR.w - 4) * fury.ratio;
    this.furyText.setText(Math.floor(fury.current) + ' / ' + fury.max);

    this.speedLabel.setText(this.battle.speed + 'x');
    this.pauseLabel.setText(this.battle.paused ? 'Resume' : 'Pause');
    this.pauseVeil.setVisible(this.battle.paused);

    for (const b of this.deployButtons) {
      const def = ALL_UNIT_DEFS[b.unitId]!;
      const cd = this.battle.cooldownRemaining(b.unitId);
      b.cooldownVeil.height = (BTN_H - 4) * (cd / def.deployCooldown);

      const owned = progression.isUnitUnlocked(b.unitId);
      const usable = owned && cd <= 0 && fury.canAfford(def.cost);

      b.box.setFillStyle(def.tint, usable ? 0.28 : 0.1);
      b.box.setStrokeStyle(2, def.tint, owned ? 1 : 0.25);
      b.label.setText(owned ? String(def.cost) : 'locked');
      b.label.setColor(usable ? CSS.accent : CSS.muted);
    }

    this.updateAbilityButtons();
    this.updateCommandButtons();
    this.drawMinimap();
    this.updateHint();
  }

  private updateAbilityButtons(): void {
    const armed = this.battle.targetingAbility;

    for (const b of this.abilityButtons) {
      const { def } = b;
      b.cooldownVeil.height = (BTN_H - 4) * this.battle.abilities.fraction(def.id);

      const heroGone = def.kind === 'shockwave' && !this.battle.hero;
      const usable = this.battle.canCast(def);
      const isArmed = armed?.id === def.id;

      b.box.setFillStyle(def.tint, usable ? 0.3 : 0.1);
      b.box.setStrokeStyle(isArmed ? 4 : 2, def.tint, isArmed ? 1 : 0.85);
      b.label.setColor(usable ? CSS.accent : CSS.muted);

      if (heroGone) {
        b.timer.setText(Math.ceil(Math.max(0, this.battle.heroRespawnMs) / 1000) + 's');
        b.timer.setColor(CSS.danger);
        continue;
      }

      const cd = this.battle.abilities.remaining(def.id);
      b.timer.setText(cd > 0 ? String(Math.ceil(cd / 1000)) : '');
      b.timer.setColor(CSS.text);
    }
  }

  private updateHint(): void {
    if (this.battle.paused) {
      this.hint.setText('PAUSED');
      return;
    }
    if (this.battle.targetingAbility) {
      this.hint.setText('Choose a target — click the battlefield   ( Esc to cancel )');
      return;
    }
    if (!this.battle.hero) {
      this.hint.setText('Fenrir has fallen');
      return;
    }
    this.hint.setText('');
  }
}
