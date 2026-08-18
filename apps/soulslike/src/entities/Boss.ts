import { StateMachine, StateDefinition } from '@phazer/engine';
import { Player } from './Player';
import { IsoEntity } from './IsoEntity';

const ATTACK_RANGE = 2.2;      // world units, distance at which the boss commits to an attack
const CHASE_SPEED = 1.6;       // world units/sec
const LUNGE_SPEED = 9.5;       // world units/sec
const TELEGRAPH_DURATION = 500; // ms, red/white flicker before the lunge fires
const LUNGE_DURATION = 260;     // ms
const RECOVER_DURATION = 650;   // ms, boss is dimmed and stationary
const HIT_RADIUS = 1.1;         // world units, lunge hitbox vs. player

const MAX_HEALTH = 5;

type BossStateName = 'chase' | 'telegraph' | 'lunge' | 'recover' | 'dead';

export class Boss extends IsoEntity {

    private readonly displayName: string;
    private player: Player;
    private fsm: StateMachine<Boss, BossStateName>;

    private health = MAX_HEALTH;

    private stateTimer = 0;
    private lungeDirX = 0;
    private lungeDirY = 0;
    private hasHitThisLunge = false;

    private eye: Phaser.GameObjects.Ellipse;

    constructor(scene: Phaser.Scene, worldX: number, worldY: number, arenaExtent: number, player: Player, name: string) {
        super(scene, worldX, worldY, arenaExtent);
        this.player = player;
        this.displayName = name;

        const body = scene.add.polygon(0, 0, [
            0, -46,
            34, -18,
            30, 30,
            0, 46,
            -30, 30,
            -34, -18
        ], 0x2c1320).setStrokeStyle(3, 0x0c0508);

        const hornLeft = scene.add.triangle(0, 0, -22, -36, -34, -70, -8, -42, 0x120609);
        const hornRight = scene.add.triangle(0, 0, 22, -36, 34, -70, 8, -42, 0x120609);

        this.eye = scene.add.ellipse(0, -8, 20, 10, 0xff2d2d);

        this.add([body, hornLeft, hornRight, this.eye]);

        this.fsm = new StateMachine<Boss, BossStateName>(this, Boss.States, 'chase');
    }

    private static readonly States: Record<BossStateName, StateDefinition<Boss, BossStateName>> = {
        chase: {
            onEnter: boss => {
                boss.alpha = 1;
                boss.eye.setFillStyle(0xff2d2d);
            },
            onUpdate: (boss, deltaMs) => boss.updateChase(deltaMs)
        },
        telegraph: {
            onUpdate: (boss, deltaMs) => boss.updateTelegraph(deltaMs)
        },
        lunge: {
            onEnter: boss => {
                boss.hasHitThisLunge = false;
            },
            onUpdate: (boss, deltaMs) => boss.updateLunge(deltaMs)
        },
        recover: {
            onEnter: boss => {
                boss.alpha = 0.7;
                boss.eye.setFillStyle(0x662222);
                boss.stateTimer = RECOVER_DURATION;
            },
            onUpdate: (boss, deltaMs) => boss.updateRecover(deltaMs)
        },
        dead: {
            onEnter: boss => {
                boss.alpha = 0.35;
                boss.eye.setFillStyle(0x000000);
            }
        }
    };

    public get Name(): string {
        return this.displayName;
    }

    public get Health(): number {
        return this.health;
    }

    public get MaxHealth(): number {
        return MAX_HEALTH;
    }

    public get IsDead(): boolean {
        return this.fsm.Current === 'dead';
    }

    public update(deltaMs: number, originX: number, originY: number): void {
        if (!this.IsDead) {
            this.checkPlayerAttack();
        }

        this.fsm.update(deltaMs);
        this.syncScreenPosition(originX, originY);
    }

    private checkPlayerAttack(): void {
        if (!this.player.IsAttackActive) {
            return;
        }

        const dist = Math.hypot(this.player.WorldX - this.worldX, this.player.WorldY - this.worldY);
        if (dist <= this.player.AttackRange && this.player.ConsumeAttackHit()) {
            this.takeDamage(1);
        }
    }

    private takeDamage(amount: number): void {
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) {
            this.fsm.transition('dead');
        }
    }

    private updateChase(deltaMs: number): BossStateName | void {
        const dt = deltaMs / 1000;

        const dx = this.player.WorldX - this.worldX;
        const dy = this.player.WorldY - this.worldY;
        const dist = Math.hypot(dx, dy);
        if (dist <= 0.001) {
            return;
        }

        const dirX = dx / dist;
        const dirY = dy / dist;
        this.setScale(dirX < 0 ? -1 : 1, 1);

        if (dist > ATTACK_RANGE) {
            const moved = this.clampToArena(this.worldX + dirX * CHASE_SPEED * dt, this.worldY + dirY * CHASE_SPEED * dt);
            this.worldX = moved.x;
            this.worldY = moved.y;
        } else {
            this.stateTimer = TELEGRAPH_DURATION;
            return 'telegraph';
        }
    }

    private updateTelegraph(deltaMs: number): BossStateName | void {
        this.eye.setFillStyle(this.stateTimer % 200 < 100 ? 0xffffff : 0xff2d2d);

        this.stateTimer -= deltaMs;
        if (this.stateTimer > 0) {
            return;
        }

        const dx = this.player.WorldX - this.worldX;
        const dy = this.player.WorldY - this.worldY;
        const dist = Math.hypot(dx, dy) || 1;
        this.lungeDirX = dx / dist;
        this.lungeDirY = dy / dist;

        this.stateTimer = LUNGE_DURATION;
        return 'lunge';
    }

    private updateLunge(deltaMs: number): BossStateName | void {
        const dt = deltaMs / 1000;

        const moved = this.clampToArena(this.worldX + this.lungeDirX * LUNGE_SPEED * dt, this.worldY + this.lungeDirY * LUNGE_SPEED * dt);
        this.worldX = moved.x;
        this.worldY = moved.y;

        if (!this.hasHitThisLunge) {
            const hitDist = Math.hypot(this.player.WorldX - this.worldX, this.player.WorldY - this.worldY);
            if (hitDist <= HIT_RADIUS) {
                this.hasHitThisLunge = true;
                this.player.TakeDamage(this.worldX, this.worldY);
            }
        }

        this.stateTimer -= deltaMs;
        if (this.stateTimer <= 0) {
            return 'recover';
        }
    }

    private updateRecover(deltaMs: number): BossStateName | void {
        this.stateTimer -= deltaMs;
        if (this.stateTimer <= 0) {
            return 'chase';
        }
    }
}
