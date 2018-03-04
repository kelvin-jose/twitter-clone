const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reqSchema = new Schema ({
    user: {type: Schema.ObjectId, ref: 'User'},
    time: {type: Date, default: Date.now},
    status: {type: String, default: 'pending'}
});

mongoose.model('VerReq',reqSchema);