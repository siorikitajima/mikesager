const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const Book = require('../models/book');
const Bio = require('../models/bio');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID_S3,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_S3
});

const bioeditor_get = (req, res) => {
    Bio.findOne({_id: '616921ae5548e4dd220f0788'}, (err, data) => {
        if(err) {console.log(err);}
        else {
            res.render('bio-editor', {
                title: 'Bio Editor',
                nav: 'bio-editor',
                body: data.body,
                headshot: data.headshot,
                snippet: data.snippet
            })
        }
    })
}

const bioeditor_post = (req, res) => {
    const data = req.body;

    Bio.findOne({_id: '616921ae5548e4dd220f0788'}, (err, bioData) => {
        bioData.body = data;

        bioData.save((err) => {
            if(err) { console.error(err); 
            } else {
                res.send('success'); 
            }
        });
    })
};

const bioimg_post = (req, res) => {
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
            filename = `bio/${file.originalname}`;
            cb(null, `bio/${file.originalname}`);
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

const headshot_post = (req, res) => {
    let filename;
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
            filename = `headshot/${file.originalname}`;
            cb(null, `headshot/${file.originalname}`);
          }
        })
      });
      const uploadMiddleware = upload.single('headshot');
      uploadMiddleware(req, res, function(err) {
        if (err) {
          console.log(err);
          return res.send("<script> alert('Oops! There was errors. Please check if the image JPG, and smaller than 5MB.'); window.location =  '/bioList'; </script>");
         }
      });
      Bio.findOne({_id: '616921ae5548e4dd220f0788'}, (err, bioData) => {
        bioData.headshot = `https://mikesager.s3.amazonaws.com/${filename}`;
        bioData.save((err) => {
            if(err) { console.error(err); 
            } else {
                res.redirect('/bio'); 
            }
        });
    })      
}

const bio_front_get = (req, res) => {
    Book.find({}, (err, booksData) => {
        Bio.findOne({_id: '616921ae5548e4dd220f0788'}, (err, bioData) => {
            if(err) {console.log(err);}
            else {
                res.render('biography', {
                    title: 'Biography',
                    nav: 'biography',
                    biodata: bioData,
                    books: booksData
                })
            }
        })
    })
}

const admin_get = (req, res) => {
    Bio.findOne({_id: '616921ae5548e4dd220f0788'}, (err, bioData) => {
        if(err) {console.log(err);}
        else {
            res.render('adminHome', {
                title: 'Biography',
                nav: 'biography',
                biodata: bioData
            })
        }
    })
}

const admin_post = (req, res) => {
    const data = req.body;

    Bio.findOne({_id: '616921ae5548e4dd220f0788'}, (err, bioData) => {
        bioData.snippet = data;

        bioData.save((err) => {
            if(err) { console.error(err); 
            } else {
                res.send('success'); 
            }
        });
    })
}

module.exports = {
    bioeditor_get,
    bioeditor_post,
    bioimg_post,
    headshot_post,
    bio_front_get,
    admin_get,
    admin_post
}