// Import express module
var express = require('express');

// Import path module
var path = require('path');

// Import logger module
var logger = require('morgan');

// Instantiate the express middleware
var app = express();

// Load logger module
app.use(logger('dev'));

// Set public folder to publish static content
app.use(express.static(path.join(__dirname, 'public')));

// Set redirection to index.html
app.get(/\/.*/, function (req, res) {
    var matches = null;
    var templates = ['cart', 'order', 'profile', 'purchase', 'signin', 'signup'];
    if ((matches = req.path.match(/^\/$/)) ||
        ((matches = req.path.match(/^\/([^\/]*)\/?$/)) && templates.includes(matches[1])))
        res.sendFile(path.join(__dirname, '/public/index.html'));
    else
        res.sendStatus(404);
});

// Listen to port 3000
app.listen(3000, function() {
    console.log('Gameshop Web app listening on port 3000!')
});