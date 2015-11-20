var express = require('express');
var url = require('url');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser')
var GitBook = require('gitbook-api');
var utils = require('./utils');

var app = express();

// Parse request body
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/', function(req, res) {
    res.send('Hello World!');
});

// Incomming webhook from Gumroad
app.post('/webhook/:author/:book/:token', function(req, res, next) {
    var payload = req.body;

    var gitbook = new GitBook({
        username: req.params.author,
        token: req.params.token
    });

    var bookId = [req.params.author, req.params.book].join('/');
    var book = gitbook.book(bookId);
    var keyValue = utils.guid();

    // Create the access key on gitbook.com
    book.createKey({
        label: 'Gumroad: ' + payload.full_name + ' (' + payload.email + ')',
        key: keyValue
    })

    // Send url to read the book
    .then(function(key) {
        res.send(key.urls.read)
    })
    .fail(next);
});

app.use(function(err, req, res, next) {
    console.error(err.stack || err);
    res.status(500).send(err.message || err);
});

var server = app.listen(process.env.PORT || 6001, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Service listening at http://%s:%s', host, port);
});