import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import { BattleScene } from './scenes/BattleScene';
import { CreateScene } from './scenes/CreateScene';
import { CultivateScene } from './scenes/CultivateScene';
import { MapScene } from './scenes/MapScene';

// CultivateScene đứng đầu: nếu chưa có nhân vật, nó tự chuyển sang CreateScene.
new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b0f1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [CultivateScene, CreateScene, MapScene, BattleScene],
});
