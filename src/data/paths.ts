export type PathId = 'tuTien' | 'theTu' | 'diNang';

export interface Stats {
  theChat: number;
  sucManh: number;
  thanPhap: number;
  linhLuc: number;
  thanThuc: number;
  ngoTinh: number;
}

export const STAT_LABELS: Record<keyof Stats, string> = {
  theChat: 'Thể chất',
  sucManh: 'Sức mạnh',
  thanPhap: 'Thân pháp',
  linhLuc: 'Linh lực',
  thanThuc: 'Thần thức',
  ngoTinh: 'Ngộ tính',
};

export const STAT_HINTS: Record<keyof Stats, string> = {
  theChat: 'Máu, phòng thủ',
  sucManh: 'Sát thương vật lý',
  thanPhap: 'Thứ tự ra đòn, né tránh',
  linhLuc: 'Sát thương pháp thuật',
  thanThuc: 'Sức mạnh dị năng, chí mạng',
  ngoTinh: 'Tốc độ tu luyện',
};

export const BASE_STATS: Stats = {
  theChat: 5,
  sucManh: 5,
  thanPhap: 5,
  linhLuc: 5,
  thanThuc: 5,
  ngoTinh: 5,
};

export interface PathDef {
  id: PathId;
  name: string;
  energyName: string;
  color: number;
  description: string;
  trait: string;
  /** Tên các bậc Nhân giới (bậc 1-5). */
  tiers: string[];
  /** Chỉ số cộng mỗi lần lên giai đoạn. */
  gains: Partial<Stats>;
  /** Hệ số năng lượng cần cho mỗi giai đoạn. */
  costMultiplier: number;
}

export const PATHS: Record<PathId, PathDef> = {
  tuTien: {
    id: 'tuTien',
    name: 'Tu tiên',
    energyName: 'Linh khí',
    color: 0x7fd4ff,
    description: 'Hấp thụ linh khí, luyện pháp thuật.\nTốc độ tu phụ thuộc linh căn.',
    trait: 'Tu luyện cả khi tắt game',
    tiers: ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần'],
    gains: { linhLuc: 3, thanThuc: 1, ngoTinh: 1 },
    costMultiplier: 1,
  },
  theTu: {
    id: 'theTu',
    name: 'Thể tu',
    energyName: 'Khí huyết',
    color: 0xff8a5c,
    description: 'Rèn thân thể đến cực hạn.\nTu lâu hơn nhưng tăng toàn diện.',
    trait: 'Không phụ thuộc may rủi, mọi chỉ số đều tăng',
    tiers: ['Luyện Bì', 'Luyện Nhục', 'Đoán Cốt', 'Dịch Cân', 'Tẩy Tủy'],
    gains: { theChat: 3, sucManh: 3, thanPhap: 1, linhLuc: 1, thanThuc: 1, ngoTinh: 1 },
    costMultiplier: 1.5,
  },
  diNang: {
    id: 'diNang',
    name: 'Dị năng',
    energyName: 'Tinh thần lực',
    color: 0xc58cff,
    description: 'Thức tỉnh năng lực đặc biệt.\nCó sẵn một dị năng bản mệnh.',
    trait: 'Dị năng bản mệnh phẩm chất A trở lên',
    tiers: ['Thức Tỉnh', 'Ngưng Hạch', 'Hóa Hình', 'Lĩnh Vực', 'Pháp Tắc'],
    gains: { thanThuc: 3, thanPhap: 1 },
    costMultiplier: 1,
  },
};

export const PATH_ORDER: PathId[] = ['tuTien', 'theTu', 'diNang'];
export const STAGE_NAMES = ['Sơ kỳ', 'Trung kỳ', 'Hậu kỳ'];
