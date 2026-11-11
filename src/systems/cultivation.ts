import { BASE_STATS, PATHS, STAGE_NAMES, type PathId, type Stats } from '../data/paths';
import { rollBanMenhDiNang, rollLinhCan } from '../data/talents';
import type { Character } from '../state/save';

/** Bản hiện tại chỉ có Nhân giới: bậc 1 đến 5. */
export const MAX_TIER = 5;
const BASE_COST = 60;
const COST_GROWTH = 1.55;
const BASE_RATE = 1;
/** Tu luyện khi vắng mặt tính tối đa 8 giờ. */
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

export function realmName(c: Character): string {
  return `${PATHS[c.path].tiers[c.tier - 1]} · ${STAGE_NAMES[c.stage]}`;
}

export function isAtPeak(c: Character): boolean {
  return c.tier === MAX_TIER && c.stage === STAGE_NAMES.length - 1;
}

/** Lần lên tiếp theo là đột phá bậc lớn (hậu kỳ lên bậc mới). */
export function isBreakthrough(c: Character): boolean {
  return c.stage === STAGE_NAMES.length - 1;
}

export function energyRequired(c: Character): number {
  const index = (c.tier - 1) * STAGE_NAMES.length + c.stage;
  return Math.round(BASE_COST * Math.pow(COST_GROWTH, index) * PATHS[c.path].costMultiplier);
}

/** Năng lượng hấp thụ mỗi giây. */
export function energyRate(c: Character): number {
  const fromNgoTinh = 1 + c.stats.ngoTinh * 0.02;
  const fromLinhCan = c.path === 'tuTien' ? c.linhCan.speed : 1;
  return BASE_RATE * c.tier * fromNgoTinh * fromLinhCan;
}

export function tapGain(c: Character): number {
  return energyRate(c);
}

export function canAdvance(c: Character): boolean {
  return !isAtPeak(c) && c.energy >= energyRequired(c);
}

/** Lên một giai đoạn. Trả về các chỉ số được cộng, hoặc null nếu chưa đủ điều kiện. */
export function advance(c: Character): Partial<Stats> | null {
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
 * Tính năng lượng tích được trong lúc vắng mặt và cập nhật mốc thời gian.
 * Chỉ nhánh tu tiên có đặc tính này.
 */
export function applyOfflineGain(c: Character, now: number): number {
  const seconds = Math.min(Math.max((now - c.lastSeen) / 1000, 0), OFFLINE_CAP_SECONDS);
  c.lastSeen = now;
  if (c.path !== 'tuTien' || seconds < 60) return 0;
  const gain = Math.floor(energyRate(c) * seconds);
  c.energy += gain;
  return gain;
}
