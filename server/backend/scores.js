const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    username: { type: String },
    score: { type: Number },

    // `gridId` references the `WordGrid` document associated with the scor
    // `ref: 'WordGrid'` tells Mongoose to link this field to the `WordGrid` collection
    gridId: { type: mongoose.Schema.Types.ObjectId, ref: 'WordGrid' },
});

// Allow schema to be used in other files
module.exports = mongoose.model('Score', scoreSchema);