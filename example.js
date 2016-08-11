var request = require("request")
var readMi = require("mineimator-reader")
request.get({ url: "https://www.dropbox.com/s/7t6cjul1y8j0c2y/Name.mproj?dl=1", encoding: null }, function(error, response, body) {
    readMi.readMineimator(body).then((output) => console.log(output))        
})