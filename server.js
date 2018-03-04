const express = require('express');
const fs = require('fs');
const passport = require('passport');
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];
const auth = require('./config/middlewares/authorization');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser')
const localStrategy = require('passport-local')
const models_path = __dirname+'/app/models';
fs.readdirSync(models_path).forEach(file => {
  require(models_path+'/'+file);
});

const User = mongoose.model("User")
const VerReq = mongoose.model("VerReq")
const Tag = mongoose.model("Tag")
const authRoutes = require('./app/controllers/auth')


app.use(bodyParser.urlencoded({ extended: true }))

mongoose.Promise = global.Promise;
mongoose.connect(config.db, {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  useMongoClient: true
});

app.use(require('express-session')({
  secret: "Yes I'm coming with a brand name",
  resave: false,
  saveUninitialized: false
}))

passport.use(new localStrategy(
  function(username, password, done) {
    User.findOne({ username: username,password: password }, function(err, user) {
      if (err) { return done(err); }
      return done(null, user);
    });
  }
));



app.get('/search',function(req,res){
    var key = req.param('key');
    var reg = new RegExp(key,'i');
User.find({name: reg}, function(err, rows) {
	  if (err) throw err;
    var data=[];
    for(i=0;i<rows.length;i++)
      {
        data.push(rows[i].name+ "  @" + rows[i].username);
      }
      res.end(JSON.stringify(data));
	});
});

app.get('/search-tag',function(req,res){
    var key = req.param.q;
    var reg = new RegExp(key,'i');
    Tag.find({keyword: reg}, function(err, rows) {
	  if (err) throw err;
    var data=[];
    for(i=0;i<rows.length;i++)
      {
        data.push({
            id: rows[i]._id,
            name: rows[i].keyword
        });
      }
      res.end(JSON.stringify(data));
	});
});

app.get('/users/get/verified/:userId',function(req,res){
  User.findById(req.params.userId,function(err,user){
        if(err) res.redirect('/admin/verification')
        else {
            user.verified = 'true'
            user.save(function(err,user){
                if(err) res.redirect('/admin/verification')
                else {
                 res.redirect('/admin/delete/' + req.params.userId)   
//                 res.redirect('/admin/verification')   
                }
            })
        }
    })  
})

app.get("/admin/delete/:userId",function(req,res){
      VerReq.find({user: req.params.userId}).remove().exec();
              res.redirect('/admin/verification')
      }) 

app.use(passport.initialize())
app.use(passport.session())

app.use(authRoutes)

require('./config/passport')(passport, config);
require('./config/express')(app, config, passport);
require('./config/routes')(app,auth);



app.listen(port);
console.log('Express app started on port ' + port);
exports = module.exports = app;
