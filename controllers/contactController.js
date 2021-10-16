const nodemailer = require('nodemailer')
const Book = require('../models/book');

const contact_get = (req, res) => {
    Book.find({}, (err, booksData) => {
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

module.exports = {
    contact_get,
    contact_post
}