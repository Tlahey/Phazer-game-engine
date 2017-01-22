import { Dictionary } from './../Utils/Dictionnary';
import { Spell } from './Spell';
import { ICreature_db } from './../DataBase/DatabaseModel';
import { DatabaseSingleton } from './../DataBase/DatabaseSingleton';
import { Guid } from './../Utils/Guid';
import { SimpleGame } from './../../app';
import { Events } from './../Logical/Events';


export enum CreatureFlags{
    CREATURE_NONE                   = 0x000, // 0b0000
    CREATURE_FREEZE                 = 0x001, // 0b0001  -> Sprite ne bouge pas
    CREATURE_INVISIBLE              = 0x002, // 0b0010  -> Sprite n'est pas affiché à l'écran
    CREATURE_MOVE_NOT_NORMALIZED    = 0x004, // 0b0100  -> Les déplacements se font avec une accélération
}

export class Creature{

    constructor(scriptName?:string){
        this._guid = Guid.newGuid();
        this._scriptName = scriptName;
        this._active = true;
        this._event = new Events();

        this._isRunning = false;
        this._lSummon = [];

        this._lSpells = new Dictionary<Spell>();
    }

    public Initialize() : void {
        this._sprite = SimpleGame.overlays.Item(this._positionZ.toString()).create(this._positionX, this._positionY, 'model_' + this._entry);
        SimpleGame.game.physics.enable(this._sprite, Phaser.Physics.ARCADE);
        this._sprite.scale.setTo(this._scale, this._scale);
        this._sprite.alpha = this._alpha;
    }

    // VARIABLES

    private _guid : string;         get Guid(): string { return this._guid; }
    private _modelId : number;      get ModelId(): number { return this._modelId; }             set ModelId(newValue: number) { this._modelId = newValue; }
    private _lifes: number;         get Lifes(): number { return this._lifes; }                 set Lifes(newValue: number) { this._lifes = newValue; }
    
    private _positionX: number;     get PositionX(): number { return this._positionX; }         set PositionX(newValue: number) { this._positionX = newValue; }
    private _positionY: number;     get PositionY(): number { return this._positionY; }         set PositionY(newValue: number) { this._positionY = newValue; }
    private _positionZ: number;     get PositionZ(): number { return this._positionZ; }         set PositionZ(newValue: number) { this._positionZ = newValue; }

    private _speedRun: number;      get SpeedRun(): number { return this._speedRun; }           set SpeedRun(newValue: number) { this._speedRun = newValue; }
    private _speedWalk: number;     get SpeedWalk(): number { return this._speedWalk; }         set SpeedWalk(newValue: number) { this._speedWalk = newValue; }

    private _scale: number;         get Scale(): number { return this._scale; }                 set Scale(newValue: number) { this._scale = newValue; }
    private _alpha: number;         get Alpha(): number { return this._alpha; }                 set Alpha(newValue: number) { this._alpha = newValue; }
    private _freeze: boolean;       get Freeze(): boolean { return this._freeze; }              set Freeze(newValue: boolean) { this._freeze = newValue; }
    private _invisible: boolean;    get Invisible(): boolean { return this._invisible; }        set Invisible(newValue: boolean) { this._invisible = newValue; }

    private _entry: number;         get Entry(): number { return this._entry; }                 set Entry(newValue: number) { this._entry = newValue; }

    private _sprite : Phaser.Sprite;    get Sprite():Phaser.Sprite { return this._sprite; }

    private _isMoving : boolean;        get isMoving() : Boolean { return this._isMoving; }

    private _isRunning: boolean;
    private _active: boolean;
    private _targetPosition;
    private _moveToPositionId : number;
    private _position : Phaser.Point;
    private _summoner : Creature;
    private _lSummon : Creature[];

    private _scriptName:string;         get ScriptName():string { return this._scriptName; }

    private _event : Events;            get Events():Events{ return this._event; }

    private _lSpells:Dictionary<Spell>; get SpellList():Dictionary<Spell>{ return this._lSpells; }

    // END VARIABLE

    public Move(posX:number, posY: number) : void{
        this._sprite.position = new Phaser.Point(posX, posY);
    }
    private _movePosition : Phaser.Point;
    public MoveTo(posX:number, posY: number, idPosition:number = 1){
        this._movePosition = new Phaser.Point(posX, posY);
        this._isMoving = true;
        this._moveToPositionId = idPosition;
        // SimpleGame.game.physics.arcade.moveToXY(this._sprite, posX , posY, (this._isRunning) ? this._speedRun : this._speedWalk);
        // this._oldDeplacementDistance = SimpleGame.game.physics.arcade.distanceToXY(this._sprite, this._movePosition.x , this._movePosition.y);
        // var duration = (game.physics.distanceToPointer(sprite, pointer) / 300) * 1000;
        var tween = SimpleGame.game.add.tween(this._sprite);
        tween.to({ x: posX, y: posY }, undefined, "Sine.easeInOut", true);
        tween.interpolation(Phaser.Math.linearInterpolation);
        tween.onComplete.add(() => {
            this._sprite.body.velocity.setTo(0, 0);
            this._movePosition = undefined;
            this._isMoving = false;
            if(this._moveToPositionId != -1){
                this.MovementInform(this._moveToPositionId);
            }
        }, this);
        tween.start();
    }

    public MovementInform(id: number) : void{

    }

    public SummonCreature(creatureEntry : number, PositionX : number, PositionY : number, PositionZ : number) : void {
        var creature: ICreature_db = {
            Entry: creatureEntry,
            PositionX: PositionX,
            PositionY: PositionY,
            PositionZ: PositionZ
        };
        var newCreature = DatabaseSingleton.getInstance().AddCreature(creature);
        newCreature._summoner = this;

        this._lSummon.push(newCreature);

        this.OnSummon(newCreature);
    }

    public DoCast(spellId:number, target:Creature = null) : void{
        let spell : Spell = DatabaseSingleton.getInstance().GetSpell(spellId);
        if (spell == null)
            return;
        
        spell.PositionX = this._sprite.position.x + (this._sprite.width / 2);
        spell.PositionY = this._sprite.position.y + (this._sprite.height / 2);
        spell.PositionZ = this._positionZ;

        spell.Caster = this;
        spell.Target = target;  // TODO : si target undefined -> Prendre la plus proche

        spell.Launch();
        this._lSpells.Add(spell.Guid, spell);
    }

    public OnSummon(creature : Creature){

    }

    public ClearSummons(){
        // Die all lSummon
        this._lSummon = [];
    }

    public Update(gameTime:number):void{        
        if(!this._active)
            return;

        this._lSpells.Values().forEach(spell => {
            spell.Value.Update(gameTime);
        });

        this._event.Update(gameTime);
    }

    public PlaySound(soundId : number){
        SimpleGame.game.add.audio('sound_' + soundId).play();
    }

    public SpellHitTargetCreature(spell : Spell, creat : Creature, act? : () => void) : void
    {
        if(act){
            act();
        }
        
        // creat.TakesDamages(spell, creat);

        spell.Dispose();
        // _lSpell.TryTake(out spell);
    }

    public Die():void{
        if(this._lSummon != null){
            // On die l'ensemble des fils
            this._lSummon.forEach(x => {
                x.Die();
            });
        }
        if(this._summoner != null){
            // On supprime les sprites summon de la liste des créatures
            this._summoner.OnSummonDie(this);
        } 
        this._sprite.destroy();
    }

    public OnSummonDie(creature : Creature) : void{

    }
    /*
    private _oldDeplacementDistance: number;
    private Deplacement(gameTime:number) : void{
        if(this._isMoving){
            var dist = SimpleGame.game.physics.arcade.distanceToXY(this._sprite, this._movePosition.x , this._movePosition.y);
            if (dist > this._oldDeplacementDistance)// Math.round(dist) >= -1 && Math.round(dist) <= 1)
            {
                this._oldDeplacementDistance = undefined;
                this._sprite.body.velocity.setTo(0, 0);
                this._movePosition = undefined;
                this._isMoving = false;
                if(this._moveToPositionId != -1){
                    this.MovementInform(this._moveToPositionId);
                }
            } else {
                this._oldDeplacementDistance = dist;
            }
        }
    }*/
}