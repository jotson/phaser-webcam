var WebcamState = function(game) {
};

WebcamState.prototype.create = function() {
    game.stage.backgroundColor = G.backgroundColor;

    // Setup camera
    this.camBitmap = game.add.bitmapData(G.camWidth, G.camHeight, 'cam');
    this.cam = new Phaser.Plugin.Webcam(game, this);
    this.cam.start(this.camBitmap.width, this.camBitmap.height, this.camBitmap.context);
    game.add.plugin(this.cam);

    // Setup final display surface
    this.surface = game.add.sprite(0, 0, this.camBitmap);
    this.surface.x = game.width/2 - G.camWidth/2;
    this.surface.y = game.height/2 - G.camHeight/2;

    // Setup shaders
    this.pixelate = game.add.filter('Pixelate');
    this.pixelate.size = 40;
    this.color = game.add.filter('Gray');

    // Add shaders
    this.surface.filters = [this.pixelate];
    // this.surface.tint = 0xff9900;
};

WebcamState.prototype.update = function() {
    if (this.input.activePointer.isDown) {
        // This doesn't work if there is a filter! PIXI bug.
        var r = game.make.renderTexture(game.width, game.height);
        r.renderXY(game.world, 0, 0, false);
        console.log(r.getImage().src);

        // This doesn't work with WebGL
        // var context = game.canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
        // console.log(game.canvas.toDataURL());
    }
    this.camBitmap.dirty = true;
};
