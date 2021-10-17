const express = require('express');
require('dotenv').config();

const bodyParser = require('body-parser').json({limit: '50mb'});
const { render } = require('ejs');
const mongoose = require('mongoose');
const bookController = require('./controllers/bookController');
const tipController = require('./controllers/tipController');
const bioController = require('./controllers/bioController');
const bookListController = require('./controllers/bookListController');
const tipListController = require('./controllers/tipListController');
const contactController = require('./controllers/contactController');
const authController = require('./controllers/authController');
const passport = require('passport');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const initializePassport = require('./controllers/passport-config');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const methodOverride = require('method-override');

const app = express();
const port = process.env.PORT || 3100;
let salt = process.env.HASH_NUMBER;
let salfInt = parseInt(salt);

var store = new MongoDBStore({
    uri: process.env.DB_URL,
    collection: 'mySessions'
  });

var sess = {
secret: process.env.SESSION_SECRET,
resave: false,
saveUninitialized: false,
store: store,
cookie:{
    secure: process.env.NODE_ENV == "production" ? true : false ,
    maxAge: 1000 * 60 * 60 * 24 * 7
}
}
app.use(session(sess));


mongoose.connect(process.env.DB_URL)
    .then(() => {app.listen(port); console.log('Omar listening');})
    .catch((err) => console.log(err));
const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        User.find()
        .then((result) => { 
            initializePassport(
                passport, 
                name => result.find(user => user.name === name),
                id => result.find(user => user.id === id)
            );
        }).catch((err) => console.log(err));
    });

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(bodyParser);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Front Routes
app.get('/', bookController.books_get);
app.get('/book/:slug', bookController.book_single_get);

app.get('/biography', bioController.bio_front_get);

app.get('/tips', tipController.tips_get);
app.get('/tip/:slug', tipController.tip_single_get);

app.get('/contact', contactController.contact_get);
app.post('/contact', contactController.contact_post);
app.get('/thanku', contactController.thanku_get);

// Admin panel Routes
app.get('/admin', authController.checkAuthenticated, bioController.admin_get);
app.post('/admin', authController.checkAuthenticated, bioController.admin_post);

// Admin Book Editor
app.get('/edit/:slug', authController.checkAuthenticated, bookController.editor_get);
app.post('/edit/:slug', authController.checkAuthenticated, bookController.editor_post);
app.post('/featimage', authController.checkAuthenticated, bookController.bookimg_post);
app.post('/snippet/:slug', authController.checkAuthenticated, bookController.snippet_post);
app.post('/bookRename', authController.checkAuthenticated, bookListController.bookList_rename);
app.post('/bookLinks', authController.checkAuthenticated, bookListController.bookList_links);
app.post('/bookCover/:slug', authController.checkAuthenticated, bookListController.coverimg_post);

// Admin Book List
app.post('/publish/:slug', authController.checkAuthenticated, bookListController.publish_book);
app.get('/booklist', authController.checkAuthenticated, bookListController.bookList_get);
app.post('/booklist', authController.checkAuthenticated, bookListController.bookList_post);
app.post('/bookDelete', authController.checkAuthenticated, bookListController.bookList_delete);
app.post('/up/:slug', authController.checkAuthenticated, bookListController.up_book);
app.post('/down/:slug', authController.checkAuthenticated, bookListController.down_book);

app.get('/tipedit/:slug', authController.checkAuthenticated, tipController.tipEditor_get);
app.post('/tipedit/:slug', authController.checkAuthenticated, tipController.tipEditor_post);
app.post('/tipimage', authController.checkAuthenticated, tipController.tipimg_post);

app.post('/publishTip/:slug', authController.checkAuthenticated, tipListController.publish_tip);
app.get('/tiplist', authController.checkAuthenticated, tipListController.tipList_get);
app.post('/tiplist', authController.checkAuthenticated, tipListController.tipList_post);
app.post('/tipDelete', authController.checkAuthenticated, tipListController.tipList_delete);
app.post('/tipRename', authController.checkAuthenticated, tipListController.tipList_rename);
// app.post('/tipCover/:slug', authController.checkAuthenticated, tipListController.tipthumbimg_post);

app.get('/bio', authController.checkAuthenticated, bioController.bioeditor_get);
app.post('/bio', authController.checkAuthenticated, bioController.bioeditor_post);
app.post('/bioimage', authController.checkAuthenticated, bioController.bioimg_post);
app.post('/headshot', authController.checkAuthenticated, bioController.headshot_post);

// User Management Routes
app.get('/register', (req, res) => {
    res.render('register', { title: 'register', nav: 'register' });
});
app.post('/register', async (req, res) => {
    await bcrypt.hash(req.body.pass, salfInt, (err, hash) => {
    if(err) console.log(err);
        const user = new User({
            name: req.body.name,
            password: hash
        });
        user.save((err) => {
            if(err) {console.log(err)}
            else { res.redirect('/login');}
    });
})
});
app.get('/login', authController.checkNotAuthenticated, (req, res) => {
    res.render('login', { title: 'login', nav: 'login' });
});
app.post('/login', authController.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
}));
app.delete('/logout', authController.log_out);
