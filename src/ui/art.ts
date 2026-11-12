import Phaser from 'phaser';

/** Hình nhân vật và dị thú: tên khóa, đường dẫn file, và cách đặt hình cho vừa khung. */

export type Gender = 'nam' | 'nu';
/** Mỗi giới tính có bấy nhiêu kiểu hình để chọn. */
export const SKIN_COUNT = 4;

export function characterKey(gender: Gender, skin: number): string {
  return `char-${gender}-${skin}`;
}

/** Nạp toàn bộ hình nhân vật. Gọi trong preload của màn hình đầu tiên. */
export function preloadCharacters(scene: Phaser.Scene): void {
  for (const gender of ['nam', 'nu'] as Gender[]) {
    for (let skin = 1; skin <= SKIN_COUNT; skin += 1) {
      scene.load.image(characterKey(gender, skin), `assets/characters/${gender}-${skin}.webp`);
    }
  }
}

export function monsterKey(file: string): string {
  return `mon-${file}`;
}

export function monsterPath(file: string): string {
  return `assets/monsters/${file}.webp`;
}

/** Thu phóng hình cho vừa khung rộng × cao mà không méo. Trả về tỉ lệ đã dùng. */
export function fit(image: Phaser.GameObjects.Image, width: number, height: number): number {
  const scale = Math.min(width / image.width, height / image.height);
  image.setScale(scale);
  return scale;
}
