const mongoose = require('mongoose');

const wordGridSchema = new mongoose.Schema({
    day: { type: Number, required: true }, // Day of the month
    language: { type: String, required: true, enum: ['English', 'German'] },
    grid: {
        type: [[String]],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length === 4 && arr.every(row => row.length === 4);
            },
            message: 'Grid must be a 4x4 array of strings.'
        }
    },
}, { timestamps: true });

// ALlow schema to be used in other files
module.exports = mongoose.model('WordGrid', wordGridSchema);