/// <reference path="../tsDefinitions/phaser.comments.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// -------------------------------------------------------------------------
var Game = /** @class */ (function (_super) {
    __extends(Game, _super);
    function Game() {
        // init game
        return _super.call(this, 600, 300, Phaser.CANVAS, "content", State) || this;
    }
    return Game;
}(Phaser.Game));
var Zombie = /** @class */ (function (_super) {
    __extends(Zombie, _super);
    function Zombie(game, x, y, frameStartIndex, axis, axisModificator) {
        var _this = _super.call(this, game, x, y, 'zombie') || this;
        _this.ZOMBIE_SPEED = 20;
        var fsi = frameStartIndex;
        _this.animations.add('eatBrain', [0, 12, 1, 13]);
        _this.animations.add('walk', [0, 6, 12, 1, 7, 13]);
        _this.play('walk', 5, true);
        _this.events.onOutOfBounds.add(_this.zombieOut, _this);
        return _this;
    }
    Zombie.newRandomZombie = function (game) {
        var aDirection = Math.abs(Math.random() * 4 * 90);
        var newZombie;
        /*        if (aDirection == 0 || aDirection == 4) {
                    newZombie = new NorthZombie(game);
                }*/
        newZombie = new NorthZombie(game);
        return newZombie;
    };
    Zombie.prototype.getZombieSpeed = function () {
        return this.ZOMBIE_SPEED;
    };
    Zombie.prototype.slowDown = function () {
        this.body.velocity.y = -this.getZombieSpeed();
    };
    Zombie.prototype.eatBrain = function () {
    };
    Zombie.prototype.zombieOut = function () {
        this.game.state.score += 20;
        this.game.state.scoreText.text = this.game.state.scoreString + this.game.state.score;
    };
    return Zombie;
}(Phaser.Sprite));
var NorthZombie = /** @class */ (function (_super) {
    __extends(NorthZombie, _super);
    function NorthZombie(game) {
        return _super.call(this, game, game.width / 2, 0, 1, 'y', '-') || this;
    }
    NorthZombie.prototype.setBaseVelocity = function () {
        this.body.velocity.y = this.getZombieSpeed();
    };
    NorthZombie.prototype.updateVelocity = function (o) {
        // updating player velocity
        this.body.velocity.y += -o.gamma;
        //for use landscape use o.beta instead of o.gamma
    };
    return NorthZombie;
}(Zombie));
// -------------------------------------------------------------------------
var State = /** @class */ (function (_super) {
    __extends(State, _super);
    function State() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.score = 0;
        _this.scoreString = '';
        _this.newZombieTime = 0;
        _this.timeEating = -1;
        return _this;
    }
    State.prototype.preload = function () {
        this.game.stage.backgroundColor = '#85b5e1';
        this.game.load.spritesheet('zombie', 'resources/img/zombie_sheet.png', 46, 49);
        this.game.load.spritesheet('brain', 'resources/img/brain.png', 81, 61);
        this.game.load.spritesheet('soapBubble', 'resources/img/ball.jpg', 25, 25);
    };
    State.prototype.create = function () {
        this.brain = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'brain');
        this.game.physics.arcade.enable(this.brain);
        this.brain.animations.add('aeten', null, 4, false);
        this.brain.body.immovable = true;
        this.soapBubbles = this.game.add.group();
        this.soapBubbles.enableBody = true;
        this.zombies = this.game.add.group();
        this.zombies.enableBody = true;
        this.zombies.setAll('outOfBoundsKill', true);
        this.zombies.setAll('checkWorldBounds', true);
        //  The score
        this.scoreString = 'Score : ';
        this.scoreText = this.game.add.text(10, 10, this.scoreString + this.score, { font: '34px Arial', fill: '#fff' });
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.game.input.onDown.add(this.goFullScreen, this);
        this.setupGyro();
    };
    State.prototype.goFullScreen = function () {
        // Stretch to fill
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        // Keep original size
        // game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
        // Maintain aspect ratio
        // game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.startFullScreen(false);
    };
    State.prototype.setupGyro = function () {
        gyro.frequency = 10;
        // start gyroscope detection
        var zom = this.zombies;
        var scoretxt = this.scoreText;
        gyro.startTracking(function (o) {
            zom.callAll('updateVelocity', null, o);
            scoretxt.text = o.beta + " " + o.gamma;
        });
    };
    State.prototype.update = function () {
        var gameTime = this.game.time.now;
        var self = this;
        if (gameTime > this.newZombieTime && this.zombies.length < 1) {
            var newZombie = Zombie.newRandomZombie(this.game);
            this.zombies.add(newZombie);
            this.newZombieTime = gameTime + 1200;
        }
        this.game.physics.arcade.collide(this.zombies, this.brain, function (brain, zombie) {
            zombie.animations.stop('walk');
            zombie.animations.play('eatBrain', 7);
            brain.play('aeten', 3, false, true);
            //change this logic for one where brain has live points
            if (self.timeEating == -1) {
                self.timeEating = gameTime;
            }
            ;
            if (gameTime > self.timeEating + 3000) {
                location.reload();
            }
        });
        if (this.game.input.activePointer.isDown) {
            this.soapFloor();
        }
        this.zombies.callAll('setBaseVelocity', null);
        if (this.cursors.up.isDown) {
            // this.zombies.setAll('body.velocity.x', -(this.ZOMBIE_SPEED - 35));
            this.zombies.callAll('slowDown', null);
            // this.zombies.setAll('body.velocity.x',-(ZOMBIE_SPEED-35));
        }
        if (this.cursors.left.isDown) {
            this.zombies.setAll('body.velocity.x', -(this.ZOMBIE_SPEED - 35));
            // this.zombies.setAll('body.velocity.x',-(ZOMBIE_SPEED-35));
        }
        if (this.cursors.right.isDown) {
            // this.zombies.setAll('body.velocity.x', ZOMBIE_SPEED);
            this.zombies.setAll('body.velocity.x', this.ZOMBIE_SPEED - 35);
        }
    };
    State.prototype.soapFloor = function () {
        var newSoap = this.soapBubbles.create(this.game.input.x, this.game.input.y, 'soapBubble');
        newSoap.width = newSoap.height = 25;
    };
    return State;
}(Phaser.State));
// -------------------------------------------------------------------------
window.onload = function () {
    new Game();
};
//# sourceMappingURL=Game.js.map