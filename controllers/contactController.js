const nodemailer = require('nodemailer')
const Book = require('../models/book');

const contact_get = (req, res) => {
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
        res.render('contact', {
            title: 'Contact',
            nav: 'contact',
            books: booksData
        })
    }})
}

const contact_post = (req, res) => {
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_PASS = process.env.GMAIL_PASS;
    const GMAIL_PORT = process.env.GMAIL_PORT;
    const GMAIL_HOST = process.env.GMAIL_HOST;

    const smtpTrans = nodemailer.createTransport({
      host: GMAIL_HOST,
      port: GMAIL_PORT,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
      }
    })
  
    const mailOpts = {
      from: `${req.body.email}`,
      to: GMAIL_USER,
      subject: `[MS.com] Message from ${req.body.name}`,
      text: `You received new passage via MikeSager.com. \n\nName: ${req.body.name}\n\nEmail: ${req.body.email}\n\nMessage: ${req.body.message}\n\n`
    }

    smtpTrans.sendMail(mailOpts, (error, response) => {
      if (error) { res.redirect('/contact') }
      else { res.redirect('/thanku');  }
    })
}
const thanku_get = (req, res) => {
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
      res.render('msgSent', {
          title: 'Contact',
          nav: 'contact',
          books: booksData
      })
  }})
}

module.exports = {
    contact_get,
    contact_post,
    thanku_get
}