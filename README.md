# mineimator-reader

Mine-imator is a Minecraft 3D animation software made in GameMaker, and stores its save files in .mproj files, in binary format. This is a quick and hacky module that can read a Mine-imator file, and return an object with the data that it got.

## Example

```javascript
const fs = require("fs");
const readMi = require("mineimator-reader");
const util = require("util") // Allows for the console to print nested objects instead of [Object]

fs.readFile("./someFile.mproj", function(error, data) {
    // data now contains the buffer that will be put into the function
    readMi.readFile(data, function(output, error) {
        if (error) { // there was an error
            console.log(error.stack) // tells you where the error happened
            // then deal with the error
        } else { // everything went a-ok
            console.log(util.inspect(output, {showHidden: false, depth: null})) // Allows you to see inside the nested objects
        }
    });
});
```

`output` will be an object with objects inside objects, arrays of objects, strings, numbers, booleans, it's rather messy. I can't document every last thing `output` has, because I would end up rewriting the code.

I hope the names explain themselves. If not, feel free to ask me what they are, or (for bonus points!), check the Mineimator source code and see how everything lines up.

Again, this is very nasty, and incomplete. This won't work for every file, and you'll most certainly need a handler for errors, because they will happen. 

-Flarp
