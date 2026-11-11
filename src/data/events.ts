import rawEvents from './events.json';
import { PLACE_TYPES, type PlaceType } from './map';
import { STAT_LABELS, type Stats } from './paths';

/**
 * Sự kiện được viết trong file events.json để người không biết code cũng thêm được.
 * Hướng dẫn viết nằm ở docs/VIET-SU-KIEN.md.
 */

/** Kết quả của một lựa chọn. */
export interface Outcome {
  text: string;
  /** Năng lượng tu luyện nhận được. */
  energy?: number;
  /** Linh thạch được (dương) hoặc mất (âm). */
  linhThach?: number;
  /** Chỉ số được cộng. */
  stat?: { name: keyof Stats; amount: number };
  /** Số ngày trôi qua. */
  days?: number;
}

export interface Choice {
  text: string;
  /** Có phép thử thì kết quả phụ thuộc chỉ số và vận may. */
  check?: { stat: keyof Stats; difficulty: number };
  /** Linh thạch phải có để chọn. */
  cost?: number;
  ok: Outcome;
  fail?: Outcome;
}

export interface GameEvent {
  id: string;
  title: string;
  /** Loại địa danh mà sự kiện có thể xuất hiện. */
  places: PlaceType[];
  text: string;
  choices: Choice[];
}

function isStat(value: unknown): value is keyof Stats {
  return typeof value === 'string' && value in STAT_LABELS;
}

function outcomeProblem(outcome: unknown): string | null {
  if (typeof outcome !== 'object' || outcome === null) return 'thiếu kết quả';
  const o = outcome as Record<string, unknown>;
  if (typeof o.text !== 'string' || o.text.length === 0) return 'kết quả thiếu "text"';
  for (const key of ['energy', 'linhThach', 'days']) {
    if (o[key] !== undefined && typeof o[key] !== 'number') return `"${key}" phải là số`;
  }
  if (o.stat !== undefined) {
    const stat = o.stat as Record<string, unknown>;
    if (!isStat(stat?.name) || typeof stat.amount !== 'number') return '"stat" sai tên chỉ số hoặc thiếu "amount"';
  }
  return null;
}

/** Trả về lý do sự kiện không hợp lệ, hoặc null nếu dùng được. */
export function eventProblem(event: unknown): string | null {
  if (typeof event !== 'object' || event === null) return 'không phải một sự kiện';
  const e = event as Record<string, unknown>;
  if (typeof e.id !== 'string' || e.id.length === 0) return 'thiếu "id"';
  if (typeof e.title !== 'string' || typeof e.text !== 'string') return 'thiếu "title" hoặc "text"';
  if (!Array.isArray(e.places) || e.places.length === 0) return 'thiếu "places"';
  for (const place of e.places) {
    if (typeof place !== 'string' || !(place in PLACE_TYPES)) return `loại địa danh lạ: ${String(place)}`;
  }
  if (!Array.isArray(e.choices) || e.choices.length < 2 || e.choices.length > 3) return 'cần 2 hoặc 3 lựa chọn';
  for (const choice of e.choices as Record<string, unknown>[]) {
    if (typeof choice.text !== 'string') return 'lựa chọn thiếu "text"';
    if (choice.cost !== undefined && typeof choice.cost !== 'number') return '"cost" phải là số';
    if (choice.check !== undefined) {
      const check = choice.check as Record<string, unknown>;
      if (!isStat(check?.stat) || typeof check.difficulty !== 'number') return '"check" sai tên chỉ số hoặc thiếu "difficulty"';
      if (choice.fail === undefined) return 'lựa chọn có "check" thì phải có "fail"';
    }
    const problem = outcomeProblem(choice.ok) ?? (choice.fail === undefined ? null : outcomeProblem(choice.fail));
    if (problem) return problem;
  }
  return null;
}

/** Sự kiện viết sai bị bỏ qua và báo trong console, để một lỗi nhỏ không làm hỏng cả game. */
export const EVENTS: GameEvent[] = (rawEvents as unknown[]).filter((event, index, all) => {
  const id = (event as { id?: string }).id;
  const duplicate = all.findIndex((other) => (other as { id?: string }).id === id) !== index;
  const problem = duplicate ? 'trùng "id"' : eventProblem(event);
  if (problem) console.warn(`Bỏ qua sự kiện ${id ?? `số ${index + 1}`}: ${problem}`);
  return !problem;
}) as GameEvent[];

export function eventById(id: string): GameEvent | undefined {
  return EVENTS.find((item) => item.id === id);
}
