var express = require('express');
var url = require('url');

var app = express();
app.get('/', function (req, res) {
    res.send('Hello World!');
});


var server = app.listen(process.env.PORT || 6001, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Service listening at http://%s:%s', host, port);
});