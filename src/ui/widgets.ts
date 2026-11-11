import Phaser from 'phaser';
import { FONT } from '../config';

export function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size: number,
  color = '#e8f0ff',
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, text, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      color,
      align: 'center',
      // Chừa chỗ cho dấu tiếng Việt khỏi bị cắt ở mép trên.
      padding: { top: 8, bottom: 4 },
    })
    .setOrigin(0.5);
}

type Pinnable = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.ScrollFactor &
  Phaser.GameObjects.Components.Depth;

export interface Button {
  /** Các đối tượng tạo nên nút, để ghim lên giao diện hoặc xóa đi. */
  objects: Pinnable[];
  setLabel(text: string): void;
  setEnabled(enabled: boolean): void;
  destroy(): void;
}

export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  color: number,
  onClick: () => void,
  fontSize = 30,
): Button {
  const box = scene.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xffffff, 0.25);
  const caption = label(scene, x, y, text, fontSize, '#0b0f1a');
  let enabled = true;
  box.setInteractive({ useHandCursor: true });
  box.on('pointerdown', () => {
    if (!enabled) return;
    scene.tweens.add({ targets: [box, caption], scale: 0.95, duration: 60, yoyo: true });
    onClick();
  });
  return {
    objects: [box, caption],
    setLabel: (value) => caption.setText(value),
    setEnabled: (value) => {
      enabled = value;
      box.setAlpha(value ? 1 : 0.35);
      caption.setAlpha(value ? 1 : 0.6);
    },
    destroy: () => {
      box.destroy();
      caption.destroy();
    },
  };
}

/** Ghim đối tượng lên giao diện: không trôi theo camera, nằm trên bản đồ. */
export function pin<T extends Pinnable>(items: T[], depth = 100): T[] {
  items.forEach((item) => {
    item.setScrollFactor(0);
    item.setDepth(depth);
  });
  return items;
}

export function formatNumber(value: number): string {
  return Math.floor(value).toLocaleString('vi-VN');
}

export function hexColor(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
