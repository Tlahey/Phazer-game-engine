System.register("iso/IsoMath", [], function (exports_1, context_1) {
    "use strict";
    var IsoMath;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            /**
             * 2:1 isometric projection helpers. World coordinates are a plain cartesian
             * grid (used for game logic, arena bounds, tile lookups); screen coordinates
             * are what gets rendered. Both conversions are linear (no translation), so
             * they can be applied to deltas as well as absolute positions.
             */
            IsoMath = class IsoMath {
                static toScreen(worldX, worldY) {
                    const halfW = IsoMath.TILE_WIDTH / 2;
                    const halfH = IsoMath.TILE_HEIGHT / 2;
                    return {
                        x: (worldX - worldY) * halfW,
                        y: (worldX + worldY) * halfH
                    };
                }
                static toWorld(screenX, screenY) {
                    const halfW = IsoMath.TILE_WIDTH / 2;
                    const halfH = IsoMath.TILE_HEIGHT / 2;
                    return {
                        x: (screenX / halfW + screenY / halfH) / 2,
                        y: (screenY / halfH - screenX / halfW) / 2
                    };
                }
            };
            exports_1("IsoMath", IsoMath);
            IsoMath.TILE_WIDTH = 128;
            IsoMath.TILE_HEIGHT = 64;
        }
    };
});
System.register("input/PlayerInput", [], function (exports_2, context_2) {
    "use strict";
    var PlayerInput;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            /**
             * Maps WASD/arrows to on-screen cardinal directions (not world axes), so
             * "up" always visually moves the character toward the top of the screen
             * even though that corresponds to a diagonal move in the isometric world grid.
             */
            PlayerInput = class PlayerInput {
                constructor(keyboard) {
                    const KC = Phaser.Input.Keyboard.KeyCodes;
                    this.up = keyboard.addKey(KC.W);
                    this.down = keyboard.addKey(KC.S);
                    this.left = keyboard.addKey(KC.A);
                    this.right = keyboard.addKey(KC.D);
                    this.upArrow = keyboard.addKey(KC.UP);
                    this.downArrow = keyboard.addKey(KC.DOWN);
                    this.leftArrow = keyboard.addKey(KC.LEFT);
                    this.rightArrow = keyboard.addKey(KC.RIGHT);
                    this.dodgeKey = keyboard.addKey(KC.SPACE);
                    this.dodgeKeyAlt = keyboard.addKey(KC.SHIFT);
                }
                poll() {
                    let screenDirX = 0;
                    let screenDirY = 0;
                    if (this.up.isDown || this.upArrow.isDown)
                        screenDirY -= 1;
                    if (this.down.isDown || this.downArrow.isDown)
                        screenDirY += 1;
                    if (this.left.isDown || this.leftArrow.isDown)
                        screenDirX -= 1;
                    if (this.right.isDown || this.rightArrow.isDown)
                        screenDirX += 1;
                    const length = Math.hypot(screenDirX, screenDirY);
                    if (length > 0) {
                        screenDirX /= length;
                        screenDirY /= length;
                    }
                    const dodgePressed = Phaser.Input.Keyboard.JustDown(this.dodgeKey) ||
                        Phaser.Input.Keyboard.JustDown(this.dodgeKeyAlt);
                    return { screenDirX, screenDirY, dodgePressed };
                }
            };
            exports_2("PlayerInput", PlayerInput);
        }
    };
});
System.register("entities/Player", ["iso/IsoMath"], function (exports_3, context_3) {
    "use strict";
    var IsoMath_1, MOVE_SPEED, DODGE_SPEED, DODGE_DURATION, DODGE_COOLDOWN, ARENA_EXTENT, Player;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (IsoMath_1_1) {
                IsoMath_1 = IsoMath_1_1;
            }
        ],
        execute: function () {
            MOVE_SPEED = 220; // screen px/sec
            DODGE_SPEED = 620; // screen px/sec
            DODGE_DURATION = 220; // ms of movement + invincibility
            DODGE_COOLDOWN = 550; // ms before another dodge can start
            ARENA_EXTENT = 6.3; // world units, keeps the player on the ground grid
            Player = class Player extends Phaser.GameObjects.Container {
                constructor(scene, worldX, worldY) {
                    super(scene, 0, 0);
                    this.facingX = 0;
                    this.facingY = -1;
                    this.isDodging = false;
                    this.dodgeTimer = 0;
                    this.dodgeCooldown = 0;
                    this.dodgeDirX = 0;
                    this.dodgeDirY = 0;
                    this.worldX = worldX;
                    this.worldY = worldY;
                    const body = scene.add.ellipse(0, 0, 46, 28, 0x5c5c5c).setStrokeStyle(2, 0x1b1710);
                    this.nose = scene.add.triangle(0, 0, 0, -14, -7, 2, 7, 2, 0xb22222);
                    this.add([body, this.nose]);
                }
                get IsInvincible() {
                    return this.isDodging;
                }
                update(deltaMs, input, originX, originY) {
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
                    }
                    else if (hasMoveInput) {
                        screenDirX = input.screenDirX;
                        screenDirY = input.screenDirY;
                        this.facingX = screenDirX;
                        this.facingY = screenDirY;
                    }
                    if (screenDirX !== 0 || screenDirY !== 0) {
                        const worldDelta = IsoMath_1.IsoMath.toWorld(screenDirX * speed * dt, screenDirY * speed * dt);
                        this.worldX = Phaser.Math.Clamp(this.worldX + worldDelta.x, -ARENA_EXTENT, ARENA_EXTENT);
                        this.worldY = Phaser.Math.Clamp(this.worldY + worldDelta.y, -ARENA_EXTENT, ARENA_EXTENT);
                    }
                    const screen = IsoMath_1.IsoMath.toScreen(this.worldX, this.worldY);
                    this.setPosition(originX + screen.x, originY + screen.y);
                    this.setDepth(this.y);
                    this.alpha = this.isDodging ? 0.55 : 1;
                    this.nose.setAngle(Math.atan2(this.facingY, this.facingX) * (180 / Math.PI) + 90);
                }
            };
            exports_3("Player", Player);
        }
    };
});
System.register("scenes/GameScene", ["iso/IsoMath", "input/PlayerInput", "entities/Player"], function (exports_4, context_4) {
    "use strict";
    var IsoMath_2, PlayerInput_1, Player_1, GRID_RADIUS, GameScene;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (IsoMath_2_1) {
                IsoMath_2 = IsoMath_2_1;
            },
            function (PlayerInput_1_1) {
                PlayerInput_1 = PlayerInput_1_1;
            },
            function (Player_1_1) {
                Player_1 = Player_1_1;
            }
        ],
        execute: function () {
            GRID_RADIUS = 6; // yields a (2*GRID_RADIUS+1)^2 diamond-tiled arena
            GameScene = class GameScene extends Phaser.Scene {
                constructor() {
                    super('GameScene');
                }
                create() {
                    this.originX = this.scale.width / 2;
                    this.originY = this.scale.height / 3;
                    this.createGroundTextures();
                    this.buildGround();
                    this.player = new Player_1.Player(this, 0, 0);
                    this.add.existing(this.player);
                    this.playerInput = new PlayerInput_1.PlayerInput(this.input.keyboard);
                    this.cameras.main.setBackgroundColor(0x1b1710);
                    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
                }
                update(_time, delta) {
                    const state = this.playerInput.poll();
                    this.player.update(delta, state, this.originX, this.originY);
                }
                createGroundTextures() {
                    const halfW = IsoMath_2.IsoMath.TILE_WIDTH / 2;
                    const halfH = IsoMath_2.IsoMath.TILE_HEIGHT / 2;
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
                        graphics.lineTo(IsoMath_2.IsoMath.TILE_WIDTH, halfH);
                        graphics.lineTo(halfW, IsoMath_2.IsoMath.TILE_HEIGHT);
                        graphics.lineTo(0, halfH);
                        graphics.closePath();
                        graphics.fillPath();
                        graphics.strokePath();
                        graphics.generateTexture(tile.key, IsoMath_2.IsoMath.TILE_WIDTH, IsoMath_2.IsoMath.TILE_HEIGHT);
                    });
                    graphics.destroy();
                }
                buildGround() {
                    for (let gx = -GRID_RADIUS; gx <= GRID_RADIUS; gx++) {
                        for (let gy = -GRID_RADIUS; gy <= GRID_RADIUS; gy++) {
                            const screen = IsoMath_2.IsoMath.toScreen(gx, gy);
                            const key = (gx + gy) % 2 === 0 ? 'tile_a' : 'tile_b';
                            const tile = this.add.image(this.originX + screen.x, this.originY + screen.y, key);
                            tile.setDepth(screen.y);
                        }
                    }
                }
            };
            exports_4("GameScene", GameScene);
        }
    };
});
/// <reference path="./../node_modules/phaser/types/phaser.d.ts"/>
System.register("main", ["scenes/GameScene"], function (exports_5, context_5) {
    "use strict";
    var GameScene_1, config;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (GameScene_1_1) {
                GameScene_1 = GameScene_1_1;
            }
        ],
        execute: function () {/// <reference path="./../node_modules/phaser/types/phaser.d.ts"/>
            config = {
                type: Phaser.AUTO,
                parent: 'content',
                width: 960,
                height: 600,
                backgroundColor: '#1b1710',
                scene: [GameScene_1.GameScene]
            };
            window.onload = () => {
                window.game = new Phaser.Game(config);
            };
        }
    };
});
System.register("Utils/Dictionnary", [], function (exports_6, context_6) {
    "use strict";
    var Dictionary;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
            Dictionary = class Dictionary {
                constructor() {
                    this.items = {};
                    this.count = 0;
                }
                ContainsKey(key) {
                    return this.items.hasOwnProperty(key);
                }
                Count() {
                    return this.count;
                }
                Add(key, value) {
                    this.items[key] = value;
                    this.count++;
                }
                Remove(key) {
                    var val = this.items[key];
                    delete this.items[key];
                    this.count--;
                    return val;
                }
                Item(key) {
                    return this.items[key];
                }
                Keys() {
                    var keySet = [];
                    for (var prop in this.items) {
                        if (this.items.hasOwnProperty(prop)) {
                            keySet.push(prop);
                        }
                    }
                    return keySet;
                }
                Values() {
                    var values = [];
                    for (var prop in this.items) {
                        if (this.items.hasOwnProperty(prop)) {
                            values.push({
                                Key: prop,
                                Value: this.items[prop]
                            });
                        }
                    }
                    return values;
                }
                GetObjectByPropertyValue(property, value) {
                    var objects = this.Values();
                    for (var i = 0, ii = objects.length; i < ii; i++) {
                        var item = objects[i].Value;
                        if (item[property] == value) {
                            return item;
                        }
                    }
                    return undefined;
                }
            };
            exports_6("Dictionary", Dictionary);
        }
    };
});
System.register("Utils/Guid", [], function (exports_7, context_7) {
    "use strict";
    var Guid;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            Guid = class Guid {
                static newGuid() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                }
            };
            exports_7("Guid", Guid);
        }
    };
});
//# sourceMappingURL=app.js.map