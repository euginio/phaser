/// <reference path="phaser.comments.d.ts" />;

var game = new Phaser.Game(600, 300, Phaser.CANVAS, 'game', 
				{ preload: preload, create: create, update: update });

function preload() {

    game.stage.backgroundColor = '#85b5e1';

    // this.game.load.baseURL = 'http://examples.phaser.io/assets/';
    // this.game.load.crossOrigin = 'anonymous';

    this.game.load.spritesheet('zombie', 'img/zombie_sheet.png', 46, 49)
    
    this.game.load.spritesheet('brain', 'img/brain.png', 81, 61);
    this.game.load.image('soapBubble', 'img/soap-bubbles.jpg', 25,25);

}


var brain;
var soapBubbles;
var cursors;
var jumpButton;
var westZombies;
var eastZombies;
var zombieBaseVelocity = 50;
var score = 0;
var scoreString = '';
var scoreText;

function create() {  
    brain = game.add.sprite(this.game.width/2, this.game.height/2, 'brain');
    this.game.physics.arcade.enable(brain);
    brain.animations.add('aeten');
    brain.body.immovable = true;
    
    soapBubbles = game.add.group();
    soapBubbles.enableBody=true;

    westZombies = game.add.group();
    westZombies.enableBody = true;
    
    eastZombies = game.add.group();
	eastZombies.enableBody = true;

    westZombies.setAll('outOfBoundsKill', true);
    westZombies.setAll('checkWorldBounds', true);
    eastZombies.setAll('outOfBoundsKill', true);
    eastZombies.setAll('checkWorldBounds', true);

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });
    
    cursors = this.game.input.keyboard.createCursorKeys();
    jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function zombieOut() {
    score += 20;
    scoreText.text = scoreString + score;
}

var newZombieTime=0;
var timeEating=-1;

function update () {
    if (this.game.time.now > newZombieTime && eastZombies.length + westZombies.length < 2)
    {
    	var westZombie = westZombies.create(50, this.game.height/2, 'zombie');
        westZombie.animations.add('walk-right', [5,11,17]);
        westZombie.play('walk-right', 7, true);
	   
        var eastZombie = eastZombies.create(this.game.width - 50, this.game.height/2, 'zombie');
        eastZombie.animations.add('eatenBrain',null, 7);
        eastZombie.animations.add('walk-left', [4,10,16]);
        eastZombie.play('walk-left', 7, true);

        eastZombie.events.onOutOfBounds.add(zombieOut, this);
        westZombie.events.onOutOfBounds.add(zombieOut, this);

        newZombieTime = this.game.time.now + 1200;

    }

	westZombies.setAll('body.velocity.x', zombieBaseVelocity);
    eastZombies.setAll('body.velocity.x', -zombieBaseVelocity);	    
     
    
    this.game.physics.arcade.collide(eastZombies, brain, function(brain, zombie){
        zombie.animations.stop('walk-left');
        zombie.animations.play('eatenBrain');
        brain.play('aeten', 7, true);

    	//change this logic for one where brain has live points
    	if (timeEating == -1) { timeEating = game.time.now };
    	if (game.time.now > timeEating + 3000) {
        	//location.reload();
    	}
    });
    this.game.physics.arcade.collide(westZombies, brain, function(){
        //location.reload();
    });
    
    
    if (cursors.left.isDown)
    {
        westZombies.setAll('body.velocity.x',-(zombieBaseVelocity-35));
        // eastZombies.setAll('body.velocity.x',-(zombieBaseVelocity-35));
    }

    if (cursors.right.isDown)
    {
        // westZombies.setAll('body.velocity.x', zombieBaseVelocity);
        eastZombies.setAll('body.velocity.x', zombieBaseVelocity-35);
    }

    if (game.input.activePointer.isDown){
        soapFloor();
    }

     gyro.frequency = 10;
    // start gyroscope detection
      gyro.startTracking(function(o) {
           // updating player velocity
           //player.body.velocity.x += o.gamma/20;
                   westZombies.setAll('body.velocity.x', o.gamma);
                   eastZombies.setAll('body.velocity.x', o.gamma);
    scoreText.text=o.gamma/20;

      });   

}

function soapFloor(){
    var newSoap = soapBubbles.create(game.input.x, game.input.y, 'soapBubble');
    newSoap.width=newSoap.height=25;
}

function render () {
    
}