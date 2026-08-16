import { IsoMath } from './../iso/IsoMath';
import { PlayerInput } from './../input/PlayerInput';
import { Player } from './../entities/Player';

const GRID_RADIUS = 6; // yields a (2*GRID_RADIUS+1)^2 diamond-tiled arena

export class GameScene extends Phaser.Scene {

    private player: Player;
    private playerInput: PlayerInput;
    private originX: number;
    private originY: number;

    constructor() {
        super('GameScene');
    }

    create(): void {
        this.originX = this.scale.width / 2;
        this.originY = this.scale.height / 3;

        this.createGroundTextures();
        this.buildGround();

        this.player = new Player(this, 0, 0);
        this.add.existing(this.player);

        this.playerInput = new PlayerInput(this.input.keyboard);

        this.cameras.main.setBackgroundColor(0x1b1710);
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    }

    update(_time: number, delta: number): void {
        const state = this.playerInput.poll();
        this.player.update(delta, state, this.originX, this.originY);
    }

    private createGroundTextures(): void {
        const halfW = IsoMath.TILE_WIDTH / 2;
        const halfH = IsoMath.TILE_HEIGHT / 2;
        const graphics = this.add.graphics();

        [
            { key: 'tile_a', fill: 0x3a3226 },
            { key: 'tile_b', fill: 0x453b2c }
        ].forEach(tile => {
            graphics.clear();
            graphics.fillStyle(tile.fill, 1);
            graphics.lineStyle(1, 0x1b1710, 1);
            graphics.beginPath();
            graphics.moveTo(halfW, 0);
            graphics.lineTo(IsoMath.TILE_WIDTH, halfH);
            graphics.lineTo(halfW, IsoMath.TILE_HEIGHT);
            graphics.lineTo(0, halfH);
            graphics.closePath();
            graphics.fillPath();
            graphics.strokePath();
            graphics.generateTexture(tile.key, IsoMath.TILE_WIDTH, IsoMath.TILE_HEIGHT);
        });

        graphics.destroy();
    }

    private buildGround(): void {
        for (let gx = -GRID_RADIUS; gx <= GRID_RADIUS; gx++) {
            for (let gy = -GRID_RADIUS; gy <= GRID_RADIUS; gy++) {
                const screen = IsoMath.toScreen(gx, gy);
                const key = (gx + gy) % 2 === 0 ? 'tile_a' : 'tile_b';
                const tile = this.add.image(this.originX + screen.x, this.originY + screen.y, key);
                tile.setDepth(screen.y);
            }
        }
    }
}
