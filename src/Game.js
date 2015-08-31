var game = new Phaser.Game(600, 300, Phaser.CANVAS, 'game', 
				{ preload: preload, create: create, update: update });

function preload() {

    game.stage.backgroundColor = '#85b5e1';

    // this.game.load.baseURL = 'http://examples.phaser.io/assets/';
    // this.game.load.crossOrigin = 'anonymous';

    this.game.load.image('player', 'img/ball.png');
    this.game.load.image('platform', 'img/hole.png');

}


var brain;
var cursors;
var jumpButton;
var westZombies;
var eastZombies;
var zombieVelocity = 60;
var score = 0;
var scoreString = '';
var scoreText;

function create() {  
    brain = game.add.sprite(this.game.width/2, this.game.height/2, 'platform');
    this.game.physics.arcade.enable(brain);
    brain.body.immovable = true;
    
    westZombies = game.add.group();
    westZombies.enableBody = true;
    
    eastZombies = game.add.group();
	eastZombies.enableBody = true;

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
    if (this.game.time.now > newZombieTime && eastZombies.length + westZombies.length < 8)
    {
    	var westZombie = westZombies.create(50, this.game.height/2, 'player');
	    var eastZombie = eastZombies.create(this.game.width - 50, this.game.height/2, 'player');

        eastZombie.events.onOutOfBounds.add(zombieOut, this);
        westZombie.events.onOutOfBounds.add(zombieOut, this);

        newZombieTime = this.game.time.now + 1200;

    }

	westZombies.setAll('body.velocity.x', zombieVelocity);
    eastZombies.setAll('body.velocity.x', -zombieVelocity);	    

    westZombies.setAll('outOfBoundsKill', true);
    westZombies.setAll('checkWorldBounds', true);
    eastZombies.setAll('outOfBoundsKill', true);
    eastZombies.setAll('checkWorldBounds', true);

     
     
    
    this.game.physics.arcade.collide(eastZombies, brain, function(){
    	//change this logic for one where brain has live points
    	if (timeEating == -1) { timeEating = game.time.now };
    	if (game.time.now > timeEating + 3000) {
        	location.reload();
    	}
    });
    this.game.physics.arcade.collide(westZombies, brain, function(){
        //location.reload();
    });
    
    
    if (cursors.left.isDown)
    {
        westZombies.setAll('body.velocity.x',-(zombieVelocity-35));
        // eastZombies.setAll('body.velocity.x',-(zombieVelocity-35));
    }

    if (cursors.right.isDown)
    {
        // westZombies.setAll('body.velocity.x', zombieVelocity);
        eastZombies.setAll('body.velocity.x', zombieVelocity-35);
    }
}

function render () {
}