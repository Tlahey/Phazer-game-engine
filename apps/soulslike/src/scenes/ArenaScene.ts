import { IsoMath } from '@phazer/engine';
import { PlayerInput } from './../input/PlayerInput';
import { Player } from './../entities/Player';
import { Boss } from './../entities/Boss';
import { Mob } from './../entities/Mob';
import { Portal } from './../entities/Portal';
import { contentDatabase, creatureScripts } from './../content/GameContent';

const PORTAL_TRIGGER_DISTANCE = 0.6; // world units
const RESULT_RETURN_DELAY = 2500;    // ms before auto-returning after a boss/player death
const BOSS_BAR_WIDTH = 240;

interface ArenaSceneData {
    instanceId?: string;
    entryX?: number;
    entryY?: number;
}

interface ActivePortal {
    entity: Portal;
    targetInstanceId: string;
    targetWorldX: number;
    targetWorldY: number;
}

/**
 * Generic per-instance arena: builds its ground/entities entirely from
 * ContentDatabase (instance size, creature spawns, portals) rather than
 * hardcoding a single boss/arena. Re-entered via `scene.start('Arena', {...})`
 * with a different instanceId for each world/dungeon the player travels to.
 */
export class ArenaScene extends Phaser.Scene {

    private instanceId: string;
    private entryX: number;
    private entryY: number;

    private player: Player;
    private creatures: (Boss | Mob)[] = [];
    private activeBoss?: Boss;
    private portals: ActivePortal[] = [];
    private hasTransitioned = false;

    private playerInput: PlayerInput;
    private originX: number;
    private originY: number;

    private healthPips: Phaser.GameObjects.Arc[] = [];
    private bossHealthBarFill?: Phaser.GameObjects.Rectangle;

    constructor() {
        super('Arena');
    }

    init(data: ArenaSceneData): void {
        this.instanceId = data?.instanceId ?? 'world_hub';
        this.entryX = data?.entryX ?? 0;
        this.entryY = data?.entryY ?? 0;
        this.hasTransitioned = false;
    }

    create(): void {
        const instance = contentDatabase.getInstance(this.instanceId);

        this.originX = this.scale.width / 2;
        this.originY = this.scale.height / 3;

        this.createGroundTextures();
        this.buildGround(instance.arenaExtent);

        this.player = new Player(this, this.entryX, this.entryY, instance.arenaExtent);
        this.add.existing(this.player);

        this.activeBoss = undefined;
        this.creatures = contentDatabase.getSpawns(this.instanceId).map(spawn => {
            const template = contentDatabase.getTemplate(spawn.entry);
            const creature = creatureScripts.create(template.scriptName, this, spawn, instance.arenaExtent, this.player, template);
            this.add.existing(creature);
            if (creature instanceof Boss) {
                this.activeBoss = creature;
            }
            return creature;
        });

        this.portals = contentDatabase.getPortals(this.instanceId).map(portal => {
            const entity = new Portal(this, portal.worldX, portal.worldY, instance.arenaExtent);
            this.add.existing(entity);
            return {
                entity,
                targetInstanceId: portal.targetInstanceId,
                targetWorldX: portal.targetWorldX,
                targetWorldY: portal.targetWorldY
            };
        });

        this.playerInput = new PlayerInput(this.input.keyboard);

        this.createHealthHud();
        this.createBossHud();

        this.cameras.main.setBackgroundColor(0x1b1710);
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    }

    update(_time: number, delta: number): void {
        const state = this.playerInput.poll();
        this.player.update(delta, state, this.originX, this.originY);
        this.creatures.forEach(creature => creature.update(delta, this.originX, this.originY));
        this.portals.forEach(portal => portal.entity.update(delta, this.originX, this.originY));
        this.updateHealthHud();
        this.updateBossHud();

        if (!this.hasTransitioned) {
            this.checkPortalTriggers();
            this.checkBossDefeated();
            this.checkPlayerDefeated();
        }
    }

    private checkBossDefeated(): void {
        if (!this.activeBoss?.IsDead) {
            return;
        }

        this.hasTransitioned = true;
        this.showResultMessage(`${this.activeBoss.Name} has fallen`, '#e8ddb5');

        const exitPortal = this.portals[0];
        if (!exitPortal) {
            return;
        }

        this.scheduleReturn(exitPortal.targetInstanceId, exitPortal.targetWorldX, exitPortal.targetWorldY);
    }

    private checkPlayerDefeated(): void {
        if (!this.player.IsDefeated) {
            return;
        }

        this.hasTransitioned = true;
        this.showResultMessage('You have fallen', '#c24b4b');
        this.scheduleReturn('world_hub', 0, 0);
    }

    private showResultMessage(text: string, color: string): void {
        this.add.text(this.originX, 140, text, {
            fontSize: '22px',
            color
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
    }

    private scheduleReturn(instanceId: string, entryX: number, entryY: number): void {
        this.time.delayedCall(RESULT_RETURN_DELAY, () => {
            this.scene.start('Arena', { instanceId, entryX, entryY });
        });
    }

    private checkPortalTriggers(): void {
        const triggered = this.portals.find(portal =>
            Math.hypot(this.player.WorldX - portal.entity.WorldX, this.player.WorldY - portal.entity.WorldY) <= PORTAL_TRIGGER_DISTANCE
        );

        if (triggered) {
            this.hasTransitioned = true;
            this.scene.start('Arena', {
                instanceId: triggered.targetInstanceId,
                entryX: triggered.targetWorldX,
                entryY: triggered.targetWorldY
            });
        }
    }

    private createHealthHud(): void {
        for (let i = 0; i < this.player.MaxHealth; i++) {
            const pip = this.add.circle(24 + i * 28, 24, 9, 0xb22222)
                .setStrokeStyle(2, 0x1b1710)
                .setScrollFactor(0)
                .setDepth(1000);
            this.healthPips.push(pip);
        }
    }

    private updateHealthHud(): void {
        this.healthPips.forEach((pip, i) => {
            pip.setFillStyle(i < this.player.Health ? 0xb22222 : 0x3a3226);
        });
    }

    private createBossHud(): void {
        if (!this.activeBoss) {
            return;
        }

        const barX = this.originX - BOSS_BAR_WIDTH / 2;

        this.add.text(this.originX, 30, this.activeBoss.Name, {
            fontSize: '16px',
            color: '#e8ddb5'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        this.add.rectangle(barX, 50, BOSS_BAR_WIDTH, 14, 0x1b1710)
            .setOrigin(0, 0.5).setStrokeStyle(2, 0x0c0d08).setScrollFactor(0).setDepth(1000);

        this.bossHealthBarFill = this.add.rectangle(barX, 50, BOSS_BAR_WIDTH, 14, 0x9c1f1f)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001);
    }

    private updateBossHud(): void {
        if (!this.activeBoss || !this.bossHealthBarFill) {
            return;
        }

        this.bossHealthBarFill.scaleX = Phaser.Math.Clamp(this.activeBoss.Health / this.activeBoss.MaxHealth, 0, 1);
    }

    private createGroundTextures(): void {
        if (this.textures.exists('tile_a')) {
            return;
        }

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

    private buildGround(arenaExtent: number): void {
        const gridRadius = Math.ceil(arenaExtent);
        for (let gx = -gridRadius; gx <= gridRadius; gx++) {
            for (let gy = -gridRadius; gy <= gridRadius; gy++) {
                const screen = IsoMath.toScreen(gx, gy);
                const key = (gx + gy) % 2 === 0 ? 'tile_a' : 'tile_b';
                const tile = this.add.image(this.originX + screen.x, this.originY + screen.y, key);
                tile.setDepth(screen.y);
            }
        }
    }
}
