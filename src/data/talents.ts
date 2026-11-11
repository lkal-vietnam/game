/** Linh căn (tu tiên) và dị năng bản mệnh: hai thứ được quay ngẫu nhiên khi tạo nhân vật. */

export interface LinhCan {
  name: string;
  elements: string[];
  /** Hệ số tốc độ tu luyện khi tu tiên. */
  speed: number;
}

export interface DiNang {
  element: string;
  grade: string;
  /** Hệ số sức mạnh theo phẩm chất. */
  power: number;
}

type Rng = () => number;

const NGU_HANH = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];
const DI_HE = ['Lôi', 'Băng', 'Phong'];

const LINH_CAN_TABLE = [
  { name: 'Ngũ linh căn', count: 5, speed: 0.6, weight: 30 },
  { name: 'Tứ linh căn', count: 4, speed: 0.8, weight: 28 },
  { name: 'Tam linh căn', count: 3, speed: 1.0, weight: 22 },
  { name: 'Song linh căn', count: 2, speed: 1.3, weight: 13 },
  { name: 'Thiên linh căn', count: 1, speed: 1.7, weight: 5 },
  { name: 'Dị linh căn', count: 0, speed: 1.7, weight: 2 },
];

const DI_NANG_ELEMENTS = ['Hỏa', 'Lôi', 'Băng', 'Phong', 'Không Gian', 'Trọng Lực'];

/** Bản mệnh của người chọn dị năng làm nhánh chính: ít nhất phẩm chất A. */
const BAN_MENH_GRADES = [
  { grade: 'A', power: 1.5, weight: 70 },
  { grade: 'S', power: 2.0, weight: 22 },
  { grade: 'SS', power: 2.6, weight: 7 },
  { grade: 'SSS', power: 3.5, weight: 1 },
];

function pickWeighted<T extends { weight: number }>(items: T[], rng: Rng): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll < 0) return item;
  }
  return items[items.length - 1];
}

function pickSome(pool: string[], count: number, rng: Rng): string[] {
  const rest = [...pool];
  const picked: string[] = [];
  while (picked.length < count && rest.length > 0) {
    picked.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
  }
  // Giữ đúng thứ tự Kim, Mộc, Thủy, Hỏa, Thổ cho dễ đọc.
  return pool.filter((element) => picked.includes(element));
}

export function rollLinhCan(rng: Rng = Math.random): LinhCan {
  const row = pickWeighted(LINH_CAN_TABLE, rng);
  const elements =
    row.count === 0 ? pickSome(DI_HE, 1, rng) : pickSome(NGU_HANH, row.count, rng);
  return { name: row.name, elements, speed: row.speed };
}

export function rollBanMenhDiNang(rng: Rng = Math.random): DiNang {
  const row = pickWeighted(BAN_MENH_GRADES, rng);
  const element = DI_NANG_ELEMENTS[Math.floor(rng() * DI_NANG_ELEMENTS.length)];
  return { element, grade: row.grade, power: row.power };
}
