import { IsoMath } from '@phazer/engine';

/**
 * Shared base for the game's Container-based world entities (Player, Boss,
 * Mob): world-space position bookkeeping, arena clamping, and the
 * world-to-screen positioning/depth-sort dance every entity repeats each
 * frame. Kept here (not in @phazer/engine) since it's tied to Phaser's
 * GameObjects API, which the engine package deliberately doesn't depend on.
 */
export abstract class IsoEntity extends Phaser.GameObjects.Container {

    protected worldX: number;
    protected worldY: number;
    protected readonly arenaExtent: number;

    constructor(scene: Phaser.Scene, worldX: number, worldY: number, arenaExtent: number) {
        super(scene, 0, 0);
        this.worldX = worldX;
        this.worldY = worldY;
        this.arenaExtent = arenaExtent;
    }

    public get WorldX(): number {
        return this.worldX;
    }

    public get WorldY(): number {
        return this.worldY;
    }

    protected clampToArena(x: number, y: number): { x: number; y: number } {
        return {
            x: Phaser.Math.Clamp(x, -this.arenaExtent, this.arenaExtent),
            y: Phaser.Math.Clamp(y, -this.arenaExtent, this.arenaExtent)
        };
    }

    protected syncScreenPosition(originX: number, originY: number): void {
        const screen = IsoMath.toScreen(this.worldX, this.worldY);
        this.setPosition(originX + screen.x, originY + screen.y);
        this.setDepth(this.y);
    }
}
