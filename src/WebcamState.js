var WebcamState = function(game) {
};

WebcamState.prototype.preload = function() {
    game.load.atlasJSONHash('sprites', 'assets/gfx/atlas/sprites.png', 'assets/gfx/atlas/sprites.json');

    game.load.audio('shutter', ['assets/sfx/shutter.ogg', 'assets/sfx/shutter.mp3']);
    game.load.audio('click', ['assets/sfx/click.ogg', 'assets/sfx/click.mp3']);
    game.load.audio('ready', ['assets/sfx/ready.ogg', 'assets/sfx/ready.mp3']);
    game.load.audio('beep', ['assets/sfx/beep.ogg', 'assets/sfx/beep.mp3']);

    game.stage.smoothed = false;
};

WebcamState.prototype.create = function() {
    game.stage.backgroundColor = G.backgroundColor;

    this.shutterSound = game.add.sound('shutter', 0.8);
    this.buttonSound = game.add.sound('click');
    this.readySound = game.add.sound('ready');
    this.beepSound = game.add.sound('beep', 0.3);

    // Setup camera
    this.camBitmap = game.add.bitmapData(G.camWidth, G.camHeight, 'cam');
    this.cam = new Phaser.Plugin.Webcam(game, this);
    this.cam.onConnect.add(this.cameraConnected, this);
    this.cam.onError.add(this.cameraError, this);
    game.add.plugin(this.cam);

    this.webcamAvailable = !(navigator.getUserMedia === undefined);
    if (!this.webcamAvailable) {
        document.getElementById('unsupported').style.display = "block";
        document.getElementById('cam').style.display = "none";
    } else {
        this.cam.start(this.camBitmap.width, this.camBitmap.height, this.camBitmap.context);
    }

    // Setup working canvas
    this.pixelBitmap = game.add.bitmapData(game.width, game.height);

    // Setup final display surface
    this.surface = game.add.sprite(0, 0, this.pixelBitmap);

    // Message to turn on the camera
    this.turnOnCamera = game.add.image(0, 0, 'sprites', 'turn-on-camera.png');
    this.turnOnCamera.scale.set(2);

    // Add UI
    this.ui = game.add.group();
    game.add.image(0, game.height/2 - 21, 'sprites', 'button-panel.png', this.ui);

    this.shutter = game.add.sprite(game.width/4, game.height/2-22, 'sprites', 'button-01.png', this.ui);
    this.shutter.anchor.set(0.5);
    this.shutter.animations.add('shine', Phaser.Animation.generateFrameNames('button-', 1, 6, '.png', 2), 15);
    this.shutter.animations.play('shine');
    this.shutter.events.onInputDown.add(this.clickShutter, this);
    this.shutter.events.onInputOver.add(function() { this.shutter.animations.play('shine'); }, this);
    this.shutter.inputEnabled = true;

    this.colorButton = game.add.sprite(game.width/2 - 39, 0, 'sprites', 'color.png', this.ui);
    this.colorButton.events.onInputDown.add(this.colorButtonClicked, this);
    this.colorButton.inputEnabled = true;

    this.grayButton = game.add.sprite(game.width/2 - 39, 0, 'sprites', 'gray.png', this.ui);
    this.grayButton.events.onInputDown.add(this.grayButtonClicked, this);
    this.grayButton.visible = false;
    this.grayButton.inputEnabled = true;

    this.tintButton = game.add.sprite(game.width/2 - 39, 40, 'sprites', 'tint.png', this.ui);
    this.tintButton.events.onInputDown.add(this.tintButtonClicked, this);
    this.tintButton.inputEnabled = true;

    this.sizeButton = game.add.sprite(game.width/2 - 39, 80, 'sprites', 'size.png', this.ui);
    this.sizeButton.events.onInputDown.add(this.sizeButtonClicked, this);
    this.sizeButton.inputEnabled = true;

    this.ui.scale.set(2);
    this.ui.visible = false;

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
    this.countdownPlaying = false;

    // Flags for options
    this.color = true;
    this.tintValue = 0;
    this.pixelSize = 5;

    this.pixelSizes = [20, 15, 10, 8, 5];
    this.tintChoices = [
        { r:1, g:1, b:1 }, // none
        { r:1, g:2, b:2 }, // cyan
        { r:1, g:1.5, b:2 }, // blue
        { r:2, g:2, b:1 }, // yellow
        { r:2, g:1, b:1 }, // red
        { r:2, g:1.5, b:1 }, // orange
        { r:1, g:2, b:1 }, // green
        { r:2, g:1, b:2 }, // purple
    ];
};

WebcamState.prototype.update = function() {
    if (!this.webcamAvailable) return;

    this.pixelate();

    this.countdownPlaying = this.countdown.animations.currentAnim.isPlaying;

    if (!this.countdownPlaying && this.takePicture) {
        this.shutterSound.play();

        var data = this.pixelBitmap.canvas.toDataURL();
        document.getElementById('output').style.display = "block";

        var images = ['shot-full', 'shot-120', 'shot-72', 'shot-48'];
        for(var i = 0; i < images.length; i++) {
            var img = document.getElementById(images[i]);
            img.src = data;
            var parent = img.parentNode;
            parent.href = data;
        }

        this.countdown.visible = false;
        this.takePicture = false;
        this.ui.visible = true;
        this.shutter.animations.play('shine');
        
        // Flash
        this.flash.alpha = 1;
        game.add.tween(this.flash)
            .to({ alpha: 0 }, 250)
            .start();
    }
};

WebcamState.prototype.cameraConnected = function() {
    this.turnOnCamera.visible = false;
    this.ui.visible = true;

    this.readySound.play();
};

WebcamState.prototype.cameraError = function() {
    document.getElementById('cam').style.display = "none";
    document.getElementById('notconnected').style.display = "block";
    document.getElementById('instructions').style.display = "none";
};

WebcamState.prototype.clickShutter = function() {
    this.buttonSound.play();

    if (!this.countdownPlaying) {
        this.countdown.alpha = 1;
        this.countdown.scale.set(2);
        this.countdown.visible = true;
        this.countdown.animations.play('go');

        this.beepSound.play();

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

WebcamState.prototype.colorButtonClicked = function() {
    this.buttonSound.play();

    this.color = false;
    this.colorButton.visible = false;
    this.grayButton.visible = true;
};

WebcamState.prototype.grayButtonClicked = function() {
    this.buttonSound.play();

    this.color = true;
    this.colorButton.visible = true;
    this.grayButton.visible = false;
};

WebcamState.prototype.tintButtonClicked = function() {
    this.buttonSound.play();

    if (this.tintValue == this.tintChoices.length-1) {
        this.tintValue = 0;
    } else {
        this.tintValue++;
    }
};

WebcamState.prototype.sizeButtonClicked = function() {
    this.buttonSound.play();

    var i = this.pixelSizes.indexOf(this.pixelSize) + 1;
    if (this.pixelSizes.length > i) {
        this.pixelSize = this.pixelSizes[i];
    } else {
        this.pixelSize = this.pixelSizes[0];
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
            this.posterizeFilter(pixel, 16);
            if (!this.color) this.grayscaleFilter(pixel);
            var tint = this.tintChoices[this.tintValue];
            this.tintFilter(pixel, tint.r, tint.g, tint.b);

            // Draw pixel at x,y in new bitmap
            pxContext.fillStyle = "rgb(" + pixel.r + "," + pixel.g + "," + pixel.b + ")"
            pxContext.fillRect(x, y, this.pixelSize, this.pixelSize);
        }
    }
    
    this.camBitmap.dirty = true;
    this.pixelBitmap.dirty = true;
};

WebcamState.prototype.grayscaleFilter = function(pixel) {
    var c = Phaser.Color.RGBtoHSV(pixel.r, pixel.g, pixel.b);
    c.s = 0;
    Phaser.Color.HSVtoRGB(c.h, c.s, c.v, pixel);
};

WebcamState.prototype.tintFilter = function(pixel, r, g, b) {
    pixel.r = Math.floor(pixel.r * r);
    pixel.g = Math.floor(pixel.g * g);
    pixel.b = Math.floor(pixel.b * b);
};

WebcamState.prototype.posterizeFilter = function(pixel, colors) {
    // Posterize
    var divisor = 256 / colors;
    pixel.r = Math.floor(Math.floor(pixel.r / divisor) * divisor);
    pixel.g = Math.floor(Math.floor(pixel.g / divisor) * divisor);
    pixel.b = Math.floor(Math.floor(pixel.b / divisor) * divisor);

    // Contrast
    var thresh = 60;
    var lowThresh = 40;
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
