//@ts-check

const express = require("express");
const app = express();
const path = require("path")
const axios = require('axios').default;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + "/client/index.html"))
});

app.get('/index.js', function(req, res) {
    res.sendFile(path.join(__dirname + "/client/index.js"))
});

app.listen(8000);
console.log("started Server at http://192.168.0.109:8000")