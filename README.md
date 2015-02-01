# Phaser webcam demo

[View a live demo.](http://jotson.github.io/phaser-webcam/)

For best results:

1. Have good lighting
2. Click the red button
3. Right-click photos to save them

This demo was intended for desktop. Performance isn't great on mobile.

Created by [@yafd](http://twitter.com/yafd) with [Phaser](http://phaser.io).

Copyright © 2015 [John Watson](http://flagrantdisregard.com). Licensed under MIT license.

# Build instructions

The build process creates the the texture atlas from the png images in the gfx folder and ogg and mp3 files from the wavs in the sfx folder. But you can also just run `grunt atlas` to regenerate the texture atlases and run the game directly from the game directory with `grunt connect`.

I've only tested the build on my Ubuntu 14.10 desktop. It may not work other places. In particular, it has a dependency on `avconv` for building the mp3 and ogg files.

Requires node and grunt.

1. Install dependencies: `npm install`
2. Build: `grunt build`

Clean the build with `grunt clean`.
Build the texture atlases with `grunt atlas`.
Build the sound effects with `grunt sfx`.
Run a minimal web server to launch the game with `grunt run`. This will also enable a watch and automatically rebuild the atlas or sounds if the sources change.
