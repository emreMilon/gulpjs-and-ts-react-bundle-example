let express = require("express");
let app = express()

app.use(express.static(__dirname + "/../dist"))

let server = app.listen(8000, () => {
    console.log("Server started and listening on port 8000")
})