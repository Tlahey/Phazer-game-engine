import { Creature } from './Creature';
import { Guid } from './../Utils/Guid';
import { SimpleGame } from '../simpleGame';

export enum SpellType
{
    SPELL_TYPE_NONE     = 0,
    SPELL_TYPE_TELEPORT = 1,
    SPELL_TYPE_CAST     = 2,
    SPELL_TYPE_AURA     = 3,
    SPELL_TYPE_EFFECT   = 4,
};

export enum SpellTargetType
{
    SPELL_TYPE_SELF     = 0,
    SPELL_TYPE_TARGET   = 1,
    SPELL_TYPE_ZONE     = 2,
};

export enum SpellSounds{
    SOUND_LAUNCH = 0,
    SOUND_HIT = 1
}

export class Spell{
    constructor(ScriptName? : string){
        this._scriptName = ScriptName;
        this.InitilializeDefault();
    }

    private _guid : string;         get Guid(): string { return this._guid; }
    private _entry:number;          get Entry(): number { return this._entry; }                 set Entry(newValue: number) { this._entry = newValue; }
    private _scriptName:string;     get ScriptName(): string { return this._scriptName; }
    private _modelId:number;        get ModelId(): number { return this._modelId; }             set ModelId(newValue: number) { this._modelId = newValue; }
    private _speed:number;          get Speed(): number { return this._speed; }                 set Speed(newValue: number) { this._speed = newValue; }
    private _alpha:number;          get Alpha(): number { return this._alpha; }                 set Alpha(newValue: number) { this._alpha = newValue; }
    private _scale:number;          get Scale(): number { return this._scale; }                 set Scale(newValue: number) { this._scale = newValue; }
    private _damages:number;        get Damages(): number { return this._damages; }             set Damages(newValue: number) { this._damages = newValue; }
    private _spellHitRange:number;  get SpellHitRange(): number { return this._spellHitRange; } set SpellHitRange(newValue: number) { this._spellHitRange = newValue; }
    private _isLaunched:boolean;    get IsLaunched(): boolean { return this._isLaunched; }      set IsLaunched(newValue: boolean) { this._isLaunched = newValue; }
    private _spellName:string;      get SpellName(): string { return this._spellName; }         set SpellName(newValue: string) { this._spellName = newValue; }

    private _typeSpell:SpellType;   get TypeSpell():SpellType{ return this._typeSpell; }        set TypeSpell(newValue: SpellType) { this._typeSpell = newValue; }
    private _sounds:number[];       get Sounds():number[]{ return this._sounds; }               set Sounds(newValue: number[]) { this._sounds = newValue; }

    private _positionX: number;     get PositionX(): number { return this._positionX; }         set PositionX(newValue: number) { this._positionX = newValue; }
    private _positionY: number;     get PositionY(): number { return this._positionY; }         set PositionY(newValue: number) { this._positionY = newValue; }
    private _positionZ: number;     get PositionZ(): number { return this._positionZ; }         set PositionZ(newValue: number) { this._positionZ = newValue; }

    private _caster:Creature;       get Caster(): Creature { return this._caster; }             set Caster(newValue: Creature) { this._caster = newValue; }
    private _target:Creature;       get Target(): Creature { return this._target; }             set Target(newValue: Creature) { this._target = newValue; }

    private _typeCast: SpellTargetType;
    private _hitFinalTarget:boolean;

    private _sprite:Phaser.Sprite;  get Sprite(): Phaser.Sprite { return this._sprite; }

    private InitilializeDefault(){
        this._guid = Guid.newGuid();
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

    public Launch(){
        this._sprite = SimpleGame.overlays.Item(this._positionZ.toString()).create(this._positionX, this._positionY, 'model_' + this._modelId);
        
        this._sprite.position.x = this._sprite.position.x - (this._sprite.width / 2);
        this._sprite.position.y = this._sprite.position.y - (this._sprite.height / 2);

        SimpleGame.game.physics.enable(this._sprite, Phaser.Physics.ARCADE);
        this._sprite.scale.setTo(this._scale, this._scale);
    }

    public PlaySound(soundId : number){
        SimpleGame.game.add.audio('sound_' + soundId).play();
    }

    public Dispose(){
        this._caster.SpellList.Remove(this.Guid);
        this._sprite.destroy();
    }

    private _targetTween  : Phaser.Tween;
    
    public Update(gameTime:number){
        if(!this._isLaunched){
            this._isLaunched = true;
            if(this._sounds[SpellSounds.SOUND_LAUNCH] != undefined){
                this.PlaySound(this._sounds[SpellSounds.SOUND_LAUNCH]);
            }

            switch(this._typeCast){
                case SpellTargetType.SPELL_TYPE_SELF:
                    break;
                case SpellTargetType.SPELL_TYPE_TARGET:

                    this._targetTween = SimpleGame.game.add.tween(this.Sprite);
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
}