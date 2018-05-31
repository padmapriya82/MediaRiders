var express = require('express');
var router = express.Router();
var Sentiment = require('sentiment');
var sentiment = new Sentiment();
var math = require('mathjs');
var app = express();

var Twit = require('twit');
var config = require('../config');
var result;
var twwetSet;
var highestScore =0;
var highestChoice = [];
var choices=[];
var http = require('http');


// instantiate Twit module
var twitter = new Twit(config.twitter);

var TWEET_COUNT = 15;
var MAX_WIDTH = 305;
var OEMBED_URL = 'statuses/oembed';
var USER_TIMELINE_URL = 'statuses/user_timeline';
var tweetCount = 0;
var tweetTotalSentiment = 0;

/**
 * GET tweets json.
 */
router.get('/user_timeline/:user', function(req, res, next) {
  
  var oEmbedTweets = [], tweets = [],

  params = {
    screen_name: req.params.user, // the user id passed in as part of the route
    count: TWEET_COUNT // how many tweets to return
  };

  // the max_id is passed in via a query string param
  if(req.query.max_id) {
    params.max_id = req.query.max_id;
  }

  // request data
  twitter.get(USER_TIMELINE_URL, params, function (err, data, resp) {

    tweets = data;
    var i = 0, len = tweets.length;
      for(i; i <len; i++) {
    var score = performAnalysis(tweets[i]);
    if (tweets[i].lang=== 'en') {

       result = sentiment.analyze(tweets[i].text);

      }


    if(score != 0 && result.score >0) {
      highestScore = score;
      highestChoice[i] = tweets[i];
      tweetCount++;
      getOEmbed(tweets[i]);
    }

}
  });


  function getOEmbed (tweet) {


    // oEmbed request params
    var params = {
      "id": tweet.id_str,
      "maxwidth": MAX_WIDTH,
      "hide_thread": true,
      "omit_script": true
    };

    // request data
    twitter.get(OEMBED_URL, params, function (err, data, resp) {

         tweet.oEmbed = data;
         oEmbedTweets.push(tweet);
      // do we have oEmbed HTML for all Tweets?
   if (oEmbedTweets.length == tweetCount) {
      res.header('Content-Type', 'application/json');
        res.send(oEmbedTweets);
        tweetCount = 0;
    }


    });
  }
});

function performAnalysis(tweetSet) {
  //set a results variable
  var results = 0;
  // iterate through the tweets, pulling the text, retweet count, and favorite count
    tweet = tweetSet.text;
    retweets = tweetSet.retweet_count;
    favorites = tweetSet.favorite_count;
    // remove the hastag from the tweet text
    tweet = tweet.replace('@', '');
    // perform sentiment on the text
    var score = sentiment.analyze(tweet).score;

    results += score;
    if(score > 0){
      if(retweets > 0) {
          results += (math.log(retweets,2));
        }
      if(favorites > 0) {

        results += (math.log(favorites,2));
      }
    }
    else if(score < 0){
      if(retweets > 0) {

          results += (math.log(retweets,2));
        }
      if(favorites > 0) {

          results -= (math.log(favorites,2));
      }
    }
    else {
      results += 0;
    }

  return results
}
module.exports = router;
