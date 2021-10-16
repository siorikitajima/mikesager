const { urlencoded } = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const linkSchema = new Schema({ 
  type:{type: String }, 
  vender: {type: String }, 
  url: {type: String } 
});

const bookSchema = new Schema({
    slug: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String
    },
    subtitle: {
      type: String
    },
    author: {
      type: String
    },
    body: [{}],
    snippet: [{}],
    published: {
        type: Boolean,
        required: true
    },
    featimg: {
        type: Boolean
    },
    links: [linkSchema],
    index: {
      type: Number
    }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;