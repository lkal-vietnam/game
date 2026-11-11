/** Bản đồ thế giới của một kiếp lịch luyện: năm vùng đất, nối nhau bằng đường bộ và đường biển. */

export type PlaceType =
  | 'home'
  | 'market'
  | 'station'
  | 'spring'
  | 'guild'
  | 'dojo'
  | 'sect'
  | 'beast'
  | 'secret'
  | 'port'
  | 'village'
  | 'ruin';

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
  port: { label: 'Bến thuyền', icon: '⚓', color: 0x4fb3d9 },
  village: { label: 'Thôn làng', icon: '🏘️', color: 0xd9c27a },
  ruin: { label: 'Di tích', icon: '🏛️', color: 0xb9a37a },
};

export type Biome = 'temperate' | 'ice' | 'desert' | 'jungle' | 'island';

/** Một vùng đất: hình vuông bo tròn có bờ gợn sóng, tâm (cx, cy), bán kính (rx, ry). */
export interface Land {
  id: string;
  name: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Độ lệch pha để bờ mỗi vùng đất có hình khác nhau. */
  phase: number;
  biome: Biome;
}

export const MAP_WIDTH = 5400;
export const MAP_HEIGHT = 6400;
export const START_PLACE = 'hangMay';

export const LANDS: Land[] = [
  { id: 'lacViet', name: 'LẠC VIỆT CHÂU', cx: 2700, cy: 3200, rx: 760, ry: 900, phase: 0, biome: 'temperate' },
  { id: 'bacBang', name: 'BẮC BĂNG NGUYÊN', cx: 2700, cy: 900, rx: 1300, ry: 520, phase: 1.7, biome: 'ice' },
  { id: 'tayMac', name: 'TÂY MẠC', cx: 700, cy: 3300, rx: 520, ry: 1200, phase: 3.1, biome: 'desert' },
  { id: 'namHoang', name: 'NAM HOANG', cx: 2800, cy: 5600, rx: 1400, ry: 560, phase: 4.4, biome: 'jungle' },
  { id: 'catBa', name: 'ĐẢO CÁT BÀ', cx: 4700, cy: 2400, rx: 330, ry: 280, phase: 0.6, biome: 'island' },
  { id: 'lySon', name: 'ĐẢO LÝ SƠN', cx: 4900, cy: 3300, rx: 300, ry: 380, phase: 2.2, biome: 'island' },
  { id: 'phuQuoc', name: 'ĐẢO PHÚ QUỐC', cx: 4650, cy: 4200, rx: 360, ry: 300, phase: 5.0, biome: 'island' },
  { id: 'conDao', name: 'CÔN ĐẢO', cx: 5050, cy: 4950, rx: 220, ry: 200, phase: 3.7, biome: 'island' },
];

export function coastRadius(angle: number, phase: number): number {
  const squircle =
    1 / Math.pow(Math.pow(Math.abs(Math.cos(angle)), 4) + Math.pow(Math.abs(Math.sin(angle)), 4), 0.25);
  const wobble =
    0.92 +
    0.05 * Math.sin(3 * angle + 1.3 + phase) +
    0.035 * Math.sin(7 * angle + 0.4 + phase * 2) +
    0.02 * Math.sin(13 * angle + 2.1 + phase * 3);
  return squircle * wobble;
}

export function isInLand(land: Land, x: number, y: number, margin = 1): boolean {
  const dx = (x - land.cx) / land.rx;
  const dy = (y - land.cy) / land.ry;
  return Math.hypot(dx, dy) < coastRadius(Math.atan2(dy, dx), land.phase) * margin;
}

export function isLand(x: number, y: number, margin = 1): boolean {
  return LANDS.some((land) => isInLand(land, x, y, margin));
}

/** Góc trên trái của Lạc Việt Châu, để đặt các địa danh của châu này theo tọa độ riêng. */
export const HOME_X = 1850;
export const HOME_Y = 2200;

function home(place: Place): Place {
  return { ...place, x: place.x + HOME_X, y: place.y + HOME_Y };
}

export const PLACES: Place[] = [
  // ----- Lạc Việt Châu: Lạc Thành và vùng ven -----
  home({ id: 'hangMay', name: 'Ngõ Hàng Mây', type: 'home', x: 850, y: 1050, linhKhi: 1, description: 'Căn nhà nhỏ trong ngõ. Yên tĩnh và an toàn.' }),
  home({ id: 'dongXuan', name: 'Chợ đêm Đồng Xuân', type: 'market', x: 620, y: 900, linhKhi: 0.8, description: 'Chợ ngầm của giới tu luyện, mua bán bằng linh thạch.' }),
  home({ id: 'longBien', name: 'Ga Long Biên', type: 'station', x: 1090, y: 900, linhKhi: 0.8, description: 'Ga tàu điện lớn nhất Lạc Thành.' }),
  home({ id: 'tinhTam', name: 'Hồ Tịnh Tâm', type: 'spring', x: 850, y: 750, linhKhi: 1.5, description: 'Mặt hồ phủ sương, linh khí đậm hơn hẳn phố xá.' }),
  home({ id: 'bachMa', name: 'Tháp Bạch Mã', type: 'guild', x: 1160, y: 1150, linhKhi: 1, description: 'Trụ sở hiệp hội dị năng giả.' }),
  home({ id: 'taySon', name: 'Võ quán Tây Sơn', type: 'dojo', x: 560, y: 1190, linhKhi: 1, description: 'Nơi các thể tu rèn luyện và tỉ thí.' }),
  home({ id: 'hacThuy', name: 'Khu xưởng Hắc Thủy', type: 'beast', x: 840, y: 1430, linhKhi: 1.2, description: 'Nhà máy bỏ hoang ven thành, dị thú làm tổ.' }),
  home({ id: 'yenTu', name: 'Đạo quán Yên Tử', type: 'sect', x: 390, y: 480, linhKhi: 2.5, description: 'Đạo quán trên núi, linh mạch lớn nhất châu.' }),
  home({ id: 'cucPhuong', name: 'Rừng Cúc Phương', type: 'beast', x: 1330, y: 520, linhKhi: 2, description: 'Rừng già dị biến. Linh dược nhiều, dị thú cũng nhiều.' }),
  home({ id: 'phongNha', name: 'Động Phong Nha', type: 'secret', x: 1340, y: 1630, linhKhi: 1.8, description: 'Cửa bí cảnh. Vào được chưa chắc ra được.' }),
  home({ id: 'benHaLong', name: 'Bến Hạ Long', type: 'port', x: 850, y: 210, linhKhi: 1, description: 'Bến thuyền phía bắc, có chuyến ra Bắc Băng Nguyên.' }),
  home({ id: 'cangHaiVan', name: 'Cảng Hải Vân', type: 'port', x: 1520, y: 1000, linhKhi: 1, description: 'Cảng lớn phía đông, tàu ra quần đảo Đông Hải.' }),
  home({ id: 'benCuaLo', name: 'Bến Cửa Lò', type: 'port', x: 260, y: 1050, linhKhi: 1, description: 'Bến nhỏ phía tây, thuyền buôn sang Tây Mạc.' }),
  home({ id: 'muiCaMau', name: 'Mũi Cà Mau', type: 'port', x: 850, y: 1730, linhKhi: 1, description: 'Mũi đất tận cùng phía nam, nhìn sang Nam Hoang.' }),

  // ----- Bắc Băng Nguyên -----
  { id: 'benBangHa', name: 'Bến Băng Hà', type: 'port', x: 2700, y: 1290, linhKhi: 1, description: 'Bến thuyền đóng băng nửa năm.' },
  { id: 'saPa', name: 'Làng Sa Pa', type: 'village', x: 2200, y: 950, linhKhi: 1.2, description: 'Làng nhỏ giữa tuyết, dân quen sống cùng giá rét.' },
  { id: 'phanXiPang', name: 'Đỉnh Phan Xi Păng', type: 'sect', x: 2950, y: 720, linhKhi: 3, description: 'Kiếm tông trên nóc nhà thế giới. Linh khí lạnh và sắc.' },
  { id: 'mauSon', name: 'Băng cung Mẫu Sơn', type: 'secret', x: 3550, y: 880, linhKhi: 2.5, description: 'Cung điện băng không ai biết ai dựng.' },
  { id: 'baBe', name: 'Hồ Ba Bể', type: 'spring', x: 1800, y: 820, linhKhi: 2, description: 'Hồ không bao giờ đóng băng dù tuyết phủ quanh năm.' },

  // ----- Tây Mạc -----
  { id: 'muiNe', name: 'Bến Mũi Né', type: 'port', x: 1060, y: 3300, linhKhi: 1, description: 'Bến thuyền cạnh những đồi cát đỏ.' },
  { id: 'phanRang', name: 'Ốc đảo Phan Rang', type: 'market', x: 650, y: 3000, linhKhi: 1, description: 'Chợ giữa sa mạc, thứ gì cũng có giá.' },
  { id: 'poNagar', name: 'Tháp cổ Pô Na Ga', type: 'ruin', x: 520, y: 3700, linhKhi: 2, description: 'Tháp gạch nung đứng giữa cát đã nghìn năm.' },
  { id: 'saTrung', name: 'Sào huyệt Sa Trùng', type: 'beast', x: 760, y: 2520, linhKhi: 1.5, description: 'Cát ở đây tự chuyển động.' },
  { id: 'catVang', name: 'Bí cảnh Cát Vàng', type: 'secret', x: 620, y: 4150, linhKhi: 2.8, description: 'Chỉ hiện ra sau mỗi trận bão cát.' },

  // ----- Quần đảo Đông Hải -----
  { id: 'benCatBa', name: 'Bến Cát Bà', type: 'port', x: 4610, y: 2450, linhKhi: 1, description: 'Bến cá nhộn nhịp nhất quần đảo.' },
  { id: 'thienCung', name: 'Động Thiên Cung', type: 'secret', x: 4810, y: 2330, linhKhi: 2.5, description: 'Hang động nhũ đá phát sáng.' },
  { id: 'langLySon', name: 'Làng chài Lý Sơn', type: 'port', x: 4840, y: 3190, linhKhi: 1.2, description: 'Làng chài trên đảo núi lửa.' },
  { id: 'thoiLoi', name: 'Miệng núi Thới Lới', type: 'spring', x: 4960, y: 3440, linhKhi: 2.8, description: 'Miệng núi lửa đã tắt, linh khí tụ thành hồ.' },
  { id: 'anThoi', name: 'Cảng An Thới', type: 'port', x: 4560, y: 4210, linhKhi: 1, description: 'Cảng phía nam quần đảo.' },
  { id: 'hamNinh', name: 'Rừng Hàm Ninh', type: 'beast', x: 4790, y: 4130, linhKhi: 1.8, description: 'Rừng nguyên sinh, hải thú lên bờ làm tổ.' },
  { id: 'conLon', name: 'Ngục Côn Lôn', type: 'ruin', x: 5050, y: 4950, linhKhi: 2.2, description: 'Nhà ngục bỏ hoang. Oán khí chưa tan.' },

  // ----- Nam Hoang -----
  { id: 'rachGia', name: 'Bến Rạch Giá', type: 'port', x: 2800, y: 5200, linhKhi: 1, description: 'Bến thuyền bên cửa sông đục ngầu.' },
  { id: 'uMinh', name: 'Làng U Minh', type: 'village', x: 2300, y: 5600, linhKhi: 1.3, description: 'Làng nhà sàn giữa rừng ngập nước.' },
  { id: 'rungTram', name: 'Rừng tràm U Minh Hạ', type: 'beast', x: 1900, y: 5760, linhKhi: 2, description: 'Nước đen, cây đen, và những thứ sống trong nước cũng đen.' },
  { id: 'chuDangYa', name: 'Hỏa sơn Chư Đăng Ya', type: 'spring', x: 3300, y: 5500, linhKhi: 3, description: 'Núi lửa còn thở. Linh khí nóng rực.' },
  { id: 'sonDoong', name: 'Hang Sơn Đoòng', type: 'secret', x: 3800, y: 5700, linhKhi: 3, description: 'Hang lớn tới mức có mây và rừng riêng bên trong.' },
];

export type RoadKind = 'city' | 'trail' | 'sea';

/** Đường nối giữa hai địa danh, số ngày đi và loại đường. */
export const ROADS: [string, string, number, RoadKind][] = [
  ['hangMay', 'dongXuan', 1, 'city'],
  ['hangMay', 'longBien', 1, 'city'],
  ['hangMay', 'tinhTam', 1, 'city'],
  ['hangMay', 'bachMa', 2, 'city'],
  ['hangMay', 'taySon', 2, 'city'],
  ['hangMay', 'hacThuy', 5, 'city'],
  ['dongXuan', 'tinhTam', 1, 'city'],
  ['longBien', 'tinhTam', 1, 'city'],
  ['dongXuan', 'taySon', 2, 'city'],
  ['longBien', 'bachMa', 1, 'city'],
  ['taySon', 'hacThuy', 4, 'city'],
  ['dongXuan', 'yenTu', 20, 'trail'],
  ['tinhTam', 'yenTu', 24, 'trail'],
  ['longBien', 'cucPhuong', 15, 'trail'],
  ['tinhTam', 'cucPhuong', 18, 'trail'],
  ['bachMa', 'phongNha', 30, 'trail'],
  ['hacThuy', 'phongNha', 20, 'trail'],
  ['tinhTam', 'benHaLong', 22, 'trail'],
  ['yenTu', 'benHaLong', 18, 'trail'],
  ['cucPhuong', 'benHaLong', 20, 'trail'],
  ['longBien', 'cangHaiVan', 12, 'trail'],
  ['bachMa', 'cangHaiVan', 12, 'trail'],
  ['taySon', 'benCuaLo', 12, 'trail'],
  ['dongXuan', 'benCuaLo', 14, 'trail'],
  ['hacThuy', 'muiCaMau', 12, 'trail'],
  ['phongNha', 'muiCaMau', 22, 'trail'],

  ['benBangHa', 'saPa', 25, 'trail'],
  ['benBangHa', 'phanXiPang', 30, 'trail'],
  ['saPa', 'baBe', 20, 'trail'],
  ['saPa', 'phanXiPang', 35, 'trail'],
  ['phanXiPang', 'mauSon', 30, 'trail'],

  ['muiNe', 'phanRang', 20, 'trail'],
  ['phanRang', 'saTrung', 25, 'trail'],
  ['phanRang', 'poNagar', 30, 'trail'],
  ['muiNe', 'poNagar', 32, 'trail'],
  ['poNagar', 'catVang', 22, 'trail'],

  ['benCatBa', 'thienCung', 8, 'trail'],
  ['langLySon', 'thoiLoi', 10, 'trail'],
  ['anThoi', 'hamNinh', 9, 'trail'],

  ['rachGia', 'uMinh', 22, 'trail'],
  ['uMinh', 'rungTram', 15, 'trail'],
  ['rachGia', 'chuDangYa', 26, 'trail'],
  ['chuDangYa', 'sonDoong', 24, 'trail'],

  ['benHaLong', 'benBangHa', 60, 'sea'],
  ['benCuaLo', 'muiNe', 50, 'sea'],
  ['cangHaiVan', 'benCatBa', 45, 'sea'],
  ['cangHaiVan', 'langLySon', 50, 'sea'],
  ['muiCaMau', 'rachGia', 55, 'sea'],
  ['muiCaMau', 'anThoi', 65, 'sea'],
  ['benCatBa', 'langLySon', 20, 'sea'],
  ['langLySon', 'anThoi', 25, 'sea'],
  ['anThoi', 'conLon', 30, 'sea'],
  ['rachGia', 'anThoi', 50, 'sea'],
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
