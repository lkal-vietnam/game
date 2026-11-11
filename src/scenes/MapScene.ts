import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { eventById, type Choice, type GameEvent, type Outcome } from '../data/events';
import {
  DANGER_LEVELS,
  dangerLevel,
  findRoute,
  MAP_HEIGHT,
  MAP_WIDTH,
  PLACES,
  PLACE_TYPES,
  placeById,
  type Place,
} from '../data/map';
import { PATHS, STAT_LABELS, type Stats } from '../data/paths';
import { loadSave, writeSave, type Life, type SaveData } from '../state/save';
import { energyRequired, isAtPeak, isBreakthrough, realmName } from '../systems/cultivation';
import { canChoose, refreshEvents, resolveChoice, successChance } from '../systems/events';
import {
  ageYears,
  arrivalHazard,
  attemptAdvance,
  breakthroughChance,
  breakthroughCost,
  canAttempt,
  canWorkAt,
  createLife,
  dateLabel,
  isDead,
  lifespan,
  luanHoiPoints,
  monthlyGain,
  originById,
  seclude,
  work,
} from '../systems/life';
import { button, formatNumber, hexColor, label, pin } from '../ui/widgets';
import { drawTerrain, SEA_COLOR } from './mapArt';

const HUD_HEIGHT = 190;
const PANEL_TOP = 950;
const SEA_MARGIN = 160;
const BAR_WIDTH = 420;
/** Thu nhỏ hết cỡ thì thấy cả thế giới trong khoảng giữa thanh trạng thái và bảng địa danh. */
const MIN_ZOOM = Math.min(GAME_WIDTH / MAP_WIDTH, (PANEL_TOP - HUD_HEIGHT) / MAP_HEIGHT) * 0.97;
const MAX_ZOOM = 1.4;
/** Dưới mức này là chế độ nhìn xa: hiện tên các vùng đất, chạm vào đâu thì bay tới đó. */
const FAR_ZOOM = 0.3;
const BAND_CENTER_Y = (HUD_HEIGHT + PANEL_TOP) / 2;

type Destroyable = { destroy(): void };

interface PlaceView {
  group: Phaser.GameObjects.Container;
  ring: Phaser.GameObjects.Arc;
  danger: Phaser.GameObjects.Arc;
}

/** Lịch luyện kiếp: bản đồ thế giới, di chuyển trôi lịch, bế quan, sự kiện, tuổi thọ. */
export class MapScene extends Phaser.Scene {
  private save!: SaveData;
  private life!: Life;
  private selected!: string;
  private busy = false;
  private marker!: Phaser.GameObjects.Container;
  private bigMarker!: Phaser.GameObjects.Arc;
  private dateText!: Phaser.GameObjects.Text;
  private realmText!: Phaser.GameObjects.Text;
  private ageText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private barFill!: Phaser.GameObjects.Rectangle;
  private panel: Destroyable[] = [];
  private views = new Map<string, PlaceView>();
  private badges: Destroyable[] = [];
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private landTitles: Phaser.GameObjects.Text[] = [];
  private pinchDistance = 0;
  private lastPinchAt = -1000;

  constructor() {
    super('Map');
  }

  create(): void {
    this.save = loadSave();
    if (!this.save.character) {
      this.scene.start('Create');
      return;
    }
    this.busy = false;
    this.panel = [];
    this.views = new Map();
    this.badges = [];
    this.pinchDistance = 0;

    let isNewLife = false;
    if (!this.save.life) {
      this.save.life = createLife(this.save.character.path, this.save.livesLived + 1);
      isNewLife = true;
    }
    this.life = this.save.life;
    this.selected = this.life.location;
    refreshEvents(this.life);
    writeSave(this.save);

    this.cameras.main.setBackgroundColor(SEA_COLOR);
    this.drawMap();
    // Camera thứ hai chỉ vẽ giao diện; mọi thứ thuộc bản đồ đã tạo ở trên thì nó bỏ qua.
    this.uiCamera = this.cameras.add(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.hideFromUi(this.children.list);
    this.drawHud();
    this.setupCamera();
    this.refreshHud();
    this.renderPanel();
    if (isNewLife) this.showIntro();
    else if (isDead(this.life)) this.endLife();
  }

  private get zoom(): number {
    return this.cameras.main.zoom;
  }

  private get farMode(): boolean {
    return this.zoom < FAR_ZOOM;
  }

  // ---------- Bản đồ ----------

  private drawMap(): void {
    this.landTitles = drawTerrain(this);
    PLACES.forEach((place) => this.drawPlace(place));

    const here = placeById(this.life.location);
    const dot = this.add.circle(0, 0, 13, 0xffffff, 1).setStrokeStyle(4, 0xffd36b, 1);
    const pulse = this.add.circle(0, 0, 13, 0xffd36b, 0.5);
    const bob = this.add.container(0, -62, [pulse, dot]);
    this.marker = this.add.container(here.x, here.y, [bob]).setDepth(20);
    this.tweens.add({ targets: pulse, scale: 2.4, alpha: 0, duration: 1100, repeat: -1 });
    this.tweens.add({ targets: bob, y: -70, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Dấu vị trí cỡ lớn, chỉ hiện khi nhìn xa.
    this.bigMarker = this.add
      .circle(here.x, here.y, 110, 0xffd36b, 0.9)
      .setStrokeStyle(24, 0xffffff, 1)
      .setDepth(31)
      .setVisible(false);
    this.tweens.add({ targets: this.bigMarker, scale: 1.5, duration: 700, yoyo: true, repeat: -1 });
  }

  private drawPlace(place: Place): void {
    const type = PLACE_TYPES[place.type];
    // Mây linh khí: nơi linh khí càng đậm thì quầng sáng càng lớn.
    const cloud = this.add
      .circle(place.x, place.y, 40 + place.linhKhi * 28, 0x7ff5d8, 0.08 + place.linhKhi * 0.05)
      .setDepth(4);
    this.tweens.add({
      targets: cloud,
      scale: 1.18,
      alpha: cloud.alpha * 0.4,
      duration: 1800 + (place.x % 900),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    if (place.linhKhi >= 1.5) this.spawnMotes(place);

    const ring = this.add.circle(0, 0, 52, 0x000000, 0).setStrokeStyle(4, 0xffffff, 1).setVisible(false);
    const danger = this.add.circle(0, 0, 44, 0x000000, 0).setStrokeStyle(5, 0xffffff, 1);
    const body = this.add
      .circle(0, 0, 36, 0x101828, 1)
      .setStrokeStyle(5, type.color, 1)
      .setInteractive({ useHandCursor: true });
    const icon = label(this, 0, 0, type.icon, 34);
    const name = label(this, 0, 62, place.name, 22, '#ffffff').setStroke('#0b0f1a', 6);
    // Gom vào một nhóm để khi thu nhỏ bản đồ, cả chấm lẫn tên cùng được phóng bù cho dễ bấm.
    const group = this.add.container(place.x, place.y, [ring, danger, body, icon, name]).setDepth(5);
    this.views.set(place.id, { group, ring, danger });

    body.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Kéo hoặc phóng bản đồ rồi nhả tay trên một chấm thì không tính là chọn.
      if (this.busy || this.farMode || pointer.getDistance() > 14) return;
      if (this.time.now - this.lastPinchAt < 300) return;
      this.selected = place.id;
      this.renderPanel();
    });
  }

  /** Đốm linh khí bay lên ở những nơi linh khí đậm. */
  private spawnMotes(place: Place): void {
    const count = Math.round(place.linhKhi * 3);
    for (let i = 0; i < count; i += 1) {
      const startX = place.x + (i / count - 0.5) * 110;
      const mote = this.add.circle(startX, place.y + 20, 3, 0xa8ffe9, 0).setDepth(7);
      this.tweens.add({
        targets: mote,
        y: place.y - 90,
        x: startX + (i % 2 === 0 ? 14 : -14),
        alpha: { from: 0.9, to: 0 },
        duration: 2200 + i * 260,
        delay: i * 420,
        repeat: -1,
      });
    }
  }

  /** Viền màu quanh mỗi chấm báo nơi đó nguy hiểm thế nào so với bậc hiện tại. */
  private refreshDanger(): void {
    for (const place of PLACES) {
      const level = dangerLevel(place, this.life.tier);
      const view = this.views.get(place.id);
      view?.danger.setVisible(level > 0).setStrokeStyle(5, DANGER_LEVELS[level].color, 1);
    }
  }

  private hideFromUi(items: Phaser.GameObjects.GameObject[]): void {
    for (const item of items) {
      this.uiCamera.ignore(item);
      if (item instanceof Phaser.GameObjects.Container) this.hideFromUi(item.list);
    }
  }

  // ---------- Camera: kéo, phóng to, thu nhỏ ----------

  private applyBounds(zoom: number): void {
    const camera = this.cameras.main;
    if (zoom < 0.13) {
      // Nhìn gần hết thế giới thì bỏ giới hạn để bản đồ nằm giữa màn hình.
      camera.removeBounds();
      return;
    }
    // Phần bản đồ bị thanh trạng thái và bảng địa danh che được bù thêm, tính theo mức phóng.
    camera.setBounds(
      -SEA_MARGIN,
      -SEA_MARGIN - HUD_HEIGHT / zoom,
      MAP_WIDTH + SEA_MARGIN * 2,
      MAP_HEIGHT + SEA_MARGIN * 2 + (HUD_HEIGHT + GAME_HEIGHT - PANEL_TOP) / zoom,
    );
  }

  /** Đặt mức phóng sao cho điểm (worldX, worldY) của bản đồ nằm tại điểm (screenX, screenY) trên màn hình. */
  private zoomAround(zoom: number, worldX: number, worldY: number, screenX: number, screenY: number): void {
    const camera = this.cameras.main;
    const next = Phaser.Math.Clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    camera.setZoom(next);
    this.applyBounds(next);
    camera.setScroll(
      worldX - screenX / next - GAME_WIDTH / 2 + GAME_WIDTH / (2 * next),
      worldY - screenY / next - GAME_HEIGHT / 2 + GAME_HEIGHT / (2 * next),
    );
    this.applyZoomLook();
  }

  /** Phóng quanh một điểm trên màn hình (vị trí con trỏ hoặc giữa hai ngón tay). */
  private zoomAtScreen(zoom: number, screenX: number, screenY: number): void {
    const camera = this.cameras.main;
    const worldX = camera.worldView.x + screenX / camera.zoom;
    const worldY = camera.worldView.y + screenY / camera.zoom;
    this.zoomAround(zoom, worldX, worldY, screenX, screenY);
  }

  /** Khi thu nhỏ, phóng bù các chấm địa danh để vẫn bấm được; nhìn xa thì hiện tên vùng đất. */
  private applyZoomLook(): void {
    const scale = Phaser.Math.Clamp(1 / this.zoom, 1, 2.6);
    this.views.forEach((view) => view.group.setScale(scale));
    this.marker.setScale(scale);
    const far = this.farMode;
    this.landTitles.forEach((title) => title.setVisible(far));
    this.bigMarker.setPosition(this.marker.x, this.marker.y).setVisible(far);
  }

  private showWorld(): void {
    this.zoomAround(MIN_ZOOM, MAP_WIDTH / 2, MAP_HEIGHT / 2, GAME_WIDTH / 2, BAND_CENTER_Y);
    this.toast('Chạm vào bản đồ để tới vùng đó');
  }

  private setupCamera(): void {
    const camera = this.cameras.main;
    const here = placeById(this.life.location);
    this.zoomAround(1, here.x, here.y, GAME_WIDTH / 2, BAND_CENTER_Y);
    this.input.addPointer(1);

    const inMap = (y: number): boolean => y > HUD_HEIGHT && y < PANEL_TOP;

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.busy) return;
      const first = this.input.pointer1;
      const second = this.input.pointer2;
      if (first.isDown && second.isDown) {
        // Hai ngón tay: chụm lại để thu nhỏ, tách ra để phóng to.
        const distance = Phaser.Math.Distance.Between(first.x, first.y, second.x, second.y);
        if (this.pinchDistance > 0 && distance > 0) {
          this.zoomAtScreen(
            this.zoom * (distance / this.pinchDistance),
            (first.x + second.x) / 2,
            (first.y + second.y) / 2,
          );
        }
        this.pinchDistance = distance;
        this.lastPinchAt = this.time.now;
        return;
      }
      this.pinchDistance = 0;
      if (!pointer.isDown || !inMap(pointer.downY)) return;
      if (this.time.now - this.lastPinchAt < 150) return;
      camera.scrollX -= (pointer.x - pointer.prevPosition.x) / camera.zoom;
      camera.scrollY -= (pointer.y - pointer.prevPosition.y) / camera.zoom;
    });

    this.input.on(
      'wheel',
      (pointer: Phaser.Input.Pointer, _over: unknown, _deltaX: number, deltaY: number) => {
        if (this.busy || !inMap(pointer.y)) return;
        this.zoomAtScreen(this.zoom * (deltaY > 0 ? 0.87 : 1.15), pointer.x, pointer.y);
      },
    );

    // Khi nhìn xa, chạm vào đâu thì bay tới vùng đó.
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.pinchDistance = 0;
      if (!this.farMode || this.busy || pointer.getDistance() > 14 || !inMap(pointer.y)) return;
      if (this.time.now - this.lastPinchAt < 300) return;
      const worldX = camera.worldView.x + pointer.x / camera.zoom;
      const worldY = camera.worldView.y + pointer.y / camera.zoom;
      this.zoomAround(1, worldX, worldY, GAME_WIDTH / 2, BAND_CENTER_Y);
    });
  }

  // ---------- Thanh trạng thái ----------

  private drawHud(): void {
    const cx = GAME_WIDTH / 2;
    const color = PATHS[this.life.path].color;
    const bg = this.add.rectangle(cx, HUD_HEIGHT / 2, GAME_WIDTH, HUD_HEIGHT, 0x0b0f1a, 0.94).setInteractive();
    const line = this.add.rectangle(cx, HUD_HEIGHT, GAME_WIDTH, 2, 0xffffff, 0.15);
    this.dateText = label(this, 24, 34, '', 24, '#8a94a8').setOrigin(0, 0.5);
    this.realmText = label(this, 24, 80, '', 36).setOrigin(0, 0.5);
    this.ageText = label(this, 24, 124, '', 24, '#ffd36b').setOrigin(0, 0.5);
    const barBack = this.add.rectangle(24, 162, BAR_WIDTH, 16, 0x1c2740, 1).setOrigin(0, 0.5);
    this.barFill = this.add.rectangle(24, 162, BAR_WIDTH, 16, color, 1).setOrigin(0, 0.5);
    this.energyText = label(this, 24 + BAR_WIDTH + 14, 162, '', 20, '#c9d4e8').setOrigin(0, 0.5);
    pin([bg, line, this.dateText, this.realmText, this.ageText, barBack, this.barFill, this.energyText]);

    const back = button(this, GAME_WIDTH - 100, 46, 170, 56, 'Bản thể', 0xc9d4e8, () => {
      if (this.busy) return;
      this.scene.start('Cultivate');
    }, 24);
    pin(back.objects, 101);
    const world = button(this, GAME_WIDTH - 100, 112, 170, 56, 'Toàn cảnh', 0xffd36b, () => {
      if (this.busy) return;
      if (this.farMode) this.zoomAround(1, this.marker.x, this.marker.y, GAME_WIDTH / 2, BAND_CENTER_Y);
      else this.showWorld();
    }, 24);
    pin(world.objects, 101);
  }

  private refreshHud(): void {
    const life = this.life;
    this.dateText.setText(`Kiếp thứ ${life.index}  ·  ${dateLabel(life)}`);
    this.realmText.setText(realmName(life));
    this.ageText.setText(`Tuổi ${ageYears(life)} / ${lifespan(life)}   ·   Linh thạch ${life.linhThach}`);
    this.refreshDanger();
    if (isAtPeak(life)) {
      this.barFill.setDisplaySize(BAR_WIDTH, 16);
      this.energyText.setText(formatNumber(life.energy));
      return;
    }
    const required = energyRequired(life);
    const ratio = Phaser.Math.Clamp(life.energy / required, 0, 1);
    this.barFill.setDisplaySize(Math.max(BAR_WIDTH * ratio, 1), 16);
    this.energyText.setText(`${formatNumber(life.energy)} / ${formatNumber(required)}`);
  }

  // ---------- Bảng địa danh ----------

  private renderPanel(): void {
    this.panel.forEach((item) => item.destroy());
    this.panel = [];
    this.views.forEach((view, id) => view.ring.setVisible(id === this.selected));
    this.renderBadges();

    const cx = GAME_WIDTH / 2;
    const place = placeById(this.selected);
    const type = PLACE_TYPES[place.type];
    const level = dangerLevel(place, this.life.tier);
    const height = GAME_HEIGHT - PANEL_TOP;
    const bg = this.add.rectangle(cx, PANEL_TOP + height / 2, GAME_WIDTH, height, 0x0b0f1a, 0.96).setInteractive();
    const line = this.add.rectangle(cx, PANEL_TOP, GAME_WIDTH, 2, 0xffffff, 0.15);
    const title = label(this, cx, PANEL_TOP + 38, place.name, 34, hexColor(type.color));
    const subtitle = label(
      this,
      cx,
      PANEL_TOP + 80,
      `${type.label}  ·  Linh khí ×${place.linhKhi}  ·  ${DANGER_LEVELS[level].label}`,
      22,
      hexColor(DANGER_LEVELS[level].color),
    );
    const active = this.life.events.find((item) => item.placeId === place.id);
    const event = active ? eventById(active.eventId) : undefined;
    const monthsLeft = active ? Math.max(1, Math.ceil((active.expiresDay - this.life.days) / 30)) : 0;
    const description = event
      ? label(this, cx, PANEL_TOP + 116, `Sự kiện: ${event.title}  ·  còn ${monthsLeft} tháng`, 21, '#ffd36b')
      : label(this, cx, PANEL_TOP + 116, place.description, 21, '#8a94a8');
    this.panel.push(...pin([bg, line, title, subtitle, description]));

    const color = PATHS[this.life.path].color;
    if (this.selected !== this.life.location) {
      const route = findRoute(this.life.location, this.selected);
      if (!route) return;
      const go = button(this, cx, PANEL_TOP + 205, 460, 80, `Đi tới  ·  ${route.days} ngày`, color, () =>
        this.travel(route.stops, route.days),
      );
      this.panel.push(go, ...pin(go.objects, 101));
      if (level >= 2) {
        const text = level === 3 ? 'Tử địa: tới nơi có thể bỏ mạng' : 'Nguy hiểm: tới nơi có thể bị tập kích';
        this.panel.push(...pin([label(this, cx, PANEL_TOP + 275, text, 22, hexColor(DANGER_LEVELS[level].color))]));
      }
      return;
    }

    // Bậc càng cao thì mỗi lần bế quan càng dài, để khỏi phải bấm hàng chục lần.
    const spans = [
      [1, 5, 10],
      [1, 5, 10],
      [5, 10, 20],
      [10, 50, 100],
      [20, 100, 200],
      [20, 100, 200],
    ][this.life.tier] ?? [1, 5, 10];
    const options: [string, number][] = spans.map((years) => [`${years} năm`, years * 12]);
    options.forEach(([text, months], index) => {
      const item = button(
        this,
        cx - 230 + index * 230,
        PANEL_TOP + 166,
        210,
        54,
        `Bế quan ${text}`,
        0xc9d4e8,
        () => this.doSeclude(months, place),
        21,
      );
      this.panel.push(item, ...pin(item.objects, 101));
    });
    const perYear = monthlyGain(this.life, place.linhKhi) * 12;
    this.panel.push(...pin([label(this, cx, PANEL_TOP + 206, `+${perYear.toFixed(1)} mỗi năm tại đây`, 19, '#8a94a8')]));

    // Hàng dưới: làm thuê, đột phá, sự kiện. Có bao nhiêu nút thì chia đều bấy nhiêu.
    const major = isBreakthrough(this.life);
    const actions: { text: string; color: number; enabled: boolean; run: () => void }[] = [];
    if (canWorkAt(place)) {
      actions.push({ text: 'Làm thuê 1 năm', color: 0xc9d4e8, enabled: true, run: () => this.doWork() });
    }
    actions.push({
      text: isAtPeak(this.life) ? 'Đỉnh Nhân giới' : major ? 'Đột phá' : 'Lên giai đoạn',
      color,
      enabled: canAttempt(this.life),
      run: () => this.doAdvance(),
    });
    if (event) actions.push({ text: 'Xem sự kiện', color: 0xffd36b, enabled: true, run: () => this.openEvent(event) });
    const width = (680 - (actions.length - 1) * 14) / actions.length;
    actions.forEach((action, index) => {
      const x = 20 + width / 2 + index * (width + 14);
      const item = button(this, x, PANEL_TOP + 254, width, 54, action.text, action.color, action.run, 21);
      item.setEnabled(action.enabled);
      this.panel.push(item, ...pin(item.objects, 101));
    });

    if (major && !isAtPeak(this.life)) {
      const cost = breakthroughCost(this.life);
      const chance = Math.round(breakthroughChance(this.life) * 100);
      const enough = this.life.linhThach >= cost;
      const text = cost > 0 ? `Đột phá: thành công ${chance}%  ·  cần ${cost} linh thạch` : `Đột phá: thành công ${chance}%`;
      this.panel.push(...pin([label(this, cx, PANEL_TOP + 302, text, 20, enough ? '#c9d4e8' : '#ff8a8a')]));
    }
  }

  // ---------- Hành động ----------

  private travel(stops: string[], days: number): void {
    if (this.busy) return;
    if (this.zoom < 0.6) this.zoomAround(1, this.marker.x, this.marker.y, GAME_WIDTH / 2, BAND_CENTER_Y);
    this.busy = true;
    const points = stops.slice(1).map((id) => placeById(id));
    const camera = this.cameras.main;
    // Lệch tâm để nhân vật nằm giữa khoảng bản đồ nhìn thấy, không bị bảng địa danh che.
    camera.startFollow(this.marker, true, 0.12, 0.12, 0, (BAND_CENTER_Y - GAME_HEIGHT / 2) / this.zoom);

    const step = (index: number): void => {
      if (index >= points.length) {
        camera.stopFollow();
        const destination = placeById(stops[stops.length - 1]);
        this.life.location = destination.id;
        this.life.days += days;
        this.selected = destination.id;
        this.busy = false;
        const hazard = arrivalHazard(this.life, destination);
        if (hazard) {
          this.cameras.main.shake(400, 0.015);
          this.cameras.main.flash(300, 255, 90, 90);
        }
        this.afterTimePassed(
          hazard?.killed
            ? 'Bị tập kích'
            : hazard
              ? `Bị dị thú tập kích: dưỡng thương ${hazard.injuryDays} ngày`
              : `Đi mất ${days} ngày`,
        );
        return;
      }
      const target = points[index];
      this.tweens.add({
        targets: this.marker,
        x: target.x,
        y: target.y,
        // Chặng xa thì chạy lâu hơn một chút, nhưng không bắt người chơi chờ quá 2 giây.
        duration: 650 + Math.min(Math.hypot(target.x - this.marker.x, target.y - this.marker.y), 2700) * 0.5,
        ease: 'Sine.easeInOut',
        onComplete: () => step(index + 1),
      });
    };
    step(0);
  }

  private doSeclude(months: number, place: Place): void {
    if (this.busy) return;
    const gain = seclude(this.life, months, place.linhKhi);
    this.cameras.main.flash(250, 95, 224, 194);
    this.afterTimePassed(`+${formatNumber(gain)} ${PATHS[this.life.path].energyName.toLowerCase()}`);
  }

  private doWork(): void {
    if (this.busy) return;
    const pay = work(this.life);
    this.afterTimePassed(`Làm thuê một năm: +${pay} linh thạch`);
  }

  private doAdvance(): void {
    if (this.busy) return;
    const major = isBreakthrough(this.life);
    const tierBefore = this.life.tier;
    const result = attemptAdvance(this.life);
    if (!result) return;
    if (!result.success) {
      this.cameras.main.shake(400, 0.015);
      this.cameras.main.flash(300, 255, 90, 90);
      this.afterTimePassed('Đột phá thất bại: mất 30% tu vi, dưỡng thương một năm');
      return;
    }
    if (major) {
      this.cameras.main.flash(600, 255, 255, 255);
      this.cameras.main.shake(350, 0.012);
    } else {
      this.cameras.main.flash(250, 180, 220, 255);
    }
    const summary = (Object.keys(result.gained) as (keyof Stats)[])
      .map((key) => `${STAT_LABELS[key]} +${result.gained[key]}`)
      .join('   ');
    if (!major) {
      this.afterTimePassed(summary);
      return;
    }
    // Từ Phàm Nhân bước vào bậc 1 chưa đủ để bản thể lĩnh ngộ; từ bậc 1 trở lên mới tính.
    const insight = tierBefore >= 1;
    if (insight) this.save.camNgo += 1;
    this.afterTimePassed(`Đột phá! Thọ nguyên ${lifespan(this.life)} năm${insight ? '  ·  +1 cảm ngộ' : ''}`);
  }

  private afterTimePassed(message: string): void {
    refreshEvents(this.life);
    writeSave(this.save);
    this.refreshHud();
    this.renderPanel();
    this.toast(message);
    if (isDead(this.life)) this.endLife();
  }

  private toast(message: string): void {
    const note = label(this, GAME_WIDTH / 2, PANEL_TOP - 50, message, 26, '#9dffb0').setStroke('#0b0f1a', 6);
    note.setWordWrapWidth(660);
    pin([note], 102);
    this.tweens.add({
      targets: note,
      y: PANEL_TOP - 110,
      alpha: 0,
      delay: 1100,
      duration: 900,
      onComplete: () => note.destroy(),
    });
  }

  // ---------- Sự kiện ----------

  private renderBadges(): void {
    this.badges.forEach((item) => item.destroy());
    this.badges = [];
    for (const active of this.life.events) {
      const view = this.views.get(active.placeId);
      if (!view) continue;
      const dot = this.add.circle(32, -32, 17, 0xffd36b, 1).setStrokeStyle(3, 0x0b0f1a, 1);
      const mark = label(this, 32, -32, '!', 26, '#0b0f1a');
      view.group.add([dot, mark]);
      this.hideFromUi([dot, mark]);
      this.tweens.add({ targets: [dot, mark], scale: 1.25, duration: 500, yoyo: true, repeat: -1 });
      this.badges.push(dot, mark);
    }
  }

  private dialog(build: (add: (item: Destroyable) => void, close: () => void) => void): void {
    this.busy = true;
    const items: Destroyable[] = [];
    const cx = GAME_WIDTH / 2;
    const backdrop = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05080f, 0.93).setInteractive();
    items.push(...pin([backdrop], 200));
    build(
      (item) => items.push(item),
      () => {
        items.forEach((item) => item.destroy());
        this.busy = false;
      },
    );
  }

  private openEvent(event: GameEvent): void {
    if (this.busy) return;
    const cx = GAME_WIDTH / 2;
    const here = placeById(this.life.location);
    const level = dangerLevel(here, this.life.tier);
    this.dialog((add, close) => {
      const title = label(this, cx, 250, event.title, 40, '#ffd36b');
      const where = label(this, cx, 305, here.name, 22, '#8a94a8');
      const body = label(this, cx, 350, event.text, 27, '#e8f0ff').setOrigin(0.5, 0);
      body.setWordWrapWidth(620).setLineSpacing(8);
      pin([title, where, body], 201).forEach(add);

      event.choices.forEach((choice, index) => {
        const chance = Math.round(successChance(this.life, choice, level) * 100);
        const text = choice.check ? `${choice.text}  ·  ${chance}%` : choice.text;
        const item = button(this, cx, 760 + index * 92, 660, 76, text, 0xc9d4e8, () => {
          close();
          this.pickChoice(event, choice, level);
        }, 22);
        item.setEnabled(canChoose(this.life, choice));
        pin(item.objects, 202);
        add(item);
      });
    });
  }

  private pickChoice(event: GameEvent, choice: Choice, level: number): void {
    const { outcome, success } = resolveChoice(this.life, choice, level);
    this.life.events = this.life.events.filter((item) => item.eventId !== event.id);
    const cx = GAME_WIDTH / 2;
    this.dialog((add, close) => {
      const title = label(this, cx, 300, event.title, 40, '#ffd36b');
      const verdict = choice.fail
        ? label(this, cx, 360, success ? 'Thành công' : 'Thất bại', 26, success ? '#9dffb0' : '#ff8a8a')
        : label(this, cx, 360, ' ', 26);
      const body = label(this, cx, 420, outcome.text, 28, '#e8f0ff').setOrigin(0.5, 0);
      body.setWordWrapWidth(620).setLineSpacing(8);
      const effects = label(this, cx, 760, this.describe(outcome), 26, '#9dffb0');
      effects.setWordWrapWidth(640);
      pin([title, verdict, body, effects], 201).forEach(add);
      const next = button(this, cx, 880, 420, 84, 'Tiếp tục', PATHS[this.life.path].color, () => {
        close();
        this.afterTimePassed(outcome.days ? `Trôi qua ${outcome.days} ngày` : ' ');
      });
      pin(next.objects, 202);
      add(next);
    });
  }

  private describe(outcome: Outcome): string {
    const parts: string[] = [];
    if (outcome.energy) parts.push(`${PATHS[this.life.path].energyName} +${outcome.energy}`);
    if (outcome.linhThach) parts.push(`Linh thạch ${outcome.linhThach > 0 ? '+' : ''}${outcome.linhThach}`);
    if (outcome.stat) parts.push(`${STAT_LABELS[outcome.stat.name]} +${outcome.stat.amount}`);
    if (outcome.days) parts.push(`${outcome.days} ngày`);
    return parts.length > 0 ? parts.join('   ·   ') : 'Không có gì thay đổi';
  }

  // ---------- Mở đầu và kết thúc kiếp ----------

  private overlay(lines: [string, number, string][], buttonText: string, onClose: () => void): void {
    this.busy = true;
    const cx = GAME_WIDTH / 2;
    const items: Destroyable[] = [];
    const backdrop = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85).setInteractive();
    items.push(...pin([backdrop], 200));
    let y = 250;
    for (const [text, size, color] of lines) {
      const line = label(this, cx, y, text, size, color);
      line.setWordWrapWidth(640);
      line.setY(y + line.height / 2);
      items.push(...pin([line], 201));
      y += line.height + 10;
    }
    const close = button(this, cx, y + 50, 420, 84, buttonText, PATHS[this.life.path].color, () => {
      items.forEach((item) => item.destroy());
      close.destroy();
      this.busy = false;
      onClose();
    });
    pin(close.objects, 202);
  }

  private showIntro(): void {
    const life = this.life;
    const origin = originById(life.origin);
    const birthplace = placeById(life.location);
    const level = dangerLevel(birthplace, life.tier);
    const lines: [string, number, string][] = [
      [`Kiếp thứ ${life.index}`, 56, '#e8f0ff'],
      [`Hồn nhập vào một đứa trẻ phàm nhân 12 tuổi ở ${birthplace.name}.`, 26, '#8a94a8'],
      [origin.name, 36, '#ffd36b'],
      [origin.description, 24, '#c9d4e8'],
      [`${life.linhCan.name}: ${life.linhCan.elements.join(', ')}`, 34, '#7fd4ff'],
    ];
    if (life.banMenh) {
      lines.push([`Dị năng bản mệnh: ${life.banMenh.element} · ${life.banMenh.grade}`, 30, '#c58cff']);
    }
    lines.push([`Thọ nguyên: ${lifespan(life)} năm`, 28, '#ffd36b']);
    if (level >= 2) lines.push(['Nơi này nguy hiểm với một phàm nhân. Cẩn thận.', 24, '#ff8a3c']);
    this.overlay(lines, 'Bắt đầu', () => undefined);
  }

  private endLife(): void {
    const life = this.life;
    const points = luanHoiPoints(life);
    this.save.luanHoiPoints += points;
    this.save.livesLived += 1;
    this.save.life = null;
    writeSave(this.save);
    const cause = life.killed
      ? `Kiếp thứ ${life.index} bỏ mạng ở ${placeById(life.location).name}, tuổi ${ageYears(life)}.`
      : `Kiếp thứ ${life.index} khép lại ở tuổi ${ageYears(life)}.`;
    this.overlay(
      [
        [life.killed ? 'Bỏ mạng' : 'Thọ nguyên đã tận', 52, '#e8f0ff'],
        [cause, 26, '#8a94a8'],
        [realmName(life), 40, hexColor(PATHS[life.path].color)],
        [`Điểm luân hồi +${points}`, 36, '#ffd36b'],
      ],
      'Hồn về bản thể',
      () => this.scene.start('Cultivate'),
    );
  }
}
