import Phaser from 'phaser';
import { MAP_HEIGHT, MAP_WIDTH, PLACES, placeById, ROADS } from '../data/map';
import { label } from '../ui/widgets';

/**
 * Vẽ nền bản đồ Lạc Thành hoàn toàn bằng code: biển, đất liền, núi, rừng, sông, thành phố.
 * Mọi hình đều tự sinh từ một hạt giống cố định nên lần nào mở cũng ra đúng một bản đồ.
 */

const CENTER_X = MAP_WIDTH / 2;
const CENTER_Y = MAP_HEIGHT / 2;
const LAND_RX = 760;
const LAND_RY = 900;

const SEA = 0x0c2a3d;
const SHALLOW = 0x14506a;
const SAND = 0xcdb98a;
const LAND = 0x35573c;
const LAND_LIGHT = 0x44694a;

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bán kính bờ biển theo góc: hình vuông bo tròn có gợn sóng để bờ không đều. */
function coastRadius(angle: number): number {
  const squircle = 1 / Math.pow(Math.pow(Math.abs(Math.cos(angle)), 4) + Math.pow(Math.abs(Math.sin(angle)), 4), 0.25);
  const wobble =
    0.92 + 0.05 * Math.sin(3 * angle + 1.3) + 0.035 * Math.sin(7 * angle + 0.4) + 0.02 * Math.sin(13 * angle + 2.1);
  return squircle * wobble;
}

function coastPoints(scale: number): Phaser.Math.Vector2[] {
  const points: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 180; i += 1) {
    const angle = (i / 180) * Math.PI * 2;
    const radius = coastRadius(angle) * scale;
    points.push(
      new Phaser.Math.Vector2(
        CENTER_X + Math.cos(angle) * LAND_RX * radius,
        CENTER_Y + Math.sin(angle) * LAND_RY * radius,
      ),
    );
  }
  return points;
}

function isLand(x: number, y: number, margin = 1): boolean {
  const dx = (x - CENTER_X) / LAND_RX;
  const dy = (y - CENTER_Y) / LAND_RY;
  return Math.hypot(dx, dy) < coastRadius(Math.atan2(dy, dx)) * margin;
}

function nearPlace(x: number, y: number, distance: number): boolean {
  return PLACES.some((place) => Math.hypot(place.x - x, place.y - y) < distance);
}

/** Rải điểm ngẫu nhiên trong một hình elip, chỉ lấy điểm nằm trên đất và không đè lên địa danh. */
function scatter(
  random: () => number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count: number,
  clearance: number,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let attempt = 0; attempt < count * 6 && points.length < count; attempt += 1) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random());
    const x = cx + Math.cos(angle) * rx * radius;
    const y = cy + Math.sin(angle) * ry * radius;
    if (!isLand(x, y, 0.93) || nearPlace(x, y, clearance)) continue;
    points.push({ x, y });
  }
  // Vẽ từ trên xuống để hình phía dưới che chân hình phía trên.
  return points.sort((a, b) => a.y - b.y);
}

export function drawTerrain(scene: Phaser.Scene): void {
  const random = seededRandom(20261111);
  const g = scene.add.graphics();

  // Biển và bờ.
  g.fillStyle(SEA, 1).fillRect(-400, -400, MAP_WIDTH + 800, MAP_HEIGHT + 800);
  g.fillStyle(SHALLOW, 0.55).fillPoints(coastPoints(1.07), true);
  g.fillStyle(SHALLOW, 1).fillPoints(coastPoints(1.035), true);
  g.fillStyle(SAND, 1).fillPoints(coastPoints(1.012), true);
  g.fillStyle(LAND, 1).fillPoints(coastPoints(1), true);

  // Những mảng đất sáng tối để nền không phẳng lì.
  for (const spot of scatter(random, CENTER_X, CENTER_Y, 700, 820, 70, 0)) {
    g.fillStyle(random() < 0.5 ? LAND_LIGHT : 0x2e4d36, 0.45);
    g.fillEllipse(spot.x, spot.y, 90 + random() * 140, 50 + random() * 80);
  }

  // Vùng đất hoang quanh Hắc Thủy.
  for (const spot of scatter(random, 840, 1460, 300, 170, 26, 0)) {
    g.fillStyle(0x5a5340, 0.5).fillEllipse(spot.x, spot.y, 80 + random() * 90, 40 + random() * 40);
  }

  drawRiver(g);
  drawCity(scene, g, random);
  drawRoads(g);

  // Núi quanh Yên Tử.
  for (const spot of scatter(random, 400, 470, 330, 270, 60, 70)) {
    drawMountain(g, spot.x, spot.y, 30 + random() * 34);
  }
  // Rừng Cúc Phương.
  for (const spot of scatter(random, 1330, 520, 300, 270, 190, 60)) {
    drawTree(g, spot.x, spot.y, 9 + random() * 7, random);
  }
  // Cây lẻ rải khắp nơi ngoài thành.
  for (const spot of scatter(random, CENTER_X, CENTER_Y, 720, 850, 130, 60)) {
    if (Math.hypot((spot.x - 850) / 470, (spot.y - 1050) / 360) < 1) continue;
    drawTree(g, spot.x, spot.y, 8 + random() * 5, random);
  }
  // Đồi đá vôi quanh Phong Nha.
  for (const spot of scatter(random, 1340, 1620, 260, 210, 34, 70)) {
    drawKarst(g, spot.x, spot.y, 26 + random() * 30);
  }
  // Nhà xưởng bỏ hoang ở Hắc Thủy.
  for (const spot of scatter(random, 840, 1440, 230, 110, 9, 75)) {
    drawFactory(g, spot.x, spot.y);
  }

  drawWaves(scene, random);
  drawClouds(scene, random);
  drawCompass(scene, 1570, 170);
  drawRegionNames(scene);
}

function drawRiver(g: Phaser.GameObjects.Graphics): void {
  const lake = placeById('tinhTam');
  const course = new Phaser.Curves.Spline([
    new Phaser.Math.Vector2(430, 590),
    new Phaser.Math.Vector2(560, 660),
    new Phaser.Math.Vector2(700, 700),
    new Phaser.Math.Vector2(lake.x, lake.y),
    new Phaser.Math.Vector2(1010, 790),
    new Phaser.Math.Vector2(1230, 800),
    new Phaser.Math.Vector2(1420, 880),
    new Phaser.Math.Vector2(1640, 960),
  ]).getPoints(80);
  g.lineStyle(22, 0x1d4b61, 1).strokePoints(course);
  g.lineStyle(13, 0x2e86ab, 1).strokePoints(course);
  g.lineStyle(3, 0x7fd0ee, 0.5).strokePoints(course);
  g.fillStyle(0x1d4b61, 1).fillEllipse(lake.x, lake.y, 190, 130);
  g.fillStyle(0x2e86ab, 1).fillEllipse(lake.x, lake.y, 170, 112);
  g.fillStyle(0x7fd0ee, 0.25).fillEllipse(lake.x - 20, lake.y - 14, 90, 40);
}

function drawCity(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics, random: () => number): void {
  const cx = 850;
  const cy = 1050;
  g.fillStyle(0x3b4458, 0.9).fillEllipse(cx, cy, 980, 760);
  g.fillStyle(0x464f66, 0.9).fillEllipse(cx, cy, 760, 560);

  for (const spot of scatter(random, cx, cy, 440, 330, 230, 62)) {
    const width = 14 + random() * 18;
    const height = 18 + random() * 46;
    const shade = [0x232a3b, 0x2a3246, 0x1e2535][Math.floor(random() * 3)];
    g.fillStyle(0x151a26, 0.5).fillRect(spot.x - width / 2 + 4, spot.y - 4, width, 8);
    g.fillStyle(shade, 1).fillRect(spot.x - width / 2, spot.y - height, width, height);
    g.fillStyle(0x4a5672, 1).fillRect(spot.x - width / 2, spot.y - height, width, 3);
    // Cửa sổ sáng đèn.
    for (let wy = spot.y - height + 7; wy < spot.y - 5; wy += 8) {
      for (let wx = spot.x - width / 2 + 3; wx < spot.x + width / 2 - 4; wx += 6) {
        if (random() < 0.45) g.fillStyle(0xffd97a, 0.85).fillRect(wx, wy, 3, 4);
      }
    }
    // Một số tòa có đèn nhấp nháy trên nóc.
    if (random() < 0.12) {
      const light = scene.add.circle(spot.x, spot.y - height - 3, 3, 0xff6b6b, 1).setDepth(2);
      scene.tweens.add({ targets: light, alpha: 0.1, duration: 600 + random() * 900, yoyo: true, repeat: -1 });
    }
  }
}

function drawRoads(g: Phaser.GameObjects.Graphics): void {
  for (const [a, b, days] of ROADS) {
    const from = placeById(a);
    const to = placeById(b);
    if (days < 10) {
      g.lineStyle(11, 0x1c2230, 0.9).lineBetween(from.x, from.y, to.x, to.y);
      g.lineStyle(5, 0xaab4c8, 0.9).lineBetween(from.x, from.y, to.x, to.y);
      continue;
    }
    // Đường xa: nét đứt như lối mòn.
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.floor(length / 26);
    g.lineStyle(5, 0xe6d3a3, 0.85);
    for (let i = 0; i < steps; i += 1) {
      const t0 = i / steps;
      const t1 = (i + 0.55) / steps;
      g.lineBetween(
        from.x + (to.x - from.x) * t0,
        from.y + (to.y - from.y) * t0,
        from.x + (to.x - from.x) * t1,
        from.y + (to.y - from.y) * t1,
      );
    }
  }
}

function drawMountain(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  g.fillStyle(0x1b2a22, 0.45).fillEllipse(x + size * 0.2, y + 2, size * 2.1, size * 0.5);
  g.fillStyle(0x6b7566, 1).fillTriangle(x - size, y, x, y - size * 1.5, x + size, y);
  g.fillStyle(0x4c5549, 1).fillTriangle(x, y - size * 1.5, x + size, y, x + size * 0.15, y);
  g.fillStyle(0xeef3f5, 1).fillTriangle(
    x - size * 0.3,
    y - size * 1.05,
    x,
    y - size * 1.5,
    x + size * 0.3,
    y - size * 1.05,
  );
}

function drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, random: () => number): void {
  const shade = [0x1f4a2c, 0x275a34, 0x1a3f26, 0x2f6a3d][Math.floor(random() * 4)];
  g.fillStyle(0x14261a, 0.4).fillEllipse(x + 2, y + 1, size * 1.6, size * 0.6);
  g.fillStyle(0x3a2a1c, 1).fillRect(x - 1.5, y - size * 0.5, 3, size * 0.6);
  g.fillStyle(shade, 1).fillCircle(x, y - size, size);
  g.fillStyle(0x57a064, 0.35).fillCircle(x - size * 0.3, y - size * 1.3, size * 0.45);
}

function drawKarst(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  g.fillStyle(0x1b2a22, 0.4).fillEllipse(x + size * 0.15, y, size * 1.6, size * 0.45);
  g.fillStyle(0x7b8a7a, 1).fillEllipse(x, y - size * 0.75, size * 1.1, size * 1.7);
  g.fillStyle(0x596757, 1).fillEllipse(x + size * 0.22, y - size * 0.7, size * 0.6, size * 1.5);
  g.fillStyle(0x3c6b45, 1).fillEllipse(x - size * 0.05, y - size * 1.45, size * 0.8, size * 0.4);
}

function drawFactory(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0x15181f, 0.5).fillRect(x - 24, y - 3, 56, 8);
  g.fillStyle(0x4b4a48, 1).fillRect(x - 26, y - 24, 52, 24);
  g.fillStyle(0x36353a, 1).fillRect(x + 10, y - 52, 9, 30);
  g.fillStyle(0x6c3b2a, 1).fillRect(x + 10, y - 52, 9, 5);
  g.fillStyle(0x2a2a2e, 1).fillTriangle(x - 26, y - 24, x - 13, y - 36, x - 13, y - 24);
  g.fillStyle(0x2a2a2e, 1).fillTriangle(x - 13, y - 24, x, y - 36, x, y - 24);
}

function drawWaves(scene: Phaser.Scene, random: () => number): void {
  let placed = 0;
  for (let attempt = 0; attempt < 600 && placed < 70; attempt += 1) {
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

function drawClouds(scene: Phaser.Scene, random: () => number): void {
  for (let i = 0; i < 8; i += 1) {
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
  g.lineStyle(2, 0xe6d3a3, 0.8).strokeCircle(x, y, 46);
  g.fillStyle(0xe6d3a3, 0.9);
  g.fillTriangle(x, y - 58, x - 9, y, x + 9, y);
  g.fillTriangle(x, y + 58, x - 9, y, x + 9, y);
  g.fillStyle(0xb99d5f, 0.9);
  g.fillTriangle(x - 58, y, x, y - 9, x, y + 9);
  g.fillTriangle(x + 58, y, x, y - 9, x, y + 9);
  label(scene, x, y - 78, 'B', 24, '#e6d3a3').setDepth(3);
}

function drawRegionNames(scene: Phaser.Scene): void {
  const names: [number, number, string, number][] = [
    [850, 1300, 'L Ạ C   T H À N H', 0],
    [420, 250, 'DÃY YÊN TỬ', -8],
    [1340, 300, 'RỪNG CÚC PHƯƠNG', 6],
    [1300, 1830, 'NÚI ĐÁ PHONG NHA', -4],
    [560, 1560, 'ĐẤT HOANG HẮC THỦY', 5],
    [-110, 1000, 'BIỂN TÂY', -90],
    [1810, 1000, 'BIỂN ĐÔNG HẢI', 90],
  ];
  for (const [x, y, text, angle] of names) {
    label(scene, x, y, text, 26, '#f1e6c8').setAlpha(0.45).setAngle(angle).setDepth(3);
  }
}
