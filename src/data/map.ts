/**
 * Bản đồ thế giới của một kiếp lịch luyện: Thiên Nam Đại Lục gồm năm quốc gia liền nhau,
 * quanh đó là các đảo. Trong đại lục đi đường bộ qua các quan ải; ra đảo đi đường biển từ các cảng.
 */

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
  | 'ruin'
  | 'city'
  | 'pass';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  x: number;
  y: number;
  /** Hệ số linh khí: bế quan ở đây nhanh hay chậm. */
  linhKhi: number;
  /** Mức nguy hiểm: bậc cảnh giới nên có để tới đây an toàn (0 là phàm nhân cũng tới được). */
  danger: number;
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
  city: { label: 'Thành thị', icon: '🏯', color: 0xf2a65a },
  pass: { label: 'Quan ải', icon: '🚩', color: 0xc9d4e8 },
};

export type Biome = 'temperate' | 'ice' | 'desert' | 'jungle' | 'island' | 'highland' | 'volcanic';

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
  /** Thuộc đại lục chính: các vùng này nối liền nhau thành một khối, mỗi vùng là một quốc gia. */
  mainland?: boolean;
}

export const MAP_WIDTH = 7400;
export const MAP_HEIGHT = 6200;
export const START_PLACE = 'hangMay';

export const LANDS: Land[] = [
  { id: 'lacViet', name: 'LẠC VIỆT QUỐC', cx: 1900, cy: 2300, rx: 760, ry: 900, phase: 0, biome: 'temperate', mainland: true },
  { id: 'bacBang', name: 'BẮC BĂNG QUỐC', cx: 1900, cy: 1050, rx: 1300, ry: 520, phase: 1.7, biome: 'ice', mainland: true },
  { id: 'tayMac', name: 'TÂY MẠC QUỐC', cx: 850, cy: 2400, rx: 520, ry: 1200, phase: 3.1, biome: 'desert', mainland: true },
  { id: 'namHoang', name: 'NAM HOANG QUỐC', cx: 2000, cy: 3550, rx: 1400, ry: 560, phase: 4.4, biome: 'jungle', mainland: true },
  { id: 'catBa', name: 'ĐẢO CÁT BÀ', cx: 5300, cy: 1500, rx: 330, ry: 280, phase: 0.6, biome: 'island' },
  { id: 'lySon', name: 'ĐẢO LÝ SƠN', cx: 5500, cy: 2400, rx: 300, ry: 380, phase: 2.2, biome: 'island' },
  { id: 'phuQuoc', name: 'ĐẢO PHÚ QUỐC', cx: 5250, cy: 3300, rx: 360, ry: 300, phase: 5.0, biome: 'island' },
  { id: 'conDao', name: 'CÔN ĐẢO', cx: 5650, cy: 4050, rx: 220, ry: 200, phase: 3.7, biome: 'island' },
  { id: 'dongSon', name: 'ĐÔNG SƠN QUỐC', cx: 3600, cy: 2100, rx: 1100, ry: 1500, phase: 2.9, biome: 'highland', mainland: true },
  { id: 'xichDiem', name: 'XÍCH DIỆM ĐẢO', cx: 5700, cy: 5100, rx: 1250, ry: 700, phase: 1.1, biome: 'volcanic' },
  { id: 'bachLongVi', name: 'ĐẢO BẠCH LONG VĨ', cx: 5200, cy: 600, rx: 300, ry: 260, phase: 4.0, biome: 'island' },
  { id: 'honTre', name: 'HÒN TRE', cx: 3900, cy: 4500, rx: 260, ry: 240, phase: 0.3, biome: 'island' },
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

/** Quốc gia hoặc đảo chứa một điểm. Chỗ hai vùng chồng lên nhau thì vùng đứng trước trong danh sách được tính. */
export function landAt(x: number, y: number): Land | undefined {
  return LANDS.find((land) => isInLand(land, x, y));
}

export function isLand(x: number, y: number, margin = 1): boolean {
  return LANDS.some((land) => isInLand(land, x, y, margin));
}

/** Góc trên trái của Lạc Việt Châu, để đặt các địa danh của châu này theo tọa độ riêng. */
export const HOME_X = 1050;
export const HOME_Y = 1300;

function home(place: Place): Place {
  return { ...place, x: place.x + HOME_X, y: place.y + HOME_Y };
}

export const PLACES: Place[] = [
  // ----- Lạc Việt Quốc -----
  home({ id: 'hangMay', name: 'Ngõ Hàng Mây', type: 'home', x: 850, y: 1050, linhKhi: 1, danger: 0, description: 'Căn nhà nhỏ trong ngõ. Yên tĩnh và an toàn.' }),
  home({ id: 'dongXuan', name: 'Chợ đêm Đồng Xuân', type: 'market', x: 620, y: 900, linhKhi: 0.8, danger: 0, description: 'Chợ ngầm của giới tu luyện, mua bán bằng linh thạch.' }),
  home({ id: 'longBien', name: 'Ga Long Biên', type: 'station', x: 1090, y: 900, linhKhi: 0.8, danger: 0, description: 'Ga tàu điện lớn nhất Lạc Thành.' }),
  home({ id: 'tinhTam', name: 'Hồ Tịnh Tâm', type: 'spring', x: 850, y: 750, linhKhi: 1.5, danger: 0, description: 'Mặt hồ phủ sương, linh khí đậm hơn hẳn phố xá.' }),
  home({ id: 'bachMa', name: 'Tháp Bạch Mã', type: 'guild', x: 1160, y: 1150, linhKhi: 1, danger: 0, description: 'Trụ sở hiệp hội dị năng giả.' }),
  home({ id: 'taySon', name: 'Võ quán Tây Sơn', type: 'dojo', x: 560, y: 1190, linhKhi: 1, danger: 0, description: 'Nơi các thể tu rèn luyện và tỉ thí.' }),
  home({ id: 'hacThuy', name: 'Khu xưởng Hắc Thủy', type: 'beast', x: 840, y: 1430, linhKhi: 1.2, danger: 1, description: 'Nhà máy bỏ hoang ven thành, dị thú làm tổ.' }),
  home({ id: 'yenTu', name: 'Đạo quán Yên Tử', type: 'sect', x: 390, y: 480, linhKhi: 2.5, danger: 0, description: 'Đạo quán trên núi, linh mạch lớn nhất châu.' }),
  home({ id: 'cucPhuong', name: 'Rừng Cúc Phương', type: 'beast', x: 1330, y: 520, linhKhi: 2, danger: 1, description: 'Rừng già dị biến. Linh dược nhiều, dị thú cũng nhiều.' }),
  home({ id: 'phongNha', name: 'Động Phong Nha', type: 'secret', x: 1340, y: 1630, linhKhi: 1.8, danger: 2, description: 'Cửa bí cảnh. Vào được chưa chắc ra được.' }),
  home({ id: 'benHaLong', name: 'Ải Hạ Long', type: 'pass', x: 850, y: 210, linhKhi: 1, danger: 0, description: 'Cửa ải phía bắc, bên kia là Bắc Băng Quốc.' }),
  home({ id: 'cangHaiVan', name: 'Ải Hải Vân', type: 'pass', x: 1520, y: 1000, linhKhi: 1, danger: 0, description: 'Đèo cao phía đông, bên kia là Đông Sơn Quốc.' }),
  home({ id: 'benCuaLo', name: 'Ải Cửa Lò', type: 'pass', x: 260, y: 1050, linhKhi: 1, danger: 0, description: 'Cửa ải phía tây, bên kia là cát của Tây Mạc Quốc.' }),
  home({ id: 'muiCaMau', name: 'Ải Cà Mau', type: 'pass', x: 850, y: 1730, linhKhi: 1, danger: 0, description: 'Cửa ải phía nam, bên kia là rừng Nam Hoang Quốc.' }),
  home({ id: 'vinh', name: 'Thành Vinh', type: 'city', x: 330, y: 1500, linhKhi: 1, danger: 0, description: 'Thành thị phía tây nam Lạc Việt Quốc, nổi tiếng thợ rèn.' }),
  home({ id: 'hue', name: 'Cố thành Huế', type: 'city', x: 1450, y: 1380, linhKhi: 1.3, danger: 0, description: 'Kinh thành xưa bên sông, nay là nơi các thế gia tụ họp.' }),

  // ----- Bắc Băng Quốc -----
  { id: 'langSon', name: 'Băng thành Lạng Sơn', type: 'city', x: 1780, y: 1240, linhKhi: 1.2, danger: 1, description: 'Kinh đô Bắc Băng Quốc, tường thành đắp bằng băng vĩnh cửu.' },
  { id: 'dienBien', name: 'Thành Điện Biên', type: 'city', x: 2450, y: 1270, linhKhi: 1.2, danger: 2, description: 'Thành trấn biên, quanh năm phòng dị thú từ núi tràn xuống.' },
  { id: 'cuaOng', name: 'Cảng Cửa Ông', type: 'port', x: 2980, y: 1110, linhKhi: 1, danger: 2, description: 'Cảng phía đông Bắc Băng Quốc, tàu phá băng ra biển.' },
  { id: 'benBangHa', name: 'Ải Băng Hà', type: 'pass', x: 1900, y: 1440, linhKhi: 1, danger: 1, description: 'Cửa ải đóng băng, lối xuống Lạc Việt Quốc.' },
  { id: 'saPa', name: 'Làng Sa Pa', type: 'village', x: 1400, y: 1100, linhKhi: 1.2, danger: 1, description: 'Làng nhỏ giữa tuyết, dân quen sống cùng giá rét.' },
  { id: 'phanXiPang', name: 'Đỉnh Phan Xi Păng', type: 'sect', x: 2150, y: 870, linhKhi: 3, danger: 2, description: 'Kiếm tông trên nóc nhà thế giới. Linh khí lạnh và sắc.' },
  { id: 'mauSon', name: 'Băng cung Mẫu Sơn', type: 'secret', x: 2750, y: 1030, linhKhi: 2.5, danger: 3, description: 'Cung điện băng không ai biết ai dựng.' },
  { id: 'baBe', name: 'Hồ Ba Bể', type: 'spring', x: 1000, y: 970, linhKhi: 2, danger: 2, description: 'Hồ không bao giờ đóng băng dù tuyết phủ quanh năm.' },

  // ----- Tây Mạc Quốc -----
  { id: 'ninhThuan', name: 'Sa đô Ninh Thuận', type: 'city', x: 980, y: 2660, linhKhi: 1.1, danger: 1, description: 'Kinh đô Tây Mạc Quốc, xây quanh một giếng không bao giờ cạn.' },
  { id: 'tuyHoa', name: 'Thành Tuy Hòa', type: 'city', x: 570, y: 2350, linhKhi: 1, danger: 2, description: 'Thành của các đoàn lữ hành, cửa ngõ ra biển tây.' },
  { id: 'muiNe', name: 'Ải Mũi Né', type: 'pass', x: 1210, y: 2400, linhKhi: 1, danger: 1, description: 'Cửa ải cạnh những đồi cát đỏ, lối sang Lạc Việt Quốc.' },
  { id: 'phanRang', name: 'Ốc đảo Phan Rang', type: 'market', x: 800, y: 2100, linhKhi: 1, danger: 1, description: 'Chợ giữa sa mạc, thứ gì cũng có giá.' },
  { id: 'poNagar', name: 'Tháp cổ Pô Na Ga', type: 'ruin', x: 670, y: 2800, linhKhi: 2, danger: 2, description: 'Tháp gạch nung đứng giữa cát đã nghìn năm.' },
  { id: 'saTrung', name: 'Sào huyệt Sa Trùng', type: 'beast', x: 910, y: 1620, linhKhi: 1.5, danger: 3, description: 'Cát ở đây tự chuyển động.' },
  { id: 'catVang', name: 'Bí cảnh Cát Vàng', type: 'secret', x: 770, y: 3250, linhKhi: 2.8, danger: 4, description: 'Chỉ hiện ra sau mỗi trận bão cát.' },

  // ----- Quần đảo Đông Hải -----
  { id: 'benCatBa', name: 'Bến Cát Bà', type: 'port', x: 5210, y: 1550, linhKhi: 1, danger: 1, description: 'Bến cá nhộn nhịp nhất quần đảo.' },
  { id: 'thienCung', name: 'Động Thiên Cung', type: 'secret', x: 5410, y: 1430, linhKhi: 2.5, danger: 2, description: 'Hang động nhũ đá phát sáng.' },
  { id: 'langLySon', name: 'Làng chài Lý Sơn', type: 'port', x: 5440, y: 2290, linhKhi: 1.2, danger: 1, description: 'Làng chài trên đảo núi lửa.' },
  { id: 'thoiLoi', name: 'Miệng núi Thới Lới', type: 'spring', x: 5560, y: 2540, linhKhi: 2.8, danger: 2, description: 'Miệng núi lửa đã tắt, linh khí tụ thành hồ.' },
  { id: 'anThoi', name: 'Cảng An Thới', type: 'port', x: 5160, y: 3310, linhKhi: 1, danger: 1, description: 'Cảng phía nam quần đảo.' },
  { id: 'hamNinh', name: 'Rừng Hàm Ninh', type: 'beast', x: 5390, y: 3230, linhKhi: 1.8, danger: 3, description: 'Rừng nguyên sinh, hải thú lên bờ làm tổ.' },
  { id: 'conLon', name: 'Ngục Côn Lôn', type: 'ruin', x: 5650, y: 4050, linhKhi: 2.2, danger: 4, description: 'Nhà ngục bỏ hoang. Oán khí chưa tan.' },

  // ----- Nam Hoang Quốc -----
  { id: 'canTho', name: 'Thành Cần Thơ', type: 'city', x: 1960, y: 3510, linhKhi: 1.2, danger: 2, description: 'Kinh đô Nam Hoang Quốc, nửa thành nổi trên sông.' },
  { id: 'baoLoc', name: 'Thành Bảo Lộc', type: 'city', x: 2820, y: 3330, linhKhi: 1.3, danger: 2, description: 'Thành trên đồi trà, dược sư khắp nơi tìm về.' },
  { id: 'haTien', name: 'Cảng Hà Tiên', type: 'port', x: 2550, y: 3910, linhKhi: 1, danger: 2, description: 'Cảng phía nam đại lục, tàu ra các đảo xa.' },
  { id: 'rachGia', name: 'Ải Rạch Giá', type: 'pass', x: 2000, y: 3150, linhKhi: 1, danger: 2, description: 'Cửa ải bên dòng sông đục, lối lên Lạc Việt Quốc.' },
  { id: 'uMinh', name: 'Làng U Minh', type: 'village', x: 1500, y: 3550, linhKhi: 1.3, danger: 2, description: 'Làng nhà sàn giữa rừng ngập nước.' },
  { id: 'rungTram', name: 'Rừng tràm U Minh Hạ', type: 'beast', x: 1100, y: 3710, linhKhi: 2, danger: 3, description: 'Nước đen, cây đen, và những thứ sống trong nước cũng đen.' },
  { id: 'chuDangYa', name: 'Hỏa sơn Chư Đăng Ya', type: 'spring', x: 2500, y: 3450, linhKhi: 3, danger: 4, description: 'Núi lửa còn thở. Linh khí nóng rực.' },
  { id: 'sonDoong', name: 'Hang Sơn Đoòng', type: 'secret', x: 3000, y: 3650, linhKhi: 3, danger: 5, description: 'Hang lớn tới mức có mây và rừng riêng bên trong.' },

  // ----- Đông Sơn Quốc -----
  { id: 'haiPhong', name: 'Thành Hải Phòng', type: 'city', x: 3150, y: 1750, linhKhi: 1.1, danger: 1, description: 'Thành thị đông đúc nhất Đông Sơn Quốc.' },
  { id: 'thanhHoa', name: 'Thành Thanh Hóa', type: 'city', x: 3900, y: 2480, linhKhi: 1.2, danger: 2, description: 'Thành cổ dưới chân núi, quê của nhiều võ tướng.' },
  { id: 'doSon', name: 'Cảng Đồ Sơn', type: 'port', x: 4450, y: 2000, linhKhi: 1, danger: 2, description: 'Cảng lớn bờ đông, tàu ra quần đảo Đông Hải.' },
  { id: 'vanDon', name: 'Ải Vân Đồn', type: 'pass', x: 2720, y: 2100, linhKhi: 1, danger: 1, description: 'Cửa ngõ phía tây của Đông Sơn Quốc.' },
  { id: 'hoaLu', name: 'Cố đô Hoa Lư', type: 'city', x: 3500, y: 2000, linhKhi: 1.2, danger: 1, description: 'Kinh đô Đông Sơn Quốc, thành cổ giữa núi đá.' },
  { id: 'mocChau', name: 'Làng Mộc Châu', type: 'village', x: 3200, y: 1300, linhKhi: 1.3, danger: 1, description: 'Làng trên cao nguyên, quanh năm mây phủ.' },
  { id: 'tamDao', name: 'Kiếm các Tam Đảo', type: 'sect', x: 4000, y: 1200, linhKhi: 3.2, danger: 3, description: 'Ba ngọn núi, ba mạch kiếm. Không nhận kẻ yếu.' },
  { id: 'nuiCoc', name: 'Hồ Núi Cốc', type: 'spring', x: 4200, y: 2200, linhKhi: 2.6, danger: 2, description: 'Hồ sâu giữa núi, nước xanh như ngọc.' },
  { id: 'baiDinh', name: 'Cổ tự Bái Đính', type: 'ruin', x: 3700, y: 2800, linhKhi: 2.4, danger: 3, description: 'Ngôi chùa bỏ hoang, chuông vẫn tự đổ lúc nửa đêm.' },
  { id: 'trangAn', name: 'Bí cảnh Tràng An', type: 'secret', x: 3300, y: 3100, linhKhi: 3.5, danger: 4, description: 'Hang nối hang, nước nối nước. Lối vào đổi chỗ mỗi mùa.' },
  { id: 'samSon', name: 'Bến Sầm Sơn', type: 'port', x: 3350, y: 3330, linhKhi: 1, danger: 2, description: 'Bến thuyền phía nam Đông Sơn Châu.' },

  // ----- Xích Diệm Đảo -----
  { id: 'honKhoi', name: 'Bến Hòn Khói', type: 'port', x: 5700, y: 4540, linhKhi: 1.2, danger: 3, description: 'Bến thuyền dưới trời tro bụi.' },
  { id: 'cuLao', name: 'Làng Cù Lao', type: 'village', x: 5200, y: 5050, linhKhi: 1.5, danger: 3, description: 'Dân làng sống nhờ suối nước nóng.' },
  { id: 'batTrang', name: 'Lò rèn Bát Tràng', type: 'market', x: 6100, y: 4950, linhKhi: 1.5, danger: 3, description: 'Lò rèn pháp bảo dùng lửa địa tâm.' },
  { id: 'baDen', name: 'Núi Bà Đen', type: 'beast', x: 5600, y: 5400, linhKhi: 3, danger: 4, description: 'Hỏa thú làm tổ trong lòng núi.' },
  { id: 'chuProng', name: 'Hỏa ngục Chư Prông', type: 'secret', x: 6500, y: 5250, linhKhi: 4, danger: 5, description: 'Biển dung nham. Chưa ai vào mà kể lại được.' },

  // ----- Đảo lẻ -----
  { id: 'bachLongVi', name: 'Hải đăng Bạch Long Vĩ', type: 'port', x: 5200, y: 600, linhKhi: 1.5, danger: 2, description: 'Ngọn hải đăng giữa biển bắc.' },
  { id: 'honTre', name: 'Thủy trại Hòn Tre', type: 'port', x: 3900, y: 4500, linhKhi: 1.5, danger: 3, description: 'Sào huyệt của hải tặc, ai có linh thạch đều là khách.' },
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

  ['benHaLong', 'benBangHa', 12, 'trail'],
  ['benCuaLo', 'muiNe', 12, 'trail'],
  ['cangHaiVan', 'vanDon', 12, 'trail'],
  ['doSon', 'langLySon', 45, 'sea'],
  ['muiCaMau', 'rachGia', 12, 'trail'],
  ['haTien', 'anThoi', 60, 'sea'],
  ['benCatBa', 'langLySon', 20, 'sea'],
  ['langLySon', 'anThoi', 25, 'sea'],
  ['anThoi', 'conLon', 30, 'sea'],
  ['haTien', 'conLon', 70, 'sea'],

  ['vanDon', 'hoaLu', 25, 'trail'],
  ['hoaLu', 'mocChau', 28, 'trail'],
  ['mocChau', 'tamDao', 30, 'trail'],
  ['hoaLu', 'nuiCoc', 26, 'trail'],
  ['hoaLu', 'baiDinh', 28, 'trail'],
  ['baiDinh', 'trangAn', 20, 'trail'],
  ['trangAn', 'samSon', 12, 'trail'],
  ['baiDinh', 'samSon', 22, 'trail'],
  ['honKhoi', 'cuLao', 24, 'trail'],
  ['honKhoi', 'batTrang', 22, 'trail'],
  ['cuLao', 'baDen', 20, 'trail'],
  ['batTrang', 'baDen', 22, 'trail'],
  ['batTrang', 'chuProng', 24, 'trail'],

  ['doSon', 'benCatBa', 40, 'sea'],
  ['samSon', 'langLySon', 55, 'sea'],
  ['benCatBa', 'bachLongVi', 40, 'sea'],
  ['cuaOng', 'bachLongVi', 45, 'sea'],
  ['doSon', 'bachLongVi', 50, 'sea'],
  ['anThoi', 'samSon', 80, 'sea'],
  ['conLon', 'honTre', 25, 'sea'],
  ['haTien', 'honTre', 30, 'sea'],
  ['honTre', 'honKhoi', 35, 'sea'],
  ['samSon', 'honKhoi', 50, 'sea'],

  ['taySon', 'vinh', 10, 'trail'],
  ['benCuaLo', 'vinh', 10, 'trail'],
  ['hacThuy', 'vinh', 12, 'trail'],
  ['bachMa', 'hue', 10, 'trail'],
  ['cangHaiVan', 'hue', 10, 'trail'],
  ['phongNha', 'hue', 12, 'trail'],
  ['benBangHa', 'langSon', 12, 'trail'],
  ['saPa', 'langSon', 16, 'trail'],
  ['phanXiPang', 'langSon', 22, 'trail'],
  ['langSon', 'dienBien', 24, 'trail'],
  ['dienBien', 'mauSon', 18, 'trail'],
  ['dienBien', 'cuaOng', 20, 'trail'],
  ['muiNe', 'ninhThuan', 14, 'trail'],
  ['phanRang', 'ninhThuan', 20, 'trail'],
  ['poNagar', 'ninhThuan', 16, 'trail'],
  ['phanRang', 'tuyHoa', 16, 'trail'],
  ['ninhThuan', 'tuyHoa', 20, 'trail'],
  ['rachGia', 'canTho', 14, 'trail'],
  ['uMinh', 'canTho', 18, 'trail'],
  ['canTho', 'baoLoc', 28, 'trail'],
  ['chuDangYa', 'baoLoc', 14, 'trail'],
  ['baoLoc', 'haTien', 22, 'trail'],
  ['sonDoong', 'haTien', 20, 'trail'],
  ['vanDon', 'haiPhong', 16, 'trail'],
  ['haiPhong', 'hoaLu', 14, 'trail'],
  ['haiPhong', 'mocChau', 20, 'trail'],
  ['hoaLu', 'thanhHoa', 18, 'trail'],
  ['thanhHoa', 'nuiCoc', 14, 'trail'],
  ['thanhHoa', 'baiDinh', 14, 'trail'],
  ['nuiCoc', 'doSon', 14, 'trail'],
  ['thanhHoa', 'doSon', 22, 'trail'],
];

/** Mức nguy hiểm của một nơi so với bậc của người chơi: 0 an toàn, 1 ngang sức, 2 nguy hiểm, 3 tử địa. */
export function dangerLevel(place: Place, tier: number): number {
  if (place.danger === 0 || place.danger < tier) return 0;
  if (place.danger === tier) return 1;
  if (place.danger === tier + 1) return 2;
  return 3;
}

export const DANGER_LEVELS = [
  { label: 'An toàn', color: 0x7fe08a },
  { label: 'Ngang sức', color: 0xffd36b },
  { label: 'Nguy hiểm', color: 0xff8a3c },
  { label: 'Tử địa', color: 0xff3b3b },
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
