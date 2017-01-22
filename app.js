/// <reference path="./node_modules/phaser/typescript/phaser.d.ts"/>
"use strict";
var npc_cloud_1 = require("./src/Model/CreatureScript/npc_cloud");
var SimpleGame = (function () {
    function SimpleGame() {
        SimpleGame.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {
            preload: this.preload,
            create: this.create,
            update: this.update
        });
    }
    SimpleGame.prototype.preload = function () {
        // this.game.load.image('logo', 'phaser2.png');
    };
    SimpleGame.prototype.create = function () {
        // var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
        // logo.anchor.setTo(0.5, 0.5);
        var npc = new npc_cloud_1.npc_cloud();
    };
    SimpleGame.prototype.update = function () {
        // console.log("ok");
    };
    return SimpleGame;
}());
exports.SimpleGame = SimpleGame;
window.onload = function () {
    game = new SimpleGame();
};
//# sourceMappingURL=app.js.map