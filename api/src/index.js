const express = require('express');
var session = require('express-session')
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./database/db');
const fs = require('fs');
var nodemailer = require('nodemailer');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { registerValidate, emailTestValidate } = require('./helpers/validations');
var https = require('https');
var http = require('http');
var privateKey  = fs.readFileSync('ssl/selfsigned.key', 'utf8');
var certificate = fs.readFileSync('ssl/selfsigned.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
const axios = require('axios');

require('dotenv').config();

const app = express();
app.use('*', cors());
app.use(session({ secret: 'SECRET',
                    resave: false,
                    saveUninitialized: true,
                    cookie: { secure: true } 
                }));
app.use(express.json({ limit: '12MB' }));
app.use(passport.initialize());
app.use(passport.session());


var authRouter = require('./routes/auth');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

app.use('/api/auth', cors(), authRouter);
app.use('/api/user', cors(), userRouter);
app.use('/api/admin', cors(), adminRouter);

app.get('/', (req, res) => {
    res.send('Home');
});

//Helpers/Tests

//Social Login Begin


/* To emulate creating token on client */
//Facebook
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://localhost:8443/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'name', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    var user = {
        'email': profile.emails[0].value,
        'name' : profile.name.givenName + ' ' + profile.name.familyName,
        'id'   : profile.id,
        'token': accessToken
    }
    return cb(null, user);
  }
));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

// used to deserialize the user
passport.deserializeUser(function(id, cb) {
    return cb(null,user)
});

app.get('/auth/facebook', passport.authenticate('facebook' , {session: false, authType: 'reauthenticate', scope: ['email', 'public_profile']}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/test' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(req.user);
    res.json(req.user.token);
});

/* To emulate creating token on client */
//Twitter
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_KEY_SECRET,
    callbackURL: "https://127.0.0.1:8443/auth/twitter/callback"
    },
    function(token, tokenSecret, profile, done) {
        console.log(token);
        console.log(tokenSecret);
        console.log(profile);
        var user = {
            'name': profile.username,
            'id' : profile.id,
            'photo' : profile.photos[0].value,
            'token': token
        }
        // console.log(token);
        // console.log(profile);
        done(null, user);
    }
));

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/home' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(req.user.name);
    // console.log(req.user);
    res.json(req.user);
});

//Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://localhost:8443/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        var user = {
            'profile': profile,
            'accessToken': accessToken
        }
       done(null, user);
  }
));

app.get('/auth/google', passport.authenticate('google', { scope: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback',passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        res.json(req.user);
    }
);

//Social Login End
app.get('/logout',function (req, res){
    req.logout();
    res.send('Logged out?');
});

app.get('/test', (req, res) => {
    axios.get('https://graph.facebook.com/v11.0/3198393003728480/picture?type=large')
    .then(function (response){
        console.log(response.request.res.responseUrl);
        axios.get(response.request.res.responseUrl,{responseType: 'arraybuffer'})
        .then( response => {
            db.query('INSERT INTO facebook_photo (avatar) VALUES (?)',[Buffer.from(response.data, 'binary')], (err, result) => {
                if(err){
                    console.log(err);
                    res.json(err);
                }else{
                    console.log('Inserted');
                    res.json('Inserted');
                }
            });
        })
    })
    .catch(function (error){
        res.json(error);
    })
});

app.get('/logsucc', (req, res) => {
    res.send('Oh yes');
});

app.get('/createdb', (req, res) => {
    let sql = 'CREATE TABLE IF NOT EXISTS `users` (' +
        '`user_id` INT NOT NULL AUTO_INCREMENT,' +
        '`email` VARCHAR(255),' +
        '`last_name` VARCHAR(20),' +
        '`first_name` VARCHAR(20),' +
        '`pw_hash` VARCHAR(255),' +
        '`zip` VARCHAR(4),' +
        '`city` VARCHAR(35),' +
        '`street` VARCHAR(35),' +
        '`house_number` VARCHAR(100),' +
        '`phone` VARCHAR(20),' +
        '`role` ENUM(\'user\', \'admin\'),' +
        '`provider` ENUM(\'vksz\', \'facebook\', \'google\', \'twitter\'),' +
        '`provider_id` INT NOT NULL ,' +
        '`confirmed` BOOLEAN DEFAULT 0,' +
        '`avatar` MEDIUMBLOB,' +
        '`device_token` VARCHAR(255),' +
        'PRIMARY KEY (`user_id`)' +
        ');';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('Something\'s wrong with the user table creation: ' + err);
        } else {
            console.log('Users created');
        }
    });

    //News Services Table
    sql = 'CREATE TABLE IF NOT EXISTS `news_services` (' +
        '`service_id` INT NOT NULL AUTO_INCREMENT,' +
        '`service_name` VARCHAR(255),' +
        'PRIMARY KEY (`service_id`)' +
        ');';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('Something\'s wrong with the News Services table creation: ' + err);
        } else {
            console.log('News Services created');
        }
    });

    //Notif Type Table
    sql = 'CREATE TABLE IF NOT EXISTS `notif_type` (' +
        '`notif_id` INT NOT NULL AUTO_INCREMENT,' +
        '`notif_name` VARCHAR(255),' +
        'PRIMARY KEY (`notif_id`)' +
        ');';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('Something\'s wrong with the Notif Type table creation: ' + err);
        } else {
            console.log('Notif Type created');
        }
    });

    //Blacklist Table
    sql = 'CREATE TABLE IF NOT EXISTS `blacklist` (' +
        '`blacklist_id` INT NOT NULL AUTO_INCREMENT,' +
        '`email` VARCHAR(255),' +
        'FOREIGN KEY (blacklist_id) REFERENCES users(user_id)' +
        ');';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('Something\'s wrong with the Blacklist table creation: ' + err);
        } else {
            console.log('Blacklist table created');
        }
    });

    //User Notif Table
    sql = 'CREATE TABLE IF NOT EXISTS `user_notifs` (' +
        '`user_notif_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,' +
        '`user_id` INT NOT NULL,' +
        '`service_id` INT NOT NULL,' +
        '`notif_email` BOOLEAN DEFAULT 0,' +
        '`notif_sms` BOOLEAN DEFAULT 0,' +
        '`notif_push_up` BOOLEAN DEFAULT 0,' +
        'FOREIGN KEY (user_id) REFERENCES users(user_id), ' +
        'FOREIGN KEY (service_id) REFERENCES news_services(service_id) ' +
        ');';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('Something\'s wrong with the User Notifs table creation: ' + err);
        } else {
            console.log('User Notifs created');
        }
    });

    sql = "INSERT INTO `notif_type`(`notif_name`) VALUES ('notif_email'), ('notif_sms'), ('notif_push_up')";
    db.query(sql, (err, result) => {
        if (err) {
            console.log('Notif type Insert something wrong: ' + err);
        } else {
            console.log('Inserted into notif_type');
        }
    });

    sql = "INSERT INTO `news_services`(`service_name`) VALUES ('Hulladékszállítás'), ('Lomtalanítás'), ('Hírek'), ('Valami'), ('PluszCucc')";
    db.query(sql, (err, result) => {
        if (err) {
            console.log('news services Insert something wrong: ' + err);
        } else {
            console.log('Inserted into news_services');
        }
    });

    res.json('DB Check log');
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// app.listen(process.env.PORT, () => {
//     console.log(`Listening to ${process.env.PORT}`);
// });

httpServer.listen(3001, () => {
    console.log('http 3001');
});

httpsServer.listen(8443, () => {
    console.log('https 8443');
});
