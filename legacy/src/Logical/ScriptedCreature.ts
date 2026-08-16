import { npc_hiboux } from './../Model/CreatureScript/npc_hiboux';
import { npc_cloud } from './../Model/CreatureScript/npc_cloud';
import { Dictionary } from './../Utils/Dictionnary';
import { Creature } from './../Model/Creature';

export class ScriptedCreature{
    private _scriptedCreature : Creature[];
    get ScriptedCreature(): Creature[] { return this._scriptedCreature; }

    constructor(){
        if(this._scriptedCreature != undefined)
            return;

        // Script Creature
        this._scriptedCreature = [];
        this._scriptedCreature.push(new npc_cloud());
        this._scriptedCreature.push(new npc_hiboux());
    }
}