import { SimpleGame } from './../../../app';
import { Creature } from './../Creature';

export class npc_hiboux extends Creature {
    constructor(){
        super("npc_hiboux");
    }

    // SOUND [0 - n]
    HIBOUX_FLY_OUT = 0;
    HIBOUX_FLY_ON = 1;
    HIBOUX_RWOU_1 = 2;
    HIBOUX_RWOU_2 = 3;

    // ACTIONS [0 - n]
    ACTION_MOVE_LEFT = 1;
    ACTION_MOVE_RIGHT = 2;
    ACTION_SPEAK = 3;
    ACTION_SUMMON_LOGO = 4;
    ACTION_UNSUMMON_LOGO = 5;

    // NPC [1 - n]
    NPC_PLUME = 3;
    NPC_LOGO_ZELDA = 4;

    // POSITION [1 - n]
    POSITION_LEFT = 1;
    POSITION_RIGHT = 2;

    SPELL_BOULE_DE_FEU = 1;
    SPELL_FADEIN = 2;
    SPELL_FADEOUT = 3;


    private _nbRwou : number = 0;
    private _logo : Creature;

    public Initialize(){
        super.Initialize();
        this.Events.ScheduleEvent(this.POSITION_LEFT, 600);
    }

    public DoAction(action: number) : void{

        switch(action){
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

    public MovementInform(id : number) : void{
        switch(id){
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

    public OnSummon(creature: Creature) : void{
        switch(creature.Entry){
            case this.NPC_PLUME:
                break;
            case this.NPC_LOGO_ZELDA:
                this._logo = creature;
                this.DoCast(this.SPELL_FADEIN, creature);
                break;
        }
    }

    public Update(gameTime:number) : void{
        super.Update(gameTime);

        switch(this.Events.ExecuteEvent()){
            case this.ACTION_MOVE_LEFT:
                this.DoAction(this.ACTION_MOVE_LEFT);
                break;
            case this.ACTION_SPEAK:
                if(this._nbRwou < 8)
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
}