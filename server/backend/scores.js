/*
scores.js -- MongoDB Schema
Stores usernames, scores, gridId, longestWord, and totalWords
*/

const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    username: { type: String, required: true },
    score: { type: Number, required: true },
    
    // References a grid defined the wordGrid.js schema
    gridId: { type: mongoose.Schema.Types.ObjectId, ref: 'WordGrid', required: true },

    longestWord: { type: String, default: '' }, 
    totalWords: { type: Number, default: 0 }   
});

module.exports = mongoose.model('Score', scoreSchema);