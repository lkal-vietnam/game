import { SAVE_KEY } from '../config';

/**
 * Dữ liệu lưu của một người chơi.
 * Giữ ở dạng JSON thuần để sau này chuyển lên máy chủ dùng chung mà không phải đổi cấu trúc.
 */
export interface SaveData {
  version: 1;
  qi: number;
}

const DEFAULT_SAVE: SaveData = { version: 1, qi: 0 };

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return { ...DEFAULT_SAVE, ...parsed, version: 1 };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Trình duyệt chặn lưu (ví dụ chế độ ẩn danh): bỏ qua, game vẫn chơi được.
  }
}
