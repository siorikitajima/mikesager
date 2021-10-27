const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const Book = require('../models/book');
const Tip = require('../models/tip');
const Bio = require('../models/bio');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID_S3,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_S3
});

const tipEditor_get = (req, res) => {
    let tipslug = req.params.slug;
    Tip.findOne({slug: tipslug}, (err, tipData) => {
        if(err) {console.log(err);}
        else {
            res.render('tip-editor', {
                title: 'Tip Editor',
                nav: 'tip-editor',
                name: tipslug,
                tip: tipData,
                published: tipData.published
            })
        }
    })
}

//// Create New Tip
const tipEditor_post = (req, res) => {
    var tipslug = req.params.slug;
    const data = req.body;
    const headLength = req.headers.headlength;
    const headerData = data.slice(0, headLength);
    const bodyData = data.slice(headLength);
    let urls = [], titles = [], subtitles = [], headers = [], paras = [];
    for(let b = 0; b < headerData.length; b++) {
        if(headerData[b].type == 'header' && headerData[b].data.level == 1) {
            let datext = headerData[b].data.text;
            titles.push(datext);
        }
        if(headerData[b].type == 'header' && headerData[b].data.level == 3) {
            let datext = headerData[b].data.text;
            subtitles.push(datext);
        }
    }
    for(let b = 0; b < bodyData.length; b++) {
        if(bodyData[b].type == 'image') {
            let daurl = bodyData[b].data.file.url;
            urls.push(daurl);
        }
        if(bodyData[b].type == 'header') {
            let datext = bodyData[b].data.text;
            headers.push(datext);
        }
        if(bodyData[b].type == 'paragraph') {
            let datext = bodyData[b].data.text;
            paras.push(datext);
        }
    }
    const descText = paras[0] + ' ' + paras[1] + ' ' + paras[2] + ' ' + paras[3] + ' ' + paras[4] + ' ' + paras[5] + ' ' + paras[6] + ' ' + paras[7] + ' ' + paras[8] + ' ' + paras[9];
    var cleanedText = descText.replace( /(<([^>]+)>)/ig, '');
    var stripHere = 140;
    var shortText = cleanedText.substring(0, stripHere) + "..."; 

    Tip.findOne({slug: tipslug}, (err, tipData) => {
        tipData.header = headerData;
        tipData.body = bodyData;
        tipData.title = titles[0];
        tipData.snippet = shortText;
        tipData.featimg = urls[0] || '';
        tipData.save((err) => {
            if(err) { console.error(err); 
            } else {
                res.send('success'); 
            }
        });
    })
};

//// Inline image for Tip
const tipimg_post = (req, res) => {
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
            filename = `tip/${file.originalname}`;
            cb(null, `tip/${file.originalname}`);
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

//// Tips listing page (Client)
const tips_get = (req, res) => {
    Book.find({}, (err, booksData) => {
        booksData.sort(function(a, b) {
            var keyA = a.index,
                keyB = b.index;
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
          });
        Tip.find({}, (err, tipsData) => {
            tipsData.sort(function(a, b) {
                var keyA = new Date(a.updatedAt),
                keyB = new Date(b.updatedAt);
                if (keyA < keyB) return 1;
                if (keyA > keyB) return -1;
                return 0;
            });
            if(err) {console.log(err);}
            else {
                res.render('tips', {
                    title: 'TIPS',
                    nav: 'tips',
                    tips: tipsData,
                    books: booksData
                })
            }
        })
    })
}

const tip_single_get = (req, res) => {
    var tipslug = req.params.slug;
    Book.find({}, (err, booksData) => {
        booksData.sort(function(a, b) {
            var keyA = a.index,
                keyB = b.index;
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
          });
        Tip.findOne({slug: tipslug}, (err, tipData) => {
            if(err) {console.log(err);}
            else {
                Bio.findOne({_id: '616921ae5548e4dd220f0788'}, (err, data) => {
                    if(err) {console.log(err);}
                    else {
                        res.render('tip-single', {
                            title: tipData.title,
                            nav: 'tip-single',
                            name: tipslug,
                            tip: tipData,
                            snippet: data.snippet,
                            books: booksData
                        })
                    }
                })
            }
        })
    })
}

module.exports = {
    tipEditor_get,
    tipEditor_post,
    tipimg_post,
    tips_get,
    tip_single_get
}