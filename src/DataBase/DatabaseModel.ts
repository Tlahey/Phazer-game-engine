export interface ICreature_db{
    Entry: number;
    PositionX: number;
    PositionY: number;
    PositionZ: number;
}

export interface ICreatureTemplate_db{
    Entry: number;
    ModelId: number;
    Name: string;
    Lifes: number;
    SpeedWalk: number;
    SpeedRun: number;
    Scale: number;
    Flags: number;
    Alpha: number;
    SoundsIds: number[];
    TextIds: number[],
    ScriptName: string;
}

export interface IModel_db{
    Id: number;
    AssetName: string;
}

export interface ISound_db{
    Id: number;
    AssetName: string;
}

export interface ISpell_db{
    Id: number;
    SpellName: string;
    ModelId: number;
    SpellType: number;
    SpellTargetType: number;
    CastTime: number;
    Range: number;
    Alpha: number;
    Damages: number;
    Speed: number;
    Scale: number;
    SpellHitRange: number;
    SoundIds: number[];
    SoundVolume: number;
    SpellScriptName: string;
}

export interface IText_db{
    Id: number;
    Text: string;
}