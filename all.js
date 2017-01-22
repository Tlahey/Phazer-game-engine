System.register("src/DataBase/DatabaseModel", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("src/Utils/Dictionnary", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var Dictionary;
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
            exports_2("Dictionary", Dictionary);
        }
    };
});
System.register("src/Utils/Guid", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var Guid;
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
            exports_3("Guid", Guid);
        }
    };
});
System.register("src/Logical/Events", ["src/Utils/Dictionnary"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var Dictionnary_1, Events;
    return {
        setters: [
            function (Dictionnary_1_1) {
                Dictionnary_1 = Dictionnary_1_1;
            }
        ],
        execute: function () {
            Events = class Events {
                constructor() {
                    this.Reset();
                }
                Reset() {
                    this._lEvents = new Dictionnary_1.Dictionary();
                }
                ScheduleEvent(index, value) {
                    this._lEvents.Add(index.toString(), value);
                }
                Update(physicType) {
                    let eventsTemp = new Dictionnary_1.Dictionary();
                    this._lEvents.Values().forEach(item => {
                        let timer = this._lEvents.Item(item.Key) - physicType;
                        eventsTemp.Add(item.Key, (timer <= 0) ? 0 : timer);
                    });
                    this._lEvents = eventsTemp;
                }
                ExecuteEvent() {
                    let key = this._lEvents.Values().find(x => x.Value <= 0);
                    if (key == undefined || (key.Value == 0 && key.Key == "0"))
                        return -1;
                    this._lEvents.Remove(key.Key);
                    return parseInt(key.Key);
                }
            };
            exports_4("Events", Events);
        }
    };
});
System.register("src/Model/Creature", ["src/Utils/Dictionnary", "src/DataBase/DatabaseSingleton", "src/Utils/Guid", "app", "src/Logical/Events"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var Dictionnary_2, DatabaseSingleton_1, Guid_1, app_1, Events_1, CreatureFlags, Creature;
    return {
        setters: [
            function (Dictionnary_2_1) {
                Dictionnary_2 = Dictionnary_2_1;
            },
            function (DatabaseSingleton_1_1) {
                DatabaseSingleton_1 = DatabaseSingleton_1_1;
            },
            function (Guid_1_1) {
                Guid_1 = Guid_1_1;
            },
            function (app_1_1) {
                app_1 = app_1_1;
            },
            function (Events_1_1) {
                Events_1 = Events_1_1;
            }
        ],
        execute: function () {
            (function (CreatureFlags) {
                CreatureFlags[CreatureFlags["CREATURE_NONE"] = 0] = "CREATURE_NONE";
                CreatureFlags[CreatureFlags["CREATURE_FREEZE"] = 1] = "CREATURE_FREEZE";
                CreatureFlags[CreatureFlags["CREATURE_INVISIBLE"] = 2] = "CREATURE_INVISIBLE";
                CreatureFlags[CreatureFlags["CREATURE_MOVE_NOT_NORMALIZED"] = 4] = "CREATURE_MOVE_NOT_NORMALIZED";
            })(CreatureFlags || (CreatureFlags = {}));
            exports_5("CreatureFlags", CreatureFlags);
            Creature = class Creature {
                constructor(scriptName) {
                    this._guid = Guid_1.Guid.newGuid();
                    this._scriptName = scriptName;
                    this._active = true;
                    this._event = new Events_1.Events();
                    this._isRunning = false;
                    this._lSummon = [];
                    this._lSpells = new Dictionnary_2.Dictionary();
                }
                Initialize() {
                    this._sprite = app_1.SimpleGame.overlays.Item(this._positionZ.toString()).create(this._positionX, this._positionY, 'model_' + this._entry);
                    app_1.SimpleGame.game.physics.enable(this._sprite, Phaser.Physics.ARCADE);
                    this._sprite.scale.setTo(this._scale, this._scale);
                    this._sprite.alpha = this._alpha;
                }
                get Guid() { return this._guid; }
                get ModelId() { return this._modelId; }
                set ModelId(newValue) { this._modelId = newValue; }
                get Lifes() { return this._lifes; }
                set Lifes(newValue) { this._lifes = newValue; }
                get PositionX() { return this._positionX; }
                set PositionX(newValue) { this._positionX = newValue; }
                get PositionY() { return this._positionY; }
                set PositionY(newValue) { this._positionY = newValue; }
                get PositionZ() { return this._positionZ; }
                set PositionZ(newValue) { this._positionZ = newValue; }
                get SpeedRun() { return this._speedRun; }
                set SpeedRun(newValue) { this._speedRun = newValue; }
                get SpeedWalk() { return this._speedWalk; }
                set SpeedWalk(newValue) { this._speedWalk = newValue; }
                get Scale() { return this._scale; }
                set Scale(newValue) { this._scale = newValue; }
                get Alpha() { return this._alpha; }
                set Alpha(newValue) { this._alpha = newValue; }
                get Freeze() { return this._freeze; }
                set Freeze(newValue) { this._freeze = newValue; }
                get Invisible() { return this._invisible; }
                set Invisible(newValue) { this._invisible = newValue; }
                get Entry() { return this._entry; }
                set Entry(newValue) { this._entry = newValue; }
                get Sprite() { return this._sprite; }
                get isMoving() { return this._isMoving; }
                get ScriptName() { return this._scriptName; }
                get Events() { return this._event; }
                get SpellList() { return this._lSpells; }
                // END VARIABLE
                Move(posX, posY) {
                    this._sprite.position = new Phaser.Point(posX, posY);
                }
                MoveTo(posX, posY, idPosition = 1) {
                    this._movePosition = new Phaser.Point(posX, posY);
                    this._isMoving = true;
                    this._moveToPositionId = idPosition;
                    // SimpleGame.game.physics.arcade.moveToXY(this._sprite, posX , posY, (this._isRunning) ? this._speedRun : this._speedWalk);
                    // this._oldDeplacementDistance = SimpleGame.game.physics.arcade.distanceToXY(this._sprite, this._movePosition.x , this._movePosition.y);
                    // var duration = (game.physics.distanceToPointer(sprite, pointer) / 300) * 1000;
                    var tween = app_1.SimpleGame.game.add.tween(this._sprite);
                    tween.to({ x: posX, y: posY }, undefined, "Sine.easeInOut", true);
                    tween.interpolation(Phaser.Math.linearInterpolation);
                    tween.onComplete.add(() => {
                        this._sprite.body.velocity.setTo(0, 0);
                        this._movePosition = undefined;
                        this._isMoving = false;
                        if (this._moveToPositionId != -1) {
                            this.MovementInform(this._moveToPositionId);
                        }
                    }, this);
                    tween.start();
                }
                MovementInform(id) {
                }
                SummonCreature(creatureEntry, PositionX, PositionY, PositionZ) {
                    var creature = {
                        Entry: creatureEntry,
                        PositionX: PositionX,
                        PositionY: PositionY,
                        PositionZ: PositionZ
                    };
                    var newCreature = DatabaseSingleton_1.DatabaseSingleton.getInstance().AddCreature(creature);
                    newCreature._summoner = this;
                    this._lSummon.push(newCreature);
                    this.OnSummon(newCreature);
                }
                DoCast(spellId, target = null) {
                    let spell = DatabaseSingleton_1.DatabaseSingleton.getInstance().GetSpell(spellId);
                    if (spell == null)
                        return;
                    spell.PositionX = this._sprite.position.x + (this._sprite.width / 2);
                    spell.PositionY = this._sprite.position.y + (this._sprite.height / 2);
                    spell.PositionZ = this._positionZ;
                    spell.Caster = this;
                    spell.Target = target; // TODO : si target undefined -> Prendre la plus proche
                    spell.Launch();
                    this._lSpells.Add(spell.Guid, spell);
                }
                OnSummon(creature) {
                }
                ClearSummons() {
                    // Die all lSummon
                    this._lSummon = [];
                }
                Update(gameTime) {
                    if (!this._active)
                        return;
                    this._lSpells.Values().forEach(spell => {
                        spell.Value.Update(gameTime);
                    });
                    this._event.Update(gameTime);
                }
                PlaySound(soundId) {
                    app_1.SimpleGame.game.add.audio('sound_' + soundId).play();
                }
                SpellHitTargetCreature(spell, creat, act) {
                    if (act) {
                        act();
                    }
                    // creat.TakesDamages(spell, creat);
                    spell.Dispose();
                    // _lSpell.TryTake(out spell);
                }
                Die() {
                    if (this._lSummon != null) {
                        // On die l'ensemble des fils
                        this._lSummon.forEach(x => {
                            x.Die();
                        });
                    }
                    if (this._summoner != null) {
                        // On supprime les sprites summon de la liste des créatures
                        this._summoner.OnSummonDie(this);
                    }
                    this._sprite.destroy();
                }
                OnSummonDie(creature) {
                }
            };
            exports_5("Creature", Creature);
        }
    };
});
System.register("src/Model/CreatureScript/npc_hiboux", ["src/Model/Creature"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var Creature_1, npc_hiboux;
    return {
        setters: [
            function (Creature_1_1) {
                Creature_1 = Creature_1_1;
            }
        ],
        execute: function () {
            npc_hiboux = class npc_hiboux extends Creature_1.Creature {
                constructor() {
                    super("npc_hiboux");
                    // SOUND [0 - n]
                    this.HIBOUX_FLY_OUT = 0;
                    this.HIBOUX_FLY_ON = 1;
                    this.HIBOUX_RWOU_1 = 2;
                    this.HIBOUX_RWOU_2 = 3;
                    // ACTIONS [0 - n]
                    this.ACTION_MOVE_LEFT = 1;
                    this.ACTION_MOVE_RIGHT = 2;
                    this.ACTION_SPEAK = 3;
                    this.ACTION_SUMMON_LOGO = 4;
                    this.ACTION_UNSUMMON_LOGO = 5;
                    // NPC [1 - n]
                    this.NPC_PLUME = 3;
                    this.NPC_LOGO_ZELDA = 4;
                    // POSITION [1 - n]
                    this.POSITION_LEFT = 1;
                    this.POSITION_RIGHT = 2;
                    this.SPELL_BOULE_DE_FEU = 1;
                    this.SPELL_FADEIN = 2;
                    this.SPELL_FADEOUT = 3;
                    this._nbRwou = 0;
                }
                Initialize() {
                    super.Initialize();
                    this.Events.ScheduleEvent(this.POSITION_LEFT, 600);
                }
                DoAction(action) {
                    switch (action) {
                        case this.ACTION_MOVE_RIGHT:
                            this.DoCast(this.SPELL_FADEOUT, this._logo);
                            this.Events.ScheduleEvent(this.ACTION_UNSUMMON_LOGO, 1000);
                            this.PlaySound(this.HIBOUX_FLY_OUT);
                            this.MoveTo(800, 0, this.POSITION_RIGHT);
                            this._nbRwou = 0;
                            break;
                        case this.ACTION_MOVE_LEFT:
                            this.PlaySound(this.HIBOUX_FLY_ON);
                            this.MoveTo(-100, 0, this.POSITION_LEFT);
                            break;
                        case this.ACTION_SPEAK:
                            this.PlaySound((this._nbRwou % 2 == 0) ? this.HIBOUX_RWOU_1 : this.HIBOUX_RWOU_2);
                            this._nbRwou++;
                            this.Events.ScheduleEvent((this._nbRwou < 8) ? this.ACTION_SPEAK : this.ACTION_MOVE_RIGHT, 1000);
                            break;
                        case this.ACTION_UNSUMMON_LOGO:
                            this._logo.Die();
                            this._logo = null;
                            break;
                    }
                }
                MovementInform(id) {
                    switch (id) {
                        case this.POSITION_RIGHT:
                            this.ClearSummons();
                            this.Events.ScheduleEvent(this.ACTION_MOVE_LEFT, 1000);
                            break;
                        case this.POSITION_LEFT:
                            this.SummonCreature(this.NPC_LOGO_ZELDA, 460, 80, this.PositionZ);
                            this.Events.ScheduleEvent(this.ACTION_SPEAK, 100);
                            break;
                    }
                }
                OnSummon(creature) {
                    switch (creature.Entry) {
                        case this.NPC_PLUME:
                            break;
                        case this.NPC_LOGO_ZELDA:
                            this._logo = creature;
                            this.DoCast(this.SPELL_FADEIN, creature);
                            break;
                    }
                }
                Update(gameTime) {
                    super.Update(gameTime);
                    switch (this.Events.ExecuteEvent()) {
                        case this.ACTION_MOVE_LEFT:
                            this.DoAction(this.ACTION_MOVE_LEFT);
                            break;
                        case this.ACTION_SPEAK:
                            if (this._nbRwou < 8)
                                this.DoCast(this.SPELL_BOULE_DE_FEU, this._logo);
                            this.DoAction(this.ACTION_SPEAK);
                            break;
                        case this.ACTION_MOVE_RIGHT:
                            this.DoAction(this.ACTION_MOVE_RIGHT);
                            break;
                        case this.ACTION_UNSUMMON_LOGO:
                            this.DoAction(this.ACTION_UNSUMMON_LOGO);
                            break;
                    }
                }
            };
            exports_6("npc_hiboux", npc_hiboux);
        }
    };
});
System.register("src/Model/CreatureScript/npc_cloud", ["src/Model/Creature"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var Creature_2, npc_cloud;
    return {
        setters: [
            function (Creature_2_1) {
                Creature_2 = Creature_2_1;
            }
        ],
        execute: function () {
            npc_cloud = class npc_cloud extends Creature_2.Creature {
                constructor() {
                    super("npc_cloud");
                }
                getRandom(min, max) {
                    return Math.random() * (max - min) + min;
                }
                Initialize() {
                    super.Initialize();
                }
                Update(gameTime) {
                    super.Update(gameTime);
                    if (!super.isMoving) {
                        super.Move(800, this.getRandom(0, 500));
                        super.MoveTo(-300, super.Sprite.position.y);
                    }
                }
            };
            exports_7("npc_cloud", npc_cloud);
        }
    };
});
System.register("app", ["src/Utils/Dictionnary", "src/DataBase/DatabaseSingleton"], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var Dictionnary_3, DatabaseSingleton_2, SimpleGame;
    return {
        setters: [
            function (Dictionnary_3_1) {
                Dictionnary_3 = Dictionnary_3_1;
            },
            function (DatabaseSingleton_2_1) {
                DatabaseSingleton_2 = DatabaseSingleton_2_1;
            }
        ],
        execute: function () {
            SimpleGame = class SimpleGame {
                constructor() {
                    SimpleGame.game = new Phaser.Game(800, 500, Phaser.AUTO, 'content', {
                        preload: this.preload,
                        create: this.create,
                        update: this.update
                    });
                }
                preload() {
                    // On charge l'ensemble des modèles
                    var spritesPath = "./src/Assets/Sprites/";
                    DatabaseSingleton_2.DatabaseSingleton.getInstance().models_db.Values().forEach(model => {
                        SimpleGame.game.load.image('model_' + model.Value.Id, spritesPath + model.Value.AssetName);
                    });
                    var soundsPath = "./src/Assets/Sounds/";
                    DatabaseSingleton_2.DatabaseSingleton.getInstance().sounds_db.Values().forEach(sound => {
                        SimpleGame.game.load.audio('sound_' + sound.Value.Id, soundsPath + sound.Value.AssetName);
                    });
                }
                create() {
                    SimpleGame.overlays = new Dictionnary_3.Dictionary();
                    for (var i = 0, ii = 10; i != ii; i++) {
                        SimpleGame.overlays.Add(i.toString(), SimpleGame.game.add.group());
                    }
                    SimpleGame.game.stage.backgroundColor = '#51a2ff';
                    // A faire en dernier !
                    DatabaseSingleton_2.DatabaseSingleton.getInstance().InitializeWorld();
                }
                update() {
                    DatabaseSingleton_2.DatabaseSingleton.getInstance().GameCreature.Values().forEach(cre => {
                        cre.Value.Update(SimpleGame.game.time.physicsElapsedMS);
                    });
                }
            };
            exports_8("SimpleGame", SimpleGame);
            window.onload = () => {
                DatabaseSingleton_2.DatabaseSingleton.getInstance().createDbObjects().then(() => {
                    var game = new SimpleGame();
                });
            };
        }
    };
});
System.register("src/Model/Spell", ["app", "src/Utils/Guid"], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    var app_2, Guid_2, SpellType, SpellTargetType, SpellSounds, Spell;
    return {
        setters: [
            function (app_2_1) {
                app_2 = app_2_1;
            },
            function (Guid_2_1) {
                Guid_2 = Guid_2_1;
            }
        ],
        execute: function () {
            (function (SpellType) {
                SpellType[SpellType["SPELL_TYPE_NONE"] = 0] = "SPELL_TYPE_NONE";
                SpellType[SpellType["SPELL_TYPE_TELEPORT"] = 1] = "SPELL_TYPE_TELEPORT";
                SpellType[SpellType["SPELL_TYPE_CAST"] = 2] = "SPELL_TYPE_CAST";
                SpellType[SpellType["SPELL_TYPE_AURA"] = 3] = "SPELL_TYPE_AURA";
                SpellType[SpellType["SPELL_TYPE_EFFECT"] = 4] = "SPELL_TYPE_EFFECT";
            })(SpellType || (SpellType = {}));
            exports_9("SpellType", SpellType);
            ;
            (function (SpellTargetType) {
                SpellTargetType[SpellTargetType["SPELL_TYPE_SELF"] = 0] = "SPELL_TYPE_SELF";
                SpellTargetType[SpellTargetType["SPELL_TYPE_TARGET"] = 1] = "SPELL_TYPE_TARGET";
                SpellTargetType[SpellTargetType["SPELL_TYPE_ZONE"] = 2] = "SPELL_TYPE_ZONE";
            })(SpellTargetType || (SpellTargetType = {}));
            exports_9("SpellTargetType", SpellTargetType);
            ;
            (function (SpellSounds) {
                SpellSounds[SpellSounds["SOUND_LAUNCH"] = 0] = "SOUND_LAUNCH";
                SpellSounds[SpellSounds["SOUND_HIT"] = 1] = "SOUND_HIT";
            })(SpellSounds || (SpellSounds = {}));
            exports_9("SpellSounds", SpellSounds);
            Spell = class Spell {
                constructor(ScriptName) {
                    this._scriptName = ScriptName;
                    this.InitilializeDefault();
                }
                get Guid() { return this._guid; }
                get Entry() { return this._entry; }
                set Entry(newValue) { this._entry = newValue; }
                get ScriptName() { return this._scriptName; }
                get ModelId() { return this._modelId; }
                set ModelId(newValue) { this._modelId = newValue; }
                get Speed() { return this._speed; }
                set Speed(newValue) { this._speed = newValue; }
                get Alpha() { return this._alpha; }
                set Alpha(newValue) { this._alpha = newValue; }
                get Scale() { return this._scale; }
                set Scale(newValue) { this._scale = newValue; }
                get Damages() { return this._damages; }
                set Damages(newValue) { this._damages = newValue; }
                get SpellHitRange() { return this._spellHitRange; }
                set SpellHitRange(newValue) { this._spellHitRange = newValue; }
                get IsLaunched() { return this._isLaunched; }
                set IsLaunched(newValue) { this._isLaunched = newValue; }
                get SpellName() { return this._spellName; }
                set SpellName(newValue) { this._spellName = newValue; }
                get TypeSpell() { return this._typeSpell; }
                set TypeSpell(newValue) { this._typeSpell = newValue; }
                get Sounds() { return this._sounds; }
                set Sounds(newValue) { this._sounds = newValue; }
                get PositionX() { return this._positionX; }
                set PositionX(newValue) { this._positionX = newValue; }
                get PositionY() { return this._positionY; }
                set PositionY(newValue) { this._positionY = newValue; }
                get PositionZ() { return this._positionZ; }
                set PositionZ(newValue) { this._positionZ = newValue; }
                get Caster() { return this._caster; }
                set Caster(newValue) { this._caster = newValue; }
                get Target() { return this._target; }
                set Target(newValue) { this._target = newValue; }
                get Sprite() { return this._sprite; }
                InitilializeDefault() {
                    this._guid = Guid_2.Guid.newGuid();
                    this._scale = 1;
                    this._alpha = 1;
                    this._speed = 1;
                    this._damages = 0;
                    this._spellName = "";
                    this._typeCast = SpellTargetType.SPELL_TYPE_TARGET;
                    this._typeSpell = SpellType.SPELL_TYPE_NONE;
                    this._hitFinalTarget = false;
                    this._isLaunched = false;
                }
                Launch() {
                    this._sprite = app_2.SimpleGame.overlays.Item(this._positionZ.toString()).create(this._positionX, this._positionY, 'model_' + this._modelId);
                    this._sprite.position.x = this._sprite.position.x - (this._sprite.width / 2);
                    this._sprite.position.y = this._sprite.position.y - (this._sprite.height / 2);
                    app_2.SimpleGame.game.physics.enable(this._sprite, Phaser.Physics.ARCADE);
                    this._sprite.scale.setTo(this._scale, this._scale);
                }
                PlaySound(soundId) {
                    app_2.SimpleGame.game.add.audio('sound_' + soundId).play();
                }
                Dispose() {
                    this._caster.SpellList.Remove(this.Guid);
                    this._sprite.destroy();
                }
                Update(gameTime) {
                    if (!this._isLaunched) {
                        this._isLaunched = true;
                        if (this._sounds[SpellSounds.SOUND_LAUNCH] != undefined) {
                            this.PlaySound(this._sounds[SpellSounds.SOUND_LAUNCH]);
                        }
                        switch (this._typeCast) {
                            case SpellTargetType.SPELL_TYPE_SELF:
                                break;
                            case SpellTargetType.SPELL_TYPE_TARGET:
                                this._targetTween = app_2.SimpleGame.game.add.tween(this.Sprite);
                                this._targetTween.to({
                                    x: this._target.PositionX + (this._target.Sprite.width / 2),
                                    y: this._target.PositionY + (this._target.Sprite.height / 2)
                                }, 600, Phaser.Easing.Linear.None, true);
                                this._targetTween.interpolation(Phaser.Math.linearInterpolation);
                                this._targetTween.onComplete.add(() => {
                                    this._caster.SpellHitTargetCreature(this, this._target, () => { this.PlaySound(this._sounds[SpellSounds.SOUND_HIT]); });
                                }, this);
                                break;
                            case SpellTargetType.SPELL_TYPE_ZONE:
                                break;
                        }
                    }
                }
            };
            exports_9("Spell", Spell);
        }
    };
});
System.register("src/Model/SpellScript/spell_fadeout", ["app", "src/Model/Spell"], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    var app_3, Spell_1, spell_fadeout;
    return {
        setters: [
            function (app_3_1) {
                app_3 = app_3_1;
            },
            function (Spell_1_1) {
                Spell_1 = Spell_1_1;
            }
        ],
        execute: function () {
            spell_fadeout = class spell_fadeout extends Spell_1.Spell {
                constructor() {
                    super("spell_fadeout");
                }
                Update(gameTime) {
                    if (!this.IsLaunched) {
                        var tween = app_3.SimpleGame.game.add.tween(this.Target.Sprite);
                        tween.to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
                        tween.interpolation(Phaser.Math.linearInterpolation);
                        tween.onComplete.add(() => {
                            this.Dispose();
                        }, this);
                    }
                    super.Update(gameTime);
                }
            };
            exports_10("spell_fadeout", spell_fadeout);
        }
    };
});
System.register("src/Model/SpellScript/spell_fadein", ["app", "src/Model/Spell"], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    var app_4, Spell_2, spell_fadein;
    return {
        setters: [
            function (app_4_1) {
                app_4 = app_4_1;
            },
            function (Spell_2_1) {
                Spell_2 = Spell_2_1;
            }
        ],
        execute: function () {
            spell_fadein = class spell_fadein extends Spell_2.Spell {
                constructor() {
                    super("spell_fadein");
                }
                Update(gameTime) {
                    if (!this.IsLaunched) {
                        var tween = app_4.SimpleGame.game.add.tween(this.Target.Sprite);
                        tween.to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true);
                        tween.interpolation(Phaser.Math.linearInterpolation);
                        tween.onComplete.add(() => {
                            this.Dispose();
                        }, this);
                    }
                    super.Update(gameTime);
                }
            };
            exports_11("spell_fadein", spell_fadein);
        }
    };
});
System.register("src/Logical/ScriptedSpell", ["src/Model/SpellScript/spell_fadeout", "src/Model/SpellScript/spell_fadein"], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    var spell_fadeout_1, spell_fadein_1, ScriptedSpell;
    return {
        setters: [
            function (spell_fadeout_1_1) {
                spell_fadeout_1 = spell_fadeout_1_1;
            },
            function (spell_fadein_1_1) {
                spell_fadein_1 = spell_fadein_1_1;
            }
        ],
        execute: function () {
            ScriptedSpell = class ScriptedSpell {
                get ScriptedSpell() { return this._scriptedSpell; }
                constructor() {
                    if (this._scriptedSpell != undefined)
                        return;
                    // Script Creature
                    this._scriptedSpell = [];
                    this._scriptedSpell.push(new spell_fadein_1.spell_fadein());
                    this._scriptedSpell.push(new spell_fadeout_1.spell_fadeout());
                }
            };
            exports_12("ScriptedSpell", ScriptedSpell);
        }
    };
});
System.register("src/Logical/ScriptedCreature", ["src/Model/CreatureScript/npc_hiboux", "src/Model/CreatureScript/npc_cloud"], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    var npc_hiboux_1, npc_cloud_1, ScriptedCreature;
    return {
        setters: [
            function (npc_hiboux_1_1) {
                npc_hiboux_1 = npc_hiboux_1_1;
            },
            function (npc_cloud_1_1) {
                npc_cloud_1 = npc_cloud_1_1;
            }
        ],
        execute: function () {
            ScriptedCreature = class ScriptedCreature {
                get ScriptedCreature() { return this._scriptedCreature; }
                constructor() {
                    if (this._scriptedCreature != undefined)
                        return;
                    // Script Creature
                    this._scriptedCreature = [];
                    this._scriptedCreature.push(new npc_cloud_1.npc_cloud());
                    this._scriptedCreature.push(new npc_hiboux_1.npc_hiboux());
                }
            };
            exports_13("ScriptedCreature", ScriptedCreature);
        }
    };
});
System.register("src/Logical/Flags", [], function (exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    var Flags;
    return {
        setters: [],
        execute: function () {
            Flags = class Flags {
                constructor(flag) {
                    this._flag = flag;
                }
                Contains(flag) {
                    let retur = (this._flag & (flag)) == (flag);
                    return !retur;
                }
            };
            exports_14("Flags", Flags);
        }
    };
});
System.register("src/DataBase/DatabaseSingleton", ["src/Logical/ScriptedSpell", "src/Model/Spell", "src/Logical/ScriptedCreature", "src/Logical/Flags", "src/Model/Creature", "src/Utils/Dictionnary"], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    var ScriptedSpell_1, Spell_3, ScriptedCreature_1, Flags_1, Creature_3, Dictionnary_4, DatabaseSingleton;
    return {
        setters: [
            function (ScriptedSpell_1_1) {
                ScriptedSpell_1 = ScriptedSpell_1_1;
            },
            function (Spell_3_1) {
                Spell_3 = Spell_3_1;
            },
            function (ScriptedCreature_1_1) {
                ScriptedCreature_1 = ScriptedCreature_1_1;
            },
            function (Flags_1_1) {
                Flags_1 = Flags_1_1;
            },
            function (Creature_3_1) {
                Creature_3 = Creature_3_1;
            },
            function (Dictionnary_4_1) {
                Dictionnary_4 = Dictionnary_4_1;
            }
        ],
        execute: function () {
            DatabaseSingleton = class DatabaseSingleton {
                constructor() {
                    if (DatabaseSingleton._instance) {
                        throw new Error("Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.");
                    }
                    DatabaseSingleton._instance = this;
                    DatabaseSingleton._instance._instanceScriptedCreature = new ScriptedCreature_1.ScriptedCreature();
                    DatabaseSingleton._instance._instanceScriptedSpell = new ScriptedSpell_1.ScriptedSpell();
                }
                static getInstance() {
                    return DatabaseSingleton._instance;
                }
                get GameCreature() { return this._gameCreatures; }
                getDatabaseInformations(databasePath, callbackFunction) {
                    var request = new XMLHttpRequest();
                    request.onload = callbackFunction;
                    request.open("get", databasePath, true);
                    request.send();
                }
                InitializeCreature(item) {
                    let tempCT = this.creaturesTemplate_db.Item(item.Entry.toString());
                    let cFlags = new Flags_1.Flags(tempCT.Flags);
                    let cre = (tempCT.ScriptName) ? Object.create(this._instanceScriptedCreature.ScriptedCreature.find(x => x.ScriptName == tempCT.ScriptName)) : new Creature_3.Creature();
                    cre.Entry = item.Entry; // identifiant du type de créature
                    cre.ModelId = tempCT.ModelId; // Modèle de la créature
                    cre.Lifes = tempCT.Lifes; // Nombre de vie
                    cre.PositionX = item.PositionX; // Position X de la créature
                    cre.PositionY = item.PositionY; // Position Y de la créature
                    cre.PositionZ = item.PositionZ; // Position Z de la créature
                    cre.SpeedRun = tempCT.SpeedRun; // Vitesse de course de la créature
                    cre.SpeedWalk = tempCT.SpeedWalk; // Vitesse de marche de la créature
                    cre.Scale = tempCT.Scale; // Taille de l'image
                    cre.Alpha = tempCT.Alpha; // Opacité de l'image
                    cre.Freeze = cFlags.Contains(Creature_3.CreatureFlags.CREATURE_FREEZE); // La créature bouge ?
                    cre.Invisible = cFlags.Contains(Creature_3.CreatureFlags.CREATURE_INVISIBLE); // Affiche le sprite de la créature
                    // cre.DeplacementNonNormalise = cFlags.Contains(CreatureFlags.CREATURE_MOVE_NOT_NORMALIZED);  // Vitesse normalisée de la créature
                    //cre.ScriptName = tempCT.ScriptName;                                     // ScriptName de la créature (pas obligatoire)
                    // cre.Sounds = new Sounds(tempCT.SoundsID.FindElements(_dbSounds), game.Content); // TODO Throw error si Sounds < 2
                    // cre.TypeCreature = Type_Creature.TYPE_CREATURE_CREATURE;
                    // Texts = new Texts(tempCT.TextsID.FindElements(_dbTexts), game.Content),
                    return cre;
                }
                InitializeWorld() {
                    this.creatures_db.Values().forEach(creat => {
                        this.AddCreature(creat.Value);
                    });
                }
                GetSpell(spellId) {
                    let tempSP = this.spells_db.Item(spellId.toString());
                    let spe = (tempSP.SpellScriptName) ? Object.create(this._instanceScriptedSpell.ScriptedSpell.find(x => x.ScriptName == tempSP.SpellScriptName)) : new Spell_3.Spell();
                    spe.Entry = tempSP.Id;
                    spe.Damages = tempSP.Damages;
                    spe.ModelId = tempSP.ModelId;
                    spe.TypeSpell = tempSP.SpellType;
                    spe.SpellName = tempSP.SpellName;
                    spe.Alpha = tempSP.Alpha;
                    spe.Scale = tempSP.Scale;
                    spe.Speed = tempSP.Speed;
                    spe.SpellHitRange = tempSP.SpellHitRange;
                    spe.Sounds = tempSP.SoundIds;
                    return spe;
                }
                AddCreature(creat) {
                    let newCreature = this.InitializeCreature(creat);
                    newCreature.Initialize();
                    this._gameCreatures.Add(newCreature.Guid, newCreature);
                    return newCreature;
                }
                createDbObjects() {
                    this._gameCreatures = new Dictionnary_4.Dictionary();
                    var promises = [];
                    // CREATURE
                    promises.push(new Promise(resolve => {
                        this.creatures_db = new Dictionnary_4.Dictionary();
                        this.getDatabaseInformations("./src/Assets/Database/Creature.json", (result) => {
                            JSON.parse(result.target.responseText).forEach((el) => {
                                this.creatures_db.Add(el.Entry.toString(), el);
                            });
                            resolve();
                        });
                    }));
                    // CREATURE TEMPLATE
                    promises.push(new Promise(resolve => {
                        this.creaturesTemplate_db = new Dictionnary_4.Dictionary();
                        this.getDatabaseInformations("./src/Assets/Database/CreatureTemplate.json", (result) => {
                            JSON.parse(result.target.responseText).forEach((el) => {
                                this.creaturesTemplate_db.Add(el.Entry.toString(), el);
                            });
                            resolve();
                        });
                    }));
                    // MODELS
                    promises.push(new Promise(resolve => {
                        this.models_db = new Dictionnary_4.Dictionary();
                        this.getDatabaseInformations("./src/Assets/Database/Models.json", (result) => {
                            JSON.parse(result.target.responseText).forEach((el) => {
                                this.models_db.Add(el.Id.toString(), el);
                            });
                            resolve();
                        });
                    }));
                    // SOUNDS
                    promises.push(new Promise(resolve => {
                        this.sounds_db = new Dictionnary_4.Dictionary();
                        this.getDatabaseInformations("./src/Assets/Database/Sounds.json", (result) => {
                            JSON.parse(result.target.responseText).forEach((el) => {
                                this.sounds_db.Add(el.Id.toString(), el);
                            });
                            resolve();
                        });
                    }));
                    // SPELLS 
                    promises.push(new Promise(resolve => {
                        this.spells_db = new Dictionnary_4.Dictionary();
                        this.getDatabaseInformations("./src/Assets/Database/Spells.json", (result) => {
                            JSON.parse(result.target.responseText).forEach((el) => {
                                this.spells_db.Add(el.Id.toString(), el);
                            });
                            resolve();
                        });
                    }));
                    // TEXTS
                    promises.push(new Promise(resolve => {
                        this.texts_db = new Dictionnary_4.Dictionary();
                        this.getDatabaseInformations("./src/Assets/Database/Texts.json", (result) => {
                            JSON.parse(result.target.responseText).forEach((el) => {
                                this.texts_db.Add(el.Id.toString(), el);
                            });
                            resolve();
                        });
                    }));
                    return Promise.all(promises);
                }
            };
            DatabaseSingleton._instance = new DatabaseSingleton();
            exports_15("DatabaseSingleton", DatabaseSingleton);
        }
    };
});
//# sourceMappingURL=all.js.map