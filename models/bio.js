const { urlencoded } = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bioSchema = new Schema({
    body: [{}],
    snippet: [{}],
    headshot: {
        type: String
    }
}, { timestamps: true });

const Bio = mongoose.model('Bio', bioSchema);
module.exports = Bio;