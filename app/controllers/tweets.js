// ## Tweet Controller
const createPagination = require('./analytics').createPagination;
const mongoose = require("mongoose");
const Tweet = mongoose.model("Tweet");
const User = mongoose.model("User");
const Tag = mongoose.model("Tag");
const Analytics = mongoose.model("Analytics");
const _ = require("underscore");
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
//let Tags = []

app.use(bodyParser.urlencoded({ extended: true }))

exports.tweet = (req, res, next, id) => {
  Tweet.load(id, (err, tweet) => {
    if (err) {
      return next(err);
    }
    if (!tweet) {
      return next(new Error("Failed to load tweet" + id));
    }
    req.tweet = tweet;
    next();
  });
};

// ### Create a Tweet
exports.create = (req, res) => {
  const tweet = new Tweet(req.body);
  tweet.user = req.user;
  tweet.createdOn = getCurrDate()    
  var temp = []   
  if(req.body.items!=undefined) {    
      for(var i=0;i<req.body.items.length;i++)  {
          Tag.findById(mongoose.Types.ObjectId(req.body.items[i]),function(err,tag){  
            if(tag){
                tag.count = tag.count + 1
                tag.save()
                temp.push(tag.keyword[0])
                tweet.tags.push(tag.keyword[0])
            }
        });  
      }
  }
     if(req.body.items_new!=undefined) {
    for(var i=0;i<req.body.items_new.length;i++)  {
    tweet.tags.push(req.body.items_new[i])
  }
    } 

  tweet.uploadAndSave({}, err => {
    if (err) {
      res.render("pages/500", {error: err});
    } else {
        for(i=0;i<temp.length;i++) 
            tweet.tags.push(temp[i])
        tweet.save()
//      console.log(req.body.items + " " + req.body.items_new)
        if(req.body.items_new!=undefined) {
        for(var i=0;i<req.body.items_new.length;i++)  {   
          Tag.create({
              keyword: req.body.items_new[i]
          },function(err,newTag){});
      }
        }
      res.redirect("/");
    }
  });
};

// ### Update a tweet
exports.update = (req, res) => {
  let tweet = req.tweet;
  tweet = _.extend(tweet, {"body": req.body.tweet});
  tweet.uploadAndSave({}, (err) => {
    if (err) {
      return res.render("pages/500", {error: err});
    }
    res.redirect("/");
  });
};

// ### Delete a tweet
exports.destroy = (req, res) => {
  const tweet = req.tweet;
  tweet.remove(err => {
    if (err) {
      return res.render("pages/500");
    }
    res.redirect("/");
  });
};

exports.index = (req, res) => {
//  var Tags = []    
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const perPage = 10;
  const options = {
    perPage: perPage,
    page: page
  };
  let followingCount = req.user.following.length;
  let followerCount = req.user.followers.length;
  let tweets, tweetCount, pageViews, analytics, pagination;
  User.countUserTweets(req.user._id).then(result => {
    tweetCount = result;
  });
  Tweet.list(options)
    .then(result => {
      tweets = result;
      return Tweet.countTotalTweets();
    })
    .then(result => {
      pageViews = result;
      pagination = createPagination(req, Math.ceil(pageViews/ perPage),  page+1);
      return Analytics.list({ perPage: 15 });
    })
    .then(result => {
      analytics = result;
      res.render("pages/index", {
        title: "List of Tweets",
        tweets: tweets,
        trends: getTrendingWhat(),
        page: page + 1,
        tweetCount: tweetCount,
        pagination: pagination,
        followerCount: followerCount,
        followingCount: followingCount,
        pages: Math.ceil(pageViews / perPage),
      });
    })
    .catch(error => {
      console.log(error);
      res.render("pages/500");
    });
}

function getCurrDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    today = dd + "-" + mm +"-" + yyyy;
    return today;
}

function getTrendingWhat() {
    Tag.find().limit(5).sort({count : -1}).exec(function(err,tags){
       Tags = []
       for(var i=0;i<tags.length;i++) 
           Tags.push({
               keyword: tags[i].keyword[0],
               count: tags[i].count
           })
    });
    return Tags
}

