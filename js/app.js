'use strict';

//Add a function to Array to obtain a random element from it
Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)];
}

//List of some values between 0 & 1 which can be used to provide a flexible solution to decide if a new bug should be initialised
const possibleProbabilities = [0.25, 0.30, 0.40, 0.60, 0.75, 0.80];

//Store score element
let timer = document.getElementsByClassName('score')[0];

//Store winnning game popup element
let popup = document.getElementsByClassName('popup-outter')[0];
let selectorPopup = document.querySelector('.char-selector-inner');

//Possible y posns for bugs
const possibleStarterPosns = [225, 140, 55];

//Possible speeds for the bugs
let possibleSpeeds = [4, 5.25, 6];

/*
For future: to randomize collectible positions on the canvas
const allPosns = [
    [0,55],[100,55],[200,55],[300,55],[400,55],
    [0,140],[100,140],[200,140],[300,140],[400,140],
    [0,225],[100,225],[200,225],[300,225],[400,225]
];
*/

let timerInterval = null;
let difficultyInterval = null;
let gameStarted = false;

//Update score panel in  winner's screen popup
function updateStars() {
    let currentScore = timer.textContent;
    if (currentScore < 40) {
        document.querySelector('.win-star-3').style.display = 'none';
        document.querySelector('.win-star-2').style.display = 'none';
    } else if (currentScore < 80) {
        document.querySelector('.win-star-3').style.display = 'none';
    }
}

//Called when user loses the game
function endGame() {
    fadeIn(document.getElementsByClassName('popup-outter')[0], 200, 'block');
    document.querySelector('.pop-score').textContent = timer.textContent;

    updateStars();
    intervalManager(false);
    increaseDifficulty(false);
    gameStarted = false;

    document.querySelector('.refresh-container').addEventListener('click', function () {
        startNewGame();
    });
}

//Hide the winning popup
function hidePopup() {
    fadeOut(document.getElementsByClassName('popup-outter')[0], 500);
}

//Start a new game
function startNewGame() {
    hidePopup();
    timer.textContent = 0;
    document.querySelector('.win-star-3').style.display = 'inline';
    document.querySelector('.win-star-2').style.display = 'inline';
    player.resetPlayer();
}

//Custom fadeIn function other than the one provided by jQuery, taken from StackOverflow
function fadeIn(el, duration, display) {
    var s = el.style, step = 25 / (duration || 300);
    s.opacity = s.opacity || 0;
    s.display = display || "block";
    (function fade() { (s.opacity = parseFloat(s.opacity) + step) > 1 ? s.opacity = 1 : setTimeout(fade, 25); })();
}

//Custom fadeOut function other than the one provided by jQuery, taken from StackOverflow
function fadeOut(el, duration) {
    var s = el.style, step = 25 / (duration || 300);
    s.opacity = s.opacity || 1;
    (function fade() { (s.opacity -= step) < 0 ? s.display = "none" : setTimeout(fade, 25); })();
}

//Used to start and stop interval function of score panel
function intervalManager(flag) {
    if (flag) {
        timerInterval = setInterval(function () {
            timer.textContent++;
        }, 1000);
    } else {
        clearInterval(timerInterval);
    }
}

//Increase difficulty every 40 seconds
function increaseDifficulty(flag) {
    if (flag) {
        difficultyInterval = setInterval(function () {
            for (let i = 0, len = possibleSpeeds.length; i < len; i++) {
                possibleSpeeds[i] += 1.00;
            }
        }, 40000);
    } else {
        clearInterval(difficultyInterval);
        possibleSpeeds = [4, 5.25, 6];
    }
}

class Character {
    constructor(x, y, sprite) {
        this.sprite = sprite;
        this.x = x;
        this.y = y;
    }
}

// Enemies our player must avoid
class Enemy extends Character {
    constructor() {
        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        super(-100, possibleStarterPosns.randomElement(), 'images/enemy-bug.png');

        this.actualSpeed = possibleSpeeds.randomElement();
    }

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    update(dt) {
        this.x += this.actualSpeed;
        if ((player.y === this.y) && this.betweenPositions(player.x, this.x)) {
            endGame();
        }
    }

    // Draw the enemy on the screen, required method for game
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    //To check if the given params are between 40 unit co-ordinates
    betweenPositions(val1, val2) {
        if (val1 > (val2 - 40) && val1 < (val2 + 40)) {
            return true;
        }
    }
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
class Player extends Character {
    constructor(imageURL = 'images/char-cat-girl.png') {
        super(200, 310, imageURL);
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    update(dt) {
        if (this.y === -30) {
            endGame();
        }
    }

    //Reset position of player
    resetPlayer() {
        this.x = 200;
        this.y = 310;
        timer.textContent = 0;
    }

    handleInput(keycode) {
        switch (keycode) {
            case 'left':
                if (!(this.x === 0))
                    this.x -= 100;
                break;
            case 'right':
                if (!(this.x === 400))
                    this.x += 100;
                break;
            case 'up':
                //Start timer only if user moves into field
                if (!gameStarted) {
                    intervalManager(true);
                    increaseDifficulty(true);
                    gameStarted = true;
                }
                if (!(this.y < 50))
                    this.y -= 85;
                break;
            case 'down':
                if (!(this.y > 200))
                    this.y += 85;
                break;
        }
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
let allEnemies = [];

//Initialise a default player
let player = new Player('images/char-cat-girl.png');

//Create a new bug depending on the element selected from the probability Array which contains a list of probabilities
setInterval(function () {
    let probability = possibleProbabilities.randomElement();
    if (probability > 0.50) {
        allEnemies.push(new Enemy());
    }
}, 500);

//Charactor selection listener
$('.char-selector-inner').click(function (event) {
    player = new Player(event.target.getAttribute("data-value"));
    player.render();

    fadeOut(document.querySelector('.char-selector-outter'), 200);
});

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener("keyup", function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});