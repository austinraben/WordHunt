/* 
wordGrid.js -- MongoDB Schema
Stores days, languages, and grids
*/

const mongoose = require('mongoose');

const wordGridSchema = new mongoose.Schema({
    day: { type: Number, required: true },
    language: { type: String, required: true, enum: ['English', 'German'] },
    grid: {
        type: [[String]],
        required: true,
    },
});

// ALlow schema to be used in other files
module.exports = mongoose.model('WordGrid', wordGridSchema);