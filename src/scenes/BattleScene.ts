import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { PATHS } from '../data/paths';
import { loadSave, writeSave, type Life, type Relation, type SaveData } from '../state/save';
import {
  finishBattle,
  fleeChance,
  playerCombat,
  playRound,
  startBattle,
  type Action,
  type Battle,
  type Enemy,
} from '../systems/battle';
import { realmName } from '../systems/cultivation';
import { characterKey, fit, monsterPath } from '../ui/art';
import { button, label, type Button } from '../ui/widgets';

export interface BattleSetup {
  enemies: Enemy[];
  /** Câu dẫn vào trận, ví dụ "Dị thú chặn đường". */
  intro: string;
  /** Tu sĩ đang giao đấu, nếu có: kết quả trận sẽ ghi vào quan hệ với người này. */
  npc?: Relation;
}

interface EnemyView {
  body: Phaser.GameObjects.Arc;
  icon: Phaser.GameObjects.Image;
  bar: Phaser.GameObjects.Rectangle;
  hpText: Phaser.GameObjects.Text;
  x: number;
  y: number;
}

const ENEMY_Y = 360;
const ENEMY_BAR = 130;
const PLAYER_BAR = 400;

/** Màn hình trận đấu theo lượt: một mình đấu với một tới bốn kẻ địch. */
export class BattleScene extends Phaser.Scene {
  private save!: SaveData;
  private life!: Life;
  private setup!: BattleSetup;
  private battle!: Battle;
  private views: EnemyView[] = [];
  private logLines: Phaser.GameObjects.Text[] = [];
  private history: string[] = [];
  private hpBar!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private skillButton!: Button;
  private fleeButton!: Button;
  private buttons: Button[] = [];
  private busy = false;

  constructor() {
    super('Battle');
  }

  init(data: BattleSetup): void {
    this.setup = data;
  }

  preload(): void {
    // Chỉ nạp hình của những dị thú có mặt trong trận này.
    for (const enemy of this.setup?.enemies ?? []) {
      if (enemy.file && !this.textures.exists(enemy.image)) this.load.image(enemy.image, monsterPath(enemy.file));
    }
  }

  create(): void {
    this.save = loadSave();
    if (!this.save.life || !this.setup?.enemies?.length) {
      this.scene.start('Map');
      return;
    }
    this.life = this.save.life;
    this.battle = startBattle(this.life, this.setup.enemies);
    this.views = [];
    this.logLines = [];
    this.history = [];
    this.buttons = [];
    this.busy = false;

    const cx = GAME_WIDTH / 2;
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x140d14);
    this.add.rectangle(cx, 390, GAME_WIDTH, 440, 0x24121a, 0.9);
    label(this, cx, 70, 'Giao chiến', 44, '#ff8a8a');
    label(this, cx, 132, this.setup.intro, 22, '#c9d4e8').setWordWrapWidth(660);

    this.drawEnemies();
    for (let i = 0; i < 4; i += 1) {
      this.logLines.push(label(this, cx, 630 + i * 38, '', 21, '#8a94a8').setWordWrapWidth(680));
    }
    this.drawPlayer();
    this.drawButtons();
    this.cameras.main.flash(300, 255, 60, 60);
    this.refresh();
  }

  private drawEnemies(): void {
    const count = this.battle.enemies.length;
    const spacing = 172;
    const startX = GAME_WIDTH / 2 - ((count - 1) * spacing) / 2;
    this.battle.enemies.forEach((enemy, index) => {
      const x = startX + index * spacing;
      const body = this.add
        .circle(x, ENEMY_Y, 74, 0x1a2233, 0.6)
        .setStrokeStyle(5, 0xe05d5d, 1)
        .setInteractive({ useHandCursor: true });
      const icon = this.add.image(x, ENEMY_Y, enemy.image);
      fit(icon, 160, 170);
      label(this, x, ENEMY_Y + 104, enemy.name, 19, '#e8f0ff').setWordWrapWidth(164);
      this.add.rectangle(x - ENEMY_BAR / 2, ENEMY_Y + 150, ENEMY_BAR, 12, 0x3a1a1a, 1).setOrigin(0, 0.5);
      const bar = this.add.rectangle(x - ENEMY_BAR / 2, ENEMY_Y + 150, ENEMY_BAR, 12, 0xe05d5d, 1).setOrigin(0, 0.5);
      const hpText = label(this, x, ENEMY_Y + 174, '', 18, '#c9d4e8');
      body.on('pointerdown', () => {
        if (this.busy || enemy.hp === 0) return;
        this.battle.target = index;
        this.refresh();
      });
      this.tweens.add({ targets: [body, icon], y: ENEMY_Y - 8, duration: 900 + index * 130, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.views.push({ body, icon, bar, hpText, x, y: ENEMY_Y });
    });
  }

  private drawPlayer(): void {
    const portrait = this.add.image(130, 905, characterKey(this.save.character?.gender ?? 'nam', this.save.character?.skin ?? 1));
    fit(portrait, 190, 290);
    label(this, 250, 830, realmName(this.life), 30, '#e8f0ff').setOrigin(0, 0.5);
    this.add.rectangle(250, 880, PLAYER_BAR, 22, 0x1c2740, 1).setOrigin(0, 0.5);
    this.hpBar = this.add.rectangle(250, 880, PLAYER_BAR, 22, 0x7fe08a, 1).setOrigin(0, 0.5);
    this.hpText = label(this, 250, 922, '', 22, '#c9d4e8').setOrigin(0, 0.5);
    if (this.life.injured) label(this, 250, 962, 'Đang thương nặng: thua trận này là bỏ mạng', 20, '#ff8a8a').setOrigin(0, 0.5);
  }

  private drawButtons(): void {
    const me = playerCombat(this.life);
    const color = PATHS[this.life.path].color;
    const attack = button(this, 190, 1080, 320, 80, 'Đánh thường', 0xc9d4e8, () => this.act('attack'), 26);
    this.skillButton = button(this, 530, 1080, 320, 80, me.skillName, color, () => this.act('skill'), 26);
    const defend = button(this, 190, 1180, 320, 80, 'Phòng thủ', 0xc9d4e8, () => this.act('defend'), 26);
    this.fleeButton = button(this, 530, 1180, 320, 80, 'Bỏ chạy', 0x8a94a8, () => this.act('flee'), 26);
    this.buttons = [attack, this.skillButton, defend, this.fleeButton];
  }

  private refresh(): void {
    const me = playerCombat(this.life);
    this.battle.enemies.forEach((enemy, index) => {
      const view = this.views[index];
      const alive = enemy.hp > 0;
      view.bar.setDisplaySize(Math.max((ENEMY_BAR * enemy.hp) / enemy.maxHp, 0.01), 12);
      view.hpText.setText(alive ? `${enemy.hp} / ${enemy.maxHp}` : 'Đã gục');
      view.body.setAlpha(alive ? 1 : 0.25);
      view.icon.setAlpha(alive ? 1 : 0.25);
      const targeted = alive && index === this.battle.target;
      view.body.setStrokeStyle(targeted ? 8 : 5, targeted ? 0xffd36b : 0xe05d5d, 1);
    });
    const ratio = Phaser.Math.Clamp(this.battle.hp / me.maxHp, 0, 1);
    this.hpBar.setDisplaySize(Math.max(PLAYER_BAR * ratio, 0.01), 22);
    this.hpBar.setFillStyle(ratio > 0.5 ? 0x7fe08a : ratio > 0.25 ? 0xffd36b : 0xff5c5c);
    this.hpText.setText(`Máu ${this.battle.hp} / ${me.maxHp}`);
    const ready = this.battle.cooldown === 0;
    this.skillButton.setLabel(ready ? me.skillName : `${me.skillName} (chờ ${this.battle.cooldown} lượt)`);
    this.skillButton.setEnabled(ready);
    this.fleeButton.setLabel(`Bỏ chạy · ${Math.round(fleeChance(this.life, this.battle) * 100)}%`);

    const recent = this.history.slice(-4);
    this.logLines.forEach((line, index) => {
      line.setText(recent[index] ?? '');
      line.setColor(index === recent.length - 1 ? '#ffffff' : '#8a94a8');
    });
  }

  private act(action: Action): void {
    if (this.busy || this.battle.outcome !== 'ongoing') return;
    this.busy = true;
    const result = playRound(this.life, this.battle, action);
    this.history.push(...result.log);

    result.hits.forEach((hit, index) => {
      this.time.delayedCall(index * 220, () => {
        if (hit.target === -1) {
          if (!hit.dodged) this.cameras.main.shake(160, 0.012);
          this.floatText(130, 800, hit.dodged ? 'Né' : `-${hit.damage}`, hit.dodged ? '#9dffb0' : '#ff8a8a');
          return;
        }
        const view = this.views[hit.target];
        if (!hit.dodged) {
          this.tweens.add({ targets: [view.body, view.icon], x: view.x + 14, duration: 45, yoyo: true, repeat: 2 });
        }
        this.floatText(view.x, view.y - 80, hit.dodged ? 'Né' : `-${hit.damage}`, hit.crit ? '#ffd36b' : '#ffffff', hit.crit ? 46 : 34);
      });
    });

    this.time.delayedCall(result.hits.length * 220 + 150, () => {
      this.refresh();
      if (this.battle.outcome === 'ongoing') {
        this.busy = false;
        return;
      }
      this.time.delayedCall(450, () => this.finish());
    });
  }

  private floatText(x: number, y: number, text: string, color: string, size = 34): void {
    const item = label(this, x, y, text, size, color).setStroke('#0b0f1a', 6).setDepth(50);
    this.tweens.add({ targets: item, y: y - 90, alpha: 0, duration: 800, ease: 'Cubic.easeOut', onComplete: () => item.destroy() });
  }

  private finish(): void {
    const summary = finishBattle(this.life, this.battle);
    const notes: string[] = [summary.detail];

    const npc = this.setup.npc;
    if (npc) {
      const known = this.life.relations.find((item) => item.name === npc.name);
      if (this.battle.outcome === 'won' && known?.status === 'thu') {
        // Hạ được kẻ thù cũ thì dứt hậu họa.
        this.life.relations = this.life.relations.filter((item) => item.name !== npc.name);
        notes.push(`${npc.name} không còn là mối họa.`);
      } else {
        if (known) known.status = 'thu';
        else this.life.relations.push({ ...npc, status: 'thu' });
        notes.push(
          this.battle.outcome === 'won'
            ? `${npc.name} trọng thương bỏ chạy và ghi thù ngươi.`
            : `${npc.name} từ nay là kẻ thù của ngươi.`,
        );
      }
    }
    writeSave(this.save);

    const cx = GAME_WIDTH / 2;
    this.buttons.forEach((item) => item.setEnabled(false));
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05080f, 0.9).setInteractive().setDepth(60);
    const won = this.battle.outcome === 'won';
    const lost = this.battle.outcome === 'lost';
    label(this, cx, 420, summary.title, 60, won ? '#ffd36b' : lost ? '#ff8a8a' : '#c9d4e8').setDepth(61);
    label(this, cx, 590, notes.join('\n\n'), 26, '#e8f0ff').setWordWrapWidth(620).setLineSpacing(8).setDepth(61);
    const next = button(this, cx, 820, 420, 84, 'Tiếp tục', PATHS[this.life.path].color, () => this.scene.start('Map'));
    next.objects.forEach((item) => item.setDepth(62));
    if (won) this.cameras.main.flash(500, 255, 220, 120);
  }
}
