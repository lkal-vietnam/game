import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import { CultivateScene } from './scenes/CultivateScene';

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
  scene: [CultivateScene],
});
