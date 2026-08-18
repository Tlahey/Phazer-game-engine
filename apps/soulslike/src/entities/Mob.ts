import { StateMachine, StateDefinition } from '@phazer/engine';
import { IsoEntity } from './IsoEntity';

const PATROL_SPEED = 0.7;      // world units/sec
const PATROL_DISTANCE = 1.4;   // world units from spawn point
const ARRIVE_THRESHOLD = 0.05; // world units

type MobStateName = 'toOffset' | 'toSpawn';

/**
 * Minimal demo creature: no attack, just paces back and forth between its
 * spawn point and a short offset. Exists to prove the content/registry
 * system handles more than one creature script side by side with the Boss.
 */
export class Mob extends IsoEntity {

    private fsm: StateMachine<Mob, MobStateName>;
    private readonly spawnX: number;
    private readonly spawnY: number;
    private readonly offsetX: number;
    private readonly offsetY: number;

    constructor(scene: Phaser.Scene, worldX: number, worldY: number, arenaExtent: number) {
        super(scene, worldX, worldY, arenaExtent);
        this.spawnX = worldX;
        this.spawnY = worldY;
        this.offsetX = worldX + PATROL_DISTANCE;
        this.offsetY = worldY;

        const body = scene.add.circle(0, 0, 16, 0x1f2417).setStrokeStyle(2, 0x0c0d08);
        const spike = scene.add.triangle(0, 0, 0, -20, -6, -6, 6, -6, 0x0c0d08);

        this.add([body, spike]);

        this.fsm = new StateMachine<Mob, MobStateName>(this, Mob.States, 'toOffset');
    }

    private static readonly States: Record<MobStateName, StateDefinition<Mob, MobStateName>> = {
        toOffset: {
            onUpdate: (mob, deltaMs) => mob.moveToward(mob.offsetX, mob.offsetY, deltaMs, 'toSpawn')
        },
        toSpawn: {
            onUpdate: (mob, deltaMs) => mob.moveToward(mob.spawnX, mob.spawnY, deltaMs, 'toOffset')
        }
    };

    public update(deltaMs: number, originX: number, originY: number): void {
        this.fsm.update(deltaMs);
        this.syncScreenPosition(originX, originY);
    }

    private moveToward(targetX: number, targetY: number, deltaMs: number, nextState: MobStateName): MobStateName | void {
        const dt = deltaMs / 1000;
        const dx = targetX - this.worldX;
        const dy = targetY - this.worldY;
        const dist = Math.hypot(dx, dy);

        if (dist <= ARRIVE_THRESHOLD) {
            return nextState;
        }

        const dirX = dx / dist;
        const dirY = dy / dist;
        const step = Math.min(PATROL_SPEED * dt, dist);
        const moved = this.clampToArena(this.worldX + dirX * step, this.worldY + dirY * step);
        this.worldX = moved.x;
        this.worldY = moved.y;
        this.setScale(dirX < 0 ? -1 : 1, 1);
    }
}
