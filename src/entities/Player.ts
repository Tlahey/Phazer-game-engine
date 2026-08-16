import { IsoMath } from './../iso/IsoMath';
import { PlayerInputState } from './../input/PlayerInput';

const MOVE_SPEED = 220;        // screen px/sec
const DODGE_SPEED = 620;       // screen px/sec
const DODGE_DURATION = 220;    // ms of movement + invincibility
const DODGE_COOLDOWN = 550;    // ms before another dodge can start
const ARENA_EXTENT = 6.3;      // world units, keeps the player on the ground grid

export class Player extends Phaser.GameObjects.Container {

    private worldX: number;
    private worldY: number;

    private facingX = 0;
    private facingY = -1;

    private isDodging = false;
    private dodgeTimer = 0;
    private dodgeCooldown = 0;
    private dodgeDirX = 0;
    private dodgeDirY = 0;

    private nose: Phaser.GameObjects.Triangle;

    constructor(scene: Phaser.Scene, worldX: number, worldY: number) {
        super(scene, 0, 0);
        this.worldX = worldX;
        this.worldY = worldY;

        const body = scene.add.ellipse(0, 0, 46, 28, 0x5c5c5c).setStrokeStyle(2, 0x1b1710);
        this.nose = scene.add.triangle(0, 0, 0, -14, -7, 2, 7, 2, 0xb22222);

        this.add([body, this.nose]);
    }

    public get IsInvincible(): boolean {
        return this.isDodging;
    }

    public update(deltaMs: number, input: PlayerInputState, originX: number, originY: number): void {
        const dt = deltaMs / 1000;

        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown = Math.max(0, this.dodgeCooldown - deltaMs);
        }

        const hasMoveInput = input.screenDirX !== 0 || input.screenDirY !== 0;

        if (input.dodgePressed && !this.isDodging && this.dodgeCooldown <= 0) {
            this.isDodging = true;
            this.dodgeTimer = DODGE_DURATION;
            this.dodgeDirX = hasMoveInput ? input.screenDirX : this.facingX;
            this.dodgeDirY = hasMoveInput ? input.screenDirY : this.facingY;
        }

        let screenDirX = 0;
        let screenDirY = 0;
        let speed = MOVE_SPEED;

        if (this.isDodging) {
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
            this.worldX = Phaser.Math.Clamp(this.worldX + worldDelta.x, -ARENA_EXTENT, ARENA_EXTENT);
            this.worldY = Phaser.Math.Clamp(this.worldY + worldDelta.y, -ARENA_EXTENT, ARENA_EXTENT);
        }

        const screen = IsoMath.toScreen(this.worldX, this.worldY);
        this.setPosition(originX + screen.x, originY + screen.y);
        this.setDepth(this.y);

        this.alpha = this.isDodging ? 0.55 : 1;
        this.nose.setAngle(Math.atan2(this.facingY, this.facingX) * (180 / Math.PI) + 90);
    }
}
