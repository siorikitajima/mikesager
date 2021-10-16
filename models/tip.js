const { urlencoded } = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tipSchema = new Schema({
    slug: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String
    },
    body: [{}],
    header: [{}],
    snippet: [{}],
    published: {
        type: Boolean,
        required: true
    },
    featimg: {
        type: String
    },
    order: {
      type: Number
    }
}, { timestamps: true });

const Tip = mongoose.model('Tip', tipSchema);
module.exports = Tip;