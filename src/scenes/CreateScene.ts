import Phaser from 'phaser';
import { GAME_WIDTH } from '../config';
import { PATHS, PATH_ORDER, type PathId } from '../data/paths';
import { emptySave, writeSave, type Character } from '../state/save';
import { createCharacter } from '../systems/cultivation';
import { button, hexColor, label } from '../ui/widgets';

type Gender = 'nam' | 'nu';

/** Tạo bản thể: chọn nhân vật, chọn nhánh chính, rồi xem kết quả quay linh căn. */
export class CreateScene extends Phaser.Scene {
  constructor() {
    super('Create');
  }

  create(): void {
    this.chooseGender();
  }

  private chooseGender(): void {
    const cx = GAME_WIDTH / 2;
    label(this, cx, 130, 'Chọn nhân vật', 60);
    label(this, cx, 200, 'Đây là bản thể của bạn, giữ mãi qua mọi kiếp', 26, '#8a94a8');

    const options: [Gender, string, number, number][] = [
      ['nam', 'Nam', cx - 170, 0x7fd4ff],
      ['nu', 'Nữ', cx + 170, 0xff9bb5],
    ];
    for (const [gender, name, x, color] of options) {
      const card = this.add
        .rectangle(x, 620, 300, 560, 0x162033, 1)
        .setStrokeStyle(3, color, 0.9)
        .setInteractive({ useHandCursor: true });
      const portrait = this.add.image(x, 590, `char-${gender}`);
      portrait.setScale(420 / portrait.height);
      this.tweens.add({ targets: portrait, y: 580, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      label(this, x, 860, name, 40, hexColor(color));
      card.on('pointerdown', () => {
        this.children.removeAll(true);
        this.choosePath(gender);
      });
    }
  }

  private choosePath(gender: Gender): void {
    const cx = GAME_WIDTH / 2;
    label(this, cx, 110, 'Chọn con đường', 60);
    label(this, cx, 180, 'Nhánh chính chọn một lần và giữ mãi', 26, '#8a94a8');
    PATH_ORDER.forEach((id, index) => this.pathCard(id, gender, 380 + index * 300));
  }

  private pathCard(id: PathId, gender: Gender, y: number): void {
    const def = PATHS[id];
    const cx = GAME_WIDTH / 2;
    const card = this.add
      .rectangle(cx, y, 620, 260, 0x162033, 1)
      .setStrokeStyle(3, def.color, 0.9)
      .setInteractive({ useHandCursor: true });
    label(this, cx, y - 85, def.name, 44, hexColor(def.color));
    label(this, cx, y - 5, def.description, 26, '#c9d4e8');
    label(this, cx, y + 85, `Đặc tính: ${def.trait}`, 22, '#8a94a8');
    card.on('pointerdown', () => {
      // Lưu ngay để không thể tải lại trang mà quay linh căn lần nữa.
      const character = createCharacter(id, gender, Date.now());
      writeSave({ ...emptySave(), character });
      this.children.removeAll(true);
      this.showResult(character);
    });
  }

  private showResult(c: Character): void {
    const cx = GAME_WIDTH / 2;
    const def = PATHS[c.path];
    this.cameras.main.flash(400, 255, 255, 255);

    const portrait = this.add.image(cx, 250, `char-${c.gender}`);
    portrait.setScale(300 / portrait.height);
    label(this, cx, 440, def.name, 56, hexColor(def.color));
    label(this, cx, 540, 'Linh căn của bản thể', 28, '#8a94a8');
    const title = label(this, cx, 610, c.linhCan.name, 52);
    label(this, cx, 680, `Hệ: ${c.linhCan.elements.join(', ')}`, 30, '#7fd4ff');
    label(this, cx, 735, `Tốc độ tu tiên ×${c.linhCan.speed}`, 26, '#c9d4e8');
    this.tweens.add({ targets: title, scale: { from: 0.4, to: 1 }, duration: 500, ease: 'Back.easeOut' });

    if (c.banMenh) {
      label(this, cx, 830, 'Dị năng bản mệnh', 28, '#8a94a8');
      label(this, cx, 895, `Hệ ${c.banMenh.element}`, 48, '#c58cff');
      label(this, cx, 955, `Phẩm chất ${c.banMenh.grade}`, 32, '#ffd36b');
    }

    button(this, cx, 1110, 460, 90, 'Bắt đầu tu luyện', def.color, () => {
      this.scene.start('Cultivate');
    });
  }
}
