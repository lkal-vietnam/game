/** Bản đồ Lạc Thành: vùng đầu tiên của một kiếp lịch luyện. */

export type PlaceType =
  | 'home'
  | 'market'
  | 'station'
  | 'spring'
  | 'guild'
  | 'dojo'
  | 'sect'
  | 'beast'
  | 'secret';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  x: number;
  y: number;
  /** Hệ số linh khí: bế quan ở đây nhanh hay chậm. */
  linhKhi: number;
  description: string;
}

export const PLACE_TYPES: Record<PlaceType, { label: string; icon: string; color: number }> = {
  home: { label: 'Nhà', icon: '🏠', color: 0x6fb1ff },
  market: { label: 'Phường thị', icon: '🛒', color: 0xffc857 },
  station: { label: 'Ga tàu', icon: '🚉', color: 0x9aa7bd },
  spring: { label: 'Linh mạch', icon: '💧', color: 0x5fe0c2 },
  guild: { label: 'Hiệp hội dị năng', icon: '🗼', color: 0xc58cff },
  dojo: { label: 'Võ quán', icon: '🥋', color: 0xff8a5c },
  sect: { label: 'Tông môn', icon: '⛩️', color: 0x7fd4ff },
  beast: { label: 'Vùng dị thú', icon: '🐾', color: 0xe05d5d },
  secret: { label: 'Bí cảnh', icon: '🌀', color: 0xb04bd8 },
};

export const MAP_WIDTH = 1700;
export const MAP_HEIGHT = 2000;
export const START_PLACE = 'hangMay';

export const PLACES: Place[] = [
  {
    id: 'hangMay',
    name: 'Ngõ Hàng Mây',
    type: 'home',
    x: 850,
    y: 1050,
    linhKhi: 1,
    description: 'Căn nhà nhỏ trong ngõ. Yên tĩnh và an toàn.',
  },
  {
    id: 'dongXuan',
    name: 'Chợ đêm Đồng Xuân',
    type: 'market',
    x: 620,
    y: 900,
    linhKhi: 0.8,
    description: 'Chợ ngầm của giới tu luyện, mua bán bằng linh thạch.',
  },
  {
    id: 'longBien',
    name: 'Ga Long Biên',
    type: 'station',
    x: 1090,
    y: 900,
    linhKhi: 0.8,
    description: 'Ga tàu điện lớn nhất Lạc Thành.',
  },
  {
    id: 'tinhTam',
    name: 'Hồ Tịnh Tâm',
    type: 'spring',
    x: 850,
    y: 750,
    linhKhi: 1.5,
    description: 'Mặt hồ phủ sương, linh khí đậm hơn hẳn phố xá.',
  },
  {
    id: 'bachMa',
    name: 'Tháp Bạch Mã',
    type: 'guild',
    x: 1160,
    y: 1150,
    linhKhi: 1,
    description: 'Trụ sở hiệp hội dị năng giả.',
  },
  {
    id: 'taySon',
    name: 'Võ quán Tây Sơn',
    type: 'dojo',
    x: 560,
    y: 1190,
    linhKhi: 1,
    description: 'Nơi các thể tu rèn luyện và tỉ thí.',
  },
  {
    id: 'hacThuy',
    name: 'Khu xưởng Hắc Thủy',
    type: 'beast',
    x: 840,
    y: 1430,
    linhKhi: 1.2,
    description: 'Nhà máy bỏ hoang ven thành, dị thú làm tổ.',
  },
  {
    id: 'yenTu',
    name: 'Đạo quán Yên Tử',
    type: 'sect',
    x: 390,
    y: 480,
    linhKhi: 2.5,
    description: 'Đạo quán trên núi, linh mạch lớn nhất vùng.',
  },
  {
    id: 'cucPhuong',
    name: 'Rừng Cúc Phương',
    type: 'beast',
    x: 1330,
    y: 520,
    linhKhi: 2,
    description: 'Rừng già dị biến. Linh dược nhiều, dị thú cũng nhiều.',
  },
  {
    id: 'phongNha',
    name: 'Động Phong Nha',
    type: 'secret',
    x: 1340,
    y: 1630,
    linhKhi: 1.8,
    description: 'Cửa bí cảnh. Vào được chưa chắc ra được.',
  },
];

/** Đường nối giữa hai địa danh và số ngày đi. */
export const ROADS: [string, string, number][] = [
  ['hangMay', 'dongXuan', 1],
  ['hangMay', 'longBien', 1],
  ['hangMay', 'tinhTam', 1],
  ['hangMay', 'bachMa', 2],
  ['hangMay', 'taySon', 2],
  ['hangMay', 'hacThuy', 5],
  ['dongXuan', 'tinhTam', 1],
  ['longBien', 'tinhTam', 1],
  ['dongXuan', 'taySon', 2],
  ['longBien', 'bachMa', 1],
  ['taySon', 'hacThuy', 4],
  ['dongXuan', 'yenTu', 20],
  ['tinhTam', 'yenTu', 24],
  ['longBien', 'cucPhuong', 15],
  ['tinhTam', 'cucPhuong', 18],
  ['bachMa', 'phongNha', 30],
  ['hacThuy', 'phongNha', 20],
];

export function placeById(id: string): Place {
  const place = PLACES.find((item) => item.id === id);
  if (!place) throw new Error(`Không có địa danh: ${id}`);
  return place;
}

export interface Route {
  /** Các địa danh đi qua, tính cả điểm đầu và điểm cuối. */
  stops: string[];
  days: number;
}

/** Tìm đường ngắn nhất (ít ngày nhất) giữa hai địa danh. */
export function findRoute(from: string, to: string): Route | null {
  const best = new Map<string, number>([[from, 0]]);
  const previous = new Map<string, string>();
  const pending = new Set(PLACES.map((place) => place.id));
  while (pending.size > 0) {
    let current: string | null = null;
    for (const id of pending) {
      if (best.has(id) && (current === null || best.get(id)! < best.get(current)!)) current = id;
    }
    if (current === null) break;
    pending.delete(current);
    if (current === to) break;
    for (const [a, b, days] of ROADS) {
      const next = a === current ? b : b === current ? a : null;
      if (next === null || !pending.has(next)) continue;
      const total = best.get(current)! + days;
      if (!best.has(next) || total < best.get(next)!) {
        best.set(next, total);
        previous.set(next, current);
      }
    }
  }
  if (!best.has(to)) return null;
  const stops = [to];
  while (stops[0] !== from) stops.unshift(previous.get(stops[0])!);
  return { stops, days: best.get(to)! };
}
