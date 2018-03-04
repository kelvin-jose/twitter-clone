const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongoose = require("mongoose");
const User = mongoose.model("User")
const Tweet = mongoose.model("Tweet")
const Tag = mongoose.model("Tag")
const Admin = mongoose.model("Admin")
const bodyParser = require('body-parser')
const analytics = require("./analytics");

var express = require('express')
var router  = express.Router()

router.use(bodyParser.urlencoded({ extended: true }))

router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);


//admin routes

router.get('/admin/login',function(req,res){
      res.render('pages/super-login')
  });
let totalTweetCount,dailyTweetCount,monthlyTweetCount,yearlyTweetCount,dailyUsersCount,monthlyUsersCount,yearlyUsersCount;


function getTotalTweetCount() {    
    Tweet.find({},function(err,tweets){
        totalTweetCount = tweets.length;
    })
    return totalTweetCount
}

function getDailyTweetCount() {
    var today = getCurrDate()
    var token = new RegExp(today, 'i');
    Tweet.find({createdOn: token},function(err,tweets){
        dailyTweetCount = tweets.length
    })
    return dailyTweetCount;
} 

function getMonthlyTweetCount() {
    var today = new Date()
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear(); 
    if(mm<10) {
        mm = '0'+mm
    } 
    var month = "-" + mm + "-" + yyyy; 
    var token = new RegExp(month,'i')
    Tweet.find({createdOn: token},function(err,tweets){
        monthlyTweetCount = tweets.length
    })  
    return monthlyTweetCount
}

function getYearlyTweetCount() {
    var today = new Date()
    var yyyy = today.getFullYear();
    var year = "-" + yyyy
    var token = new RegExp(year,'i')
    Tweet.find({createdOn: token},function(err,tweets){
        yearlyTweetCount = tweets.length
    })
    return yearlyTweetCount
}

let Tags = [];
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

function getDailyUsersCount() {
   var today = getCurrDate()
    var token = new RegExp(today, 'i');
    User.find({joinedOn: token},function(err,users){
        dailyUsersCount = users.length
    })
    return dailyUsersCount; 
}

function getMonthlyUsersCount() {
    var today = new Date()
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear(); 
    if(mm<10) {
        mm = '0'+mm
    } 
    var month = "-" + mm + "-" + yyyy; 
    var token = new RegExp(month,'i')
    User.find({joinedOn: token},function(err,users){
        monthlyUsersCount = users.length
    })  
    return monthlyUsersCount
}

function getYearlyUsersCount() {
    var today = new Date()
    var yyyy = today.getFullYear();
    var year = "-" + yyyy
    var token = new RegExp(year,'i')
    User.find({joinedOn: token},function(err,users){
        yearlyUsersCount = users.length
    })
    return yearlyUsersCount
}


router.get('/admin/',function(req,res){
          var totalTweetCount= getTotalTweetCount()
          var dailyTweetCount= getDailyTweetCount()
          var monthlyTweetCount= getMonthlyTweetCount()
          var yearlyTweetCount= getYearlyTweetCount()
          var trendingWhat= getTrendingWhat()
          var dailyUsersCount= getDailyUsersCount()
          var monthlyUsersCount= getMonthlyUsersCount()
          var yearlyUsersCount= getYearlyUsersCount()
          
      res.render('pages/superuser-index',{
          totalTweetCount: totalTweetCount,
          dailyTweetCount: dailyTweetCount,
          monthlyTweetCount: monthlyTweetCount,
          yearlyTweetCount: yearlyTweetCount,
          trendingWhat: trendingWhat,
          dailyUsersCount: dailyUsersCount,
          monthlyUsersCount: monthlyUsersCount,
          yearlyUsersCount: yearlyUsersCount
  })
});

router.post('/admin/login',function(req,res){
    Admin.findOne({username: req.body.username,password: req.body.password},function(err,user){
        if(user) {
            req.login(user, function(error) {
            });
            res.redirect('/admin/')
        }
        else res.render('pages/super-login')
    })
})

router.post('/register',function(req,res){
    
    var userData = {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    joinedOn: getCurrDate()
  }
    User.create(userData,function(err,user) {
    if(err) {
    //   req.flash('error',err.message)
      return res.redirect('/register')
    }
      passport.authenticate('local')(req,res,function(){
      res.redirect('/')
    })
  })
});

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

    today = dd + "-" + mm + "-" + yyyy; // /.*m.*/
    return today;
}

module.exports = router;