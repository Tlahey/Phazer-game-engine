/**
 * Plain data shapes for a TrinityCore-style content split: static templates
 * (identity/behavior, matched by entry) are placed into the world via spawn
 * rows that reference a template + the instance they live in.
 */

export interface CreatureTemplate {
    entry: number;
    name: string;
    /** Matched against a ScriptRegistry key to resolve the concrete AI/visual class. */
    scriptName: string;
    /** Drives HUD/encounter treatment (health bar, victory text) without the caller needing to know the concrete class. */
    isBoss: boolean;
}

export interface CreatureSpawn {
    guid: number;
    entry: number;
    instanceId: string;
    worldX: number;
    worldY: number;
}

export interface InstanceDefinition {
    id: string;
    name: string;
    arenaExtent: number;
}

export interface PortalDefinition {
    instanceId: string;
    worldX: number;
    worldY: number;
    targetInstanceId: string;
    targetWorldX: number;
    targetWorldY: number;
}
