import { Spell } from './../Spell';
import { SimpleGame } from '../../simpleGame';
export class spell_fadeout extends Spell {


    constructor(){
        super("spell_fadeout");
    }

    public Update(gameTime:number){
        if(!this.IsLaunched){
            var tween = SimpleGame.game.add.tween(this.Target.Sprite);
            tween.to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
            tween.interpolation(Phaser.Math.linearInterpolation);
            tween.onComplete.add(() => {
                this.Dispose();
            }, this);
        }
        super.Update(gameTime);
    }
}