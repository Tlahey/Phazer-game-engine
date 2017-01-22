"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Creature_1 = require('../Creature');
var app_1 = require('../../../app');
var npc_cloud = (function (_super) {
    __extends(npc_cloud, _super);
    function npc_cloud() {
        _super.call(this, "npc_cloud");
    }
    npc_cloud.prototype.Intitialise = function () {
        _super.prototype.Initialize.call(this);
        app_1.SimpleGame.game.load.atlas('enemy', '../../Assets/Sprites/enemy-tanks.png', '../../Assets/Sprites/tanks.json');
        var x, y = 0;
        this.shadow = app_1.SimpleGame.game.add.sprite(x, y, 'enemy', 'shadow');
        this.tank = app_1.SimpleGame.game.add.sprite(x, y, 'enemy', 'tank1');
        this.turret = app_1.SimpleGame.game.add.sprite(x, y, 'enemy', 'turret');
        this.shadow.anchor.set(0.5);
        this.tank.anchor.set(0.5);
        this.turret.anchor.set(0.3, 0.5);
    };
    return npc_cloud;
}(Creature_1.Creature));
exports.npc_cloud = npc_cloud;
//# sourceMappingURL=npc_cloud.js.map