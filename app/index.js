var path = require('path');
var express = require('express');
var url = require('url');
var nunjucks = require("nunjucks");
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var GitBook = require('gitbook-api');
var passport = require('passport');
var GumroadStrategy = require('passport-gumroad').Strategy;
var GitBookStrategy = require('passport-gitbook').Strategy;


var HOSTNAME = process.env.HOSTNAME;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Configure gumroad oauth
passport.use(new GumroadStrategy({
        clientID: process.env.GUMROAD_CLIENT_ID,
        clientSecret: process.env.GUMROAD_CLIENT_SECRET,
        callbackURL: url.resolve(HOSTNAME, "/auth/gumroad/callback")
    },
    function(accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

// Configure gumroad oauth
passport.use(new GitBookStrategy({
        clientID: process.env.GITBOOK_CLIENT_ID,
        clientSecret: process.env.GITBOOK_CLIENT_SECRET,
        callbackURL: url.resolve(HOSTNAME, "/auth/gitbook/callback")
    },
    function(accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

var app = express();
app.set('trust proxy', 1);


var tpl = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.resolve(__dirname, '../views')), {
    autoescape: true,
    watch: true
});
tpl.express(app);

// Parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(cookieSession({
    name: 'session',
    keys: (process.env.SESSION_KEYS || 'test').split(',')
}))

app.use(passport.initialize());
app.use(passport.session());

// Serve assets
app.use('/assets', express.static(path.resolve(__dirname, '../public')));
app.use('/assets', express.static(path.resolve(__dirname, '../node_modules/gitbook-styleguide/assets')));

app.get('/', function(req, res) {
    res.render('index.html');
});

// Incomming webhook from Gumroad
app.post('/webhook/:author/:book/:token', function(req, res, next) {
    var payload = req.body;

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
        res.send(key.urls.read)
    })
    .fail(next);
});

app.get('/auth/gumroad', passport.authenticate('gumroad'));
app.get('/auth/gumroad/callback',
    passport.authenticate('gumroad', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/auth/gitbook', passport.authenticate('gitbook'));
app.get('/auth/gitbook/callback',
    passport.authenticate('gitbook', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
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