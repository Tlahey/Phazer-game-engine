import { StateMachine, StateDefinition } from '@phazer/engine';
import { Player } from './Player';
import { IsoEntity } from './IsoEntity';

const PATROL_SPEED = 0.7;      // world units/sec
const CHASE_SPEED = 1.1;       // world units/sec, slower than the boss's chase
const PATROL_DISTANCE = 1.4;   // world units from spawn point
const ARRIVE_THRESHOLD = 0.05; // world units

const AGGRO_RANGE = 2.5;    // world units, starts the chase
const DEAGGRO_RANGE = 3.6;  // world units, larger than AGGRO_RANGE to avoid state flicker at the boundary
const ATTACK_RANGE = 0.7;   // world units, contact range
const ATTACK_COOLDOWN = 900; // ms between contact hits

type MobStateName = 'toOffset' | 'toSpawn' | 'chase';

/**
 * Weak, simple hostile: paces between its spawn point and a short offset
 * until the player wanders within AGGRO_RANGE, then closes in and deals
 * contact damage on a cooldown — no telegraph/lunge theater like the Boss,
 * just a fast weak nuisance you're expected to shrug off or dodge.
 */
export class Mob extends IsoEntity {

    private player: Player;
    private fsm: StateMachine<Mob, MobStateName>;
    private readonly spawnX: number;
    private readonly spawnY: number;
    private readonly offsetX: number;
    private readonly offsetY: number;
    private attackCooldown = 0;

    constructor(scene: Phaser.Scene, worldX: number, worldY: number, arenaExtent: number, player: Player) {
        super(scene, worldX, worldY, arenaExtent);
        this.player = player;
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
            onUpdate: (mob, deltaMs) => mob.checkAggro() ?? mob.moveToward(mob.offsetX, mob.offsetY, deltaMs, 'toSpawn')
        },
        toSpawn: {
            onUpdate: (mob, deltaMs) => mob.checkAggro() ?? mob.moveToward(mob.spawnX, mob.spawnY, deltaMs, 'toOffset')
        },
        chase: {
            onUpdate: (mob, deltaMs) => mob.updateChase(deltaMs)
        }
    };

    public update(deltaMs: number, originX: number, originY: number): void {
        if (this.attackCooldown > 0) {
            this.attackCooldown = Math.max(0, this.attackCooldown - deltaMs);
        }

        this.fsm.update(deltaMs);
        this.syncScreenPosition(originX, originY);
    }

    private distanceToPlayer(): number {
        return Math.hypot(this.player.WorldX - this.worldX, this.player.WorldY - this.worldY);
    }

    private checkAggro(): MobStateName | void {
        if (this.distanceToPlayer() <= AGGRO_RANGE) {
            return 'chase';
        }
    }

    private updateChase(deltaMs: number): MobStateName | void {
        const dist = this.distanceToPlayer();
        if (dist > DEAGGRO_RANGE) {
            return 'toSpawn';
        }

        if (dist > ATTACK_RANGE) {
            const dt = deltaMs / 1000;
            const dirX = (this.player.WorldX - this.worldX) / dist;
            const dirY = (this.player.WorldY - this.worldY) / dist;
            const moved = this.clampToArena(this.worldX + dirX * CHASE_SPEED * dt, this.worldY + dirY * CHASE_SPEED * dt);
            this.worldX = moved.x;
            this.worldY = moved.y;
            this.setScale(dirX < 0 ? -1 : 1, 1);
        } else if (this.attackCooldown <= 0) {
            this.attackCooldown = ATTACK_COOLDOWN;
            this.player.TakeDamage(this.worldX, this.worldY);
        }
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
