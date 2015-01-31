# Build instructions

The build process creates the the texture atlases, creates a minified version of the code, and creates a zip file of the packaged game. But you can also just run `grunt atlas` to regenerate the texture atlases and run the game directly from the game directory with `grunt connect`.

Requires node and grunt.

1. Install dependencies: `npm install`
2. Build: `grunt build`

Clean the build with `grunt clean`.
Build the texture atlases with `grunt atlas`.
Run a minimal web server to launch the game with `grunt connect`.
