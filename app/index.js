var express = require('express');
var url = require('url');
var nodemailer = require('nodemailer');

var app = express();


app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.post('/webhook/:author/:book/:token', function(req, res, next) {

});


var server = app.listen(process.env.PORT || 6001, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Service listening at http://%s:%s', host, port);
});