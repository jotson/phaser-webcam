Phaser.Filter.BlurX = function(game) {
    Phaser.Filter.call(this, game);

    this.uniforms.blur = { type: '1f', value: 1 / 512 };

    this.fragmentSrc = [
      "precision mediump float;",
      "varying vec2 vTextureCoord;",
      "varying vec4 vColor;",
      "uniform float blur;",
      "uniform sampler2D uSampler;",

      "void main(void) {",
        "vec4 sum = vec4(0.0);",

        "sum += texture2D(uSampler, vec2(vTextureCoord.x - 4.0*blur, vTextureCoord.y)) * 0.05;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x - 3.0*blur, vTextureCoord.y)) * 0.09;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x - 2.0*blur, vTextureCoord.y)) * 0.12;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x - blur, vTextureCoord.y)) * 0.15;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x + blur, vTextureCoord.y)) * 0.15;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x + 2.0*blur, vTextureCoord.y)) * 0.12;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x + 3.0*blur, vTextureCoord.y)) * 0.09;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x + 4.0*blur, vTextureCoord.y)) * 0.05;",

        "gl_FragColor = sum;",

      "}"
    ];

};

Phaser.Filter.BlurX.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.BlurX.prototype.constructor = Phaser.Filter.BlurX;

Object.defineProperty(Phaser.Filter.BlurX.prototype, 'blur', {

    get: function() {
        return this.uniforms.blur.value / (1/7000);
    },

    set: function(value) {
        this.uniforms.blur.value = (1/7000) * value;
    }

});

Phaser.Filter.BlurY = function(game) {
    Phaser.Filter.call(this, game);

    this.uniforms.blur = { type: '1f', value: 1 / 512 };

    this.fragmentSrc = [
      "precision mediump float;",
      "varying vec2 vTextureCoord;",
      "varying vec4 vColor;",
      "uniform float blur;",
      "uniform sampler2D uSampler;",

      "void main(void) {",
        "vec4 sum = vec4(0.0);",

        "sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 4.0*blur)) * 0.05;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 3.0*blur)) * 0.09;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0*blur)) * 0.12;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - blur)) * 0.15;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + blur)) * 0.15;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0*blur)) * 0.12;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 3.0*blur)) * 0.09;",
        "sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 4.0*blur)) * 0.05;",

        "gl_FragColor = sum;",

      "}"
    ];

};

Phaser.Filter.BlurY.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.BlurY.prototype.constructor = Phaser.Filter.BlurY;

Object.defineProperty(Phaser.Filter.BlurY.prototype, 'blur', {

    get: function() {
        return this.uniforms.blur.value / (1/7000);
    },

    set: function(value) {
        this.uniforms.blur.value = (1/7000) * value;
    }

});

Phaser.Filter.Blur = function(game) {
    Phaser.Filter.call(this, game);
    
    this.blurXFilter = new Phaser.Filter.BlurX();
    this.blurYFilter = new Phaser.Filter.BlurY();

    this.passes = [this.blurXFilter, this.blurYFilter];
};

Phaser.Filter.Blur.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.Blur.prototype.constructor = Phaser.Filter.Blur;

Object.defineProperty(Phaser.Filter.Blur.prototype, 'blur', {
    get: function() {
        return this.blurXFilter.blur;
    },
    set: function(value) {
        this.blurXFilter.blur = this.blurYFilter.blur = value;
        console.log(value);
    }
});

Phaser.Filter.Gray = function(game) {
    Phaser.Filter.call(this, game);

    this.uniforms.uBrightness = { type: '1f', value: 1.0 };

    this.fragmentSrc = [

        "precision mediump float;",

        "varying vec2       vTextureCoord;",
        "varying vec4       vColor;",
        "uniform sampler2D  uSampler;",
        "uniform float      uBrightness;",

        "void main(void) {",
            "gl_FragColor = texture2D(uSampler, vTextureCoord);",
            "gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(uBrightness * gl_FragColor.g), 1.0);",
        "}"
    ];

};

Phaser.Filter.Gray.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.Gray.prototype.constructor = Phaser.Filter.Gray;

/**
* The strength of the gray. 1 will make the object black and white, 0 will make the object its normal color
* @property gray
*/
Object.defineProperty(Phaser.Filter.Gray.prototype, 'brightness', {

    get: function() {
        return this.uniforms.uBrightness.value;
    },

    set: function(value) {
        this.uniforms.uBrightness.value = value;
    }

});

/**
* Original author of PixelateFilter: Mat Groves http://matgroves.com/ @Doormat23
* adapted for Phaser.js
*/

/**
* This filter applies a pixelate effect making display objects appear 'blocky'
* @class PixelateFilter
* @contructor
*/
Phaser.Filter.Pixelate = function(game) {

    Phaser.Filter.call(this, game);

    this.passes = [this];

    this.uniforms.pixelSize = { type: '1f', value: 30 };

    this.fragmentSrc = [

        "precision mediump float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        "uniform vec2 testDim;",
        "uniform float pixelSize;",
        "uniform sampler2D uSampler;",

        "void main(void)",
        "{",

            "vec2 coord = vTextureCoord;",
            "vec2 color = floor( ( vTextureCoord * pixelSize ) ) / pixelSize;",
            "gl_FragColor = texture2D(uSampler, color);",
        "}"
    ];
};

Phaser.Filter.Pixelate.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.Pixelate.prototype.constructor = Phaser.Filter.Pixelate;

/**
 * This a point that describes the size of the blocs. x is the width of the block and y is the the height
 * @property size
 * @type Point
 */
Object.defineProperty(Phaser.Filter.Pixelate.prototype, 'size', {

    get: function() {

        return this.uniforms.pixelSize.value;

    },

    set: function(value) {

        this.dirty = true;
        this.uniforms.pixelSize.value = value;

    }

});
