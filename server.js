var express       = require('express');        // call express
var app           = express();                 // define our app using express
var bodyParser    = require('body-parser');
var http          = require('http')
var fs            = require('fs');
var Fabric_Client = require('fabric-client');
var path          = require('path');
var util          = require('util');
var os            = require('os');
// Load all of our middleware
// configure app to use bodyParser()
// this will let us get the data from a POST
var express = require('express');
var app = express();
var cors = require('cors')
app.use(cors())
app.use(express.json());
require('./server/routes.js')(app);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/client'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/api', function (req, res) {
    res.send('Hello from event server api 1.0 with CORS');
});

var port = process.env.PORT || 8080;
var server = app.listen(port, function () {
    console.log('Listening on port ' + port);
});

process.on("SIGINT", () => {
    process.exit(130 /* 128 + SIGINT */);
});

process.on("SIGTERM", () => {
    console.log("Terminating...");
    server.close();
});
