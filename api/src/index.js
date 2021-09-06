const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./database/db');
const fs = require('fs');
var nodemailer = require('nodemailer');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { registerValidate, emailTestValidate } = require('./helpers/validations');
var https = require('https');
var http = require('http');
var privateKey  = fs.readFileSync('ssl/selfsigned.key', 'utf8');
var certificate = fs.readFileSync('ssl/selfsigned.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
const FacebookTokenStrategy = require('passport-facebook-token');

require('dotenv').config();

const app = express();
app.use('*', cors());
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



passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://localhost:8443/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'name', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    // console.log(accessToken);
    return cb(null, profile);
  }
));

// passport.use('facebook-token', new FacebookTokenStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     fbGraphVersion: 'v11.0'
//   },
//   function(accessToken, refreshToken, profile, done) {
//     // console.log(profile);

//     console.log(accessToken);
//     var user = {
//         'email': profile.emails[0].value,
//         'name' : profile.name.givenName + ' ' + profile.name.familyName,
//         'id'   : profile.id,
//         'token': accessToken
//     }

//     // You can perform any necessary actions with your user at this point,
//     // e.g. internal verification against a users table,
//     // creating new user entries, etc.

//     return done(null, user); // the user object we just made gets passed to the route's controller as `req.user`
//   }
// ));

// app.get('/my/api/:access_token/endpoint', passport.authenticate('facebook-token'), 
//         function (req, res) {
//             if (req.user){
//                 //you're authenticated! return sensitive secret information here.
//                 res.send(200, {'secrets':['array','of','top','secret','information']});
//             } else {
//                 // not authenticated. go away.
//                 res.send(401)
//             }

// });

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

// used to deserialize the user
passport.deserializeUser(function(id, cb) {
    return cb(null,user)
});

app.get('/auth/facebook', passport.authenticate('facebook' , {session: false, authType: 'reauthenticate', scope: 'email'}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/test' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log('callback req user')
    console.log(`ID: ${req.user._json.id}`);
    console.log(`Last Name: ${req.user._json.last_name}`);
    console.log(`First Name: ${req.user._json.first_name}`);
    console.log(`Email: ${req.user._json.email}`);
    console.log(`Access token: ${req.user._json.access_token}`);
    console.log(req.user);
    res.redirect('/logsucc');
  });

app.get('/logout',function (req, res){
    req.logout();
    res.send('Logged out?');
});

//Social Login End
app.get('/test', (req, res) => {
    res.send('Oh noo');
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
