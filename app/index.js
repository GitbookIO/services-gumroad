var express = require('express');
var url = require('url');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser')
var GitBook = require('gitbook-api');

var app = express();

// Parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', function(req, res) {
    res.send('Hello World!');
});

// Incomming webhook from Gumroad
app.post('/webhook/:author/:book/:token', function(req, res, next) {
    var payload = req.body;
    console.log('receive payload', payload);

    if (!payload.email) return next(new Error('Require "email" in payload'));

    var gitbook = new GitBook({
        username: req.params.author,
        token: req.params.token
    });

    var bookId = [req.params.author, req.params.book].join('/');
    var book = gitbook.book(bookId);

    // Create the access key on gitbook.com
    book.createKey({
        label: 'Gumroad: ' + (payload.full_name || 'Unknown') + ' (' + payload.email + ')'
    })

    // Send url to read the book
    .then(function(key) {
        console.log('-> key', key);
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