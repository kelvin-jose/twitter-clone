const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const TagSchema = new Schema({
    keyword: [
        { type: String,maxlength: 20 
        }],
          count: { type: Number, default: 1 }
});

mongoose.model("Tag", TagSchema);
