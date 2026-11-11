import { SAVE_KEY } from '../config';
import type { PathId, Stats } from '../data/paths';
import type { DiNang, LinhCan } from '../data/talents';

/** Bản thể: tu luyện ở thế giới chính theo thời gian thật, không già, không chết. */
export interface Character {
  /** Nhánh chính, chọn một lần và giữ mãi. */
  path: PathId;
  /** Hình nhân vật: nam hoặc nữ. */
  gender: 'nam' | 'nu';
  linhCan: LinhCan;
  /** Dị năng bản mệnh, chỉ có khi nhánh chính là dị năng. */
  banMenh: DiNang | null;
  /** Bậc lớn, bắt đầu từ 1. */
  tier: number;
  /** Giai đoạn nhỏ: 0 sơ kỳ, 1 trung kỳ, 2 hậu kỳ. */
  stage: number;
  energy: number;
  stats: Stats;
  /** Mốc thời gian (ms) lần cuối cập nhật, dùng để tính bế quan khi vắng mặt. */
  lastSeen: number;
}

/** Một kiếp lịch luyện: sống trên bản đồ, có lịch và tuổi thọ. */
export interface Life {
  /** Kiếp thứ mấy, bắt đầu từ 1. */
  index: number;
  /** Mã xuất thân của kiếp này. */
  origin: string;
  path: PathId;
  linhCan: LinhCan;
  banMenh: DiNang | null;
  tier: number;
  stage: number;
  energy: number;
  stats: Stats;
  /** Số ngày đã trôi qua trong kiếp này. */
  days: number;
  /** Mã địa danh đang đứng. */
  location: string;
  linhThach: number;
  /** Đã bỏ mạng (bị tập kích ở tử địa), khác với hết thọ. */
  killed: boolean;
  /** Các sự kiện đang hiện trên bản đồ. */
  events: ActiveEvent[];
}

export interface ActiveEvent {
  eventId: string;
  placeId: string;
  /** Ngày (tính từ đầu kiếp) mà sự kiện biến mất. */
  expiresDay: number;
}

/**
 * Dữ liệu lưu của một người chơi.
 * Giữ ở dạng JSON thuần để sau này chuyển lên máy chủ dùng chung mà không phải đổi cấu trúc.
 */
export interface SaveData {
  version: 2;
  character: Character | null;
  life: Life | null;
  luanHoiPoints: number;
  livesLived: number;
  /** Cảm ngộ: kiếm trong các kiếp, bản thể cần để đột phá bậc lớn. */
  camNgo: number;
}

export function emptySave(): SaveData {
  return { version: 2, character: null, life: null, luanHoiPoints: 0, livesLived: 0, camNgo: 0 };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      // Bản lưu cũ chưa có các trường về kiếp: bù giá trị mặc định.
      if (parsed.version === 2) {
        const save = { ...emptySave(), ...parsed };
        if (save.character) save.character.gender ??= 'nam';
        if (save.life) {
          save.life.events ??= [];
          save.life.origin ??= 'thuongDan';
          save.life.killed ??= false;
        }
        return save;
      }
    }
  } catch {
    // Dữ liệu hỏng hoặc trình duyệt chặn: coi như chưa có bản lưu.
  }
  return emptySave();
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Trình duyệt chặn lưu (ví dụ chế độ ẩn danh): bỏ qua, game vẫn chơi được.
  }
}
