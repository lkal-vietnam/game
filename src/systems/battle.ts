import type { Life, Relation } from '../state/save';
import { characterKey, monsterKey, SKIN_COUNT } from '../ui/art';
import { DAYS_PER_YEAR } from './life';

/** Luật chiến đấu theo lượt. File này chỉ có phép tính, không dính tới hình ảnh. */

type Rng = () => number;

export interface Enemy {
  name: string;
  /** Khóa hình đã nạp trong game. */
  image: string;
  /** File hình dị thú cần nạp; tu sĩ dùng hình nhân vật có sẵn nên bỏ trống. */
  file?: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  /** Tu sĩ (người) hay dị thú. */
  human: boolean;
}

export interface PlayerCombat {
  maxHp: number;
  attack: number;
  skillPower: number;
  skillName: string;
  defense: number;
}

/** Dị thú theo bậc: tên và file hình trong public/assets/monsters. */
const BEASTS: [string, string][][] = [
  [
    ['Linh Miêu Tam Nhãn', 'pet-03'],
    ['Hồ Ly Lá Non', 'pet-02'],
    ['Kim Mao Tiểu Sư', 'pet-07'],
  ],
  [
    ['Hắc Viêm Lang', 'pet-04'],
    ['Lộc Băng Giác', 'pet-05'],
    ['Thanh Vũ Hạc', 'pet-06'],
    ['Sói Ngậm Kiếm', 'pet-08'],
  ],
  [
    ['Tiểu Lôi Kỳ Lân', 'pet-10'],
    ['Tử Hỏa Linh Hồ', 'pet-09'],
    ['Xích Dương Điểu', 'pet-01'],
    ['Kim Nha Hổ', 'boss-10'],
  ],
  [
    ['Hỏa Trư Ma', 'boss-08'],
    ['Huyết Dực Bạch Hổ', 'boss-09'],
    ['Lục Độc Cửu Đầu Xà', 'boss-05'],
    ['Kim Mao Sư Vương', 'boss-18'],
    ['Thôn Hải Cự Ngư', 'boss-12'],
  ],
  [
    ['Băng Viêm Song Sắc Điểu', 'boss-06'],
    ['Thanh Phong Long Ưng', 'boss-07'],
    ['Cửu Vĩ Yêu Hồ', 'boss-17'],
    ['Dung Nham Cự Nhân', 'boss-14'],
    ['Thương Hải Long Kình', 'boss-13'],
    ['Xích Vũ Phượng', 'boss-16'],
    ['Hư Không Ma Chu', 'boss-11'],
  ],
  [
    ['Kim Long Vạn Kiếm', 'boss-01'],
    ['Xích Viêm Thần Nữ', 'boss-02'],
    ['Hỏa Long Thôn Nhật', 'boss-03'],
    ['Kim Dực Thiên Cơ', 'boss-04'],
    ['Băng Ngục Cửu Đầu Long', 'boss-15'],
    ['Lôi Đình Cự Thần', 'boss-19'],
    ['Hư Không Minh Long', 'boss-20'],
  ],
];
const SURNAMES = ['Lý', 'Trần', 'Phạm', 'Đoàn', 'Mạc', 'Tạ', 'Vương', 'Khúc', 'Dương', 'Hồ'];
const GIVEN_NAMES = ['Thanh Phong', 'Bất Phàm', 'Vân Khê', 'Hàn Sơn', 'Tử Yên', 'Minh Nguyệt', 'Trường Sinh', 'Lạc Trần', 'Cô Vân', 'Thiết Tâm'];
const NPC_RANKS = ['phàm nhân luyện võ', 'tu sĩ Luyện Khí', 'tu sĩ Trúc Cơ', 'tu sĩ Kim Đan', 'tu sĩ Nguyên Anh', 'tu sĩ Hóa Thần'];

const SKILL_COOLDOWN = 3;
export const HUNTS_PER_YEAR = 3;
export const HUNT_DAYS = 15;

function pick<T>(items: T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}

function clampLevel(level: number): number {
  return Math.min(5, Math.max(0, Math.round(level)));
}

function makeEnemy(name: string, image: string, level: number, human: boolean, file?: string): Enemy {
  // Tu sĩ có đầu óc và pháp bảo nên nhỉnh hơn dị thú cùng bậc.
  const boost = human ? 1.25 : 1;
  const maxHp = Math.round((20 + level * 26) * boost);
  return {
    name,
    image,
    file,
    level,
    hp: maxHp,
    maxHp,
    attack: (5 + level * 6) * boost,
    defense: level * 1.5,
    human,
  };
}

/** Số địch trong một trận: thường là một, nhưng có thể bị hai, ba hoặc bốn con vây. */
function rollGroupSize(rng: Rng): number {
  const roll = rng();
  if (roll < 0.6) return 1;
  if (roll < 0.85) return 2;
  if (roll < 0.95) return 3;
  return 4;
}

export function createBeasts(level: number, rng: Rng = Math.random): Enemy[] {
  const tier = clampLevel(level);
  const count = rollGroupSize(rng);
  const [name, file] = pick(BEASTS[tier], rng);
  return Array.from({ length: count }, (_, index) =>
    makeEnemy(count > 1 ? `${name} ${index + 1}` : name, monsterKey(file), tier, false, file),
  );
}

export function createNpc(level: number, rng: Rng = Math.random): Relation {
  return { name: `${pick(SURNAMES, rng)} ${pick(GIVEN_NAMES, rng)}`, level: clampLevel(level), status: 'la' };
}

export function npcRank(npc: Relation): string {
  return NPC_RANKS[clampLevel(npc.level)];
}

/** Tu sĩ mượn một trong các hình nhân vật; cùng một tên thì luôn ra cùng một hình. */
function npcImage(name: string): string {
  let hash = 0;
  for (const letter of name) hash = (hash * 31 + letter.charCodeAt(0)) % 1000;
  return characterKey(hash % 2 === 0 ? 'nam' : 'nu', (hash % SKIN_COUNT) + 1);
}

export function npcAsEnemy(npc: Relation): Enemy {
  return makeEnemy(npc.name, npcImage(npc.name), npc.level, true);
}

/** Tu sĩ thù địch đôi khi kéo theo đồng bọn. */
export function createNpcParty(npc: Relation, rng: Rng = Math.random): Enemy[] {
  const party = [npcAsEnemy(npc)];
  const extra = rollGroupSize(rng) - 1;
  for (let i = 0; i < extra; i += 1) {
    party.push(makeEnemy(`Đồng bọn ${i + 1}`, npcImage(`${npc.name}${i}`), Math.max(0, npc.level - 1), true));
  }
  return party;
}

// ---------- Người chơi ----------

export function maxHp(life: Life): number {
  return 30 + life.stats.theChat * 6 + life.tier * 25;
}

/** Thương nặng thì máu chỉ hồi được tới 30% cho tới khi bế quan chữa thương. */
export function hpCap(life: Life): number {
  return life.injured ? Math.ceil(maxHp(life) * 0.3) : maxHp(life);
}

export function currentHp(life: Life): number {
  return Math.min(life.hp ?? maxHp(life), hpCap(life));
}

/** Thời gian trôi thì máu tự hồi 1% mỗi ngày, không vượt quá giới hạn. */
export function recover(life: Life, days: number): void {
  if (days <= 0) return;
  life.hp = Math.min(hpCap(life), currentHp(life) + Math.ceil(maxHp(life) * 0.01 * days));
}

/** Bế quan từ một năm trở lên thì chữa lành thương nặng và hồi đầy máu. */
export function healBySeclusion(life: Life, months: number): boolean {
  const cured = life.injured && months >= 12;
  if (cured) life.injured = false;
  life.hp = hpCap(life);
  return cured;
}

export function playerCombat(life: Life): PlayerCombat {
  const s = life.stats;
  const tierBoost = 1 + life.tier * 0.35;
  let skillPower = 4 + s.linhLuc * 1.6;
  let skillName = 'Pháp thuật';
  if (life.path === 'theTu') {
    skillPower = 4 + (s.sucManh + s.theChat) * 0.9;
    skillName = 'Trọng quyền';
  } else if (life.path === 'diNang') {
    skillPower = (4 + s.thanThuc * 1.3) * (life.banMenh?.power ?? 1);
    skillName = life.banMenh ? `Dị năng ${life.banMenh.element}` : 'Dị năng';
  }
  return {
    maxHp: maxHp(life),
    attack: (3 + s.sucManh) * tierBoost,
    skillPower: skillPower * tierBoost,
    skillName,
    defense: s.theChat * 0.4,
  };
}

// ---------- Diễn biến trận đấu ----------

export type Action = 'attack' | 'skill' | 'defend' | 'flee';

export interface Hit {
  /** -1 là người chơi, còn lại là vị trí của địch. */
  target: number;
  damage: number;
  crit: boolean;
  dodged: boolean;
}

export interface Battle {
  enemies: Enemy[];
  hp: number;
  target: number;
  cooldown: number;
  round: number;
  outcome: 'ongoing' | 'won' | 'lost' | 'fled';
}

export interface RoundResult {
  log: string[];
  hits: Hit[];
}

export function startBattle(life: Life, enemies: Enemy[]): Battle {
  return { enemies, hp: currentHp(life), target: 0, cooldown: 0, round: 1, outcome: 'ongoing' };
}

function strongestLevel(battle: Battle): number {
  return Math.max(...battle.enemies.filter((enemy) => enemy.hp > 0).map((enemy) => enemy.level), 0);
}

function roll(base: number, defense: number, rng: Rng): number {
  return Math.max(1, Math.round(base * (0.85 + rng() * 0.3) - defense));
}

export function fleeChance(life: Life, battle: Battle): number {
  const gap = life.stats.thanPhap - (4 + strongestLevel(battle) * 2);
  return Math.min(0.9, Math.max(0.15, 0.4 + gap * 0.06));
}

/** Thực hiện một lượt: người chơi ra tay trước, sau đó từng kẻ địch còn sống đánh lại. */
export function playRound(life: Life, battle: Battle, action: Action, rng: Rng = Math.random): RoundResult {
  const me = playerCombat(life);
  const log: string[] = [];
  const hits: Hit[] = [];
  if (battle.outcome !== 'ongoing') return { log, hits };

  if (battle.enemies[battle.target]?.hp <= 0) {
    battle.target = battle.enemies.findIndex((enemy) => enemy.hp > 0);
  }
  const foe = battle.enemies[battle.target];
  let defending = false;

  if (action === 'flee') {
    if (rng() < fleeChance(life, battle)) {
      battle.outcome = 'fled';
      log.push('Ngươi thoát thân.');
      return { log, hits };
    }
    log.push('Ngươi quay đầu chạy nhưng bị chặn lại.');
  } else if (action === 'defend') {
    defending = true;
    log.push('Ngươi thủ thế.');
  } else {
    const useSkill = action === 'skill' && battle.cooldown === 0;
    const crit = rng() < Math.min(0.5, life.stats.thanThuc * 0.015);
    const dodged = rng() < 0.05;
    const base = (useSkill ? me.skillPower : me.attack) * (crit ? 1.6 : 1);
    const damage = dodged ? 0 : roll(base, foe.defense, rng);
    foe.hp = Math.max(0, foe.hp - damage);
    hits.push({ target: battle.target, damage, crit, dodged });
    const move = useSkill ? me.skillName : 'Đòn thường';
    log.push(
      dodged
        ? `${foe.name} né được ${move.toLowerCase()} của ngươi.`
        : `${move}${crit ? ' chí mạng' : ''}: ${foe.name} mất ${damage} máu.`,
    );
    if (useSkill) battle.cooldown = SKILL_COOLDOWN;
    if (foe.hp === 0) log.push(`${foe.name} gục xuống.`);
  }

  if (battle.enemies.every((enemy) => enemy.hp === 0)) {
    battle.outcome = 'won';
    return { log, hits };
  }

  for (const enemy of battle.enemies) {
    if (enemy.hp === 0) continue;
    const dodge = Math.min(0.4, Math.max(0.02, 0.05 + (life.stats.thanPhap - (4 + enemy.level * 2)) * 0.03));
    if (rng() < dodge) {
      hits.push({ target: -1, damage: 0, crit: false, dodged: true });
      log.push(`Ngươi né được đòn của ${enemy.name}.`);
      continue;
    }
    let damage = roll(enemy.attack, me.defense, rng);
    if (defending) damage = Math.max(1, Math.round(damage * 0.4));
    battle.hp = Math.max(0, battle.hp - damage);
    hits.push({ target: -1, damage, crit: false, dodged: false });
    log.push(`${enemy.name} đánh trúng: ngươi mất ${damage} máu.`);
    if (battle.hp === 0) {
      battle.outcome = 'lost';
      break;
    }
  }

  if (action !== 'skill' && battle.cooldown > 0) battle.cooldown -= 1;
  battle.round += 1;
  return { log, hits };
}

export interface Spoils {
  linhThach: number;
  energy: number;
}

export function spoils(enemies: Enemy[], rng: Rng = Math.random): Spoils {
  let linhThach = 0;
  let energy = 0;
  for (const enemy of enemies) {
    const coins = 6 + enemy.level * 8 + Math.floor(rng() * 6);
    // Tu sĩ mang nhiều linh thạch; dị thú thì có hạch để hấp thụ.
    linhThach += enemy.human ? coins * 3 : coins;
    if (!enemy.human) energy += 3 + enemy.level * 5;
  }
  return { linhThach, energy };
}

/**
 * Ghi kết quả trận đấu vào kiếp. Thua thì thương nặng; đang thương nặng mà thua nữa thì bỏ mạng.
 * Trả về câu tóm tắt để hiện cho người chơi.
 */
export function finishBattle(life: Life, battle: Battle, rng: Rng = Math.random): { title: string; detail: string } {
  if (battle.outcome === 'won') {
    const loot = spoils(battle.enemies, rng);
    life.hp = battle.hp;
    life.linhThach += loot.linhThach;
    life.energy += loot.energy;
    const parts = [`Linh thạch +${loot.linhThach}`];
    if (loot.energy > 0) parts.push(`Tu vi +${loot.energy} (hấp thụ dị hạch)`);
    return { title: 'Thắng trận', detail: parts.join('   ·   ') };
  }
  if (battle.outcome === 'fled') {
    life.hp = battle.hp;
    return { title: 'Thoát thân', detail: 'Ngươi chạy thoát, không được gì.' };
  }
  if (life.injured) {
    life.killed = true;
    return { title: 'Bỏ mạng', detail: 'Thương cũ chưa lành lại thêm thương mới. Ngươi không gượng dậy được nữa.' };
  }
  life.injured = true;
  life.hp = 1;
  return {
    title: 'Thua trận',
    detail: 'Ngươi bị thương nặng. Phải bế quan ít nhất một năm để chữa; còn đánh nữa mà thua thì bỏ mạng.',
  };
}

// ---------- Săn dị thú ----------

export function huntsLeft(life: Life, placeId: string): number {
  const year = Math.floor(life.days / DAYS_PER_YEAR);
  const record = life.hunts[placeId];
  return record && record.year === year ? Math.max(0, HUNTS_PER_YEAR - record.count) : HUNTS_PER_YEAR;
}

export function useHunt(life: Life, placeId: string): void {
  const year = Math.floor(life.days / DAYS_PER_YEAR);
  const record = life.hunts[placeId];
  life.hunts[placeId] = record && record.year === year ? { year, count: record.count + 1 } : { year, count: 1 };
  life.days += HUNT_DAYS;
}
