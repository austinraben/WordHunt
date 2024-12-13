/*
user.js -- MongoDB Schema
Stores usernames
*/

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String },
});

module.exports = mongoose.model('User', userSchema);
