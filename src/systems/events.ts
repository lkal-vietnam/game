import { EVENTS, type Choice, type Outcome } from '../data/events';
import { PLACES } from '../data/map';
import type { Life } from '../state/save';
import { DAYS_PER_YEAR } from './life';

const MAX_ACTIVE = 3;

/** Xóa sự kiện hết hạn và sinh sự kiện mới cho đủ số lượng. */
export function refreshEvents(life: Life, rng: () => number = Math.random): void {
  life.events = life.events.filter((item) => item.expiresDay > life.days);
  for (let attempt = 0; attempt < 20 && life.events.length < MAX_ACTIVE; attempt += 1) {
    const template = EVENTS[Math.floor(rng() * EVENTS.length)];
    if (life.events.some((item) => item.eventId === template.id)) continue;
    const candidates = PLACES.filter(
      (place) =>
        template.places.includes(place.type) &&
        !life.events.some((item) => item.placeId === place.id),
    );
    if (candidates.length === 0) continue;
    const place = candidates[Math.floor(rng() * candidates.length)];
    life.events.push({
      eventId: template.id,
      placeId: place.id,
      // Mỗi sự kiện tồn tại từ 1 đến 3 năm rồi biến mất.
      expiresDay: life.days + Math.round((1 + rng() * 2) * DAYS_PER_YEAR),
    });
  }
}

/** Xác suất thành công của một lựa chọn có phép thử, từ 10% đến 95%. */
export function successChance(life: Life, choice: Choice): number {
  if (!choice.check) return 1;
  const diff = life.stats[choice.check.stat] - choice.check.difficulty;
  return Math.min(0.95, Math.max(0.1, 0.5 + diff * 0.08));
}

export function canChoose(life: Life, choice: Choice): boolean {
  return (choice.cost ?? 0) <= life.linhThach;
}

/** Thực hiện lựa chọn: áp dụng kết quả vào kiếp và trả về kết quả đó. */
export function resolveChoice(
  life: Life,
  choice: Choice,
  rng: () => number = Math.random,
): { outcome: Outcome; success: boolean } {
  const success = !choice.fail || rng() < successChance(life, choice);
  const outcome = success ? choice.ok : choice.fail!;
  life.energy += outcome.energy ?? 0;
  life.linhThach = Math.max(0, life.linhThach + (outcome.linhThach ?? 0));
  if (outcome.stat) life.stats[outcome.stat[0]] += outcome.stat[1];
  life.days += outcome.days ?? 0;
  return { outcome, success };
}
