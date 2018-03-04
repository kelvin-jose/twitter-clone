const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// ## Define AdminSchema
const AdminSchema = new Schema({
  name: String,
  email: String,
  username: String,
  password: String
});

mongoose.model("Admin", AdminSchema);