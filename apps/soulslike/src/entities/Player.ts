import { IsoMath } from '@phazer/engine';
import { PlayerInputState } from './../input/PlayerInput';
import { IsoEntity } from './IsoEntity';

const MOVE_SPEED = 220;        // screen px/sec
const DODGE_SPEED = 620;       // screen px/sec
const DODGE_DURATION = 220;    // ms of movement + invincibility
const DODGE_COOLDOWN = 550;    // ms before another dodge can start

const MAX_HEALTH = 3;
const HIT_INVINCIBILITY_DURATION = 700; // ms of i-frames + flicker after taking a hit
const KNOCKBACK_DISTANCE = 1.1;         // world units, pushed away from the attacker

const ATTACK_RANGE = 1.3;     // world units, melee reach
const ATTACK_DURATION = 180;  // ms, active hit window
const ATTACK_COOLDOWN = 320;  // ms before another attack can start

export class Player extends IsoEntity {

    private facingX = 0;
    private facingY = -1;

    private isDodging = false;
    private dodgeTimer = 0;
    private dodgeCooldown = 0;
    private dodgeDirX = 0;
    private dodgeDirY = 0;

    private health = MAX_HEALTH;
    private hitInvincibleTimer = 0;

    private isAttacking = false;
    private attackTimer = 0;
    private attackCooldown = 0;
    private hasDealtDamageThisAttack = false;

    private nose: Phaser.GameObjects.Triangle;
    private weapon: Phaser.GameObjects.Triangle;

    constructor(scene: Phaser.Scene, worldX: number, worldY: number, arenaExtent: number) {
        super(scene, worldX, worldY, arenaExtent);

        const body = scene.add.ellipse(0, 0, 46, 28, 0x5c5c5c).setStrokeStyle(2, 0x1b1710);
        this.nose = scene.add.triangle(0, 0, 0, -14, -7, 2, 7, 2, 0xb22222);
        this.weapon = scene.add.triangle(0, 0, 0, -20, -10, -46, 10, -46, 0xd8c98a).setVisible(false);

        this.add([body, this.nose, this.weapon]);
    }

    public get IsInvincible(): boolean {
        return this.isDodging || this.hitInvincibleTimer > 0;
    }

    public get IsAttackActive(): boolean {
        return this.isAttacking;
    }

    public get AttackRange(): number {
        return ATTACK_RANGE;
    }

    /** Returns true once per swing, the first time it's called while the attack is active. */
    public ConsumeAttackHit(): boolean {
        if (!this.isAttacking || this.hasDealtDamageThisAttack) {
            return false;
        }
        this.hasDealtDamageThisAttack = true;
        return true;
    }

    public get Health(): number {
        return this.health;
    }

    public get MaxHealth(): number {
        return MAX_HEALTH;
    }

    public get IsDefeated(): boolean {
        return this.health <= 0;
    }

    public TakeDamage(sourceWorldX: number, sourceWorldY: number): void {
        if (this.IsInvincible || this.IsDefeated) {
            return;
        }

        this.health -= 1;
        this.hitInvincibleTimer = HIT_INVINCIBILITY_DURATION;

        const dx = this.worldX - sourceWorldX;
        const dy = this.worldY - sourceWorldY;
        const dist = Math.hypot(dx, dy) || 1;
        const knockback = this.clampToArena(this.worldX + (dx / dist) * KNOCKBACK_DISTANCE, this.worldY + (dy / dist) * KNOCKBACK_DISTANCE);
        this.worldX = knockback.x;
        this.worldY = knockback.y;
    }

    public update(deltaMs: number, input: PlayerInputState, originX: number, originY: number): void {
        if (this.IsDefeated) {
            this.alpha = 0.25;
            this.syncScreenPosition(originX, originY);
            return;
        }

        const dt = deltaMs / 1000;

        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown = Math.max(0, this.dodgeCooldown - deltaMs);
        }

        if (this.hitInvincibleTimer > 0) {
            this.hitInvincibleTimer = Math.max(0, this.hitInvincibleTimer - deltaMs);
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown = Math.max(0, this.attackCooldown - deltaMs);
        }

        const hasMoveInput = input.screenDirX !== 0 || input.screenDirY !== 0;

        if (input.attackPressed && !this.isAttacking && !this.isDodging && this.attackCooldown <= 0) {
            this.isAttacking = true;
            this.attackTimer = ATTACK_DURATION;
            this.hasDealtDamageThisAttack = false;
        }

        if (input.dodgePressed && !this.isDodging && !this.isAttacking && this.dodgeCooldown <= 0) {
            this.isDodging = true;
            this.dodgeTimer = DODGE_DURATION;
            this.dodgeDirX = hasMoveInput ? input.screenDirX : this.facingX;
            this.dodgeDirY = hasMoveInput ? input.screenDirY : this.facingY;
        }

        let screenDirX = 0;
        let screenDirY = 0;
        let speed = MOVE_SPEED;

        if (this.isAttacking) {
            this.attackTimer -= deltaMs;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                this.attackCooldown = ATTACK_COOLDOWN;
            }
        } else if (this.isDodging) {
            screenDirX = this.dodgeDirX;
            screenDirY = this.dodgeDirY;
            speed = DODGE_SPEED;

            this.dodgeTimer -= deltaMs;
            if (this.dodgeTimer <= 0) {
                this.isDodging = false;
                this.dodgeCooldown = DODGE_COOLDOWN;
            }
        } else if (hasMoveInput) {
            screenDirX = input.screenDirX;
            screenDirY = input.screenDirY;
            this.facingX = screenDirX;
            this.facingY = screenDirY;
        }

        if (screenDirX !== 0 || screenDirY !== 0) {
            const worldDelta = IsoMath.toWorld(screenDirX * speed * dt, screenDirY * speed * dt);
            const moved = this.clampToArena(this.worldX + worldDelta.x, this.worldY + worldDelta.y);
            this.worldX = moved.x;
            this.worldY = moved.y;
        }

        this.syncScreenPosition(originX, originY);

        this.weapon.setVisible(this.isAttacking);
        this.weapon.setAngle(Math.atan2(this.facingY, this.facingX) * (180 / Math.PI) + 90);

        if (this.isDodging) {
            this.alpha = 0.55;
        } else if (this.hitInvincibleTimer > 0) {
            this.alpha = Math.floor(this.hitInvincibleTimer / 90) % 2 === 0 ? 0.3 : 1;
        } else {
            this.alpha = 1;
        }
        this.nose.setAngle(Math.atan2(this.facingY, this.facingX) * (180 / Math.PI) + 90);
    }
}
