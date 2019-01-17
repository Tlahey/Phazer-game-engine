import { Creature } from '../Creature';

export class npc_cloud extends Creature {

    constructor(){
        super("npc_cloud");
    }

    private getRandom(min: number, max: number){
        return Math.random() * (max - min) + min;
    }

    public Initialize() : void{
        super.Initialize();
    }

    public Update(gameTime:number):void{
        super.Update(gameTime);
        if(!super.isMoving){
            super.Move(800, this.getRandom(0, 500));
            super.MoveTo(-300, super.Sprite.position.y);
        }
    }
}