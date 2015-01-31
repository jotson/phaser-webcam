var BootState = function(game) {
};

BootState.prototype.preload = function() {
};

BootState.prototype.create = function() {
    if (game.device.desktop) {

    } else {

    }

    game.time.desiredFps = 30;

    game.stage.backgroundColor = G.backgroundColor;

    // Keyboard capture
    game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.SPACEBAR
    ]);

    // Focus game
    game.canvas.setAttribute('tabindex', '1');
    game.canvas.focus();

    game.state.start('webcam');
};

BootState.prototype.update = function() {
};

var game;
window.onload = function() {
    game = new Phaser.Game(G.width, G.height, Phaser.CANVAS, 'cam');

    game.state.add('boot', BootState, true);
    game.state.add('webcam', WebcamState, false);
};
