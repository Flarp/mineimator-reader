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

`output` will be an object with objects inside objects, arrays of objects, strings, numbers, booleans, it's rather messy. I can't document every last thing `output` has, because I would end up rewriting the code, but I can roughly outline what it contains.

### Property `project_name`

A string that has the name of the project, if one is there. 


### Property `project_author`

A string that has the author of the project, if one is there. 


### Property `project_description`

A string that has the description of the project, if one is there.

### Properties `project_video_width` and `project_video_height`

Two numbers that return the width and height of the project in pixels.

### Property `project
