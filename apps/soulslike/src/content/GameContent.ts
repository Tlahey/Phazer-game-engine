import { ContentDatabase, ScriptRegistry, CreatureSpawn, CreatureTemplate } from '@phazer/engine';
import { Player } from './../entities/Player';

/** Structural contract for anything the creature registry can produce — ArenaScene never needs to import concrete classes. */
export type UpdatableEntity = Phaser.GameObjects.GameObject & {
    update(deltaMs: number, originX: number, originY: number): void;
};

/** What ArenaScene needs to drive the boss HP bar/name and victory flow, regardless of which boss class this is. */
export type BossLike = UpdatableEntity & {
    readonly Name: string;
    readonly Health: number;
    readonly MaxHealth: number;
    readonly IsDead: boolean;
};

export type CreatureFactory = (scene: Phaser.Scene, spawn: CreatureSpawn, arenaExtent: number, player: Player, template: CreatureTemplate) => UpdatableEntity;

/** Shared, app-wide instances: one content database, one creature script registry. */
export const contentDatabase = new ContentDatabase();
export const creatureScripts = new ScriptRegistry<CreatureFactory>();
