import Phaser from 'phaser';
import { Castle } from '../entities/Castle';
import { Hero } from '../entities/Hero';
import { Unit } from '../entities/Unit';
import { AbilitySystem } from '../systems/AbilitySystem';
import { ManaSystem } from '../systems/ManaSystem';
import { WaveScheduler } from '../systems/SpawnSystem';
import { Vfx } from '../systems/Vfx';
import { progression } from '../systems/Progression';
import { ALL_ABILITIES } from '../config/Abilities';
import { ALL_UNIT_DEFS, HERO_RESPAWN_MS, SPEED_STEPS, THRALL_DEF } from '../config/Balance';
import { FIRST_STAGE_ID, STAGES, STAGES_BY_ID, type StageDef } from '../config/Campaign';
import { BIOMES, DEFAULT_BIOME } from '../config/Biomes';
import {
  CAMERA_PAN_SPEED,
  CSS,
  ENEMY_CASTLE_X,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_Y,
  PALETTE,
  PLAYER_CASTLE_X,
  WORLD_WIDTH,
} from '../config/GameConfig';
import type { AbilityDef, Stance, Team, UnitDef } from '../types';

/** Clicks below this are HUD, not battlefield. Screen coordinates, not world. */
const HUD_TOP = GROUND_Y + 45;

/** How long a fallen ally can still be raised by a Valkyrie. */
const GRAVE_TTL_MS = 15000;

/** Furthest the camera can scroll. */
const MAX_SCROLL = WORLD_WIDTH - GAME_WIDTH;

/** Pixels of pointer travel before a press becomes a drag rather than a click. */
const DRAG_THRESHOLD = 6;

/** Mouse within this many px of a viewport edge scrolls the field. */
const EDGE_ZONE = 55;

export class BattleScene extends Phaser.Scene {
  public mana!: ManaSystem;
  public abilities!: AbilitySystem;
  public hero: Hero | null = null;
  public heroRespawnMs = 0;
  public targetingAbility: AbilityDef | null = null;
  public paused = false;

  /**
   * Movement orders drive the champion only. Deployed troops always advance on
   * their own — you commit them by choosing what to deploy, not by steering them.
   */
  public heroStance: Stance = 'charge';
  public cameraFollow = true;

  private playerUnits: Unit[] = [];
  private enemyUnits: Unit[] = [];
  private playerCastle!: Castle;
  private enemyCastle!: Castle;
  private waves!: WaveScheduler;
  private reticle!: Phaser.GameObjects.Graphics;
  private nameTag!: Phaser.GameObjects.Text;
  private readonly cooldowns = new Map<string, number>();
  private over = false;
  private hitstopMs = 0;
  private speedIndex = 0;
  private stageId: string = FIRST_STAGE_ID;
  /** Where friendly units fell, and what they were. Feeds the Valkyrie. */
  private graveyard: { x: number; defId: string; ttl: number }[] = [];
  private panKeys?: Phaser.Input.Keyboard.Key[];
  private panKeysRight?: Phaser.Input.Keyboard.Key[];
  private dragging = false;
  private dragMoved = false;
  private dragStartX = 0;
  private dragStartScroll = 0;

  constructor() {
    super('Battle');
  }

  /** Scenes are started as `scene.start('Battle', { stageId })`. */
  init(data?: { stageId?: string }): void {
    if (data?.stageId && STAGES_BY_ID[data.stageId]) this.stageId = data.stageId;
  }

  get stage(): StageDef {
    return STAGES_BY_ID[this.stageId] ?? STAGES[0]!;
  }

  create(): void {
    this.over = false;
    this.hitstopMs = 0;
    this.playerUnits = [];
    this.enemyUnits = [];
    this.hero = null;
    this.heroRespawnMs = 0;
    this.targetingAbility = null;
    this.paused = false;
    this.speedIndex = 0;
    this.heroStance = 'charge';
    this.cameraFollow = true;
    this.applyTimeScale();
    this.cooldowns.clear();
    this.graveyard = [];
    Unit.resetLanes();

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
    this.cameras.main.setScroll(0, 0);

    this.buildBackdrop();

    this.playerCastle = new Castle(this, PLAYER_CASTLE_X, 'player', progression.lairHp());
    this.enemyCastle = new Castle(this, ENEMY_CASTLE_X, 'enemy', this.stage.enemyLairHp);

    const fury = progression.furyConfig();
    this.mana = new ManaSystem(fury.start, fury.max, fury.regen);
    this.abilities = new AbilitySystem(ALL_ABILITIES);
    this.waves = new WaveScheduler(this.stage.waves);

    this.reticle = this.add.graphics().setDepth(940);

    // Hover-to-identify. Point at anything on the field and it tells you what it is.
    this.nameTag = this.add
      .text(0, 0, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: CSS.text,
        backgroundColor: '#0d1117dd',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setDepth(960)
      .setVisible(false);

    this.spawnHero();

    this.dragging = false;
    this.dragMoved = false;
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.on('pointerupoutside', this.onPointerUp, this);
    this.input.on('wheel', this.onWheel, this);
    this.bindKeys();
    this.announceStage();

    this.scene.launch('UI');
  }

  /** Brief title card so the player knows where they are. */
  private announceStage(): void {
    const label = this.add
      .text(GAME_WIDTH / 2, 150, this.stage.name.toUpperCase(), {
        fontFamily: 'Georgia, serif',
        fontSize: '40px',
        color: CSS.text,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(480)
      .setLetterSpacing(4);

    const sub = this.add
      .text(GAME_WIDTH / 2, 186, BIOMES[this.stage.biome]?.name ?? '', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: CSS.muted,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(480);

    this.tweens.add({
      targets: [label, sub],
      alpha: 0,
      delay: 1600,
      duration: 900,
      onComplete: () => {
        label.destroy();
        sub.destroy();
      },
    });
  }

  private bindKeys(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    const K = Phaser.Input.Keyboard.KeyCodes;
    this.panKeys = [kb.addKey(K.LEFT), kb.addKey(K.A)];
    this.panKeysRight = [kb.addKey(K.RIGHT), kb.addKey(K.D)];

    // X advance / Z fall back mirror the original's bindings.
    kb.on('keydown-X', () => this.setHeroStance('charge'));
    kb.on('keydown-C', () => this.setHeroStance('hold'));
    kb.on('keydown-Z', () => this.setHeroStance('retreat'));
    kb.on('keydown-ESC', () => this.cancelTargeting());
  }

  // --- backdrop ------------------------------------------------------------

  /**
   * Three ridges at different scroll factors. Now that the camera actually
   * moves, this reads as real parallax rather than decoration.
   */
  private buildBackdrop(): void {
    const biome = BIOMES[this.stage.biome] ?? BIOMES[DEFAULT_BIOME]!;
    this.cameras.main.setBackgroundColor(biome.sky);

    // Atmospheric perspective, per biome: distant ridges hazier, near ones darker.
    let depth = -30;
    for (const layer of biome.ridges) {
      this.addRidge(depth, layer.color, layer.scrollFactor, layer.baseY, layer.amplitude, layer.phase);
      depth += 5;
    }

    const skirtH = GAME_HEIGHT - GROUND_Y;
    this.add
      .rectangle(WORLD_WIDTH / 2, GROUND_Y + skirtH / 2, WORLD_WIDTH, skirtH, biome.ground)
      .setDepth(-10);
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y, WORLD_WIDTH, 2, biome.groundLine).setDepth(-9);

    // Distance posts, so scrolling has something to read motion against.
    for (let x = 300; x < WORLD_WIDTH; x += 300) {
      this.add.rectangle(x, GROUND_Y + 16, 3, 22, biome.groundLine, 0.4).setDepth(-8);
    }
  }

  private addRidge(
    depth: number,
    color: number,
    scrollFactor: number,
    baseY: number,
    amplitude: number,
    phase: number
  ): void {
    const g = this.add.graphics().setDepth(depth).setScrollFactor(scrollFactor);
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(-120, GROUND_Y);

    for (let x = -120; x <= WORLD_WIDTH + 120; x += 150) {
      const n =
        Math.sin(x * 0.0042 + phase) * 0.6 + Math.sin(x * 0.0013 + phase * 1.7) * 0.4;
      g.lineTo(x, baseY - amplitude * (0.5 + 0.5 * n));
    }

    g.lineTo(WORLD_WIDTH + 120, GROUND_Y);
    g.closePath();
    g.fillPath();
  }

  // --- deployment ----------------------------------------------------------

  deploy(unitId: string): boolean {
    if (this.over) return false;
    const def = ALL_UNIT_DEFS[unitId];
    if (!def) return false;
    if (!progression.isUnitUnlocked(unitId)) return false;
    if (this.cooldownRemaining(unitId) > 0) return false;
    if (!this.mana.spend(def.cost)) return false;

    this.cooldowns.set(unitId, def.deployCooldown);
    this.spawn(unitId, 'player');
    return true;
  }

  cooldownRemaining(unitId: string): number {
    return this.cooldowns.get(unitId) ?? 0;
  }

  private spawn(unitId: string, team: Team): void {
    const def = progression.effectiveUnitDef(unitId);
    if (!def) return;
    const x = team === 'player' ? PLAYER_CASTLE_X + 60 : ENEMY_CASTLE_X - 60;
    this.spawnDef(def, x, team);
  }

  /** Place a unit from a definition. Troops always advance; only the hero takes orders. */
  private spawnDef(def: UnitDef, x: number, team: Team): Unit {
    const unit = new Unit(this, x, def, team);
    (team === 'player' ? this.playerUnits : this.enemyUnits).push(unit);
    return unit;
  }

  // --- legendary auras -----------------------------------------------------

  /**
   * Record friendly deaths and harvest enemy ones. Runs before the dead are
   * filtered out, so every death is seen exactly once.
   */
  private handleDeaths(): void {
    for (const u of this.playerUnits) {
      if (!u.isDead || u === this.hero) continue;
      // Thralls are already borrowed dead; they leave nothing to raise.
      if (u.def.id === THRALL_DEF.id) continue;
      this.graveyard.push({ x: u.x, defId: u.def.id, ttl: GRAVE_TTL_MS });
    }

    for (const e of this.enemyUnits) {
      if (e.isDead) this.tryRaise(e.x);
    }
  }

  /** Draugr Jarl: an enemy dying in its shadow gets back up on your side. */
  private tryRaise(x: number): void {
    for (const u of this.playerUnits) {
      const radius = u.def.traits?.raiseRadius;
      if (!radius || u.isDead || Math.abs(u.x - x) > radius) continue;

      this.spawnDef(THRALL_DEF, x, 'player');
      Vfx.pulse(this, x, GROUND_Y - 30, THRALL_DEF.tint);
      return;
    }
  }

  /** Valkyrie: pull one of your own back out of the graveyard. */
  private updateAuras(dtMs: number): void {
    for (const grave of this.graveyard) grave.ttl -= dtMs;
    this.graveyard = this.graveyard.filter((g) => g.ttl > 0);

    for (const u of [...this.playerUnits]) {
      const traits = u.def.traits;
      if (!traits?.reviveEveryMs || u.isDead) continue;

      u.auraTimer += dtMs;
      if (u.auraTimer < traits.reviveEveryMs) continue;

      const radius = traits.reviveRadius ?? 250;
      const index = this.graveyard.findIndex((g) => Math.abs(g.x - u.x) <= radius);
      if (index < 0) continue;

      u.auraTimer = 0;
      const grave = this.graveyard.splice(index, 1)[0]!;
      const def = progression.effectiveUnitDef(grave.defId);
      if (!def) continue;

      const revived = this.spawnDef(def, grave.x, 'player');
      revived.setHealth(Math.round(def.maxHp * 0.5));
      Vfx.pulse(this, grave.x, GROUND_Y - 40, ALL_UNIT_DEFS.valkyrie!.tint);
    }
  }

  private spawnHero(): void {
    this.hero = new Hero(this, PLAYER_CASTLE_X + 60, progression.effectiveHeroDef());
    this.playerUnits.push(this.hero);
    this.applyHeroStance();
    Vfx.pulse(this, this.hero.x, GROUND_Y - 40, PALETTE.accent);
  }

  // --- hero orders ---------------------------------------------------------

  /**
   * Order the champion to advance, hold, or fall back. Holding the hero back
   * while the line pushes on is the counter-tactic several bosses will demand.
   */
  setHeroStance(stance: Stance): void {
    if (this.over) return;
    this.heroStance = stance;
    this.applyHeroStance();
  }

  private applyHeroStance(): void {
    if (this.hero) this.hero.stance = this.heroStance;
  }

  // --- camera --------------------------------------------------------------

  get cameraScrollX(): number {
    return this.cameras.main.scrollX;
  }

  get playerForces(): readonly Unit[] {
    return this.playerUnits;
  }

  get enemyForces(): readonly Unit[] {
    return this.enemyUnits;
  }

  centerCameraOn(worldX: number): void {
    this.cameraFollow = false;
    this.cameras.main.scrollX = Phaser.Math.Clamp(worldX - GAME_WIDTH / 2, 0, MAX_SCROLL);
  }

  setCameraFollow(on: boolean): void {
    this.cameraFollow = on;
  }

  /** Where the fighting is: the midpoint of the two front lines. */
  private focusX(): number {
    let ourFront = -Infinity;
    for (const u of this.playerUnits) if (!u.isDead && u.x > ourFront) ourFront = u.x;

    let theirFront = Infinity;
    for (const u of this.enemyUnits) if (!u.isDead && u.x < theirFront) theirFront = u.x;

    if (ourFront > -Infinity && theirFront < Infinity) return (ourFront + theirFront) / 2;
    if (ourFront > -Infinity) return ourFront;
    if (theirFront < Infinity) return theirFront;
    return this.hero?.x ?? PLAYER_CASTLE_X;
  }

  /** Runs on real time, not scaled time, so panning feels the same at 3x. */
  private updateCamera(realDelta: number): void {
    const cam = this.cameras.main;

    const left = this.panKeys?.some((k) => k.isDown) ?? false;
    const right = this.panKeysRight?.some((k) => k.isDown) ?? false;
    let pan = (right ? 1 : 0) - (left ? 1 : 0);

    // Mouse edge scrolling. Skipped for touch, where dragging is the gesture.
    const p = this.input.activePointer;
    if (pan === 0 && !this.dragging && !p.wasTouch && p.y < HUD_TOP) {
      if (p.x < EDGE_ZONE) pan = -0.65;
      else if (p.x > GAME_WIDTH - EDGE_ZONE) pan = 0.65;
    }

    if (this.dragging && this.dragMoved) return;

    if (pan !== 0) {
      this.cameraFollow = false;
      cam.scrollX = Phaser.Math.Clamp(
        cam.scrollX + pan * CAMERA_PAN_SPEED * (realDelta / 1000),
        0,
        MAX_SCROLL
      );
      return;
    }

    if (this.cameraFollow) {
      const target = Phaser.Math.Clamp(this.focusX() - GAME_WIDTH / 2, 0, MAX_SCROLL);
      cam.scrollX = Phaser.Math.Linear(cam.scrollX, target, 0.05);
    }
  }

  // --- tempo ---------------------------------------------------------------

  get speed(): number {
    return SPEED_STEPS[this.speedIndex] ?? 1;
  }

  cycleSpeed(): number {
    this.speedIndex = (this.speedIndex + 1) % SPEED_STEPS.length;
    this.applyTimeScale();
    return this.speed;
  }

  togglePause(): boolean {
    this.paused = !this.paused;
    if (this.paused) this.cancelTargeting();
    this.applyTimeScale();
    return this.paused;
  }

  private applyTimeScale(): void {
    const scale = this.paused ? 0 : this.speed;
    this.time.timeScale = scale;
    this.tweens.timeScale = scale;
  }

  // --- abilities -----------------------------------------------------------

  canCast(def: AbilityDef): boolean {
    if (this.over) return false;
    if (!this.abilities.isReady(def.id)) return false;
    if (!this.mana.canAfford(def.manaCost)) return false;
    if (def.kind === 'shockwave' && !this.hero) return false;
    return true;
  }

  beginTargeting(def: AbilityDef): boolean {
    if (!this.canCast(def)) return false;
    this.targetingAbility = def;
    return true;
  }

  cancelTargeting(): void {
    this.targetingAbility = null;
    this.reticle.clear();
  }

  tryCast(def: AbilityDef, targetX?: number): boolean {
    if (!this.canCast(def)) return false;
    if (def.targeted && targetX === undefined) return false;

    this.mana.spend(def.manaCost);
    this.abilities.trigger(def);
    this.applyAbility(def, targetX ?? this.hero?.x ?? PLAYER_CASTLE_X);
    return true;
  }

  /**
   * Pointer on the battlefield does one of two things: it fires an armed spell,
   * or it drags the camera. Mouse and touch take the same path, which is what
   * makes the game playable on a phone at all.
   */
  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // The HUD is screen-fixed and owns its own input, so this test is in screen space.
    if (pointer.y >= HUD_TOP) return;

    const def = this.targetingAbility;
    if (def) {
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.tryCast(def, Phaser.Math.Clamp(world.x, 0, WORLD_WIDTH));
      this.cancelTargeting();
      return;
    }

    this.dragging = true;
    this.dragMoved = false;
    this.dragStartX = pointer.x;
    this.dragStartScroll = this.cameras.main.scrollX;
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.dragging || !pointer.isDown) return;

    const dx = pointer.x - this.dragStartX;
    if (!this.dragMoved && Math.abs(dx) > DRAG_THRESHOLD) {
      this.dragMoved = true;
      this.cameraFollow = false;
    }
    if (!this.dragMoved) return;

    // Content tracks the finger: drag left, the field moves left.
    this.cameras.main.scrollX = Phaser.Math.Clamp(this.dragStartScroll - dx, 0, MAX_SCROLL);
  }

  private onPointerUp(): void {
    this.dragging = false;
  }

  private onWheel(_p: unknown, _o: unknown, _dx: number, dy: number): void {
    this.cameraFollow = false;
    this.cameras.main.scrollX = Phaser.Math.Clamp(
      this.cameras.main.scrollX + dy * 0.7,
      0,
      MAX_SCROLL
    );
  }

  private applyAbility(def: AbilityDef, targetX: number): void {
    switch (def.kind) {
      case 'shockwave': {
        const cx = this.hero?.x ?? PLAYER_CASTLE_X;
        const radius = def.radius ?? 150;
        Vfx.shockwave(this, cx, GROUND_Y - 36, radius, def.tint);
        Vfx.banner(this, cx, def.name.toUpperCase(), CSS.accent);
        this.addHitstop(90);
        this.cameras.main.shake(240, 0.009);

        for (const e of this.enemyUnits) {
          if (e.isDead || Math.abs(e.x - cx) > radius) continue;
          e.takeDamage(def.damage ?? 0);
          e.knockback(40);
        }
        break;
      }

      case 'volley': {
        const radius = def.radius ?? 120;
        Vfx.volley(this, targetX, radius, def.tint);
        this.time.delayedCall(360, () => {
          if (this.over) return;
          for (const e of this.enemyUnits) {
            if (e.isDead || Math.abs(e.x - targetX) > radius) continue;
            e.takeDamage(def.damage ?? 0);
          }
          this.cameras.main.shake(200, 0.006);
        });
        break;
      }

      case 'rally': {
        for (const u of this.playerUnits) u.applyBuff(def.amount ?? 0.5, def.duration ?? 5000);
        Vfx.banner(this, this.hero?.x ?? PLAYER_CASTLE_X + 300, def.name.toUpperCase(), CSS.accent);
        break;
      }

      case 'heal': {
        const cx = this.hero?.x ?? PLAYER_CASTLE_X;
        const radius = def.radius ?? 200;
        Vfx.shockwave(this, cx, GROUND_Y - 36, radius, def.tint);
        for (const u of this.playerUnits) {
          if (u.isDead || Math.abs(u.x - cx) > radius) continue;
          u.heal(def.amount ?? 50);
        }
        break;
      }
    }
  }

  addHitstop(ms: number): void {
    this.hitstopMs = Math.max(this.hitstopMs, ms);
  }

  // --- loop ----------------------------------------------------------------

  override update(_time: number, delta: number): void {
    if (this.over) return;

    // Camera and reticle stay live while paused, so you can survey the field.
    this.updateCamera(delta);
    this.drawReticle();
    this.updateHoverLabel();
    if (this.paused) return;

    const dt = delta * this.speed;

    if (this.hitstopMs > 0) {
      this.hitstopMs -= dt;
      return;
    }

    this.mana.update(dt);
    this.abilities.update(dt);

    for (const [id, remaining] of this.cooldowns) {
      if (remaining > 0) this.cooldowns.set(id, Math.max(0, remaining - dt));
    }

    this.waves.update(dt, (id) => this.spawn(id, 'enemy'));

    const playerCtx = {
      allies: this.playerUnits,
      enemies: this.enemyUnits,
      enemyCastle: this.enemyCastle,
    };
    const enemyCtx = {
      allies: this.enemyUnits,
      enemies: this.playerUnits,
      enemyCastle: this.playerCastle,
    };

    for (const u of this.playerUnits) u.tick(dt, playerCtx);
    for (const u of this.enemyUnits) u.tick(dt, enemyCtx);

    this.handleDeaths();

    this.playerUnits = this.playerUnits.filter((u) => !u.isDead);
    this.enemyUnits = this.enemyUnits.filter((u) => !u.isDead);

    this.updateAuras(dt);
    this.updateHero(dt);

    if (this.enemyCastle.isDestroyed) this.finish(true);
    else if (this.playerCastle.isDestroyed) this.finish(false);
  }

  private updateHero(delta: number): void {
    if (this.hero?.isDead) {
      this.hero = null;
      this.heroRespawnMs = HERO_RESPAWN_MS;
      this.cancelTargeting();
      this.cameras.main.shake(300, 0.01);
    }

    if (!this.hero) {
      this.heroRespawnMs -= delta;
      if (this.heroRespawnMs <= 0) this.spawnHero();
    }
  }

  /** Name and health of whatever the pointer is over. Front ranks win ties. */
  private updateHoverLabel(): void {
    const p = this.input.activePointer;
    if (this.targetingAbility || p.y >= HUD_TOP) {
      this.nameTag.setVisible(false);
      return;
    }

    const world = this.cameras.main.getWorldPoint(p.x, p.y);
    let hit: Unit | null = null;

    for (const u of [...this.playerUnits, ...this.enemyUnits]) {
      if (u.isDead) continue;
      if (Math.abs(world.x - u.x) > u.def.radius + 5) continue;
      if (world.y < u.y - u.def.height - 14 || world.y > u.y + 8) continue;
      // Prefer the nearer rank when several overlap.
      if (!hit || u.y > hit.y) hit = u;
    }

    if (!hit) {
      this.nameTag.setVisible(false);
      return;
    }

    this.nameTag
      .setText(hit.def.name + '   ' + Math.max(0, Math.round(hit.hp)) + '/' + hit.def.maxHp)
      .setColor(hit.team === 'player' ? CSS.text : CSS.danger)
      .setPosition(hit.x, hit.y - hit.def.height - 22)
      .setVisible(true);
  }

  private drawReticle(): void {
    this.reticle.clear();
    const def = this.targetingAbility;
    if (!def) return;

    const p = this.input.activePointer;
    const world = this.cameras.main.getWorldPoint(p.x, p.y);
    const x = Phaser.Math.Clamp(world.x, 0, WORLD_WIDTH);
    const radius = def.radius ?? 100;

    this.reticle.lineStyle(2, def.tint, 0.85);
    this.reticle.strokeEllipse(x, GROUND_Y - 8, radius * 2, 44);
    this.reticle.lineBetween(x, GROUND_Y - 220, x, GROUND_Y - 40);
  }

  // --- results -------------------------------------------------------------

  private computeStars(): number {
    const ratio = this.playerCastle.hp / this.playerCastle.maxHp;
    if (ratio >= 0.9) return 3;
    if (ratio >= 0.6) return 2;
    return 1;
  }

  private finish(victory: boolean): void {
    if (this.over) return;
    this.over = true;
    this.cancelTargeting();
    this.cameras.main.shake(320, 0.006);
    this.scene.stop('UI');

    const stars = victory ? this.computeStars() : 0;
    const { earned, unlocked } = progression.recordStageResult(this.stageId, victory, stars);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // The overlay is screen-fixed, so it must ignore camera scroll.
    this.add
      .rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.78)
      .setScrollFactor(0)
      .setDepth(500);

    this.add
      .text(cx, cy - 155, victory ? 'VICTORY' : 'DEFEAT', {
        fontFamily: 'Georgia, serif',
        fontSize: '64px',
        color: victory ? CSS.text : CSS.danger,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(501);

    if (victory) {
      for (let i = 0; i < 3; i++) {
        const filled = i < stars;
        const star = this.add
          .star(cx - 66 + i * 66, cy - 78, 5, 12, 26, filled ? PALETTE.accent : 0x2f2a22)
          .setStrokeStyle(2, PALETTE.accent, filled ? 1 : 0.55)
          .setScrollFactor(0)
          .setDepth(501);

        if (filled) {
          star.setScale(0);
          this.tweens.add({
            targets: star,
            scale: 1,
            duration: 260,
            delay: 180 * i,
            ease: 'Back.Out',
          });
        }
      }
    }

    this.add
      .text(cx, cy - 8, '+' + earned + ' runes', {
        fontFamily: 'Georgia, serif',
        fontSize: '30px',
        color: CSS.accent,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(501);

    this.add
      .text(cx, cy + 28, progression.runes + ' runes in hand', {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: CSS.muted,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(501);

    if (unlocked) {
      const name = ALL_UNIT_DEFS[unlocked]?.name ?? unlocked;
      this.add
        .text(cx, cy + 58, 'UNLOCKED — ' + name.toUpperCase(), {
          fontFamily: 'Georgia, serif',
          fontSize: '19px',
          color: CSS.accent,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(501)
        .setLetterSpacing(2);
    }

    const y = cy + 118;
    this.resultButton(cx - 175, y, 'Retry', () => this.scene.start('Battle', { stageId: this.stageId }));
    this.resultButton(cx, y, 'World map', () => this.scene.start('Map'));
    this.resultButton(cx + 175, y, 'Barracks', () => this.scene.start('Barracks'));
  }

  private resultButton(x: number, y: number, label: string, onClick: () => void): void {
    const box = this.add
      .rectangle(x, y, 158, 52, PALETTE.accent, 0.14)
      .setStrokeStyle(2, PALETTE.accent)
      .setScrollFactor(0)
      .setDepth(501)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y, label, {
        fontFamily: 'Georgia, serif',
        fontSize: '19px',
        color: CSS.text,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(502);

    box.on('pointerover', () => box.setFillStyle(PALETTE.accent, 0.32));
    box.on('pointerout', () => box.setFillStyle(PALETTE.accent, 0.14));
    box.on('pointerup', onClick);
  }
}
