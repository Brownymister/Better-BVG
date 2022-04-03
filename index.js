//@ts-check

const express = require("express");
const app = express();
const path = require("path")

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + "/client/index.html"))
});

app.get('/index.js', function(req, res) {
    res.sendFile(path.join(__dirname + "/client/index.js"))
});

app.get('/index.css', function(req, res) {
    res.sendFile(path.join(__dirname + "/client/index.css"))
});

app.get('/favicon.ico', function(req, res) {
    res.sendFile(path.join(__dirname + "/230x0wFehrnseeturm.png"))
});

app.listen(8000);
console.log("started Server at http://192.168.0.109:8000")