import { CreatureTemplate, CreatureSpawn, InstanceDefinition, PortalDefinition } from './ContentTypes';

export interface ContentSources {
    templates: string;
    spawns: string;
    instances: string;
    portals: string;
}

async function fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(path);
    return response.json() as Promise<T>;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
    const grouped = new Map<string, T[]>();
    items.forEach(item => {
        const k = key(item);
        const list = grouped.get(k);
        if (list) {
            list.push(item);
        } else {
            grouped.set(k, [item]);
        }
    });
    return grouped;
}

/**
 * Loads and indexes the game's static content: creature templates (identity/AI),
 * spawns (template placements per instance), instances (maps), and portals
 * (inter-instance travel points). Fetched once at boot from plain JSON files.
 */
export class ContentDatabase {

    private templates = new Map<number, CreatureTemplate>();
    private instances = new Map<string, InstanceDefinition>();
    private spawnsByInstance = new Map<string, CreatureSpawn[]>();
    private portalsByInstance = new Map<string, PortalDefinition[]>();

    public async load(sources: ContentSources): Promise<void> {
        const [templates, spawns, instances, portals] = await Promise.all([
            fetchJson<CreatureTemplate[]>(sources.templates),
            fetchJson<CreatureSpawn[]>(sources.spawns),
            fetchJson<InstanceDefinition[]>(sources.instances),
            fetchJson<PortalDefinition[]>(sources.portals)
        ]);

        templates.forEach(template => this.templates.set(template.entry, template));
        instances.forEach(instance => this.instances.set(instance.id, instance));
        this.spawnsByInstance = groupBy(spawns, spawn => spawn.instanceId);
        this.portalsByInstance = groupBy(portals, portal => portal.instanceId);
    }

    public getTemplate(entry: number): CreatureTemplate {
        const template = this.templates.get(entry);
        if (!template) {
            throw new Error(`No creature template registered for entry ${entry}`);
        }
        return template;
    }

    public getInstance(id: string): InstanceDefinition {
        const instance = this.instances.get(id);
        if (!instance) {
            throw new Error(`No instance definition registered for id "${id}"`);
        }
        return instance;
    }

    public getSpawns(instanceId: string): CreatureSpawn[] {
        return this.spawnsByInstance.get(instanceId) ?? [];
    }

    public getPortals(instanceId: string): PortalDefinition[] {
        return this.portalsByInstance.get(instanceId) ?? [];
    }
}
