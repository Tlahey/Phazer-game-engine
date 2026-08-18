import { IsoEntity } from './IsoEntity';

const PULSE_PERIOD = 900; // ms

/**
 * Visual marker for a PortalDefinition. Purely presentational — ArenaScene
 * owns the proximity check and the actual scene transition, since only the
 * scene can call `this.scene.start(...)`.
 */
export class Portal extends IsoEntity {

    private ring: Phaser.GameObjects.Ellipse;
    private pulseTimer = 0;

    constructor(scene: Phaser.Scene, worldX: number, worldY: number, arenaExtent: number) {
        super(scene, worldX, worldY, arenaExtent);

        this.ring = scene.add.ellipse(0, 0, 54, 30, 0x2d8f8f, 0.35).setStrokeStyle(3, 0x7fe6e6);
        this.add([this.ring]);
    }

    public update(deltaMs: number, originX: number, originY: number): void {
        this.pulseTimer = (this.pulseTimer + deltaMs) % PULSE_PERIOD;
        const t = this.pulseTimer / PULSE_PERIOD;
        this.ring.setScale(1 + Math.sin(t * Math.PI * 2) * 0.08);

        this.syncScreenPosition(originX, originY);
    }
}
