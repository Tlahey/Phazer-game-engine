/// <reference path="./../node_modules/phaser/typescript/phaser.d.ts"/>

import { Dictionary } from "./Utils/Dictionnary";

import { DatabaseSingleton } from "./DataBase/DatabaseSingleton";

export class SimpleGame {
 
    constructor() {
        SimpleGame.game = new Phaser.Game(800, 500, Phaser.AUTO, 'content', { 
            preload: this.preload, 
            create: this.create,
            update: this.update
        });
    }
 
    static game: Phaser.Game;
    static overlays : Dictionary<Phaser.Group>;

    preload() {

        // On charge l'ensemble des modèles
        var spritesPath = "./src/Assets/Sprites/";
        DatabaseSingleton.getInstance().models_db.Values().forEach(model => {
            SimpleGame.game.load.image('model_' + model.Value.Id, spritesPath + model.Value.AssetName);
        });

        var soundsPath = "./src/Assets/Sounds/";
        DatabaseSingleton.getInstance().sounds_db.Values().forEach(sound => {
            SimpleGame.game.load.audio('sound_' + sound.Value.Id, soundsPath + sound.Value.AssetName);
        });

    }

    create() {
        SimpleGame.overlays = new Dictionary<Phaser.Group>();
        for(var i = 0, ii = 10; i != ii; i++){
            SimpleGame.overlays.Add(i.toString(), SimpleGame.game.add.group());
        }
        SimpleGame.game.stage.backgroundColor = '#51a2ff';

        // A faire en dernier !
        DatabaseSingleton.getInstance().InitializeWorld();
    }
 



    update() {

        DatabaseSingleton.getInstance().GameCreature.Values().forEach(cre => {
            cre.Value.Update(SimpleGame.game.time.physicsElapsedMS);
        });

    }
}

window.onload = () => {
    DatabaseSingleton.getInstance().createDbObjects().then(() => {
        var game = new SimpleGame();
    });
};