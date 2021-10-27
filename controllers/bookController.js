const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const Book = require('../models/book');
const Bio = require('../models/bio');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID_S3,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_S3
});

//// Book editor
const editor_get = (req, res) => {
    let bookslug = req.params.slug;
    Book.findOne({slug: bookslug}, (err, bookData) => {
        if(err) {console.log(err);}
        else {
            res.render('book-editor', {
                title: 'Book Editor',
                nav: 'book-editor',
                name: bookslug,
                book: bookData,
                published: bookData.published
            })
        }
    })
}

const editor_post = (req, res) => {
    var bookslug = req.params.slug;
    const data = req.body;
    Book.findOne({slug: bookslug}, (err, bookData) => {
        bookData.body = data;
        bookData.save((err) => {
            if(err) { console.error(err); 
            } else {
                res.send('success'); 
            }
        });
    })
};

const snippet_post = (req, res) => {
    var bookslug = req.params.slug;
    const data = req.body;
    Book.findOne({slug: bookslug}, (err, bookData) => {
        bookData.snippet = data;
        bookData.save((err) => {
            if(err) { console.error(err); 
            } else {
                res.send('success'); 
            }
        });
    })
};

//// Inline images for Book page
const bookimg_post = (req, res) => {
    let filename;
    let upload = multer({
        limits: { fileSize: 5000000 },
        fileFilter: async (req, file, cb) => {
            if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
              return cb(new Error('Only JPG and PNG are accepted'), false);
            }
              cb(null, true);
          },
        storage: multerS3({
          s3: s3,
          bucket: 'mikesager',
          acl: "public-read",
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
            let bookname = req.headers.bookname;
            filename = `book/${bookname}/${file.originalname}`;
            cb(null, `book/${bookname}/${file.originalname}`);
          }
        })
      });
      const uploadMiddleware = upload.single('image');
      uploadMiddleware(req, res, function(err) {
        if (err) {
          console.log(err);
          return res.send("<script> alert('Oops! There was errors'); window.location =  '/'; </script>");
         }
        else {
          return res.send({
            success: 1,
            file: {
              url: `https://mikesager.s3.amazonaws.com/${filename}`,
            }
        })}
      });
}

//// Home/Books page (Client)
const books_get = (req, res) => {
    Book.find({}, (err, booksData) => {
        booksData.sort(function(a, b) {
            var keyA = a.index,
                keyB = b.index;
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
          });
        if(err) {console.log(err);}
        else {
            Bio.findOne({_id: '616921ae5548e4dd220f0788'}, (err, data) => {
                if(err) {console.log(err);}
                else {
                res.render('books', {
                    title: 'HOME',
                    nav: 'books',
                    books: booksData,
                    snippet: data.snippet
                })
            }
            })
        }
    })
}

const book_single_get = (req, res) => {
    var bookslug = req.params.slug;
    Book.find({}, (err, booksData) => {
        booksData.sort(function(a, b) {
            var keyA = a.index,
                keyB = b.index;
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
          });
        Book.findOne({slug: bookslug}, (err, bookData) => {
            if(err) {console.log(err);}
            else {
                Bio.findOne({_id: '616921ae5548e4dd220f0788'}, (err, data) => {
                    if(err) {console.log(err);}
                    else {
                        res.render('book-single', {
                            title: bookData.title,
                            nav: 'book-single',
                            name: bookslug,
                            books: booksData,
                            book: bookData,
                            snippet: data.snippet
                        })
                    }
                })
            }
        })
    })
}

module.exports = {
    editor_get,
    editor_post,
    bookimg_post,
    books_get,
    book_single_get,
    snippet_post
}