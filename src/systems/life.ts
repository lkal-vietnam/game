import { START_PLACE } from '../data/map';
import { BASE_STATS, type PathId, type Stats } from '../data/paths';
import { rollBanMenhDiNang, rollLinhCan } from '../data/talents';
import type { Life } from '../state/save';
import { advance, canAdvance, energyRequired, isBreakthrough, talentMultiplier } from './cultivation';

export const DAYS_PER_MONTH = 30;
export const DAYS_PER_YEAR = 360;
export const START_AGE = 12;
/** Tuổi thọ theo bậc của kiếp: Phàm Nhân (bậc 0), rồi bậc 1 đến 5. */
const LIFESPAN_BY_TIER = [80, 100, 200, 500, 1000, 2000];
/**
 * Năng lượng mỗi tháng bế quan ở nơi linh khí ×1, bậc 1.
 * Đặt thấp có chủ ý: chỉ ngồi nhà thì Luyện Khí lên Trúc Cơ mất 80-90 năm.
 * Muốn nhanh hơn phải đi tìm linh mạch và kỳ ngộ.
 */
const MONTHLY_BASE = 0.32;
const START_LINH_THACH = 30;

export interface Origin {
  id: string;
  name: string;
  description: string;
  weight: number;
  /** Bắt đầu với tu vi Phàm Nhân đã đầy. */
  fullEnergy?: boolean;
  linhThach?: number;
  stats?: Partial<Stats>;
}

/** Xuất thân của một kiếp. Hiện quay ngẫu nhiên; sau này mua được bằng điểm luân hồi. */
export const ORIGINS: Origin[] = [
  { id: 'thuongDan', name: 'Con nhà thường dân', description: 'Không có gì ngoài hai bàn tay.', weight: 50 },
  {
    id: 'theGia',
    name: 'Con cháu thế gia',
    description: 'Từ nhỏ đã được dạy dẫn khí: tu vi Phàm Nhân đã đầy, có sẵn 50 linh thạch.',
    weight: 15,
    fullEnergy: true,
    linhThach: 50,
  },
  {
    id: 'moCoi',
    name: 'Trẻ mồ côi đường phố',
    description: 'Lớn lên bằng chạy và chịu đòn: Thân pháp +1, Thể chất +1, không một viên linh thạch.',
    weight: 20,
    linhThach: -START_LINH_THACH,
    stats: { thanPhap: 1, theChat: 1 },
  },
  {
    id: 'thuHuong',
    name: 'Con nhà thư hương',
    description: 'Lớn lên giữa sách vở: Ngộ tính +2.',
    weight: 15,
    stats: { ngoTinh: 2 },
  },
];

export function originById(id: string): Origin {
  return ORIGINS.find((item) => item.id === id) ?? ORIGINS[0];
}

function rollOrigin(rng: () => number): Origin {
  const total = ORIGINS.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of ORIGINS) {
    roll -= item.weight;
    if (roll < 0) return item;
  }
  return ORIGINS[0];
}

/** Mỗi kiếp đều bắt đầu là Phàm Nhân 12 tuổi. */
export function createLife(path: PathId, index: number, rng: () => number = Math.random): Life {
  const origin = rollOrigin(rng);
  const life: Life = {
    index,
    origin: origin.id,
    path,
    linhCan: rollLinhCan(rng),
    banMenh: path === 'diNang' ? rollBanMenhDiNang(rng) : null,
    tier: 0,
    stage: 0,
    energy: 0,
    stats: { ...BASE_STATS },
    days: 0,
    location: START_PLACE,
    linhThach: START_LINH_THACH + (origin.linhThach ?? 0),
    events: [],
  };
  for (const key of Object.keys(origin.stats ?? {}) as (keyof Stats)[]) {
    life.stats[key] += origin.stats?.[key] ?? 0;
  }
  if (origin.fullEnergy) life.energy = energyRequired(life);
  return life;
}

export function lifespan(life: Life): number {
  return LIFESPAN_BY_TIER[life.tier];
}

export function ageYears(life: Life): number {
  return START_AGE + Math.floor(life.days / DAYS_PER_YEAR);
}

export function isDead(life: Life): boolean {
  return ageYears(life) >= lifespan(life);
}

export function dateLabel(life: Life): string {
  const year = Math.floor(life.days / DAYS_PER_YEAR) + 1;
  const month = Math.floor((life.days % DAYS_PER_YEAR) / DAYS_PER_MONTH) + 1;
  const day = (life.days % DAYS_PER_MONTH) + 1;
  return `Năm ${year}, tháng ${month}, ngày ${day}`;
}

export function monthlyGain(life: Life, linhKhi: number): number {
  return MONTHLY_BASE * Math.max(life.tier, 1) * talentMultiplier(life) * linhKhi;
}

/** Bế quan một số tháng tại nơi có hệ số linh khí cho trước. Trả về năng lượng nhận được. */
export function seclude(life: Life, months: number, linhKhi: number): number {
  const gain = Math.round(monthlyGain(life, linhKhi) * months);
  life.energy += gain;
  life.days += months * DAYS_PER_MONTH;
  return gain;
}

/** Tỉ lệ đột phá bậc lớn thành công. Lên giai đoạn nhỏ thì luôn thành công. */
export function breakthroughChance(life: Life): number {
  if (!isBreakthrough(life)) return 1;
  const base = life.tier === 0 ? 0.7 : life.tier === 1 ? 0.4 : 0.3;
  return Math.min(0.95, Math.max(0.05, base + (life.stats.ngoTinh - 5) * 0.03));
}

/**
 * Thử lên giai đoạn hoặc đột phá. Đột phá thất bại thì mất 30% năng lượng đã tích
 * và mất một năm dưỡng thương.
 */
export function attemptAdvance(
  life: Life,
  rng: () => number = Math.random,
): { success: boolean; gained: Partial<Stats> } | null {
  if (!canAdvance(life)) return null;
  if (rng() >= breakthroughChance(life)) {
    life.energy -= Math.round(energyRequired(life) * 0.3);
    life.days += DAYS_PER_YEAR;
    return { success: false, gained: {} };
  }
  return { success: true, gained: advance(life) ?? {} };
}

/** Điểm luân hồi nhận được khi kiếp kết thúc, tính theo cảnh giới và số năm đã sống. */
export function luanHoiPoints(life: Life): number {
  const realmIndex = life.tier === 0 ? 0 : (life.tier - 1) * 3 + life.stage + 1;
  const yearsLived = ageYears(life) - START_AGE;
  return realmIndex * 10 + Math.floor(yearsLived / 10);
}
