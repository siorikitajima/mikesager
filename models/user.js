const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    username: String,
    password: String
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

const Username = mongoose.model('Username', userSchema);
module.exports = Username;