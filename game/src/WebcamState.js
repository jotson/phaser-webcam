var WebcamState = function(game) {
};

WebcamState.prototype.preload = function() {
    game.load.atlasJSONHash('sprites', 'assets/gfx/atlas/sprites.png', 'assets/gfx/atlas/sprites.json');

    game.load.audio('click', ['assets/sfx/click.ogg', 'assets/sfx/click.mp3']);

    game.stage.smoothed = false;
};

WebcamState.prototype.create = function() {
    game.stage.backgroundColor = G.backgroundColor;

    this.clickSound = game.add.sound('click', 0.8);

    this.pixelSize = 5;

    // Setup camera
    this.camBitmap = game.add.bitmapData(G.camWidth, G.camHeight, 'cam');
    this.cam = new Phaser.Plugin.Webcam(game, this);
    this.cam.start(this.camBitmap.width, this.camBitmap.height, this.camBitmap.context);
    game.add.plugin(this.cam);

    // Setup working canvas
    this.pixelBitmap = game.add.bitmapData(game.width, game.height);

    // Setup final display surface
    this.surface = game.add.sprite(0, 0, this.pixelBitmap);

    // Add UI
    this.ui = game.add.group();
    game.add.image(0, game.height/2 - 21, 'sprites', 'button-panel.png', this.ui);
    this.button = game.add.sprite(game.width/4, game.height/2-22, 'sprites', 'button-01.png', this.ui);
    this.button.anchor.set(0.5);
    this.button.animations.add('shine', Phaser.Animation.generateFrameNames('button-', 1, 6, '.png', 2), 15);
    this.button.animations.play('shine');
    this.ui.scale.set(2);

    // Add countdown
    this.countdown = game.add.sprite(game.width/2, game.height/2, 'sprites', 'countdown-01.png');
    this.countdown.anchor.set(0.5);
    this.countdown.animations.add('go', Phaser.Animation.generateFrameNames('countdown-', 1, 3, '.png', 2), 2);
    this.countdown.visible = false;
    this.countdown.scale.set(2);

    // Create flash
    this.flash = game.add.graphics(0, 0);
    this.flash.beginFill(0xffffff, 1);
    this.flash.drawRect(0, 0, game.width, game.height);
    this.flash.endFill();
    this.flash.alpha = 0;

    // Flags for taking picture
    this.takePicture = false;
};

WebcamState.prototype.update = function() {
    this.pixelate();

    var countdownPlaying = this.countdown.animations.currentAnim.isPlaying;

    if (!countdownPlaying && this.takePicture) {
        this.clickSound.play();

        var data = this.pixelBitmap.canvas.toDataURL();
        document.getElementById('output').style.display = "block";
        document.getElementById('shot-full').src = data;
        document.getElementById('shot-120').src = data;
        document.getElementById('shot-72').src = data;
        document.getElementById('shot-48').src = data;

        this.countdown.visible = false;
        this.takePicture = false;
        this.ui.visible = true;
        this.button.animations.play('shine');
        
        // Flash
        this.flash.alpha = 1;
        game.add.tween(this.flash)
            .to({ alpha: 0 }, 250)
            .start();
    }

    if (!countdownPlaying && this.input.activePointer.isDown) {
        this.countdown.alpha = 1;
        this.countdown.scale.set(2);
        this.countdown.visible = true;
        this.countdown.animations.play('go');

        this.add.tween(this.countdown.scale)
            .to({ x: 5, y: 5 }, 500, Phaser.Easing.Cubic.In)
            .repeat(2)
            .start();
        this.add.tween(this.countdown)
            .to({ alpha: 0 }, 500, Phaser.Easing.Cubic.In)
            .repeat(2)
            .start();

        this.ui.visible = false;
        this.takePicture = true;
    }
};

WebcamState.prototype.pixelate = function() {
    var offsetX = G.camWidth/2 - game.width/2;
    var offsetY = G.camHeight/2 - game.height/2;

    var pxContext = this.pixelBitmap.context;

    this.camBitmap.update();

    var pixel = Phaser.Color.createColor();

    for(var x = 0; x < game.width; x += this.pixelSize) {
        for(var y = 0; y < game.height; y += this.pixelSize) {
            // Sample color at x+offsetX,y+offsetY in camBitmap
            this.camBitmap.getPixel(Math.floor(x + offsetX), Math.floor(y + offsetY), pixel);

            // Modify color
            this.posterize(pixel, 16);
            this.grayscale(pixel);
            this.tint(pixel, 1, 1.5, 1.8);

            // Draw pixel at x,y in new bitmap
            pxContext.fillStyle = "rgb(" + pixel.r + "," + pixel.g + "," + pixel.b + ");"
            pxContext.fillRect(x, y, this.pixelSize, this.pixelSize);
        }
    }
    
    this.camBitmap.dirty = true;
    this.pixelBitmap.dirty = true;
};

WebcamState.prototype.grayscale = function(pixel) {
    var c = Phaser.Color.RGBtoHSV(pixel.r, pixel.g, pixel.b);
    c.s = 0;
    Phaser.Color.HSVtoRGB(c.h, c.s, c.v, pixel);
};

WebcamState.prototype.tint = function(pixel, r, g, b) {
    pixel.r = Math.floor(pixel.r * r);
    pixel.g = Math.floor(pixel.g * g);
    pixel.b = Math.floor(pixel.b * b);
};

WebcamState.prototype.posterize = function(pixel, colors) {
    // Posterize
    var divisor = 256 / colors;
    pixel.r = Math.floor(Math.floor(pixel.r / divisor) * divisor);
    pixel.g = Math.floor(Math.floor(pixel.g / divisor) * divisor);
    pixel.b = Math.floor(Math.floor(pixel.b / divisor) * divisor);

    // Contrast
    var thresh = 90;
    var lowThresh = 50;
    var highThresh = 220;
    var amount = 30;
    if (pixel.r > highThresh) pixel.r = 255;
    if (pixel.r > thresh) pixel.r += amount;
    if (pixel.r < thresh) pixel.r -= amount;
    if (pixel.r < lowThresh) pixel.r = 0;

    if (pixel.g > highThresh) pixel.g = 255;
    if (pixel.g > thresh) pixel.g += amount;
    if (pixel.g < thresh) pixel.g -= amount;
    if (pixel.g < lowThresh) pixel.g = 0;

    if (pixel.b > highThresh) pixel.b = 255;
    if (pixel.b > thresh) pixel.b += amount;
    if (pixel.b < thresh) pixel.b -= amount;
    if (pixel.b < lowThresh) pixel.b = 0;
};
