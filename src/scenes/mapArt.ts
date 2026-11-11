import Phaser from 'phaser';
import {
  coastRadius,
  HOME_X,
  HOME_Y,
  isInLand,
  isLand,
  LANDS,
  MAP_HEIGHT,
  MAP_WIDTH,
  PLACES,
  placeById,
  ROADS,
  type Biome,
  type Land,
} from '../data/map';
import { label } from '../ui/widgets';

/**
 * Vẽ nền bản đồ thế giới hoàn toàn bằng code. Mỗi vùng đất được vẽ một lần lên một tấm ảnh
 * riêng (canvas) rồi đưa vào game như một hình tĩnh, nên bản đồ rộng vẫn chạy nhẹ trên điện thoại.
 * Mọi hình tự sinh từ hạt giống cố định: lần nào mở cũng ra đúng một bản đồ.
 */

type Ctx = CanvasRenderingContext2D;
type Random = () => number;
interface Point {
  x: number;
  y: number;
}

/** Tỉ lệ vẽ ảnh nền so với kích thước thật, để tiết kiệm bộ nhớ. */
const TEXTURE_SCALE = 0.7;
/** Phần rìa quanh vùng đất dành cho bờ cát và nước nông. */
const PAD = 1.13;
export const SEA_COLOR = 0x0c2a3d;

const PALETTE: Record<Biome, { shallow: string; sand: string; land: string; patchA: string; patchB: string }> = {
  temperate: { shallow: '#14506a', sand: '#cdb98a', land: '#35573c', patchA: '#44694a', patchB: '#2e4d36' },
  ice: { shallow: '#2a6f8c', sand: '#b9d3e0', land: '#dbe7ee', patchA: '#eef5f8', patchB: '#c2d5e1' },
  desert: { shallow: '#17607a', sand: '#ecd9a6', land: '#d6b676', patchA: '#e2c789', patchB: '#c4a163' },
  jungle: { shallow: '#125a5e', sand: '#bfae7a', land: '#234f30', patchA: '#2c5f38', patchB: '#1a4026' },
  island: { shallow: '#1a6f86', sand: '#efe1b0', land: '#3f6b45', patchA: '#4d7c52', patchB: '#355c3b' },
};

function seededRandom(seed: number): Random {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Các nét vẽ cơ bản ----------

function ellipse(ctx: Ctx, x: number, y: number, width: number, height: number, color: string, alpha = 1): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function triangle(ctx: Ctx, points: [number, number, number, number, number, number], color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  ctx.lineTo(points[2], points[3]);
  ctx.lineTo(points[4], points[5]);
  ctx.closePath();
  ctx.fill();
}

function rect(ctx: Ctx, x: number, y: number, width: number, height: number, color: string, alpha = 1): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  ctx.globalAlpha = 1;
}

function coast(ctx: Ctx, land: Land, scale: number, color: string, alpha = 1): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i <= 240; i += 1) {
    const angle = (i / 240) * Math.PI * 2;
    const radius = coastRadius(angle, land.phase) * scale;
    const x = land.cx + Math.cos(angle) * land.rx * radius;
    const y = land.cy + Math.sin(angle) * land.ry * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function curve(ctx: Ctx, points: Point[], width: number, color: string, alpha = 1): void {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i += 1) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function nearPlace(x: number, y: number, distance: number): boolean {
  return PLACES.some((place) => Math.hypot(place.x - x, place.y - y) < distance);
}

/** Rải điểm ngẫu nhiên trong một hình elip, chỉ lấy điểm nằm trên vùng đất và không đè lên địa danh. */
function scatter(
  random: Random,
  land: Land,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count: number,
  clearance: number,
): Point[] {
  const points: Point[] = [];
  for (let attempt = 0; attempt < count * 6 && points.length < count; attempt += 1) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random());
    const x = cx + Math.cos(angle) * rx * radius;
    const y = cy + Math.sin(angle) * ry * radius;
    if (!isInLand(land, x, y, 0.93) || (clearance > 0 && nearPlace(x, y, clearance))) continue;
    points.push({ x, y });
  }
  // Vẽ từ trên xuống để hình phía dưới che chân hình phía trên.
  return points.sort((a, b) => a.y - b.y);
}

function everywhere(random: Random, land: Land, count: number, clearance: number): Point[] {
  return scatter(random, land, land.cx, land.cy, land.rx * 1.1, land.ry * 1.1, count, clearance);
}

// ---------- Các hình trang trí ----------

function mountain(ctx: Ctx, x: number, y: number, size: number, body: string, shade: string, cap: string): void {
  ellipse(ctx, x + size * 0.2, y + 2, size * 2.1, size * 0.5, '#101a16', 0.35);
  triangle(ctx, [x - size, y, x, y - size * 1.5, x + size, y], body);
  triangle(ctx, [x, y - size * 1.5, x + size, y, x + size * 0.15, y], shade);
  triangle(ctx, [x - size * 0.3, y - size * 1.05, x, y - size * 1.5, x + size * 0.3, y - size * 1.05], cap);
}

function tree(ctx: Ctx, x: number, y: number, size: number, colors: string[], random: Random): void {
  ellipse(ctx, x + 2, y + 1, size * 1.6, size * 0.6, '#0e1a12', 0.35);
  rect(ctx, x - 1.5, y - size * 0.5, 3, size * 0.6, '#3a2a1c');
  ellipse(ctx, x, y - size, size * 2, size * 2, colors[Math.floor(random() * colors.length)]);
  ellipse(ctx, x - size * 0.3, y - size * 1.3, size * 0.9, size * 0.9, '#8fd09a', 0.25);
}

function pine(ctx: Ctx, x: number, y: number, size: number): void {
  rect(ctx, x - 1.5, y - size * 0.3, 3, size * 0.4, '#3a2a1c');
  triangle(ctx, [x - size * 0.7, y - size * 0.2, x, y - size * 1.5, x + size * 0.7, y - size * 0.2], '#1f4a44');
  triangle(ctx, [x - size * 0.5, y - size * 0.9, x, y - size * 2, x + size * 0.5, y - size * 0.9], '#2a5f57');
  triangle(ctx, [x - size * 0.25, y - size * 1.6, x, y - size * 2, x + size * 0.25, y - size * 1.6], '#f2f7f9');
}

function palm(ctx: Ctx, x: number, y: number, size: number): void {
  rect(ctx, x - 1.5, y - size * 1.4, 3, size * 1.4, '#7a5a36');
  for (const angle of [-0.9, -0.3, 0.3, 0.9, 2.2, -2.2]) {
    ellipse(ctx, x + Math.cos(angle - Math.PI / 2) * size * 0.6, y - size * 1.4 + Math.sin(angle - Math.PI / 2) * size * 0.35, size * 1.1, size * 0.4, '#3f8a4a');
  }
}

function karst(ctx: Ctx, x: number, y: number, size: number, body: string, shade: string, top: string): void {
  ellipse(ctx, x + size * 0.15, y, size * 1.6, size * 0.45, '#101a16', 0.35);
  ellipse(ctx, x, y - size * 0.75, size * 1.1, size * 1.7, body);
  ellipse(ctx, x + size * 0.22, y - size * 0.7, size * 0.6, size * 1.5, shade);
  ellipse(ctx, x - size * 0.05, y - size * 1.45, size * 0.8, size * 0.4, top);
}

function factory(ctx: Ctx, x: number, y: number): void {
  rect(ctx, x - 24, y - 3, 56, 8, '#15181f', 0.5);
  rect(ctx, x - 26, y - 24, 52, 24, '#4b4a48');
  rect(ctx, x + 10, y - 52, 9, 30, '#36353a');
  rect(ctx, x + 10, y - 52, 9, 5, '#6c3b2a');
  triangle(ctx, [x - 26, y - 24, x - 13, y - 36, x - 13, y - 24], '#2a2a2e');
  triangle(ctx, [x - 13, y - 24, x, y - 36, x, y - 24], '#2a2a2e');
}

function hut(ctx: Ctx, x: number, y: number, wall: string, roof: string): void {
  rect(ctx, x - 9, y - 10, 18, 10, wall);
  triangle(ctx, [x - 13, y - 10, x, y - 22, x + 13, y - 10], roof);
}

// ---------- Từng loại vùng đất ----------

function decorateHome(ctx: Ctx, land: Land, random: Random, lights: Point[]): void {
  const ox = HOME_X;
  const oy = HOME_Y;
  for (const spot of scatter(random, land, ox + 840, oy + 1460, 300, 170, 26, 0)) {
    ellipse(ctx, spot.x, spot.y, 80 + random() * 90, 40 + random() * 40, '#5a5340', 0.5);
  }

  // Sông chảy từ núi Yên Tử qua hồ Tịnh Tâm ra biển đông.
  const lake = placeById('tinhTam');
  const course = [
    { x: ox + 430, y: oy + 590 },
    { x: ox + 560, y: oy + 660 },
    { x: ox + 700, y: oy + 700 },
    { x: lake.x, y: lake.y },
    { x: ox + 1010, y: oy + 790 },
    { x: ox + 1230, y: oy + 800 },
    { x: ox + 1420, y: oy + 880 },
    { x: ox + 1640, y: oy + 960 },
  ];
  curve(ctx, course, 22, '#1d4b61');
  curve(ctx, course, 13, '#2e86ab');
  curve(ctx, course, 3, '#7fd0ee', 0.5);
  ellipse(ctx, lake.x, lake.y, 190, 130, '#1d4b61');
  ellipse(ctx, lake.x, lake.y, 170, 112, '#2e86ab');
  ellipse(ctx, lake.x - 20, lake.y - 14, 90, 40, '#7fd0ee', 0.25);

  // Lạc Thành.
  const cx = ox + 850;
  const cy = oy + 1050;
  ellipse(ctx, cx, cy, 980, 760, '#3b4458', 0.9);
  ellipse(ctx, cx, cy, 760, 560, '#464f66', 0.9);
  for (const spot of scatter(random, land, cx, cy, 440, 330, 230, 62)) {
    const width = 14 + random() * 18;
    const height = 18 + random() * 46;
    const shade = ['#232a3b', '#2a3246', '#1e2535'][Math.floor(random() * 3)];
    rect(ctx, spot.x - width / 2 + 4, spot.y - 4, width, 8, '#151a26', 0.5);
    rect(ctx, spot.x - width / 2, spot.y - height, width, height, shade);
    rect(ctx, spot.x - width / 2, spot.y - height, width, 3, '#4a5672');
    for (let wy = spot.y - height + 7; wy < spot.y - 5; wy += 8) {
      for (let wx = spot.x - width / 2 + 3; wx < spot.x + width / 2 - 4; wx += 6) {
        if (random() < 0.45) rect(ctx, wx, wy, 3, 4, '#ffd97a', 0.85);
      }
    }
    if (random() < 0.12) lights.push({ x: spot.x, y: spot.y - height - 3 });
  }

  for (const spot of scatter(random, land, ox + 400, oy + 470, 330, 270, 60, 70)) {
    mountain(ctx, spot.x, spot.y, 30 + random() * 34, '#6b7566', '#4c5549', '#eef3f5');
  }
  const greens = ['#1f4a2c', '#275a34', '#1a3f26', '#2f6a3d'];
  for (const spot of scatter(random, land, ox + 1330, oy + 520, 300, 270, 190, 60)) {
    tree(ctx, spot.x, spot.y, 9 + random() * 7, greens, random);
  }
  for (const spot of everywhere(random, land, 130, 60)) {
    if (Math.hypot((spot.x - cx) / 470, (spot.y - cy) / 360) < 1) continue;
    tree(ctx, spot.x, spot.y, 8 + random() * 5, greens, random);
  }
  for (const spot of scatter(random, land, ox + 1340, oy + 1620, 260, 210, 34, 70)) {
    karst(ctx, spot.x, spot.y, 26 + random() * 30, '#7b8a7a', '#596757', '#3c6b45');
  }
  for (const spot of scatter(random, land, ox + 840, oy + 1440, 230, 110, 9, 75)) {
    factory(ctx, spot.x, spot.y);
  }
}

function decorateIce(ctx: Ctx, land: Land, random: Random): void {
  for (const spot of everywhere(random, land, 9, 110)) {
    ellipse(ctx, spot.x, spot.y, 170 + random() * 120, 80 + random() * 50, '#7fb6d1');
    ellipse(ctx, spot.x, spot.y, 150 + random() * 90, 62 + random() * 40, '#a9d6ea');
  }
  const lake = placeById('baBe');
  ellipse(ctx, lake.x, lake.y, 230, 150, '#1d4b61');
  ellipse(ctx, lake.x, lake.y, 205, 128, '#2e86ab');
  for (const spot of everywhere(random, land, 230, 70)) {
    mountain(ctx, spot.x, spot.y, 28 + random() * 44, '#8e9aa6', '#6c7884', '#ffffff');
  }
  for (const spot of everywhere(random, land, 160, 60)) {
    pine(ctx, spot.x, spot.y, 9 + random() * 6);
  }
  const village = placeById('saPa');
  for (const spot of scatter(random, land, village.x, village.y, 130, 90, 14, 55)) {
    hut(ctx, spot.x, spot.y, '#6b5a48', '#f4f8fa');
  }
}

function decorateDesert(ctx: Ctx, land: Land, random: Random): void {
  // Gợn cát.
  for (const spot of everywhere(random, land, 420, 0)) {
    const width = 50 + random() * 90;
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = random() < 0.5 ? '#b8935a' : '#f0dba6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(spot.x, spot.y, width / 2, 9, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  for (const spot of everywhere(random, land, 80, 70)) {
    karst(ctx, spot.x, spot.y, 22 + random() * 30, '#b5774a', '#8f5a36', '#d49a63');
  }
  const oasis = placeById('phanRang');
  ellipse(ctx, oasis.x, oasis.y + 10, 240, 150, '#5f9a57', 0.9);
  ellipse(ctx, oasis.x + 20, oasis.y + 30, 110, 60, '#2e86ab');
  for (const spot of scatter(random, land, oasis.x, oasis.y + 10, 130, 80, 26, 50)) {
    palm(ctx, spot.x, spot.y, 12 + random() * 6);
  }
  for (const spot of everywhere(random, land, 30, 70)) {
    palm(ctx, spot.x, spot.y, 9 + random() * 4);
  }
}

function decorateJungle(ctx: Ctx, land: Land, random: Random): void {
  const course = [
    { x: 1700, y: 5560 },
    { x: 2050, y: 5620 },
    { x: 2420, y: 5480 },
    { x: 2700, y: 5380 },
    { x: 2800, y: 5200 },
    { x: 2840, y: 5020 },
  ];
  curve(ctx, course, 30, '#16403a');
  curve(ctx, course, 18, '#3f7f6a');
  const volcano = placeById('chuDangYa');
  ellipse(ctx, volcano.x, volcano.y, 520, 340, '#3a2f2a', 0.8);
  for (const spot of scatter(random, land, volcano.x, volcano.y, 240, 150, 22, 70)) {
    mountain(ctx, spot.x, spot.y, 34 + random() * 40, '#4a3b36', '#322723', '#ff7a3c');
  }
  const greens = ['#17402a', '#1f5232', '#12351f', '#2a6a3c', '#0f2e1c'];
  for (const spot of everywhere(random, land, 1500, 55)) {
    if (Math.hypot((spot.x - volcano.x) / 240, (spot.y - volcano.y) / 150) < 1) continue;
    tree(ctx, spot.x, spot.y, 10 + random() * 9, greens, random);
  }
  const village = placeById('uMinh');
  for (const spot of scatter(random, land, village.x, village.y, 120, 80, 12, 55)) {
    hut(ctx, spot.x, spot.y, '#6b4f33', '#a8884f');
  }
}

function decorateIsland(ctx: Ctx, land: Land, random: Random): void {
  const size = Math.min(land.rx, land.ry);
  for (const spot of scatter(random, land, land.cx, land.cy, size * 0.5, size * 0.4, 7, 70)) {
    mountain(ctx, spot.x, spot.y, 26 + random() * 26, '#5f7a5c', '#466044', '#8fb08a');
  }
  const greens = ['#2a6a3c', '#357a45', '#1f5232'];
  for (const spot of everywhere(random, land, Math.round(size * 0.3), 55)) {
    tree(ctx, spot.x, spot.y, 9 + random() * 6, greens, random);
  }
  for (const spot of everywhere(random, land, Math.round(size * 0.12), 55)) {
    palm(ctx, spot.x, spot.y, 10 + random() * 5);
  }
}

function drawLand(scene: Phaser.Scene, land: Land, random: Random, lights: Point[]): void {
  const left = land.cx - land.rx * PAD;
  const top = land.cy - land.ry * PAD;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(land.rx * PAD * 2 * TEXTURE_SCALE);
  canvas.height = Math.ceil(land.ry * PAD * 2 * TEXTURE_SCALE);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  // Sau phép biến đổi này, mọi nét vẽ dùng thẳng tọa độ trên bản đồ thế giới.
  ctx.setTransform(TEXTURE_SCALE, 0, 0, TEXTURE_SCALE, -left * TEXTURE_SCALE, -top * TEXTURE_SCALE);

  const colors = PALETTE[land.biome];
  coast(ctx, land, 1.07, colors.shallow, 0.55);
  coast(ctx, land, 1.035, colors.shallow);
  coast(ctx, land, 1.012, colors.sand);
  coast(ctx, land, 1, colors.land);
  const patches = Math.round((land.rx * land.ry) / 9000);
  for (const spot of everywhere(random, land, patches, 0)) {
    ellipse(ctx, spot.x, spot.y, 90 + random() * 140, 50 + random() * 80, random() < 0.5 ? colors.patchA : colors.patchB, 0.45);
  }

  if (land.biome === 'temperate') decorateHome(ctx, land, random, lights);
  else if (land.biome === 'ice') decorateIce(ctx, land, random);
  else if (land.biome === 'desert') decorateDesert(ctx, land, random);
  else if (land.biome === 'jungle') decorateJungle(ctx, land, random);
  else decorateIsland(ctx, land, random);

  const key = `land-${land.id}`;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
  scene.add.image(left, top, key).setOrigin(0, 0).setScale(1 / TEXTURE_SCALE).setDepth(0);
}

// ---------- Đường đi, sóng, mây ----------

function drawRoads(scene: Phaser.Scene): void {
  const g = scene.add.graphics().setDepth(2);
  for (const [a, b, , kind] of ROADS) {
    const from = placeById(a);
    const to = placeById(b);
    if (kind === 'city') {
      g.lineStyle(11, 0x1c2230, 0.9).lineBetween(from.x, from.y, to.x, to.y);
      g.lineStyle(5, 0xaab4c8, 0.9).lineBetween(from.x, from.y, to.x, to.y);
      continue;
    }
    // Lối mòn và đường biển: nét đứt. Đường biển màu nhạt, nét thưa hơn.
    const sea = kind === 'sea';
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.floor(length / (sea ? 40 : 26));
    g.lineStyle(sea ? 6 : 5, sea ? 0xbfe8f7 : 0xe6d3a3, sea ? 0.7 : 0.85);
    for (let i = 0; i < steps; i += 1) {
      const t0 = i / steps;
      const t1 = (i + (sea ? 0.4 : 0.55)) / steps;
      g.lineBetween(
        from.x + (to.x - from.x) * t0,
        from.y + (to.y - from.y) * t0,
        from.x + (to.x - from.x) * t1,
        from.y + (to.y - from.y) * t1,
      );
    }
  }
}

function drawWaves(scene: Phaser.Scene, random: Random): void {
  let placed = 0;
  for (let attempt = 0; attempt < 3000 && placed < 260; attempt += 1) {
    const x = -200 + random() * (MAP_WIDTH + 400);
    const y = -200 + random() * (MAP_HEIGHT + 400);
    if (isLand(x, y, 1.1)) continue;
    placed += 1;
    const wave = scene.add.ellipse(x, y, 30 + random() * 30, 5, 0x9fd8ee, 0.28).setDepth(1);
    scene.tweens.add({
      targets: wave,
      x: x + 16,
      alpha: 0.05,
      duration: 1600 + random() * 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

function drawClouds(scene: Phaser.Scene, random: Random): void {
  for (let i = 0; i < 26; i += 1) {
    const y = 120 + random() * (MAP_HEIGHT - 240);
    const parts: Phaser.GameObjects.Ellipse[] = [];
    for (let j = 0; j < 4; j += 1) {
      parts.push(
        scene.add.ellipse(j * 62 - 90 + random() * 20, random() * 26 - 13, 130 + random() * 70, 54 + random() * 26, 0xffffff, 0.13),
      );
    }
    const start = -300 + random() * (MAP_WIDTH + 300);
    const cloud = scene.add.container(start, y, parts).setDepth(15);
    const speed = 9 + random() * 9;
    scene.tweens.add({
      targets: cloud,
      x: MAP_WIDTH + 400,
      duration: ((MAP_WIDTH + 400 - start) / speed) * 1000,
      onComplete: () => {
        cloud.x = -400;
        scene.tweens.add({
          targets: cloud,
          x: MAP_WIDTH + 400,
          duration: ((MAP_WIDTH + 800) / speed) * 1000,
          repeat: -1,
        });
      },
    });
  }
}

function drawCompass(scene: Phaser.Scene, x: number, y: number): void {
  const g = scene.add.graphics().setDepth(3);
  g.lineStyle(3, 0xe6d3a3, 0.8).strokeCircle(x, y, 90);
  g.fillStyle(0xe6d3a3, 0.9);
  g.fillTriangle(x, y - 116, x - 18, y, x + 18, y);
  g.fillTriangle(x, y + 116, x - 18, y, x + 18, y);
  g.fillStyle(0xb99d5f, 0.9);
  g.fillTriangle(x - 116, y, x, y - 18, x, y + 18);
  g.fillTriangle(x + 116, y, x, y - 18, x, y + 18);
  label(scene, x, y - 156, 'B', 48, '#e6d3a3').setDepth(3);
}

function drawNames(scene: Phaser.Scene): void {
  const names: [number, number, string, number][] = [
    [HOME_X + 850, HOME_Y + 1300, 'L Ạ C   T H À N H', 0],
    [HOME_X + 420, HOME_Y + 250, 'DÃY YÊN TỬ', -8],
    [HOME_X + 1340, HOME_Y + 300, 'RỪNG CÚC PHƯƠNG', 6],
    [HOME_X + 1300, HOME_Y + 1830, 'NÚI ĐÁ PHONG NHA', -4],
    [HOME_X + 560, HOME_Y + 1560, 'ĐẤT HOANG HẮC THỦY', 5],
    [1700, 2200, 'BIỂN BẮC', 0],
    [1650, 4700, 'BIỂN TÂY', 0],
    [4000, 3300, 'BIỂN ĐÔNG HẢI', 90],
    [4200, 5100, 'BIỂN NAM', 0],
  ];
  for (const [x, y, text, angle] of names) {
    label(scene, x, y, text, 26, '#f1e6c8').setAlpha(0.45).setAngle(angle).setDepth(3);
  }
}

/** Vẽ toàn bộ nền bản đồ. Trả về các nhãn tên vùng đất, chỉ hiện ở chế độ toàn cảnh. */
export function drawTerrain(scene: Phaser.Scene): Phaser.GameObjects.Text[] {
  const random = seededRandom(20261111);
  const lights: Point[] = [];
  LANDS.forEach((land) => drawLand(scene, land, random, lights));
  drawRoads(scene);
  for (const spot of lights) {
    const light = scene.add.circle(spot.x, spot.y, 3, 0xff6b6b, 1).setDepth(2);
    scene.tweens.add({ targets: light, alpha: 0.1, duration: 600 + random() * 900, yoyo: true, repeat: -1 });
  }
  drawWaves(scene, random);
  drawClouds(scene, random);
  drawCompass(scene, 4700, 900);
  drawNames(scene);

  const titles = LANDS.map((land) => {
    const size = land.biome === 'island' ? 110 : 190;
    return label(scene, land.cx, land.cy, land.name, size, '#fff7df')
      .setStroke('#0b0f1a', 26)
      .setDepth(30)
      .setVisible(false);
  });
  titles.push(
    label(scene, 4800, 1700, 'QUẦN ĐẢO ĐÔNG HẢI', 150, '#bfe8f7').setStroke('#0b0f1a', 22).setDepth(30).setVisible(false),
  );
  return titles;
}
