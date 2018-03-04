const express = require('express');
const router = express.Router();
const log = require('./middlewares/logger');
const passport = require('passport');
const users = require("../app/controllers/users");
const apiv1 = require("../app/controllers/apiv1");
const chat = require('../app/controllers/chat');
const analytics = require("../app/controllers/analytics");
const tweets = require("../app/controllers/tweets");
const comments = require("../app/controllers/comments");
const favorites = require("../app/controllers/favorites");
const follows = require("../app/controllers/follows");
const admins = require("../app/controllers/admins");
const VerReq = require("../app/models/verreq");
const mongoose = require('mongoose')
const Tweets = mongoose.model('Tweet')
module.exports = (app, auth) => {

  app.use("/", router);
  /**
   * Main unauthenticated routes
   */
  router.get("/login", users.login);
  router.get("/register",users.register)
//  router.get("/signup", users.signup);
  router.get("/logout", users.logout);

  /**
   * Admin routes
   */
    
  router.get("/admin/verification", admins.showRequest);


  /**
   * API routes
   */
  router.get("/apiv1/tweets", apiv1.tweetList);
  router.get("/apiv1/users", apiv1.usersList);

  /**
   * Authentication middleware
   * All routes specified after this middleware require authentication in order
   * to access
   */
  router.use(auth.requiresLogin)
  /**
   * Analytics logging middleware
   * Anytime an authorized user makes a get request, it will be logged into
   * analytics
   */
  router.get("/*", log.analytics)

  /**
   * Home route
   */
  router.get("/", tweets.index);

  /**
   * User routes
   */
  router.get("/users/:userId", users.show);
  router.get("/users/:userId/followers", users.showFollowers);
  router.get("/users/:userId/following", users.showFollowing);
  router.post("/users", users.create);
  router.post(
    "/users/sessions",
    passport.authenticate("local",
    {
      failureRedirect: "/login",
      failureFlash: "Invalid email or password"
    }),
    users.session
  );
  router.post("/users/:userId/follow", follows.follow);
  router.param("userId", users.user);

    // Profile Verification Routes
  router.get("/users/get/verification/:userId", users.verificationRequest); 
  router.get("/users/get/verified/:userId",users.getVerified); 
   
   //users/get/verified/:userId 
  /**
   * Chat routes
   */
  router.get('/chat', chat.index);
  router.get('/chat/:id', chat.show);
  router.get('/chat/get/:userid', chat.getChat);
  router.post('/chats', chat.create);
  /**
  * Analytics routes
  */
  router.get("/analytics", analytics.index);

  /**
   * Tweet routes
   */
  router.route("/tweets")
    .get(tweets.index)
    .post(tweets.create)

  router.route("/tweets/:id")
    .post(auth.tweet.hasAuthorization, tweets.update)
    .delete(auth.tweet.hasAuthorization, tweets.destroy)

  router.param("id", tweets.tweet);

  /**
   * Comment routes
   */
  router.route("/tweets/:id/comments")
    .get(comments.create)
    .post(comments.create)
    .delete(comments.destroy)

  /**
   * Favorite routes
   */
  router.route("/tweets/:id/favorites")
    .post(favorites.create)
    .delete(favorites.destroy)

  router.post('/tweets/:tweetId/like',function(req,res){
        Tweets.findById(req.params.tweetId,function(err,Tweet){
            if(Tweet) {
                var myArray = []
                for(var i=0;i<Tweet.likes.length;i++)
                    myArray.push(Tweet.likes[i].user.toString())
                if(myArray.includes(req.user._id.toString())) {
                    const index = myArray.indexOf(req.user._id.toString())
                    Tweet.likes.splice(index,1)
                }
                else {
                    Tweet.likes.push({
                        user: req.user._id
                    })
                }
                Tweet.save()
            }  
        });
    });
    
    router.get('/testing',function(req,res){
       res.render('pages/testpage',{
    name: 'Kelvin'
})  
    })
    
  /**
   * Page not found route (must be at the end of all routes)
   */
  router.use((req, res) => {
    res.status(404).render("pages/404", {
      url: req.originalUrl,
      error: "Not found"
    });
  });
};
