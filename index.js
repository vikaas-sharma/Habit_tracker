require("dotenv").config();
const express = require('express');
const port = 8000;
const app = express();

const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const db = require('./config/mongoose');

// require connect-flash
const flash = require('connect-flash');
const flashMiddleware = require('./config/flashMiddleware');

// used for session cookies
const session = require("express-session");
const passport = require('passport');
const passportLocal = require('./config/passport_local');

const MongoStore = require('connect-mongo');



// layouts for ejs
app.use(expressLayouts);
app.use(bodyParser.urlencoded({extended:false}));

// set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./assets')); 


if (!process.env.MONGODB_URL) {
    console.error("Error: MONGODB_URL environment variable not found!");
    process.exit(1); // Exit the application if the variable is missing
  }
//mongo store is used to store the session cookie
app.use(session({
    name: 'habitTracker',
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: MongoStore.create(
        {
            mongoUrl: process.env.MONGODB_URL,
            autoRemover : 'disabled'
        },
        function(err){
            console.log("Error in the mongo-store");
        }
    ),
}));

// Using passport
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

// flash middleware
app.use(flash());
app.use(flashMiddleware.setFlash);

// use express router
app.use('/', require('./routes'));

// directing the app in the given port
app.listen(port, function(err) {
    if(err) {
        console.log('Error', err);
        return;
    }
    console.log('Server is up and running on port: ', port);

});