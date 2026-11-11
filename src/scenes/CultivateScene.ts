import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { PATHS, STAT_HINTS, STAT_LABELS, type Stats } from '../data/paths';
import { emptySave, loadSave, writeSave, type Character, type SaveData } from '../state/save';
import {
  advance,
  applyOfflineGain,
  canAdvance,
  energyRate,
  energyRequired,
  isAtPeak,
  isBreakthrough,
  realmName,
  tapGain,
} from '../systems/cultivation';
import { button, formatNumber, label, type Button } from '../ui/widgets';

const BAR_WIDTH = 560;

/** Màn hình tu luyện: tích năng lượng, lên giai đoạn, đột phá, xem chỉ số. */
export class CultivateScene extends Phaser.Scene {
  private save!: SaveData;
  private c!: Character;
  private realmText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private rateText!: Phaser.GameObjects.Text;
  private barFill!: Phaser.GameObjects.Rectangle;
  private advanceButton!: Button;
  private statsPanel: Phaser.GameObjects.GameObject[] = [];
  private resetArmed = false;
  private sinceSave = 0;

  constructor() {
    super('Cultivate');
  }

  create(): void {
    this.save = loadSave();
    if (!this.save.character) {
      this.scene.start('Create');
      return;
    }
    this.c = this.save.character;
    this.statsPanel = [];
    this.resetArmed = false;
    const offlineGain = applyOfflineGain(this.c, Date.now());

    const def = PATHS[this.c.path];
    const cx = GAME_WIDTH / 2;
    const colorHex = `#${def.color.toString(16).padStart(6, '0')}`;

    label(this, cx, 80, def.name, 34, colorHex);
    this.realmText = label(this, cx, 150, '', 56);
    label(this, cx, 220, this.talentLine(), 24, '#8a94a8');

    this.add.rectangle(cx, 320, BAR_WIDTH, 28, 0x1c2740, 1).setStrokeStyle(2, 0xffffff, 0.2);
    this.barFill = this.add
      .rectangle(cx - BAR_WIDTH / 2, 320, BAR_WIDTH, 28, def.color, 1)
      .setOrigin(0, 0.5);
    this.energyText = label(this, cx, 370, '', 28, '#c9d4e8');
    this.rateText = label(this, cx, 410, '', 22, '#8a94a8');

    const orbY = 640;
    const halo = this.add.circle(cx, orbY, 190, def.color, 0.16);
    const orb = this.add.circle(cx, orbY, 130, def.color, 0.92);
    orb.setInteractive({ useHandCursor: true });
    this.tweens.add({
      targets: halo,
      scale: 1.25,
      alpha: 0.04,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    orb.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const gain = tapGain(this.c);
      this.c.energy += gain;
      this.tweens.add({ targets: orb, scale: 1.1, duration: 70, yoyo: true });
      this.floatText(pointer.x, pointer.y, `+${gain.toFixed(1)}`);
      this.refresh();
    });
    label(this, cx, 870, `Chạm để hấp thụ ${def.energyName.toLowerCase()}`, 24, '#8a94a8');

    this.advanceButton = button(this, cx, 975, 460, 84, '', def.color, () => this.tryAdvance());
    button(this, cx, 1105, 460, 70, this.save.life ? 'Tiếp tục lịch luyện' : 'Lịch luyện kiếp mới', 0xffd36b, () => {
      this.persist();
      this.scene.start('Map');
    }, 26);
    label(
      this,
      cx,
      1160,
      `Đã trải ${this.save.livesLived} kiếp  ·  Điểm luân hồi: ${this.save.luanHoiPoints}`,
      22,
      '#8a94a8',
    );
    button(this, cx - 150, 1220, 260, 60, 'Chỉ số', 0xc9d4e8, () => this.toggleStats(), 24);
    const resetButton = button(this, cx + 150, 1220, 260, 60, 'Tạo lại', 0x8a94a8, () => {
      if (!this.resetArmed) {
        this.resetArmed = true;
        resetButton.setLabel('Chắc chắn xóa?');
        this.time.delayedCall(3000, () => {
          this.resetArmed = false;
          resetButton.setLabel('Tạo lại');
        });
        return;
      }
      writeSave(emptySave());
      this.scene.start('Create');
    }, 24);

    if (offlineGain > 0) {
      const note = label(
        this,
        cx,
        470,
        `Bế quan lúc vắng mặt: +${formatNumber(offlineGain)} ${def.energyName.toLowerCase()}`,
        24,
        '#ffd36b',
      );
      this.tweens.add({ targets: note, alpha: 0, delay: 4000, duration: 1000 });
    }

    this.refresh();
    this.persist();
  }

  update(_time: number, delta: number): void {
    if (!this.c) return;
    this.c.energy += (energyRate(this.c) * delta) / 1000;
    this.sinceSave += delta;
    if (this.sinceSave >= 2000) this.persist();
    this.refresh();
  }

  private talentLine(): string {
    const linhCan = `${this.c.linhCan.name} (${this.c.linhCan.elements.join(', ')})`;
    if (!this.c.banMenh) return linhCan;
    return `${linhCan}  ·  Bản mệnh: ${this.c.banMenh.element} ${this.c.banMenh.grade}`;
  }

  private persist(): void {
    this.sinceSave = 0;
    this.c.lastSeen = Date.now();
    writeSave(this.save);
  }

  private refresh(): void {
    const def = PATHS[this.c.path];
    const required = energyRequired(this.c);
    this.realmText.setText(realmName(this.c));
    this.rateText.setText(`+${energyRate(this.c).toFixed(1)} mỗi giây`);

    if (isAtPeak(this.c)) {
      this.barFill.setDisplaySize(BAR_WIDTH, 28);
      this.energyText.setText(`${def.energyName}: ${formatNumber(this.c.energy)}`);
      this.advanceButton.setLabel('Đỉnh Nhân giới');
      this.advanceButton.setEnabled(false);
      return;
    }

    const ratio = Phaser.Math.Clamp(this.c.energy / required, 0, 1);
    this.barFill.setDisplaySize(Math.max(BAR_WIDTH * ratio, 1), 28);
    this.energyText.setText(
      `${def.energyName}: ${formatNumber(this.c.energy)} / ${formatNumber(required)}`,
    );
    this.advanceButton.setLabel(isBreakthrough(this.c) ? 'Đột phá' : 'Lên giai đoạn');
    this.advanceButton.setEnabled(canAdvance(this.c));
  }

  private tryAdvance(): void {
    const major = isBreakthrough(this.c);
    const gained = advance(this.c);
    if (!gained) return;
    this.persist();
    this.refresh();
    if (this.statsPanel.length > 0) {
      this.toggleStats();
      this.toggleStats();
    }

    const cx = GAME_WIDTH / 2;
    if (major) {
      this.cameras.main.flash(600, 255, 255, 255);
      this.cameras.main.shake(350, 0.012);
    } else {
      this.cameras.main.flash(250, 180, 220, 255);
    }
    this.tweens.add({
      targets: this.realmText,
      scale: { from: 1.5, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });
    const summary = (Object.keys(gained) as (keyof Stats)[])
      .map((key) => `${STAT_LABELS[key]} +${gained[key]}`)
      .join('   ');
    const note = label(this, cx, 470, summary, 24, '#9dffb0');
    note.setWordWrapWidth(640);
    this.tweens.add({ targets: note, alpha: 0, delay: 2500, duration: 800, onComplete: () => note.destroy() });
  }

  private toggleStats(): void {
    if (this.statsPanel.length > 0) {
      this.statsPanel.forEach((item) => item.destroy());
      this.statsPanel = [];
      return;
    }
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const backdrop = this.add
      .rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)
      .setInteractive();
    backdrop.on('pointerdown', () => this.toggleStats());
    const panel = this.add.rectangle(cx, cy, 620, 760, 0x162033, 1).setStrokeStyle(2, 0xffffff, 0.3);
    this.statsPanel.push(backdrop, panel, label(this, cx, cy - 320, 'Chỉ số', 44));

    (Object.keys(STAT_LABELS) as (keyof Stats)[]).forEach((key, index) => {
      const y = cy - 220 + index * 90;
      this.statsPanel.push(
        label(this, cx - 130, y, STAT_LABELS[key], 32).setOrigin(0, 0.5).setX(cx - 270),
        label(this, cx + 250, y, String(this.c.stats[key]), 36, '#ffd36b').setOrigin(1, 0.5),
        label(this, cx - 270, y + 34, STAT_HINTS[key], 20, '#8a94a8').setOrigin(0, 0.5),
      );
    });
    this.statsPanel.push(label(this, cx, cy + 335, 'Chạm để đóng', 22, '#8a94a8'));
  }

  private floatText(x: number, y: number, text: string): void {
    const item = label(this, x, y, text, 32, '#ffffff');
    this.tweens.add({
      targets: item,
      y: y - 120,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => item.destroy(),
    });
  }
}
