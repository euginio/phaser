/// <reference path="../tsDefinitions/phaser.comments.d.ts" />

// -------------------------------------------------------------------------
class Game extends Phaser.Game {
    constructor() {
        // init game
        super(600, 300, Phaser.CANVAS, "content", State);
    }
}

abstract class Zombie extends Phaser.Sprite {
    private ZOMBIE_SPEED: number = 50;
    private eatSpeed: number;
    private direction: number;

    private sprites: any;

    public constructor(game: Phaser.Game, x: number, y: number, frameStartIndex: number, axis: string, axisModificator: string) {
        super(game, x, y, 'zombie');

        var fsi = frameStartIndex;
        this.animations.add('eatBrain', [fsi, fsi + 1, fsi + 2]);
        this.animations.add('walk', [fsi + 3, fsi + 4, fsi + 5]);
        this.play('walk', 7, true);

        this.events.onOutOfBounds.add(this.zombieOut, this);
    }

    public static newRandomZombie(game: Phaser.Game) {
        var aDirection = Math.abs(Math.random() * 4 * 90);
        var newZombie: Zombie;
        /*        if (aDirection == 0 || aDirection == 4) {
                    newZombie = new NorthZombie(game);
                }*/
        newZombie = new NorthZombie(game);
        return newZombie;
    }

    getZombieSpeed() {
        return this.ZOMBIE_SPEED;
    }

    eatBrain() {

    }

    zombieOut() {
        this.game.state.score += 20;
        this.game.state.scoreText.text = this.game.state.scoreString + this.game.state.score;
    }
}

class NorthZombie extends Zombie {

    public constructor(game: Phaser.Game) {
        super(game, game.width / 2, 0, 1, 'y', '-');
    }

    setBaseVelocity() {
        this.body.velocity.y = this.getZombieSpeed();
    }

    updateVelocity(o: any) {
        // updating player velocity
        this.body.velocity.y += -o.gamma;
        //for use landscape use o.beta instead of o.gamma
    }

}

// -------------------------------------------------------------------------
class State extends Phaser.State {
    private brain: Phaser.Sprite;
    private soapBubbles: Phaser.Group;
    private zombies: Phaser.Group;
    private cursors: Phaser.CursorKeys;

    public score: number = 0;
    public scoreString: string = '';
    public scoreText: Phaser.Text;

    private newZombieTime: number = 0;
    private timeEating: number = -1;


    preload() {
        this.game.stage.backgroundColor = '#85b5e1';
        this.game.load.spritesheet('zombie', 'resources/img/zombie_sheet.png', 46, 49)
        this.game.load.spritesheet('brain', 'resources/img/brain.png', 81, 61);
        this.game.load.spritesheet('soapBubble', 'resources/img/soap-bubbles.jpg', 25, 25);
    }

    create() {


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
    }

    goFullScreen() {
        // Stretch to fill
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

        // Keep original size
        // game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;

        // Maintain aspect ratio
        // game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

        this.game.scale.startFullScreen(false);
    }

    setupGyro() {
        gyro.frequency = 10;
        // start gyroscope detection
        var zom = this.zombies;
        var scoretxt = this.scoreText;
        gyro.startTracking(function (o) {
            zom.callAll('updateVelocity', null, o);
            scoretxt.text = o.beta + " " + o.gamma;
        });
    }

    update() {
        if (this.game.time.now > this.newZombieTime && this.zombies.length < 2) {
            var newZombie: Zombie = Zombie.newRandomZombie(this.game);
            this.zombies.add(newZombie);
            this.newZombieTime = this.game.time.now + 1200;

        }
        this.game.physics.arcade.collide(this.zombies, this.brain, function (brain, zombie) {
            zombie.animations.stop('walk');
            zombie.animations.play('eatBrain');
            brain.play('aeten', 7, true);

            //change this logic for one where brain has live points
            if (this.timeEating == -1) { this.timeEating = this.game.time.now };
            if (this.game.time.now > this.timeEating + 3000) {
                //location.reload();
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
    }

    soapFloor() {
        var newSoap = this.soapBubbles.create(this.game.input.x, this.game.input.y, 'soapBubble');
        newSoap.width = newSoap.height = 25;
    }

}

// -------------------------------------------------------------------------
window.onload = () => {
    new Game();
};