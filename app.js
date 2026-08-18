var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
System.register("packages/engine/src/iso/IsoMath", [], function (exports_1, context_1) {
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
System.register("packages/engine/src/logic/StateMachine", [], function (exports_2, context_2) {
    "use strict";
    var StateMachine;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            StateMachine = class StateMachine {
                constructor(context, states, initialState) {
                    var _a, _b;
                    this.context = context;
                    this.states = states;
                    this.current = initialState;
                    (_b = (_a = this.states[this.current]).onEnter) === null || _b === void 0 ? void 0 : _b.call(_a, this.context);
                }
                get Current() {
                    return this.current;
                }
                update(deltaMs) {
                    var _a, _b;
                    const next = (_b = (_a = this.states[this.current]).onUpdate) === null || _b === void 0 ? void 0 : _b.call(_a, this.context, deltaMs);
                    if (next !== undefined && next !== this.current) {
                        this.transition(next);
                    }
                }
                transition(next) {
                    var _a, _b, _c, _d;
                    (_b = (_a = this.states[this.current]).onExit) === null || _b === void 0 ? void 0 : _b.call(_a, this.context);
                    this.current = next;
                    (_d = (_c = this.states[this.current]).onEnter) === null || _d === void 0 ? void 0 : _d.call(_c, this.context);
                }
            };
            exports_2("StateMachine", StateMachine);
        }
    };
});
System.register("packages/engine/src/Utils/Dictionnary", [], function (exports_3, context_3) {
    "use strict";
    var Dictionary;
    var __moduleName = context_3 && context_3.id;
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
            exports_3("Dictionary", Dictionary);
        }
    };
});
System.register("packages/engine/src/Utils/Guid", [], function (exports_4, context_4) {
    "use strict";
    var Guid;
    var __moduleName = context_4 && context_4.id;
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
            exports_4("Guid", Guid);
        }
    };
});
/**
 * Plain data shapes for a TrinityCore-style content split: static templates
 * (identity/behavior, matched by entry) are placed into the world via spawn
 * rows that reference a template + the instance they live in.
 */
System.register("packages/engine/src/content/ContentTypes", [], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {/**
             * Plain data shapes for a TrinityCore-style content split: static templates
             * (identity/behavior, matched by entry) are placed into the world via spawn
             * rows that reference a template + the instance they live in.
             */
        }
    };
});
System.register("packages/engine/src/content/ContentDatabase", [], function (exports_6, context_6) {
    "use strict";
    var ContentDatabase;
    var __moduleName = context_6 && context_6.id;
    function fetchJson(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(path);
            return response.json();
        });
    }
    function groupBy(items, key) {
        const grouped = new Map();
        items.forEach(item => {
            const k = key(item);
            const list = grouped.get(k);
            if (list) {
                list.push(item);
            }
            else {
                grouped.set(k, [item]);
            }
        });
        return grouped;
    }
    return {
        setters: [],
        execute: function () {
            /**
             * Loads and indexes the game's static content: creature templates (identity/AI),
             * spawns (template placements per instance), instances (maps), and portals
             * (inter-instance travel points). Fetched once at boot from plain JSON files.
             */
            ContentDatabase = class ContentDatabase {
                constructor() {
                    this.templates = new Map();
                    this.instances = new Map();
                    this.spawnsByInstance = new Map();
                    this.portalsByInstance = new Map();
                }
                load(sources) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const [templates, spawns, instances, portals] = yield Promise.all([
                            fetchJson(sources.templates),
                            fetchJson(sources.spawns),
                            fetchJson(sources.instances),
                            fetchJson(sources.portals)
                        ]);
                        templates.forEach(template => this.templates.set(template.entry, template));
                        instances.forEach(instance => this.instances.set(instance.id, instance));
                        this.spawnsByInstance = groupBy(spawns, spawn => spawn.instanceId);
                        this.portalsByInstance = groupBy(portals, portal => portal.instanceId);
                    });
                }
                getTemplate(entry) {
                    const template = this.templates.get(entry);
                    if (!template) {
                        throw new Error(`No creature template registered for entry ${entry}`);
                    }
                    return template;
                }
                getInstance(id) {
                    const instance = this.instances.get(id);
                    if (!instance) {
                        throw new Error(`No instance definition registered for id "${id}"`);
                    }
                    return instance;
                }
                getSpawns(instanceId) {
                    var _a;
                    return (_a = this.spawnsByInstance.get(instanceId)) !== null && _a !== void 0 ? _a : [];
                }
                getPortals(instanceId) {
                    var _a;
                    return (_a = this.portalsByInstance.get(instanceId)) !== null && _a !== void 0 ? _a : [];
                }
            };
            exports_6("ContentDatabase", ContentDatabase);
        }
    };
});
System.register("packages/engine/src/content/ScriptRegistry", [], function (exports_7, context_7) {
    "use strict";
    var ScriptRegistry;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            /**
             * Generic name -> factory registry, generalizing the "match a template's
             * scriptName against a registered class" pattern (TrinityCore's C++ script
             * registry; the legacy prototype's `ScriptedCreature` list) into a reusable
             * primitive. Not tied to creatures — any factory signature works.
             */
            ScriptRegistry = class ScriptRegistry {
                constructor() {
                    this.factories = new Map();
                }
                register(scriptName, factory) {
                    this.factories.set(scriptName, factory);
                }
                create(scriptName, ...args) {
                    const factory = this.factories.get(scriptName);
                    if (!factory) {
                        throw new Error(`No script registered for "${scriptName}"`);
                    }
                    return factory(...args);
                }
            };
            exports_7("ScriptRegistry", ScriptRegistry);
        }
    };
});
System.register("packages/engine/src/index", ["packages/engine/src/iso/IsoMath", "packages/engine/src/logic/StateMachine", "packages/engine/src/Utils/Dictionnary", "packages/engine/src/Utils/Guid", "packages/engine/src/content/ContentTypes", "packages/engine/src/content/ContentDatabase", "packages/engine/src/content/ScriptRegistry"], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_8(exports);
    }
    return {
        setters: [
            function (IsoMath_1_1) {
                exportStar_1(IsoMath_1_1);
            },
            function (StateMachine_1_1) {
                exportStar_1(StateMachine_1_1);
            },
            function (Dictionnary_1_1) {
                exportStar_1(Dictionnary_1_1);
            },
            function (Guid_1_1) {
                exportStar_1(Guid_1_1);
            },
            function (ContentTypes_1_1) {
                exportStar_1(ContentTypes_1_1);
            },
            function (ContentDatabase_1_1) {
                exportStar_1(ContentDatabase_1_1);
            },
            function (ScriptRegistry_1_1) {
                exportStar_1(ScriptRegistry_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("apps/soulslike/src/input/PlayerInput", [], function (exports_9, context_9) {
    "use strict";
    var PlayerInput;
    var __moduleName = context_9 && context_9.id;
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
                    this.attackKey = keyboard.addKey(KC.J);
                    this.attackKeyAlt = keyboard.addKey(KC.ENTER);
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
                    const attackPressed = Phaser.Input.Keyboard.JustDown(this.attackKey) ||
                        Phaser.Input.Keyboard.JustDown(this.attackKeyAlt);
                    return { screenDirX, screenDirY, dodgePressed, attackPressed };
                }
            };
            exports_9("PlayerInput", PlayerInput);
        }
    };
});
System.register("apps/soulslike/src/entities/IsoEntity", ["packages/engine/src/index"], function (exports_10, context_10) {
    "use strict";
    var engine_1, IsoEntity;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (engine_1_1) {
                engine_1 = engine_1_1;
            }
        ],
        execute: function () {
            /**
             * Shared base for the game's Container-based world entities (Player, Boss,
             * Mob): world-space position bookkeeping, arena clamping, and the
             * world-to-screen positioning/depth-sort dance every entity repeats each
             * frame. Kept here (not in @phazer/engine) since it's tied to Phaser's
             * GameObjects API, which the engine package deliberately doesn't depend on.
             */
            IsoEntity = class IsoEntity extends Phaser.GameObjects.Container {
                constructor(scene, worldX, worldY, arenaExtent) {
                    super(scene, 0, 0);
                    this.worldX = worldX;
                    this.worldY = worldY;
                    this.arenaExtent = arenaExtent;
                }
                get WorldX() {
                    return this.worldX;
                }
                get WorldY() {
                    return this.worldY;
                }
                clampToArena(x, y) {
                    return {
                        x: Phaser.Math.Clamp(x, -this.arenaExtent, this.arenaExtent),
                        y: Phaser.Math.Clamp(y, -this.arenaExtent, this.arenaExtent)
                    };
                }
                syncScreenPosition(originX, originY) {
                    const screen = engine_1.IsoMath.toScreen(this.worldX, this.worldY);
                    this.setPosition(originX + screen.x, originY + screen.y);
                    this.setDepth(this.y);
                }
            };
            exports_10("IsoEntity", IsoEntity);
        }
    };
});
System.register("apps/soulslike/src/entities/Player", ["packages/engine/src/index", "apps/soulslike/src/entities/IsoEntity"], function (exports_11, context_11) {
    "use strict";
    var engine_2, IsoEntity_1, MOVE_SPEED, DODGE_SPEED, DODGE_DURATION, DODGE_COOLDOWN, MAX_HEALTH, HIT_INVINCIBILITY_DURATION, KNOCKBACK_DISTANCE, ATTACK_RANGE, ATTACK_DURATION, ATTACK_COOLDOWN, Player;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (engine_2_1) {
                engine_2 = engine_2_1;
            },
            function (IsoEntity_1_1) {
                IsoEntity_1 = IsoEntity_1_1;
            }
        ],
        execute: function () {
            MOVE_SPEED = 220; // screen px/sec
            DODGE_SPEED = 620; // screen px/sec
            DODGE_DURATION = 220; // ms of movement + invincibility
            DODGE_COOLDOWN = 550; // ms before another dodge can start
            MAX_HEALTH = 3;
            HIT_INVINCIBILITY_DURATION = 700; // ms of i-frames + flicker after taking a hit
            KNOCKBACK_DISTANCE = 1.1; // world units, pushed away from the attacker
            ATTACK_RANGE = 1.3; // world units, melee reach
            ATTACK_DURATION = 180; // ms, active hit window
            ATTACK_COOLDOWN = 320; // ms before another attack can start
            Player = class Player extends IsoEntity_1.IsoEntity {
                constructor(scene, worldX, worldY, arenaExtent) {
                    super(scene, worldX, worldY, arenaExtent);
                    this.facingX = 0;
                    this.facingY = -1;
                    this.isDodging = false;
                    this.dodgeTimer = 0;
                    this.dodgeCooldown = 0;
                    this.dodgeDirX = 0;
                    this.dodgeDirY = 0;
                    this.health = MAX_HEALTH;
                    this.hitInvincibleTimer = 0;
                    this.isAttacking = false;
                    this.attackTimer = 0;
                    this.attackCooldown = 0;
                    this.hasDealtDamageThisAttack = false;
                    const body = scene.add.ellipse(0, 0, 46, 28, 0x5c5c5c).setStrokeStyle(2, 0x1b1710);
                    this.nose = scene.add.triangle(0, 0, 0, -14, -7, 2, 7, 2, 0xb22222);
                    this.weapon = scene.add.triangle(0, 0, 0, -20, -10, -46, 10, -46, 0xd8c98a).setVisible(false);
                    this.add([body, this.nose, this.weapon]);
                }
                get IsInvincible() {
                    return this.isDodging || this.hitInvincibleTimer > 0;
                }
                get IsAttackActive() {
                    return this.isAttacking;
                }
                get AttackRange() {
                    return ATTACK_RANGE;
                }
                /** Returns true once per swing, the first time it's called while the attack is active. */
                ConsumeAttackHit() {
                    if (!this.isAttacking || this.hasDealtDamageThisAttack) {
                        return false;
                    }
                    this.hasDealtDamageThisAttack = true;
                    return true;
                }
                get Health() {
                    return this.health;
                }
                get MaxHealth() {
                    return MAX_HEALTH;
                }
                get IsDefeated() {
                    return this.health <= 0;
                }
                TakeDamage(sourceWorldX, sourceWorldY) {
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
                update(deltaMs, input, originX, originY) {
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
                    }
                    else if (this.isDodging) {
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
                        const worldDelta = engine_2.IsoMath.toWorld(screenDirX * speed * dt, screenDirY * speed * dt);
                        const moved = this.clampToArena(this.worldX + worldDelta.x, this.worldY + worldDelta.y);
                        this.worldX = moved.x;
                        this.worldY = moved.y;
                    }
                    this.syncScreenPosition(originX, originY);
                    this.weapon.setVisible(this.isAttacking);
                    this.weapon.setAngle(Math.atan2(this.facingY, this.facingX) * (180 / Math.PI) + 90);
                    if (this.isDodging) {
                        this.alpha = 0.55;
                    }
                    else if (this.hitInvincibleTimer > 0) {
                        this.alpha = Math.floor(this.hitInvincibleTimer / 90) % 2 === 0 ? 0.3 : 1;
                    }
                    else {
                        this.alpha = 1;
                    }
                    this.nose.setAngle(Math.atan2(this.facingY, this.facingX) * (180 / Math.PI) + 90);
                }
            };
            exports_11("Player", Player);
        }
    };
});
System.register("apps/soulslike/src/entities/Boss", ["packages/engine/src/index", "apps/soulslike/src/entities/IsoEntity"], function (exports_12, context_12) {
    "use strict";
    var engine_3, IsoEntity_2, ATTACK_RANGE, CHASE_SPEED, LUNGE_SPEED, TELEGRAPH_DURATION, LUNGE_DURATION, RECOVER_DURATION, HIT_RADIUS, MAX_HEALTH, Boss;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (engine_3_1) {
                engine_3 = engine_3_1;
            },
            function (IsoEntity_2_1) {
                IsoEntity_2 = IsoEntity_2_1;
            }
        ],
        execute: function () {
            ATTACK_RANGE = 2.2; // world units, distance at which the boss commits to an attack
            CHASE_SPEED = 1.6; // world units/sec
            LUNGE_SPEED = 9.5; // world units/sec
            TELEGRAPH_DURATION = 500; // ms, red/white flicker before the lunge fires
            LUNGE_DURATION = 260; // ms
            RECOVER_DURATION = 650; // ms, boss is dimmed and stationary
            HIT_RADIUS = 1.1; // world units, lunge hitbox vs. player
            MAX_HEALTH = 5;
            Boss = class Boss extends IsoEntity_2.IsoEntity {
                constructor(scene, worldX, worldY, arenaExtent, player, name) {
                    super(scene, worldX, worldY, arenaExtent);
                    this.health = MAX_HEALTH;
                    this.stateTimer = 0;
                    this.lungeDirX = 0;
                    this.lungeDirY = 0;
                    this.hasHitThisLunge = false;
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
                    this.fsm = new engine_3.StateMachine(this, Boss.States, 'chase');
                }
                get Name() {
                    return this.displayName;
                }
                get Health() {
                    return this.health;
                }
                get MaxHealth() {
                    return MAX_HEALTH;
                }
                get IsDead() {
                    return this.fsm.Current === 'dead';
                }
                update(deltaMs, originX, originY) {
                    if (!this.IsDead) {
                        this.checkPlayerAttack();
                    }
                    this.fsm.update(deltaMs);
                    this.syncScreenPosition(originX, originY);
                }
                checkPlayerAttack() {
                    if (!this.player.IsAttackActive) {
                        return;
                    }
                    const dist = Math.hypot(this.player.WorldX - this.worldX, this.player.WorldY - this.worldY);
                    if (dist <= this.player.AttackRange && this.player.ConsumeAttackHit()) {
                        this.takeDamage(1);
                    }
                }
                takeDamage(amount) {
                    this.health = Math.max(0, this.health - amount);
                    if (this.health <= 0) {
                        this.fsm.transition('dead');
                    }
                }
                updateChase(deltaMs) {
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
                    }
                    else {
                        this.stateTimer = TELEGRAPH_DURATION;
                        return 'telegraph';
                    }
                }
                updateTelegraph(deltaMs) {
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
                updateLunge(deltaMs) {
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
                updateRecover(deltaMs) {
                    this.stateTimer -= deltaMs;
                    if (this.stateTimer <= 0) {
                        return 'chase';
                    }
                }
            };
            exports_12("Boss", Boss);
            Boss.States = {
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
        }
    };
});
System.register("apps/soulslike/src/entities/Mob", ["packages/engine/src/index", "apps/soulslike/src/entities/IsoEntity"], function (exports_13, context_13) {
    "use strict";
    var engine_4, IsoEntity_3, PATROL_SPEED, CHASE_SPEED, PATROL_DISTANCE, ARRIVE_THRESHOLD, AGGRO_RANGE, DEAGGRO_RANGE, ATTACK_RANGE, ATTACK_COOLDOWN, Mob;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (engine_4_1) {
                engine_4 = engine_4_1;
            },
            function (IsoEntity_3_1) {
                IsoEntity_3 = IsoEntity_3_1;
            }
        ],
        execute: function () {
            PATROL_SPEED = 0.7; // world units/sec
            CHASE_SPEED = 1.1; // world units/sec, slower than the boss's chase
            PATROL_DISTANCE = 1.4; // world units from spawn point
            ARRIVE_THRESHOLD = 0.05; // world units
            AGGRO_RANGE = 2.5; // world units, starts the chase
            DEAGGRO_RANGE = 3.6; // world units, larger than AGGRO_RANGE to avoid state flicker at the boundary
            ATTACK_RANGE = 0.7; // world units, contact range
            ATTACK_COOLDOWN = 900; // ms between contact hits
            /**
             * Weak, simple hostile: paces between its spawn point and a short offset
             * until the player wanders within AGGRO_RANGE, then closes in and deals
             * contact damage on a cooldown — no telegraph/lunge theater like the Boss,
             * just a fast weak nuisance you're expected to shrug off or dodge.
             */
            Mob = class Mob extends IsoEntity_3.IsoEntity {
                constructor(scene, worldX, worldY, arenaExtent, player) {
                    super(scene, worldX, worldY, arenaExtent);
                    this.attackCooldown = 0;
                    this.player = player;
                    this.spawnX = worldX;
                    this.spawnY = worldY;
                    this.offsetX = worldX + PATROL_DISTANCE;
                    this.offsetY = worldY;
                    const body = scene.add.circle(0, 0, 16, 0x1f2417).setStrokeStyle(2, 0x0c0d08);
                    const spike = scene.add.triangle(0, 0, 0, -20, -6, -6, 6, -6, 0x0c0d08);
                    this.add([body, spike]);
                    this.fsm = new engine_4.StateMachine(this, Mob.States, 'toOffset');
                }
                update(deltaMs, originX, originY) {
                    if (this.attackCooldown > 0) {
                        this.attackCooldown = Math.max(0, this.attackCooldown - deltaMs);
                    }
                    this.fsm.update(deltaMs);
                    this.syncScreenPosition(originX, originY);
                }
                distanceToPlayer() {
                    return Math.hypot(this.player.WorldX - this.worldX, this.player.WorldY - this.worldY);
                }
                checkAggro() {
                    if (this.distanceToPlayer() <= AGGRO_RANGE) {
                        return 'chase';
                    }
                }
                updateChase(deltaMs) {
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
                    }
                    else if (this.attackCooldown <= 0) {
                        this.attackCooldown = ATTACK_COOLDOWN;
                        this.player.TakeDamage(this.worldX, this.worldY);
                    }
                }
                moveToward(targetX, targetY, deltaMs, nextState) {
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
            };
            exports_13("Mob", Mob);
            Mob.States = {
                toOffset: {
                    onUpdate: (mob, deltaMs) => { var _a; return (_a = mob.checkAggro()) !== null && _a !== void 0 ? _a : mob.moveToward(mob.offsetX, mob.offsetY, deltaMs, 'toSpawn'); }
                },
                toSpawn: {
                    onUpdate: (mob, deltaMs) => { var _a; return (_a = mob.checkAggro()) !== null && _a !== void 0 ? _a : mob.moveToward(mob.spawnX, mob.spawnY, deltaMs, 'toOffset'); }
                },
                chase: {
                    onUpdate: (mob, deltaMs) => mob.updateChase(deltaMs)
                }
            };
        }
    };
});
System.register("apps/soulslike/src/entities/Portal", ["apps/soulslike/src/entities/IsoEntity"], function (exports_14, context_14) {
    "use strict";
    var IsoEntity_4, PULSE_PERIOD, Portal;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (IsoEntity_4_1) {
                IsoEntity_4 = IsoEntity_4_1;
            }
        ],
        execute: function () {
            PULSE_PERIOD = 900; // ms
            /**
             * Visual marker for a PortalDefinition. Purely presentational — ArenaScene
             * owns the proximity check and the actual scene transition, since only the
             * scene can call `this.scene.start(...)`.
             */
            Portal = class Portal extends IsoEntity_4.IsoEntity {
                constructor(scene, worldX, worldY, arenaExtent) {
                    super(scene, worldX, worldY, arenaExtent);
                    this.pulseTimer = 0;
                    this.ring = scene.add.ellipse(0, 0, 54, 30, 0x2d8f8f, 0.35).setStrokeStyle(3, 0x7fe6e6);
                    this.add([this.ring]);
                }
                update(deltaMs, originX, originY) {
                    this.pulseTimer = (this.pulseTimer + deltaMs) % PULSE_PERIOD;
                    const t = this.pulseTimer / PULSE_PERIOD;
                    this.ring.setScale(1 + Math.sin(t * Math.PI * 2) * 0.08);
                    this.syncScreenPosition(originX, originY);
                }
            };
            exports_14("Portal", Portal);
        }
    };
});
System.register("apps/soulslike/src/content/GameContent", ["packages/engine/src/index"], function (exports_15, context_15) {
    "use strict";
    var engine_5, contentDatabase, creatureScripts;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (engine_5_1) {
                engine_5 = engine_5_1;
            }
        ],
        execute: function () {
            /** Shared, app-wide instances: one content database, one creature script registry. */
            exports_15("contentDatabase", contentDatabase = new engine_5.ContentDatabase());
            exports_15("creatureScripts", creatureScripts = new engine_5.ScriptRegistry());
        }
    };
});
System.register("apps/soulslike/src/scenes/ArenaScene", ["packages/engine/src/index", "apps/soulslike/src/input/PlayerInput", "apps/soulslike/src/entities/Player", "apps/soulslike/src/entities/Boss", "apps/soulslike/src/entities/Portal", "apps/soulslike/src/content/GameContent"], function (exports_16, context_16) {
    "use strict";
    var engine_6, PlayerInput_1, Player_1, Boss_1, Portal_1, GameContent_1, PORTAL_TRIGGER_DISTANCE, RESULT_RETURN_DELAY, BOSS_BAR_WIDTH, ArenaScene;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [
            function (engine_6_1) {
                engine_6 = engine_6_1;
            },
            function (PlayerInput_1_1) {
                PlayerInput_1 = PlayerInput_1_1;
            },
            function (Player_1_1) {
                Player_1 = Player_1_1;
            },
            function (Boss_1_1) {
                Boss_1 = Boss_1_1;
            },
            function (Portal_1_1) {
                Portal_1 = Portal_1_1;
            },
            function (GameContent_1_1) {
                GameContent_1 = GameContent_1_1;
            }
        ],
        execute: function () {
            PORTAL_TRIGGER_DISTANCE = 0.6; // world units
            RESULT_RETURN_DELAY = 2500; // ms before auto-returning after a boss/player death
            BOSS_BAR_WIDTH = 240;
            /**
             * Generic per-instance arena: builds its ground/entities entirely from
             * ContentDatabase (instance size, creature spawns, portals) rather than
             * hardcoding a single boss/arena. Re-entered via `scene.start('Arena', {...})`
             * with a different instanceId for each world/dungeon the player travels to.
             */
            ArenaScene = class ArenaScene extends Phaser.Scene {
                constructor() {
                    super('Arena');
                    this.creatures = [];
                    this.portals = [];
                    this.hasTransitioned = false;
                    this.healthPips = [];
                }
                init(data) {
                    var _a, _b, _c;
                    this.instanceId = (_a = data === null || data === void 0 ? void 0 : data.instanceId) !== null && _a !== void 0 ? _a : 'world_hub';
                    this.entryX = (_b = data === null || data === void 0 ? void 0 : data.entryX) !== null && _b !== void 0 ? _b : 0;
                    this.entryY = (_c = data === null || data === void 0 ? void 0 : data.entryY) !== null && _c !== void 0 ? _c : 0;
                    this.hasTransitioned = false;
                }
                create() {
                    const instance = GameContent_1.contentDatabase.getInstance(this.instanceId);
                    this.originX = this.scale.width / 2;
                    this.originY = this.scale.height / 3;
                    this.createGroundTextures();
                    this.buildGround(instance.arenaExtent);
                    this.player = new Player_1.Player(this, this.entryX, this.entryY, instance.arenaExtent);
                    this.add.existing(this.player);
                    this.activeBoss = undefined;
                    this.creatures = GameContent_1.contentDatabase.getSpawns(this.instanceId).map(spawn => {
                        const template = GameContent_1.contentDatabase.getTemplate(spawn.entry);
                        const creature = GameContent_1.creatureScripts.create(template.scriptName, this, spawn, instance.arenaExtent, this.player, template);
                        this.add.existing(creature);
                        if (creature instanceof Boss_1.Boss) {
                            this.activeBoss = creature;
                        }
                        return creature;
                    });
                    this.portals = GameContent_1.contentDatabase.getPortals(this.instanceId).map(portal => {
                        const entity = new Portal_1.Portal(this, portal.worldX, portal.worldY, instance.arenaExtent);
                        this.add.existing(entity);
                        return {
                            entity,
                            targetInstanceId: portal.targetInstanceId,
                            targetWorldX: portal.targetWorldX,
                            targetWorldY: portal.targetWorldY
                        };
                    });
                    this.playerInput = new PlayerInput_1.PlayerInput(this.input.keyboard);
                    this.createHealthHud();
                    this.createBossHud();
                    this.cameras.main.setBackgroundColor(0x1b1710);
                    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
                }
                update(_time, delta) {
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
                checkBossDefeated() {
                    var _a;
                    if (!((_a = this.activeBoss) === null || _a === void 0 ? void 0 : _a.IsDead)) {
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
                checkPlayerDefeated() {
                    if (!this.player.IsDefeated) {
                        return;
                    }
                    this.hasTransitioned = true;
                    this.showResultMessage('You have fallen', '#c24b4b');
                    this.scheduleReturn('world_hub', 0, 0);
                }
                showResultMessage(text, color) {
                    this.add.text(this.originX, 140, text, {
                        fontSize: '22px',
                        color
                    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
                }
                scheduleReturn(instanceId, entryX, entryY) {
                    this.time.delayedCall(RESULT_RETURN_DELAY, () => {
                        this.scene.start('Arena', { instanceId, entryX, entryY });
                    });
                }
                checkPortalTriggers() {
                    const triggered = this.portals.find(portal => Math.hypot(this.player.WorldX - portal.entity.WorldX, this.player.WorldY - portal.entity.WorldY) <= PORTAL_TRIGGER_DISTANCE);
                    if (triggered) {
                        this.hasTransitioned = true;
                        this.scene.start('Arena', {
                            instanceId: triggered.targetInstanceId,
                            entryX: triggered.targetWorldX,
                            entryY: triggered.targetWorldY
                        });
                    }
                }
                createHealthHud() {
                    for (let i = 0; i < this.player.MaxHealth; i++) {
                        const pip = this.add.circle(24 + i * 28, 24, 9, 0xb22222)
                            .setStrokeStyle(2, 0x1b1710)
                            .setScrollFactor(0)
                            .setDepth(1000);
                        this.healthPips.push(pip);
                    }
                }
                updateHealthHud() {
                    this.healthPips.forEach((pip, i) => {
                        pip.setFillStyle(i < this.player.Health ? 0xb22222 : 0x3a3226);
                    });
                }
                createBossHud() {
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
                updateBossHud() {
                    if (!this.activeBoss || !this.bossHealthBarFill) {
                        return;
                    }
                    this.bossHealthBarFill.scaleX = Phaser.Math.Clamp(this.activeBoss.Health / this.activeBoss.MaxHealth, 0, 1);
                }
                createGroundTextures() {
                    if (this.textures.exists('tile_a')) {
                        return;
                    }
                    const halfW = engine_6.IsoMath.TILE_WIDTH / 2;
                    const halfH = engine_6.IsoMath.TILE_HEIGHT / 2;
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
                        graphics.lineTo(engine_6.IsoMath.TILE_WIDTH, halfH);
                        graphics.lineTo(halfW, engine_6.IsoMath.TILE_HEIGHT);
                        graphics.lineTo(0, halfH);
                        graphics.closePath();
                        graphics.fillPath();
                        graphics.strokePath();
                        graphics.generateTexture(tile.key, engine_6.IsoMath.TILE_WIDTH, engine_6.IsoMath.TILE_HEIGHT);
                    });
                    graphics.destroy();
                }
                buildGround(arenaExtent) {
                    const gridRadius = Math.ceil(arenaExtent);
                    for (let gx = -gridRadius; gx <= gridRadius; gx++) {
                        for (let gy = -gridRadius; gy <= gridRadius; gy++) {
                            const screen = engine_6.IsoMath.toScreen(gx, gy);
                            const key = (gx + gy) % 2 === 0 ? 'tile_a' : 'tile_b';
                            const tile = this.add.image(this.originX + screen.x, this.originY + screen.y, key);
                            tile.setDepth(screen.y);
                        }
                    }
                }
            };
            exports_16("ArenaScene", ArenaScene);
        }
    };
});
System.register("apps/soulslike/src/content/CreatureScripts", ["apps/soulslike/src/entities/Boss", "apps/soulslike/src/entities/Mob", "apps/soulslike/src/content/GameContent"], function (exports_17, context_17) {
    "use strict";
    var Boss_2, Mob_1, GameContent_2;
    var __moduleName = context_17 && context_17.id;
    /**
     * Matches each creature_template.scriptName to the class that brings it to
     * life. Adding a new creature is: a template row, a spawn row, and one
     * registration here — no scene/loader changes.
     */
    function registerCreatureScripts() {
        GameContent_2.creatureScripts.register('boss_hollowed_warden', (scene, spawn, arenaExtent, player, template) => new Boss_2.Boss(scene, spawn.worldX, spawn.worldY, arenaExtent, player, template.name));
        GameContent_2.creatureScripts.register('mob_patrol_wretch', (scene, spawn, arenaExtent, player) => new Mob_1.Mob(scene, spawn.worldX, spawn.worldY, arenaExtent, player));
    }
    exports_17("registerCreatureScripts", registerCreatureScripts);
    return {
        setters: [
            function (Boss_2_1) {
                Boss_2 = Boss_2_1;
            },
            function (Mob_1_1) {
                Mob_1 = Mob_1_1;
            },
            function (GameContent_2_1) {
                GameContent_2 = GameContent_2_1;
            }
        ],
        execute: function () {
        }
    };
});
/// <reference path="./../../../node_modules/phaser/types/phaser.d.ts"/>
System.register("apps/soulslike/src/main", ["apps/soulslike/src/scenes/ArenaScene", "apps/soulslike/src/content/GameContent", "apps/soulslike/src/content/CreatureScripts"], function (exports_18, context_18) {
    "use strict";
    var ArenaScene_1, GameContent_3, CreatureScripts_1, config;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [
            function (ArenaScene_1_1) {
                ArenaScene_1 = ArenaScene_1_1;
            },
            function (GameContent_3_1) {
                GameContent_3 = GameContent_3_1;
            },
            function (CreatureScripts_1_1) {
                CreatureScripts_1 = CreatureScripts_1_1;
            }
        ],
        execute: function () {/// <reference path="./../../../node_modules/phaser/types/phaser.d.ts"/>
            config = {
                type: Phaser.AUTO,
                parent: 'content',
                width: 960,
                height: 600,
                backgroundColor: '#1b1710',
                scene: [ArenaScene_1.ArenaScene]
            };
            window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
                CreatureScripts_1.registerCreatureScripts();
                yield GameContent_3.contentDatabase.load({
                    templates: './apps/soulslike/src/content/creatureTemplates.json',
                    spawns: './apps/soulslike/src/content/creatureSpawns.json',
                    instances: './apps/soulslike/src/content/instances.json',
                    portals: './apps/soulslike/src/content/portals.json'
                });
                window.game = new Phaser.Game(config);
            });
        }
    };
});
//# sourceMappingURL=app.js.map