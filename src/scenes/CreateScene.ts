import Phaser from 'phaser';
import { GAME_WIDTH } from '../config';
import { PATHS, PATH_ORDER, type PathId } from '../data/paths';
import { writeSave, type Character } from '../state/save';
import { createCharacter } from '../systems/cultivation';
import { button, label } from '../ui/widgets';

/** Tạo nhân vật: chọn nhánh chính, sau đó xem kết quả quay linh căn. */
export class CreateScene extends Phaser.Scene {
  constructor() {
    super('Create');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    label(this, cx, 110, 'Chọn con đường', 60);
    label(this, cx, 180, 'Nhánh chính quyết định cách bạn mạnh lên', 26, '#8a94a8');

    PATH_ORDER.forEach((id, index) => this.pathCard(id, 380 + index * 300));
  }

  private pathCard(id: PathId, y: number): void {
    const def = PATHS[id];
    const cx = GAME_WIDTH / 2;
    const card = this.add
      .rectangle(cx, y, 620, 260, 0x162033, 1)
      .setStrokeStyle(3, def.color, 0.9)
      .setInteractive({ useHandCursor: true });
    label(this, cx, y - 85, def.name, 44, `#${def.color.toString(16).padStart(6, '0')}`);
    label(this, cx, y - 5, def.description, 26, '#c9d4e8');
    label(this, cx, y + 85, `Đặc tính: ${def.trait}`, 22, '#8a94a8');
    card.on('pointerdown', () => this.choose(id));
  }

  private choose(id: PathId): void {
    // Lưu ngay để không thể tải lại trang mà quay linh căn lần nữa.
    const character = createCharacter(id, Date.now());
    writeSave({ version: 2, character });
    this.children.removeAll(true);
    this.showResult(character);
  }

  private showResult(c: Character): void {
    const cx = GAME_WIDTH / 2;
    const def = PATHS[c.path];
    this.cameras.main.flash(400, 255, 255, 255);

    label(this, cx, 200, def.name, 64, `#${def.color.toString(16).padStart(6, '0')}`);
    label(this, cx, 400, 'Linh căn của bạn', 30, '#8a94a8');
    const title = label(this, cx, 480, c.linhCan.name, 56);
    label(this, cx, 560, `Hệ: ${c.linhCan.elements.join(', ')}`, 32, '#7fd4ff');
    label(this, cx, 620, `Tốc độ tu tiên ×${c.linhCan.speed}`, 28, '#c9d4e8');
    this.tweens.add({ targets: title, scale: { from: 0.4, to: 1 }, duration: 500, ease: 'Back.easeOut' });

    if (c.banMenh) {
      label(this, cx, 760, 'Dị năng bản mệnh', 30, '#8a94a8');
      label(this, cx, 840, `Hệ ${c.banMenh.element}`, 52, '#c58cff');
      label(this, cx, 910, `Phẩm chất ${c.banMenh.grade}`, 34, '#ffd36b');
    }

    button(this, cx, 1100, 460, 90, 'Bắt đầu tu luyện', def.color, () => {
      this.scene.start('Cultivate');
    });
  }
}
