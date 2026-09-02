import Phaser from 'phaser';
import { progression } from '../systems/Progression';
import { GLOBAL_UPGRADES } from '../config/Upgrades';
import { ARMOR_LABEL, DAMAGE_LABEL, DAMAGE_TINT } from '../config/Counters';
import { ALL_UNIT_DEFS, LEGENDARY_ROSTER, ROSTER } from '../config/Balance';
import { CSS, GAME_HEIGHT, GAME_WIDTH, PALETTE } from '../config/GameConfig';

const LINK_X = 40;
const LINK_W = 470;
const LINK_H = 84;
const LINK_GAP = 12;

const CARD_W = 220;
const CARD_H = 84;
const CARD_GAP_X = 12;
const CARD_GAP_Y = 12;
const CARDS_X = 552;
const CARD_COLS = 3;

const FIRST_ROW_Y = 210;

interface Row {
  kind: 'link' | 'unit';
  id: string;
  levelText: Phaser.GameObjects.Text;
  costText: Phaser.GameObjects.Text;
  buyBox: Phaser.GameObjects.Rectangle;
}

/**
 * Spend runes between battles.
 *
 * Framed as Fenrir mastering the chain that bound him — the six impossible
 * ingredients of Gleipnir are the upgrade branches. See STORY.md.
 */
export class BarracksScene extends Phaser.Scene {
  private rows: Row[] = [];
  private runeText!: Phaser.GameObjects.Text;

  constructor() {
    super('Barracks');
  }

  create(): void {
    this.rows = [];
    this.cameras.main.setBackgroundColor(PALETTE.sky);

    this.add
      .text(GAME_WIDTH / 2, 46, 'THE BREAKING OF GLEIPNIR', {
        fontFamily: 'Georgia, serif',
        fontSize: '34px',
        color: CSS.text,
      })
      .setOrigin(0.5)
      .setLetterSpacing(3);

    this.add
      .text(GAME_WIDTH / 2, 80, 'every link you master is a piece of their cruelty turned back', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: CSS.muted,
      })
      .setOrigin(0.5);

    this.runeText = this.add
      .text(GAME_WIDTH / 2, 114, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '23px',
        color: CSS.accent,
      })
      .setOrigin(0.5);

    this.sectionHeader(LINK_X, FIRST_ROW_Y - 56, 'THE CHAIN');
    this.sectionHeader(CARDS_X, FIRST_ROW_Y - 56, 'THE WARBAND');

    GLOBAL_UPGRADES.forEach((def, i) => {
      this.buildLinkRow(
        def.id,
        LINK_X,
        FIRST_ROW_Y + i * (LINK_H + LINK_GAP),
        def.name,
        def.description
      );
    });

    // Roster plus whichever legendaries have been earned.
    const owned = [
      ...ROSTER,
      ...LEGENDARY_ROSTER.filter((id) => progression.isUnitUnlocked(id)),
    ];

    owned.forEach((unitId, i) => {
      const col = i % CARD_COLS;
      const row = Math.floor(i / CARD_COLS);
      this.buildUnitCard(
        unitId,
        CARDS_X + col * (CARD_W + CARD_GAP_X),
        FIRST_ROW_Y + row * (CARD_H + CARD_GAP_Y)
      );
    });

    this.buildBackButton();
    this.refresh();
  }

  private sectionHeader(x: number, y: number, label: string): void {
    this.add
      .text(x, y, label, {
        fontFamily: 'Georgia, serif',
        fontSize: '15px',
        color: CSS.muted,
      })
      .setLetterSpacing(2);
  }

  private buildLinkRow(
    id: string,
    x: number,
    y: number,
    title: string,
    description: string
  ): void {
    this.add
      .rectangle(x, y, LINK_W, LINK_H, PALETTE.accent, 0.08)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, PALETTE.accent, 0.5);

    this.add.text(x + 18, y - 26, title, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: CSS.text,
    });

    this.add.text(x + 18, y, description, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: CSS.muted,
    });

    const levelText = this.add.text(x + 18, y + 22, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: CSS.accent,
    });

    const { buyBox, costText } = this.buyButton(x + LINK_W - 78, y, 132, 52, PALETTE.accent, () =>
      progression.buyUpgrade(id)
    );

    this.rows.push({ kind: 'link', id, levelText, costText, buyBox });
  }

  private buildUnitCard(unitId: string, x: number, y: number): void {
    const def = ALL_UNIT_DEFS[unitId]!;

    this.add
      .rectangle(x, y, CARD_W, CARD_H, def.tint, 0.09)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, def.tint, 0.55);

    // Damage-type stripe down the left edge, matching the battle HUD.
    this.add.rectangle(x + 4, y, 5, CARD_H - 16, DAMAGE_TINT[def.damageType]).setOrigin(0, 0.5);

    this.add.text(x + 16, y - 30, def.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: def.elite ? CSS.accent : CSS.text,
    });

    this.add.text(x + 16, y - 10, DAMAGE_LABEL[def.damageType] + ' · ' + ARMOR_LABEL[def.armorType], {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: CSS.muted,
    });

    const levelText = this.add.text(x + 16, y + 10, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: CSS.accent,
    });

    const { buyBox, costText } = this.buyButton(x + CARD_W - 56, y, 96, 44, def.tint, () =>
      progression.buyUnitLevel(unitId)
    );

    this.rows.push({ kind: 'unit', id: unitId, levelText, costText, buyBox });
  }

  private buyButton(
    x: number,
    y: number,
    w: number,
    h: number,
    tint: number,
    action: () => boolean
  ): { buyBox: Phaser.GameObjects.Rectangle; costText: Phaser.GameObjects.Text } {
    const buyBox = this.add
      .rectangle(x, y, w, h, tint, 0.18)
      .setStrokeStyle(2, tint)
      .setInteractive({ useHandCursor: true });

    const costText = this.add
      .text(x, y, '', { fontFamily: 'Georgia, serif', fontSize: '13px', color: CSS.text })
      .setOrigin(0.5);

    buyBox.on('pointerover', () => buyBox.setFillStyle(tint, 0.34));
    buyBox.on('pointerout', () => buyBox.setFillStyle(tint, 0.18));
    buyBox.on('pointerdown', () => {
      if (action()) {
        this.tweens.add({ targets: buyBox, scale: 0.93, duration: 80, yoyo: true });
        this.refresh();
      } else {
        this.tweens.add({
          targets: buyBox,
          x: { from: x - 5, to: x },
          duration: 90,
          ease: 'Bounce.Out',
        });
      }
    });

    return { buyBox, costText };
  }

  private buildBackButton(): void {
    const y = GAME_HEIGHT - 40;

    const box = this.add
      .rectangle(LINK_X + LINK_W / 2, y, 220, 50, PALETTE.accent, 0.14)
      .setStrokeStyle(2, PALETTE.accent)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(LINK_X + LINK_W / 2, y, 'To the map', {
        fontFamily: 'Georgia, serif',
        fontSize: '19px',
        color: CSS.text,
      })
      .setOrigin(0.5);

    box.on('pointerover', () => box.setFillStyle(PALETTE.accent, 0.32));
    box.on('pointerout', () => box.setFillStyle(PALETTE.accent, 0.14));
    box.on('pointerup', () => this.scene.start('Map'));
  }

  /** Repaint every row from the current save state. */
  private refresh(): void {
    this.runeText.setText(progression.runes + ' runes');

    for (const row of this.rows) {
      const level =
        row.kind === 'link' ? progression.upgradeLevel(row.id) : progression.unitLevel(row.id);
      const cost =
        row.kind === 'link' ? progression.upgradeCost(row.id) : progression.unitLevelCost(row.id);

      row.levelText.setText('Level ' + level);

      if (cost === null) {
        row.costText.setText('MASTERED');
        row.costText.setColor(CSS.muted);
        row.buyBox.setAlpha(0.35);
        continue;
      }

      const affordable = progression.runes >= cost;
      row.costText.setText(cost + ' runes');
      row.costText.setColor(affordable ? CSS.text : CSS.muted);
      row.buyBox.setAlpha(affordable ? 1 : 0.45);
    }
  }
}
