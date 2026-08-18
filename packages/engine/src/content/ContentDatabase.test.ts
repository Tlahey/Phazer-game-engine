import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentDatabase } from './ContentDatabase';
import { CreatureTemplate, CreatureSpawn, InstanceDefinition, PortalDefinition } from './ContentTypes';

const templates: CreatureTemplate[] = [
    { entry: 1, name: 'The Hollowed Warden', scriptName: 'boss_hollowed_warden', isBoss: true }
];

const spawns: CreatureSpawn[] = [
    { guid: 1, entry: 1, instanceId: 'dungeon', worldX: 0, worldY: -4 },
    { guid: 2, entry: 1, instanceId: 'dungeon', worldX: 1, worldY: -4 }
];

const instances: InstanceDefinition[] = [
    { id: 'dungeon', name: 'Dungeon', arenaExtent: 6.3 }
];

const portals: PortalDefinition[] = [
    { instanceId: 'dungeon', worldX: 0, worldY: 2, targetInstanceId: 'hub', targetWorldX: 0, targetWorldY: 0 }
];

const bodies: Record<string, unknown> = {
    '/templates.json': templates,
    '/spawns.json': spawns,
    '/instances.json': instances,
    '/portals.json': portals
};

const sources = {
    templates: '/templates.json',
    spawns: '/spawns.json',
    instances: '/instances.json',
    portals: '/portals.json'
};

describe('ContentDatabase', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn((path: string) =>
            Promise.resolve({ json: () => Promise.resolve(bodies[path]) })
        ));
    });

    it('loads and indexes templates and instances by id', async () => {
        const db = new ContentDatabase();
        await db.load(sources);

        expect(db.getTemplate(1)).toEqual(templates[0]);
        expect(db.getInstance('dungeon')).toEqual(instances[0]);
    });

    it('groups spawns and portals by instanceId, defaulting to an empty list', async () => {
        const db = new ContentDatabase();
        await db.load(sources);

        expect(db.getSpawns('dungeon')).toHaveLength(2);
        expect(db.getSpawns('nowhere')).toEqual([]);
        expect(db.getPortals('dungeon')).toEqual(portals);
        expect(db.getPortals('nowhere')).toEqual([]);
    });

    it('throws for an unknown template entry or instance id', async () => {
        const db = new ContentDatabase();
        await db.load(sources);

        expect(() => db.getTemplate(999)).toThrow();
        expect(() => db.getInstance('missing')).toThrow();
    });
});
