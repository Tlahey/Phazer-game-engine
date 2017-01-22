import { ScriptedSpell } from './../Logical/ScriptedSpell';
import { Spell } from './../Model/Spell';
import { ScriptedCreature } from './../Logical/ScriptedCreature';
import { Flags } from './../Logical/Flags';
import { Creature, CreatureFlags } from './../Model/Creature';
import { SimpleGame } from './../../app';
import { ICreature_db, ICreatureTemplate_db, IModel_db, ISound_db, ISpell_db, IText_db } from './DatabaseModel';
import { Dictionary } from './../Utils/Dictionnary';


export class DatabaseSingleton {

    private static _instance:DatabaseSingleton = new DatabaseSingleton();

    constructor() {
        if(DatabaseSingleton._instance){
            throw new Error("Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.");
        }
        DatabaseSingleton._instance = this;
        DatabaseSingleton._instance._instanceScriptedCreature = new ScriptedCreature();
        DatabaseSingleton._instance._instanceScriptedSpell = new ScriptedSpell();
    }

    public static getInstance():DatabaseSingleton
    {
        return DatabaseSingleton._instance;
    }

    private _instanceScriptedCreature: ScriptedCreature;
    private _instanceScriptedSpell: ScriptedSpell;

    public creatures_db : Dictionary<ICreature_db>;
    public creaturesTemplate_db: Dictionary<ICreatureTemplate_db>;
    public models_db: Dictionary<IModel_db>;
    public sounds_db: Dictionary<ISound_db>;
    public spells_db: Dictionary<ISpell_db>;
    public texts_db: Dictionary<IText_db>;

    private _gameCreatures : Dictionary<Creature>;  get GameCreature():Dictionary<Creature>{return this._gameCreatures;}
    private _gameGroups : Dictionary<any>; 

    private getDatabaseInformations(databasePath:string, callbackFunction : (XPathResult) => void){
        var request = new XMLHttpRequest();
        request.onload = callbackFunction;
        request.open("get", databasePath, true);
        request.send();
    }

    private InitializeCreature(item:ICreature_db) : Creature{
        let tempCT = this.creaturesTemplate_db.Item(item.Entry.toString());
        let cFlags : Flags = new Flags(tempCT.Flags);

        let cre : Creature = (tempCT.ScriptName) ? Object.create(this._instanceScriptedCreature.ScriptedCreature.find(x => x.ScriptName == tempCT.ScriptName)) : new Creature();

        cre.Entry = item.Entry;         // identifiant du type de créature
        cre.ModelId = tempCT.ModelId;   // Modèle de la créature
        cre.Lifes = tempCT.Lifes;       // Nombre de vie
        cre.PositionX = item.PositionX;                                         // Position X de la créature
        cre.PositionY = item.PositionY;                                         // Position Y de la créature
        cre.PositionZ = item.PositionZ;                                         // Position Z de la créature
        cre.SpeedRun = tempCT.SpeedRun;                                         // Vitesse de course de la créature
        cre.SpeedWalk = tempCT.SpeedWalk;                                       // Vitesse de marche de la créature
        cre.Scale = tempCT.Scale;                                               // Taille de l'image
        cre.Alpha = tempCT.Alpha;                                               // Opacité de l'image
        cre.Freeze = cFlags.Contains(CreatureFlags.CREATURE_FREEZE);            // La créature bouge ?
        cre.Invisible = cFlags.Contains(CreatureFlags.CREATURE_INVISIBLE);      // Affiche le sprite de la créature
        
        // cre.DeplacementNonNormalise = cFlags.Contains(CreatureFlags.CREATURE_MOVE_NOT_NORMALIZED);  // Vitesse normalisée de la créature
        //cre.ScriptName = tempCT.ScriptName;                                     // ScriptName de la créature (pas obligatoire)
        // cre.Sounds = new Sounds(tempCT.SoundsID.FindElements(_dbSounds), game.Content); // TODO Throw error si Sounds < 2
        // cre.TypeCreature = Type_Creature.TYPE_CREATURE_CREATURE;
        // Texts = new Texts(tempCT.TextsID.FindElements(_dbTexts), game.Content),
        
        return cre;
    }

    public InitializeWorld():void{
        this.creatures_db.Values().forEach(creat => {
            this.AddCreature(creat.Value);
        });
    }

    public GetSpell(spellId:number) : Spell{
        let tempSP = this.spells_db.Item(spellId.toString());
        let spe : Spell = (tempSP.SpellScriptName) ? Object.create(this._instanceScriptedSpell.ScriptedSpell.find(x => x.ScriptName == tempSP.SpellScriptName)) : new Spell();

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

    public AddCreature(creat : ICreature_db) : Creature{
        let newCreature = this.InitializeCreature(creat);
        newCreature.Initialize();
        this._gameCreatures.Add(newCreature.Guid, newCreature);    
        return newCreature;
    }

    public createDbObjects() : Promise<void[]>{
    
        this._gameCreatures = new Dictionary<Creature>();

        var promises : Promise<void>[] = [];

        // CREATURE
        promises.push(new Promise<void>(resolve => {
            this.creatures_db = new Dictionary<ICreature_db>();
            this.getDatabaseInformations("./src/Assets/Database/Creature.json", (result) => {
                (JSON.parse(result.target.responseText) as ICreature_db[]).forEach((el) => {
                    this.creatures_db.Add(el.Entry.toString(), el);
                });
                resolve();
            });
        }));

        // CREATURE TEMPLATE
        promises.push(new Promise<void>(resolve => {
            this.creaturesTemplate_db = new Dictionary<ICreatureTemplate_db>();
            this.getDatabaseInformations("./src/Assets/Database/CreatureTemplate.json", (result) => {
                (JSON.parse(result.target.responseText) as ICreatureTemplate_db[]).forEach((el) => {
                    this.creaturesTemplate_db.Add(el.Entry.toString(), el);
                });
                resolve();
            });
        }));

        // MODELS
        promises.push(new Promise<void>(resolve => {
            this.models_db = new Dictionary<IModel_db>();
            this.getDatabaseInformations("./src/Assets/Database/Models.json", (result) => {
                (JSON.parse(result.target.responseText) as IModel_db[]).forEach((el) => {
                    this.models_db.Add(el.Id.toString(), el);
                });
                resolve();
            });
        }));

        // SOUNDS
        promises.push(new Promise<void>(resolve => {
            this.sounds_db = new Dictionary<ISound_db>();
            this.getDatabaseInformations("./src/Assets/Database/Sounds.json", (result) => {
                (JSON.parse(result.target.responseText) as ISound_db[]).forEach((el) => {
                    this.sounds_db.Add(el.Id.toString(), el);
                });
                resolve();
            });
        }));

        // SPELLS 
        promises.push(new Promise<void>(resolve => {
            this.spells_db = new Dictionary<ISpell_db>();
            this.getDatabaseInformations("./src/Assets/Database/Spells.json", (result) => {
                (JSON.parse(result.target.responseText) as ISpell_db[]).forEach((el) => {
                    this.spells_db.Add(el.Id.toString(), el);
                });
                resolve();
            });
        }));

        // TEXTS
        promises.push(new Promise<void>(resolve => {
            this.texts_db = new Dictionary<IText_db>();
            this.getDatabaseInformations("./src/Assets/Database/Texts.json", (result) => {
                (JSON.parse(result.target.responseText) as IText_db[]).forEach((el) => {
                    this.texts_db.Add(el.Id.toString(), el);
                });
                resolve();
            });
        }));

        return Promise.all(promises);

    }
}