import { Spell } from './../Model/Spell';
import { spell_fadeout } from './../Model/SpellScript/spell_fadeout';
import { spell_fadein } from './../Model/SpellScript/spell_fadein';

export class ScriptedSpell{
    private _scriptedSpell : Spell[];
    get ScriptedSpell(): Spell[] { return this._scriptedSpell; }

    constructor(){
        if(this._scriptedSpell != undefined)
            return;

        // Script Creature
        this._scriptedSpell = [];
        this._scriptedSpell.push(new spell_fadein());
        this._scriptedSpell.push(new spell_fadeout());
    }
}