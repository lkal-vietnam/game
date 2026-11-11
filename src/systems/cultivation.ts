import { BASE_STATS, PATHS, STAGE_NAMES, type PathId, type Stats } from '../data/paths';
import { rollBanMenhDiNang, rollLinhCan, type LinhCan } from '../data/talents';
import type { Character } from '../state/save';

/** Phần chung giữa bản thể và một kiếp lịch luyện: ai tu luyện cũng có các trường này. */
export interface Cultivator {
  path: PathId;
  linhCan: LinhCan;
  tier: number;
  stage: number;
  energy: number;
  stats: Stats;
}

/** Bản hiện tại chỉ có Nhân giới: bậc 1 đến 5. */
export const MAX_TIER = 5;
/** Bậc 0 là Phàm Nhân: chỉ các kiếp lịch luyện mới bắt đầu từ đây. */
const MORTAL_COST = 20;
const BASE_COST = 60;
const COST_GROWTH = 1.55;
const BASE_RATE = 1;
/** Đặc tính tu tiên: bế quan hiệu quả hơn. */
export const TU_TIEN_BONUS = 1.25;
/** Bế quan khi tắt game tính tối đa 8 giờ thật. */
const OFFLINE_CAP_SECONDS = 8 * 3600;

export function createCharacter(
  path: PathId,
  now: number,
  rng: () => number = Math.random,
): Character {
  return {
    path,
    linhCan: rollLinhCan(rng),
    banMenh: path === 'diNang' ? rollBanMenhDiNang(rng) : null,
    tier: 1,
    stage: 0,
    energy: 0,
    stats: { ...BASE_STATS },
    lastSeen: now,
  };
}

export function realmName(c: Cultivator): string {
  if (c.tier === 0) return 'Phàm Nhân';
  return `${PATHS[c.path].tiers[c.tier - 1]} · ${STAGE_NAMES[c.stage]}`;
}

export function isAtPeak(c: Cultivator): boolean {
  return c.tier === MAX_TIER && c.stage === STAGE_NAMES.length - 1;
}

/** Lần lên tiếp theo là đột phá bậc lớn (hậu kỳ lên bậc mới). */
export function isBreakthrough(c: Cultivator): boolean {
  return c.tier === 0 || c.stage === STAGE_NAMES.length - 1;
}

export function energyRequired(c: Cultivator): number {
  if (c.tier === 0) return Math.round(MORTAL_COST * PATHS[c.path].costMultiplier);
  const index = (c.tier - 1) * STAGE_NAMES.length + c.stage;
  return Math.round(BASE_COST * Math.pow(COST_GROWTH, index) * PATHS[c.path].costMultiplier);
}

/** Hệ số tốc độ chung: ngộ tính, linh căn và đặc tính tu tiên. */
export function talentMultiplier(c: Cultivator): number {
  const fromNgoTinh = 1 + c.stats.ngoTinh * 0.02;
  const fromPath = c.path === 'tuTien' ? c.linhCan.speed * TU_TIEN_BONUS : 1;
  return fromNgoTinh * fromPath;
}

/** Năng lượng bản thể hấp thụ mỗi giây thật. */
export function energyRate(c: Cultivator): number {
  return BASE_RATE * Math.max(c.tier, 1) * talentMultiplier(c);
}

export function tapGain(c: Cultivator): number {
  return energyRate(c);
}

export function canAdvance(c: Cultivator): boolean {
  return !isAtPeak(c) && c.energy >= energyRequired(c);
}

/** Lên một giai đoạn. Trả về các chỉ số được cộng, hoặc null nếu chưa đủ điều kiện. */
export function advance(c: Cultivator): Partial<Stats> | null {
  if (!canAdvance(c)) return null;
  const major = isBreakthrough(c);
  c.energy -= energyRequired(c);
  if (major) {
    c.tier += 1;
    c.stage = 0;
  } else {
    c.stage += 1;
  }
  const gained: Partial<Stats> = {};
  const gains = PATHS[c.path].gains;
  for (const key of Object.keys(gains) as (keyof Stats)[]) {
    const amount = (gains[key] ?? 0) * (major ? 2 : 1);
    c.stats[key] += amount;
    gained[key] = amount;
  }
  return gained;
}

/**
 * Bản thể bế quan theo thời gian thật, kể cả khi tắt game.
 * Tính năng lượng tích được trong lúc vắng mặt và cập nhật mốc thời gian.
 */
export function applyOfflineGain(c: Character, now: number): number {
  const seconds = Math.min(Math.max((now - c.lastSeen) / 1000, 0), OFFLINE_CAP_SECONDS);
  c.lastSeen = now;
  if (seconds < 60) return 0;
  const gain = Math.floor(energyRate(c) * seconds);
  c.energy += gain;
  return gain;
}
