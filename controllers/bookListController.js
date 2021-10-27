const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const Book = require('../models/book');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID_S3,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_S3
});

const publish_book = (req, res) => {
    var bookslug = req.params.slug;
    const data = req.body;
    let status;
    if(data.published == 'true') {
        status = false;
     } else if(data.published == 'false') {
        status = true;
     }
    Book.findOne({slug: bookslug}, (err, bookData) => {
        bookData.published = status;
        bookData.save((err) => {
            if(err) { console.error(err); 
            } else {
                res.send('success');
            }
        });
    })
}

const bookList_get = (req, res) => {
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
            res.render('bookList', {
                title: 'Book Editing',
                nav: 'bookList',
                books: booksData
            })
        }
    })
}

//// Creating New Book
const bookList_post = (req, res) => {
    // let bdata = fs.readFileSync('./json/bookBody.json');
    // let bodyData = JSON.parse(bdata);
    const slug = req.body.slug;
    const title = req.body.booktitle;
    const subtitle = req.body.subtitle;
    const author = req.body.author;
    Book.countDocuments({slug: slug}, (err, count) => { 
        if(count > 0){
            res.send('<script>alert("This name already exist.")</script>');
        } else {
            Book.countDocuments({}, (err, allcount) => {
                const withName = new Book({
                    slug: slug,
                    title: title,
                    subtitle: subtitle,
                    author: author,
                    // body: bodyData,
                    body: [],
                    published: false,
                    featimg: false,
                    index: allcount
                });
                withName.save((err) => {
                    if(err) { console.error(err); 
                    } else {
                    res.redirect('/bookList');
                    }
                });
            })
        }
    }); 
}

const bookList_delete = (req, res) => {
    const theName = req.body.oldname;
    let deletedI;
    Book.findOneAndDelete({slug: theName}, (err, dabook)=> {
        deletedI = dabook.index;
        if(err) { console.error(err); 
        } else {
            Book.find({}, (err, booksData) => {
                for (let i = 0; i < booksData.length; i++) {
                    if(booksData[i].index > deletedI) {
                        booksData[i].index = booksData[i].index - 1;
                        booksData[i].save((err) => {
                            if(err) { console.error(err); }
                        });
                    }
                }
            })
            res.redirect('bookList');
        }
    })
}

const bookList_rename = (req, res) => {
    const oldName = req.body.oldname;
    const slug = req.body.newslug;
    const title = req.body.newbooktitle;
    const subtitle = req.body.newsubtitle;
    const author = req.body.newauthor;
    let location;
    if(req.body.location == 'bookList') { location = '/bookList'; }
    else if(req.body.location == 'bookEditor') { location = '/edit/' + slug; }
    Book.findOne({slug: oldName}, (err, bookData) => {
        bookData.slug = slug;
        bookData.title = title;
        bookData.subtitle = subtitle;
        bookData.author = author;
        bookData.save((err) => {
            if(err) { console.error(err); }
            else { res.redirect(location); }
        });
    })
}

const bookList_links = (req, res) => {
    const bookslug = req.body.name;
    const links = req.body.data;
    Book.findOne({slug: bookslug}, (err, bookData) => {
        bookData.links = links;
        bookData.save((err) => {
            if(err) { console.error(err); }
            else { res.end(JSON.stringify({success : "Updated Successfully", status : 200})); }
        });
    })
}

const coverimg_post = (req, res) => {
    let bookname = req.params.slug;
    let upload = multer({
        limits: { fileSize: 5000000 },
        fileFilter: async (req, file, cb) => {
            if (file.mimetype !== 'image/jpeg') {
              return cb(new Error('Only JPG is accepted'), false);
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
            cb(null, `book/${bookname}/cover.jpg`);
          }
        })
      });
      const uploadMiddleware = upload.single('coverimg');
      uploadMiddleware(req, res, function(err) {
        if (err) {
          console.log(err);
          return res.send("<script> alert('Oops! There was errors. Please check if the image JPG, and smaller than 5MB.'); window.location =  '/bookList'; </script>");
         }
      });
      Book.findOne({slug: bookname}, (err, bookData) => {
        bookData.featimg = true;
        bookData.save((err) => {
            if(err) { console.error(err); }
            else { res.redirect('/edit/' + bookname); }
        });
    })
}

const up_book = (req, res) => {
    const bookslug = req.params.slug;
    let ogindex, another;
    Book.findOne({slug: bookslug}, (err, bookData) => {
        ogindex = bookData.index;
        another = ogindex + 1;
        Book.findOne({index: another}, (err, another) => {
            another.index = ogindex;
            another.save();
        });
        bookData.index = another;
        bookData.save((err) => { 
            if(err) { console.error(err); }
            else {
                res.end(JSON.stringify({success : "Changed index successfuly", status : 200}));
            }
        });
    });
}

const down_book = (req, res) => {
    const bookslug = req.params.slug;
    let ogindex, another;
    Book.findOne({slug: bookslug}, (err, bookData) => {
        ogindex = bookData.index;
        another = ogindex - 1;
        Book.findOne({index: another}, (err, another) => {
            another.index = ogindex;
            another.save();
        });
        bookData.index = another;
        bookData.save((err) => { 
            if(err) { console.error(err); }
            else {
                res.end(JSON.stringify({success : "Changed index successfuly", status : 200}));
            }
        });
    });
}

module.exports = {
    publish_book,
    bookList_get,
    bookList_post,
    bookList_delete,
    bookList_rename,
    bookList_links,
    coverimg_post,
    up_book,
    down_book
}