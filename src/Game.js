/// <reference path="../tsDefinitions/phaser.comments.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// -------------------------------------------------------------------------
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        // init game
        _super.call(this, 600, 300, Phaser.CANVAS, "content", State);
    }
    return Game;
}(Phaser.Game));
var Zombie = (function (_super) {
    __extends(Zombie, _super);
    function Zombie(game, x, y, frameStartIndex, axis, axisModificator) {
        _super.call(this, game, x, y, 'zombie');
        this.ZOMBIE_SPEED = 50;
        var fsi = frameStartIndex;
        this.animations.add('eatBrain', [fsi, fsi + 1, fsi + 2]);
        this.animations.add('walk', [fsi + 3, fsi + 4, fsi + 5]);
        this.play('walk', 7, true);
        this.events.onOutOfBounds.add(this.zombieOut, this);
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
    Zombie.prototype.eatBrain = function () {
    };
    Zombie.prototype.zombieOut = function () {
        this.game.state.score += 20;
        this.game.state.scoreText.text = this.game.state.scoreString + this.game.state.score;
    };
    return Zombie;
}(Phaser.Sprite));
var NorthZombie = (function (_super) {
    __extends(NorthZombie, _super);
    function NorthZombie(game) {
        _super.call(this, game, game.width / 2, 0, 1, 'y', '-');
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
var State = (function (_super) {
    __extends(State, _super);
    function State() {
        _super.apply(this, arguments);
        this.score = 0;
        this.scoreString = '';
        this.newZombieTime = 0;
        this.timeEating = -1;
    }
    State.prototype.preload = function () {
        this.game.stage.backgroundColor = '#85b5e1';
        this.game.load.spritesheet('zombie', 'resources/img/zombie_sheet.png', 46, 49);
        this.game.load.spritesheet('brain', 'resources/img/brain.png', 81, 61);
        this.game.load.spritesheet('soapBubble', 'resources/img/soap-bubbles.jpg', 25, 25);
    };
    State.prototype.create = function () {
        this.brain = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'brain');
        this.game.physics.arcade.enable(this.brain);
        this.brain.animations.add('aeten');
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
        if (this.game.time.now > this.newZombieTime && this.zombies.length < 2) {
            var newZombie = Zombie.newRandomZombie(this.game);
            this.zombies.add(newZombie);
            this.newZombieTime = this.game.time.now + 1200;
        }
        this.game.physics.arcade.collide(this.zombies, this.brain, function (brain, zombie) {
            zombie.animations.stop('walk');
            zombie.animations.play('eatBrain');
            brain.play('aeten', 7, true);
            //change this logic for one where brain has live points
            if (this.timeEating == -1) {
                this.timeEating = this.game.time.now;
            }
            ;
            if (this.game.time.now > this.timeEating + 3000) {
            }
        });
        if (this.game.input.activePointer.isDown) {
            this.soapFloor();
        }
        this.zombies.callAll('setBaseVelocity', null);
        /*        if (this.cursors.left.isDown) {
                    this.zombies.setAll('body.velocity.x', -(this.ZOMBIE_SPEED - 35));
                    // this.zombies.setAll('body.velocity.x',-(ZOMBIE_SPEED-35));
                }
        
                if (this.cursors.right.isDown) {
                    // this.zombies.setAll('body.velocity.x', ZOMBIE_SPEED);
                    this.zombies.setAll('body.velocity.x', this.ZOMBIE_SPEED - 35);
                }*/
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