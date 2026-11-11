import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { eventById, type Choice, type GameEvent, type Outcome } from '../data/events';
import { findRoute, MAP_HEIGHT, MAP_WIDTH, PLACES, PLACE_TYPES, placeById, type Place } from '../data/map';
import { PATHS, STAT_LABELS, type Stats } from '../data/paths';
import { loadSave, writeSave, type Life, type SaveData } from '../state/save';
import { advance, canAdvance, energyRequired, isAtPeak, isBreakthrough, realmName } from '../systems/cultivation';
import {
  ageYears,
  createLife,
  dateLabel,
  isDead,
  lifespan,
  luanHoiPoints,
  monthlyGain,
  seclude,
} from '../systems/life';
import { canChoose, refreshEvents, resolveChoice, successChance } from '../systems/events';
import { button, formatNumber, hexColor, label, pin } from '../ui/widgets';
import { drawTerrain } from './mapArt';

const HUD_HEIGHT = 190;
const PANEL_TOP = 950;
const SEA_MARGIN = 160;
const BAR_WIDTH = 420;

type Destroyable = { destroy(): void };

/** Lịch luyện kiếp: bản đồ Lạc Thành, di chuyển trôi lịch, bế quan theo tháng, tuổi thọ. */
export class MapScene extends Phaser.Scene {
  private save!: SaveData;
  private life!: Life;
  private selected!: string;
  private busy = false;
  private marker!: Phaser.GameObjects.Container;
  private dateText!: Phaser.GameObjects.Text;
  private realmText!: Phaser.GameObjects.Text;
  private ageText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private barFill!: Phaser.GameObjects.Rectangle;
  private panel: Destroyable[] = [];
  private rings = new Map<string, Phaser.GameObjects.Arc>();
  private badges: Destroyable[] = [];

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
    this.rings = new Map();
    this.badges = [];

    let isNewLife = false;
    if (!this.save.life) {
      this.save.life = createLife(this.save.character.path, this.save.livesLived + 1);
      writeSave(this.save);
      isNewLife = true;
    }
    this.life = this.save.life;
    this.selected = this.life.location;
    refreshEvents(this.life);
    writeSave(this.save);

    this.drawMap();
    this.drawHud();
    this.setupCamera();
    this.refreshHud();
    this.renderPanel();
    if (isNewLife) this.showIntro();
    else if (isDead(this.life)) this.endLife();
  }

  // ---------- Bản đồ ----------

  private drawMap(): void {
    drawTerrain(this);

    PLACES.forEach((place) => this.drawPlace(place));

    const here = placeById(this.life.location);
    const dot = this.add.circle(0, 0, 13, 0xffffff, 1).setStrokeStyle(4, 0xffd36b, 1);
    const pulse = this.add.circle(0, 0, 13, 0xffd36b, 0.5);
    this.marker = this.add.container(here.x, here.y - 62, [pulse, dot]).setDepth(20);
    this.tweens.add({ targets: pulse, scale: 2.4, alpha: 0, duration: 1100, repeat: -1 });
    this.tweens.add({ targets: this.marker, y: '-=8', duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private drawPlace(place: Place): void {
    const type = PLACE_TYPES[place.type];
    // Mây linh khí: nơi linh khí càng đậm thì quầng sáng càng lớn.
    const cloud = this.add
      .circle(place.x, place.y, 40 + place.linhKhi * 28, 0x7ff5d8, 0.08 + place.linhKhi * 0.06)
      .setDepth(4);
    this.tweens.add({
      targets: cloud,
      scale: 1.18,
      alpha: cloud.alpha * 0.4,
      duration: 1800 + place.x,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    if (place.linhKhi >= 1.5) this.spawnMotes(place);

    const ring = this.add
      .circle(place.x, place.y, 46, 0x000000, 0)
      .setStrokeStyle(4, 0xffffff, 1)
      .setVisible(false)
      .setDepth(6);
    this.rings.set(place.id, ring);

    const body = this.add
      .circle(place.x, place.y, 36, 0x101828, 1)
      .setStrokeStyle(5, type.color, 1)
      .setDepth(5)
      .setInteractive({ useHandCursor: true });
    label(this, place.x, place.y, type.icon, 34).setDepth(6);
    label(this, place.x, place.y + 62, place.name, 22, '#ffffff').setStroke('#0b0f1a', 6).setDepth(6);

    body.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Kéo bản đồ rồi nhả tay trên một chấm thì không tính là chọn.
      if (this.busy || pointer.getDistance() > 14) return;
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

  private setupCamera(): void {
    const camera = this.cameras.main;
    camera.setBounds(
      -SEA_MARGIN,
      -SEA_MARGIN - HUD_HEIGHT,
      MAP_WIDTH + SEA_MARGIN * 2,
      MAP_HEIGHT + SEA_MARGIN * 2 + HUD_HEIGHT + (GAME_HEIGHT - PANEL_TOP),
    );
    const here = placeById(this.life.location);
    camera.centerOn(here.x, here.y);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || this.busy) return;
      if (pointer.downY < HUD_HEIGHT || pointer.downY > PANEL_TOP) return;
      camera.scrollX -= pointer.x - pointer.prevPosition.x;
      camera.scrollY -= pointer.y - pointer.prevPosition.y;
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

    const back = button(this, GAME_WIDTH - 100, 50, 170, 60, 'Bản thể', 0xc9d4e8, () => {
      if (this.busy) return;
      this.scene.start('Cultivate');
    }, 24);
    pin(back.objects, 101);
  }

  private refreshHud(): void {
    const life = this.life;
    this.dateText.setText(`Kiếp thứ ${life.index}  ·  ${dateLabel(life)}`);
    this.realmText.setText(realmName(life));
    this.ageText.setText(`Tuổi ${ageYears(life)} / ${lifespan(life)}   ·   Linh thạch ${life.linhThach}`);
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
    this.rings.forEach((ring, id) => ring.setVisible(id === this.selected));
    this.renderBadges();

    const cx = GAME_WIDTH / 2;
    const place = placeById(this.selected);
    const type = PLACE_TYPES[place.type];
    const height = GAME_HEIGHT - PANEL_TOP;
    const bg = this.add.rectangle(cx, PANEL_TOP + height / 2, GAME_WIDTH, height, 0x0b0f1a, 0.96).setInteractive();
    const line = this.add.rectangle(cx, PANEL_TOP, GAME_WIDTH, 2, 0xffffff, 0.15);
    const title = label(this, cx, PANEL_TOP + 42, place.name, 36, hexColor(type.color));
    const subtitle = label(this, cx, PANEL_TOP + 86, `${type.label}  ·  Linh khí ×${place.linhKhi}`, 24, '#5fe0c2');
    const active = this.life.events.find((item) => item.placeId === place.id);
    const event = active ? eventById(active.eventId) : undefined;
    const monthsLeft = active ? Math.max(1, Math.ceil((active.expiresDay - this.life.days) / 30)) : 0;
    const description = event
      ? label(this, cx, PANEL_TOP + 126, `Sự kiện: ${event.title}  ·  còn ${monthsLeft} tháng`, 22, '#ffd36b')
      : label(this, cx, PANEL_TOP + 126, place.description, 22, '#8a94a8');
    this.panel.push(...pin([bg, line, title, subtitle, description]));

    const color = PATHS[this.life.path].color;
    if (this.selected !== this.life.location) {
      const route = findRoute(this.life.location, this.selected);
      if (!route) return;
      const go = button(this, cx, PANEL_TOP + 215, 460, 84, `Đi tới  ·  ${route.days} ngày`, color, () =>
        this.travel(route.stops, route.days),
      );
      this.panel.push(go, ...pin(go.objects, 101));
      return;
    }

    const perMonth = monthlyGain(this.life, place.linhKhi);
    const options: [string, number][] = [
      ['1 tháng', 1],
      ['1 năm', 12],
      ['5 năm', 60],
    ];
    options.forEach(([text, months], index) => {
      const item = button(
        this,
        cx - 230 + index * 230,
        PANEL_TOP + 188,
        210,
        62,
        `Bế quan ${text}`,
        0xc9d4e8,
        () => this.doSeclude(months, place),
        22,
      );
      this.panel.push(item, ...pin(item.objects, 101));
    });
    const rate = label(this, cx, PANEL_TOP + 236, `+${perMonth.toFixed(1)} mỗi tháng tại đây`, 20, '#8a94a8');
    this.panel.push(...pin([rate]));

    const caption = isAtPeak(this.life)
      ? 'Đỉnh Nhân giới'
      : isBreakthrough(this.life)
        ? 'Đột phá'
        : 'Lên giai đoạn';
    const hasEvent = event !== undefined;
    const up = button(
      this,
      hasEvent ? cx - 175 : cx,
      PANEL_TOP + 290,
      hasEvent ? 330 : 460,
      58,
      caption,
      color,
      () => this.doAdvance(),
      24,
    );
    up.setEnabled(canAdvance(this.life));
    this.panel.push(up, ...pin(up.objects, 101));
    if (event) {
      const open = button(this, cx + 175, PANEL_TOP + 290, 330, 58, 'Xem sự kiện', 0xffd36b, () => this.openEvent(event), 24);
      this.panel.push(open, ...pin(open.objects, 101));
    }
  }

  // ---------- Hành động ----------

  private travel(stops: string[], days: number): void {
    if (this.busy) return;
    this.busy = true;
    const points = stops.slice(1).map((id) => placeById(id));
    const camera = this.cameras.main;
    camera.startFollow(this.marker, true, 0.12, 0.12);

    const step = (index: number): void => {
      if (index >= points.length) {
        camera.stopFollow();
        this.life.location = stops[stops.length - 1];
        this.life.days += days;
        this.selected = this.life.location;
        this.busy = false;
        this.afterTimePassed(`Đi mất ${days} ngày`);
        return;
      }
      const target = points[index];
      this.tweens.killTweensOf(this.marker);
      this.tweens.add({
        targets: this.marker,
        x: target.x,
        y: target.y - 62,
        duration: 650,
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

  private doAdvance(): void {
    if (this.busy) return;
    const major = isBreakthrough(this.life);
    const gained = advance(this.life);
    if (!gained) return;
    if (major) {
      this.cameras.main.flash(600, 255, 255, 255);
      this.cameras.main.shake(350, 0.012);
    } else {
      this.cameras.main.flash(250, 180, 220, 255);
    }
    const summary = (Object.keys(gained) as (keyof Stats)[])
      .map((key) => `${STAT_LABELS[key]} +${gained[key]}`)
      .join('   ');
    if (major) this.save.camNgo += 1;
    this.afterTimePassed(major ? `Đột phá! Thọ nguyên ${lifespan(this.life)} năm  ·  +1 cảm ngộ` : summary);
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
    const note = label(this, GAME_WIDTH / 2, PANEL_TOP - 50, message, 26, '#9dffb0');
    note.setWordWrapWidth(660);
    pin([note], 102);
    this.tweens.add({
      targets: note,
      y: PANEL_TOP - 110,
      alpha: 0,
      delay: 900,
      duration: 900,
      onComplete: () => note.destroy(),
    });
  }

  // ---------- Sự kiện ----------

  private renderBadges(): void {
    this.badges.forEach((item) => item.destroy());
    this.badges = [];
    for (const active of this.life.events) {
      const place = placeById(active.placeId);
      const dot = this.add.circle(place.x + 30, place.y - 30, 17, 0xffd36b, 1).setStrokeStyle(3, 0x0b0f1a, 1).setDepth(8);
      const mark = label(this, place.x + 30, place.y - 30, '!', 26, '#0b0f1a').setDepth(9);
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
    this.dialog((add, close) => {
      const title = label(this, cx, 250, event.title, 40, '#ffd36b');
      const where = label(this, cx, 305, placeById(this.life.location).name, 22, '#8a94a8');
      const body = label(this, cx, 350, event.text, 27, '#e8f0ff').setOrigin(0.5, 0);
      body.setWordWrapWidth(620).setLineSpacing(8);
      pin([title, where, body], 201).forEach(add);

      event.choices.forEach((choice, index) => {
        const chance = Math.round(successChance(this.life, choice) * 100);
        const text = choice.check ? `${choice.text}  ·  ${chance}%` : choice.text;
        const item = button(this, cx, 760 + index * 92, 660, 76, text, 0xc9d4e8, () => {
          close();
          this.pickChoice(event, choice);
        }, 22);
        item.setEnabled(canChoose(this.life, choice));
        pin(item.objects, 202);
        add(item);
      });
    });
  }

  private pickChoice(event: GameEvent, choice: Choice): void {
    const { outcome, success } = resolveChoice(this.life, choice);
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
    if (outcome.stat) parts.push(`${STAT_LABELS[outcome.stat[0]]} +${outcome.stat[1]}`);
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
    let y = 360;
    for (const [text, size, color] of lines) {
      const line = label(this, cx, y, text, size, color);
      line.setWordWrapWidth(640);
      items.push(...pin([line], 201));
      y += size + 44;
    }
    const close = button(this, cx, y + 60, 420, 84, buttonText, PATHS[this.life.path].color, () => {
      items.forEach((item) => item.destroy());
      close.destroy();
      this.busy = false;
      onClose();
    });
    pin(close.objects, 202);
  }

  private showIntro(): void {
    const life = this.life;
    const lines: [string, number, string][] = [
      [`Kiếp thứ ${life.index}`, 56, '#e8f0ff'],
      ['Hồn nhập vào một đứa trẻ 12 tuổi ở Lạc Thành.', 26, '#8a94a8'],
      [life.linhCan.name, 48, '#7fd4ff'],
      [`Hệ: ${life.linhCan.elements.join(', ')}`, 28, '#c9d4e8'],
    ];
    if (life.banMenh) {
      lines.push([`Dị năng bản mệnh: ${life.banMenh.element} · ${life.banMenh.grade}`, 30, '#c58cff']);
    }
    lines.push([`Thọ nguyên: ${lifespan(life)} năm`, 28, '#ffd36b']);
    this.overlay(lines, 'Bắt đầu', () => undefined);
  }

  private endLife(): void {
    const life = this.life;
    const points = luanHoiPoints(life);
    this.save.luanHoiPoints += points;
    this.save.livesLived += 1;
    this.save.life = null;
    writeSave(this.save);
    this.overlay(
      [
        ['Thọ nguyên đã tận', 52, '#e8f0ff'],
        [`Kiếp thứ ${life.index} khép lại ở tuổi ${ageYears(life)}.`, 26, '#8a94a8'],
        [realmName(life), 40, hexColor(PATHS[life.path].color)],
        [`Điểm luân hồi +${points}`, 36, '#ffd36b'],
      ],
      'Hồn về bản thể',
      () => this.scene.start('Cultivate'),
    );
  }
}
