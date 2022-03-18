//@ts-check

const express = require("express");
const app = express();
const path = require("path")
const axios = require('axios').default;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + "/client/index.html "))
})

app.post("/api/locations/", function(req, res) {
    var query = req.body.query;
    var url = "https://v5.bvg.transport.rest/locations?poi=false&addresses=false&query=mehringdamm"
})


app.listen(8000);