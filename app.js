var express = require('express');
var sentiment = require('sentiment');
var senti = new sentiment();
var path = require('path');
var index = require('./routes/index');
var tweets = require('./routes/tweets');
var tweets1 = require('./routes/posTweets');

var app = express();

// serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// look for view html in the views directory
app.set('views', path.join(__dirname, 'views'));

// use ejs to render
app.set('view engine', 'ejs');

// setup routes
app.use('/', index);
app.use('/tweets', tweets);
app.use('/posTweets',tweets1);

module.exports = app;

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log('Listening on ' + port);
});
