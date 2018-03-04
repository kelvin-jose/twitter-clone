const mongoose = require("mongoose");
const Tweet = mongoose.model("Tweet");
const Schema = mongoose.Schema;
const crypto = require("crypto");


// ## Define UserSchema
const UserSchema = new Schema({
  name: String,
  email: {type: String, unique : true},
  username: {type: String, unique : true},
  password: String,
  followers: [{ type: Schema.ObjectId, ref: "User" }],
  following: [{ type: Schema.ObjectId, ref: "User" }],
  tweets: Number,
  joinedOn : {type: String},
  status: {type: String, default: 'Active'},
  verified: {type: String, default: 'false'}
});


//const validatePresenceOf = value => value && value.length;
//
//UserSchema.path("name").validate(function(name) {
//  if (authTypes.indexOf(this.provider) !== -1) {
//    return true;
//  }
//  return name.length;
//}, "Name cannot be blank");
//
//UserSchema.path("email").validate(function(email) {
//  if (authTypes.indexOf(this.provider) !== -1) {
//    return true;
//  }
//  return email.length;
//}, "Email cannot be blank");
//
//UserSchema.path("username").validate(function(username) {
//  if (authTypes.indexOf(this.provider) !== -1) {
//    return true;
//  }
//  return username.length;
//}, "username cannot be blank");
//
//
//UserSchema.pre("save", function(next) {
//  if (
//    !validatePresenceOf(this.password) &&
//    authTypes.indexOf(this.provider) === -1
//  ) {
//    next(new Error("Invalid password"));
//  } else {
//    next();
//  }
//});
//
//UserSchema.methods = {
//  authenticate: function(plainText) {
//    return this.encryptPassword(plainText) === this.hashedPassword;
//  },
//
//  makeSalt: function() {
//    return String(Math.round(new Date().valueOf() * Math.random()));
//  },
//
//  encryptPassword: function(password) {
//    if (!password) {
//      return "";
//    }
//    return crypto.createHmac("sha1", this.salt).update(password).digest("hex");
//  }
//};
//
UserSchema.statics = {
  addfollow: function(id, cb) {
    this.findOne({ _id: id }).populate("followers").exec(cb);
  },
  countUserTweets:  function (id, cb) {
    return Tweet.find({ user: id }).count().exec(cb);
  },
  load: function(options, cb) {
    options.select = options.select || "name username github";
    return this.findOne(options.criteria).select(options.select).exec(cb);
  },
  list: function(options) {
    const criteria = options.criteria || {};
    return this.find(criteria)
      .populate("user", "name username")
      .limit(options.perPage)
      .skip(options.perPage * options.page);
  }
};

mongoose.model("User", UserSchema);
