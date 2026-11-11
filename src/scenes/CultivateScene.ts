import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { loadSave, writeSave, type SaveData } from '../state/save';

/**
 * Màn hình mẫu: chạm vào quả cầu để hấp thụ linh khí.
 * Đây chỉ là khung để kiểm tra dự án chạy được, chưa phải gameplay chính thức.
 */
export class CultivateScene extends Phaser.Scene {
  private save!: SaveData;
  private qiText!: Phaser.GameObjects.Text;

  constructor() {
    super('Cultivate');
  }

  create(): void {
    this.save = loadSave();
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add
      .text(cx, 160, 'Tu luyện', { fontSize: '64px', color: '#e8f0ff' })
      .setOrigin(0.5);

    this.qiText = this.add
      .text(cx, 260, '', { fontSize: '40px', color: '#7fd4ff' })
      .setOrigin(0.5);
    this.refresh();

    const halo = this.add.circle(cx, cy, 170, 0x3aa0ff, 0.18);
    const orb = this.add.circle(cx, cy, 120, 0x7fd4ff, 0.9);
    orb.setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: halo,
      scale: 1.25,
      alpha: 0.05,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    orb.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.save.qi += 1;
      writeSave(this.save);
      this.refresh();
      this.tweens.add({ targets: orb, scale: 1.12, duration: 80, yoyo: true });
      this.spawnSpark(pointer.x, pointer.y);
    });

    this.add
      .text(cx, GAME_HEIGHT - 140, 'Chạm vào quả cầu để hấp thụ linh khí', {
        fontSize: '28px',
        color: '#8a94a8',
      })
      .setOrigin(0.5);
  }

  private refresh(): void {
    this.qiText.setText(`Linh khí: ${this.save.qi}`);
  }

  private spawnSpark(x: number, y: number): void {
    const label = this.add
      .text(x, y, '+1', { fontSize: '36px', color: '#ffffff' })
      .setOrigin(0.5);
    this.tweens.add({
      targets: label,
      y: y - 120,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }
}
