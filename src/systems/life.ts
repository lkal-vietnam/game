import { START_PLACE } from '../data/map';
import { BASE_STATS, type PathId } from '../data/paths';
import { rollBanMenhDiNang, rollLinhCan } from '../data/talents';
import type { Life } from '../state/save';
import { talentMultiplier } from './cultivation';

export const DAYS_PER_MONTH = 30;
export const DAYS_PER_YEAR = 360;
export const START_AGE = 12;
/** Tuổi thọ theo bậc cảnh giới của kiếp (bậc 1 đến 5). */
const LIFESPAN_BY_TIER = [100, 200, 500, 1000, 2000];
/** Năng lượng mỗi tháng bế quan ở nơi linh khí ×1, bậc 1. */
const MONTHLY_BASE = 1;
const START_LINH_THACH = 30;

export function createLife(path: PathId, index: number, rng: () => number = Math.random): Life {
  return {
    index,
    path,
    linhCan: rollLinhCan(rng),
    banMenh: path === 'diNang' ? rollBanMenhDiNang(rng) : null,
    tier: 1,
    stage: 0,
    energy: 0,
    stats: { ...BASE_STATS },
    days: 0,
    location: START_PLACE,
    linhThach: START_LINH_THACH,
    events: [],
  };
}

export function lifespan(life: Life): number {
  return LIFESPAN_BY_TIER[life.tier - 1];
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
  return MONTHLY_BASE * life.tier * talentMultiplier(life) * linhKhi;
}

/** Bế quan một số tháng tại nơi có hệ số linh khí cho trước. Trả về năng lượng nhận được. */
export function seclude(life: Life, months: number, linhKhi: number): number {
  const gain = Math.round(monthlyGain(life, linhKhi) * months);
  life.energy += gain;
  life.days += months * DAYS_PER_MONTH;
  return gain;
}

/** Điểm luân hồi nhận được khi kiếp kết thúc, tính theo cảnh giới và số năm đã sống. */
export function luanHoiPoints(life: Life): number {
  const realmIndex = (life.tier - 1) * 3 + life.stage;
  const yearsLived = ageYears(life) - START_AGE;
  return realmIndex * 10 + Math.floor(yearsLived / 10);
}
