import { SAVE_KEY } from '../config';
import type { PathId, Stats } from '../data/paths';
import type { DiNang, LinhCan } from '../data/talents';

export interface Character {
  path: PathId;
  linhCan: LinhCan;
  /** Dị năng bản mệnh, chỉ có khi nhánh chính là dị năng. */
  banMenh: DiNang | null;
  /** Bậc lớn, bắt đầu từ 1. */
  tier: number;
  /** Giai đoạn nhỏ: 0 sơ kỳ, 1 trung kỳ, 2 hậu kỳ. */
  stage: number;
  energy: number;
  stats: Stats;
  /** Mốc thời gian (ms) lần cuối cập nhật, dùng để tính tu luyện khi vắng mặt. */
  lastSeen: number;
}

/**
 * Dữ liệu lưu của một người chơi.
 * Giữ ở dạng JSON thuần để sau này chuyển lên máy chủ dùng chung mà không phải đổi cấu trúc.
 */
export interface SaveData {
  version: 2;
  character: Character | null;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.version === 2) return parsed;
    }
  } catch {
    // Dữ liệu hỏng hoặc trình duyệt chặn: coi như chưa có bản lưu.
  }
  return { version: 2, character: null };
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Trình duyệt chặn lưu (ví dụ chế độ ẩn danh): bỏ qua, game vẫn chơi được.
  }
}
