const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const Tip = require('../models/tip');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID_S3,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_S3
});

const publish_tip = (req, res) => {
    var tipslug = req.params.slug;
    const data = req.body;
    let status;
    if(data.published == 'true') {
        status = false;
     } else if(data.published == 'false') {
        status = true;
     }
    Tip.findOne({slug: tipslug}, (err, tipData) => {
        tipData.published = status;
        tipData.save((err) => {
            if(err) { console.error(err); 
            } else {
                res.send('success');
            }
        });
    })
}

const tipList_get = (req, res) => {
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
            res.render('tipList', {
                title: 'Tip Editing',
                nav: 'tipList',
                tips: tipsData
            })
        }
    })
}

const tipList_post = (req, res) => {
    let hdata = fs.readFileSync('./json/tipHeader.json');
    let headerData = JSON.parse(hdata);
    const slug = req.body.slug;
    Tip.countDocuments({slug: slug}, (err, count) => { 
        if(count > 0){
            res.send('<script>alert("This name already exist.")</script>');
        } else {
            const withName = new Tip({
                slug: slug,
                header: headerData,
                body: [],
                published: false,
                featimg: ''
            });
            withName.save((err) => {
                if(err) { console.error(err); 
                } else {
                  res.redirect('/tipedit/' + slug);
                }
            });
        }
    }); 
}

const tipList_delete = (req, res) => {
    const theName = req.body.oldname;
    Tip.findOneAndDelete({slug: theName}, (err)=> {
        if(err) { console.error(err); 
        } else {
            res.redirect('tipList');
        }
    })
}

const tipList_rename = (req, res) => {
    const oldName = req.body.oldname;
    const slug = req.body.newslug;
    const title = req.body.newtiptitle;
    const subtitle = req.body.newsubtitle;
    const author = req.body.newauthor;
    Tip.findOne({slug: oldName}, (err, tipData) => {
        tipData.slug = slug;
        tipData.title = title;
        tipData.subtitle = subtitle;
        tipData.author = author;
        tipData.save((err) => {
            if(err) { console.error(err); }
            else { res.redirect('/tipList'); }
        });
    })
}

module.exports = {
    publish_tip,
    tipList_get,
    tipList_post,
    tipList_delete,
    tipList_rename
}