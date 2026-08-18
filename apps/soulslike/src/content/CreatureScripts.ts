import { Boss } from './../entities/Boss';
import { Mob } from './../entities/Mob';
import { creatureScripts } from './GameContent';

/**
 * Matches each creature_template.scriptName to the class that brings it to
 * life. Adding a new creature is: a template row, a spawn row, and one
 * registration here — no scene/loader changes.
 */
export function registerCreatureScripts(): void {
    creatureScripts.register('boss_hollowed_warden', (scene, spawn, arenaExtent, player, template) =>
        new Boss(scene, spawn.worldX, spawn.worldY, arenaExtent, player, template.name));

    creatureScripts.register('mob_patrol_wretch', (scene, spawn, arenaExtent, player) =>
        new Mob(scene, spawn.worldX, spawn.worldY, arenaExtent, player));
}
