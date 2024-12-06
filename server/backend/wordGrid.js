const mongoose = require('mongoose');

const wordGridSchema = new mongoose.Schema({
    language: { type: String},
    grid: { type: [[String]]},
});

// ALlow schema to be used in other files
module.exports = mongoose.model('WordGrid', wordGridSchema);