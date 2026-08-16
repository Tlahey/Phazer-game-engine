/// <reference path="./../node_modules/phaser/types/phaser.d.ts"/>

import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 960,
    height: 600,
    backgroundColor: '#1b1710',
    scene: [GameScene]
};

window.onload = () => {
    (window as any).game = new Phaser.Game(config);
};
