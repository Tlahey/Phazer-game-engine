/// <reference path="./../../../node_modules/phaser/types/phaser.d.ts"/>

import { ArenaScene } from './scenes/ArenaScene';
import { contentDatabase } from './content/GameContent';
import { registerCreatureScripts } from './content/CreatureScripts';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 960,
    height: 600,
    backgroundColor: '#1b1710',
    scene: [ArenaScene]
};

window.onload = async () => {
    registerCreatureScripts();
    await contentDatabase.load({
        templates: './apps/soulslike/src/content/creatureTemplates.json',
        spawns: './apps/soulslike/src/content/creatureSpawns.json',
        instances: './apps/soulslike/src/content/instances.json',
        portals: './apps/soulslike/src/content/portals.json'
    });

    (window as any).game = new Phaser.Game(config);
};
