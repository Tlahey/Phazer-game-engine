import { ContentDatabase, ScriptRegistry, CreatureSpawn, CreatureTemplate } from '@phazer/engine';
import { Player } from './../entities/Player';
import { Boss } from './../entities/Boss';
import { Mob } from './../entities/Mob';

export type CreatureFactory = (scene: Phaser.Scene, spawn: CreatureSpawn, arenaExtent: number, player: Player, template: CreatureTemplate) => Boss | Mob;

/** Shared, app-wide instances: one content database, one creature script registry. */
export const contentDatabase = new ContentDatabase();
export const creatureScripts = new ScriptRegistry<CreatureFactory>();
