import { StateMachine, StateDefinition } from '@phazer/engine';
import { Player } from './Player';
import { IsoEntity } from './IsoEntity';

const MAX_HEALTH = 5;

const WINDUP_DURATION = 1200;  // ms, warning ring grows before the shockwave fires
const RELEASE_DURATION = 150;  // ms, the shockwave's brief active frame
const RECOVER_DURATION = 900;  // ms, dimmed and harmless
const SHOCKWAVE_RADIUS = 2.6;  // world units, damages the player if caught inside on release

type SentinelStateName = 'windup' | 'release' | 'recover' | 'dead';

/**
 * A stationary boss archetype, deliberately different from Boss's chase/
 * lunge: it never moves. It telegraphs a growing warning ring, then damages
 * the player if they're still within SHOCKWAVE_RADIUS when it releases.
 * Rewards positioning (get out of the ring before it fires) rather than
 * dodge-timing.
 */
export class SentinelBoss extends IsoEntity {

    private readonly displayName: string;
    private player: Player;
    private fsm: StateMachine<SentinelBoss, SentinelStateName>;

    private health = MAX_HEALTH;
    private stateTimer = 0;

    private core: Phaser.GameObjects.Ellipse;
    private warningRing: Phaser.GameObjects.Ellipse;

    constructor(scene: Phaser.Scene, worldX: number, worldY: number, arenaExtent: number, player: Player, name: string) {
        super(scene, worldX, worldY, arenaExtent);
        this.player = player;
        this.displayName = name;

        const body = scene.add.polygon(0, 0, [
            0, -50,
            26, -20,
            18, 34,
            -18, 34,
            -26, -20
        ], 0x152230).setStrokeStyle(3, 0x0a121a);

        this.warningRing = scene.add.ellipse(0, 10, 90, 45, 0x7fd6ff, 0.2).setScale(0.1);
        this.core = scene.add.ellipse(0, -14, 18, 18, 0x7fd6ff);

        this.add([body, this.warningRing, this.core]);

        this.fsm = new StateMachine<SentinelBoss, SentinelStateName>(this, SentinelBoss.States, 'windup');
    }

    private static readonly States: Record<SentinelStateName, StateDefinition<SentinelBoss, SentinelStateName>> = {
        windup: {
            onEnter: boss => {
                boss.stateTimer = WINDUP_DURATION;
                boss.alpha = 1;
                boss.warningRing.setScale(0.1).setAlpha(0.15);
            },
            onUpdate: (boss, deltaMs) => boss.updateWindup(deltaMs)
        },
        release: {
            onEnter: boss => {
                boss.stateTimer = RELEASE_DURATION;
                boss.core.setFillStyle(0xffffff);
                boss.warningRing.setScale(1).setAlpha(0.6);
                boss.dealDamageIfInRange();
            },
            onUpdate: (boss, deltaMs) => boss.updateRelease(deltaMs)
        },
        recover: {
            onEnter: boss => {
                boss.stateTimer = RECOVER_DURATION;
                boss.alpha = 0.7;
                boss.core.setFillStyle(0x35505c);
                boss.warningRing.setAlpha(0);
            },
            onUpdate: (boss, deltaMs) => boss.updateRecover(deltaMs)
        },
        dead: {
            onEnter: boss => {
                boss.alpha = 0.35;
                boss.core.setFillStyle(0x000000);
                boss.warningRing.setAlpha(0);
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

    private dealDamageIfInRange(): void {
        const dist = Math.hypot(this.player.WorldX - this.worldX, this.player.WorldY - this.worldY);
        if (dist <= SHOCKWAVE_RADIUS) {
            this.player.TakeDamage(this.worldX, this.worldY);
        }
    }

    private updateWindup(deltaMs: number): SentinelStateName | void {
        this.stateTimer -= deltaMs;

        const progress = 1 - Math.max(0, this.stateTimer) / WINDUP_DURATION;
        this.warningRing.setScale(0.1 + progress * 0.9).setAlpha(0.15 + progress * 0.45);
        this.core.setFillStyle(this.stateTimer % 200 < 100 ? 0xffffff : 0x7fd6ff);

        if (this.stateTimer <= 0) {
            return 'release';
        }
    }

    private updateRelease(deltaMs: number): SentinelStateName | void {
        this.stateTimer -= deltaMs;
        if (this.stateTimer <= 0) {
            return 'recover';
        }
    }

    private updateRecover(deltaMs: number): SentinelStateName | void {
        this.stateTimer -= deltaMs;
        if (this.stateTimer <= 0) {
            return 'windup';
        }
    }
}
