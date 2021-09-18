const express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const verify = require('../helpers/authVerify');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');
var nodemailer = require('nodemailer');
const { json } = require('express');
const jwt_decode = require('jwt-decode');
const sendEmailVerification = require('../helpers/emailVerification');
const passwordReset = require('../helpers/passwordReset');
const sendEmail = require('../helpers/sendEmail');
const {registerValidate, loginValidate, emailValidate, idValidate} = require('../helpers/validations');
const Joi = require('joi');
const FacebookTokenStrategy = require('passport-facebook-token');
const TwitterTokenStrategy = require('passport-twitter-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const passport = require('passport');
const axios = require('axios');
const randomstring = require("randomstring");

require('dotenv').config();

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

// used to deserialize the user
passport.deserializeUser(function(id, cb) {
    return cb(null,user)
});
//LOGIN:
router.post('/login', (req, res) => {
    console.log('Login eyyy');
    const { email, password} = req.body;

    const { error, value } = loginValidate.validate({ 
        email: email
    });
    
    if(!error){
        let query = db.query('SELECT u.*, b.email AS BlackListEmail FROM `users` u '+ 
                        'LEFT JOIN `blacklist` b ON u.email = b.email ' +
                        'WHERE u.email LIKE ? && u.provider LIKE \'vksz\'',[email], (err, results) => {
            if(err){
                console.log(err);
                res.status(400).json(err);
            }else {
                // console.log(results.length);
                // console.log(results);
                if(results.length === 1 && results[0].BlackListEmail === null && results[0].confirmed === 1){
                    const userEmail = results[0].email;
                    //const dbPassHash = results[0].pw_hash;
                    if(userEmail === email && bcrypt.compareSync(password, results[0].pw_hash)){
                        //Generate webtoken
                        // console.log('Generating webtoken with id: ' + results[0].user_id);
                        const accessToken = jwt.sign({ email: userEmail, role: results[0].role, id: results[0].user_id, provider: results[0].provider},
                                process.env.SECRET_KEY,
                                {expiresIn: "30m"}
                            );
                        res.json({
                            accessToken: accessToken
                        });
                    }else{
                        console.log("Wrong password");
                        res.status(400).json('Wrong password');
                    }
                }else{
                    //Error handling
                    if(results.length === 0){
                        console.log("No Email found");
                        res.status(400).json('No registered email found');
                    }else if(results[0].BlackListEmail !== null){
                        console.log("Email blacklisted?");
                        res.status(400).json('Email blacklisted');
                    }else if(results[0].confirmed === 0){
                        console.log("Email has not been confirmed yet, check your email or send another verification email?");
                        res.status(310).json('Email has not been confirmed yet, check your email or send another verification email?');
                    }
                    
                    if(results.length > 1){
                        console.log("More Email found?");
                        res.status(400).json('More Email found');
                    }
        
                }            
            }
        });
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }
});

//Register
router.post('/register', (req, res) => {
    const {email, firstname, lastname, password, zip, city, street, house_number, phone, device_token} = req.body;

    const { error, value } = registerValidate.validate({ 
        email: email,
        lastname: lastname,
        firstname: firstname,
        password: password,
        zip: zip,
        city: city,
        street: street,
        house_number: house_number,
        phone: phone,
        device_token: device_token
    });

    if(!error){
        //Load Default Avatar
        const avatarData = fs.readFileSync(process.env.DEFAULT_AVATAR_LOCATION, {encoding: 'base64'});

        //Password Crypt
        const hash = bcrypt.hashSync(password, saltRounds); 

        //Define user for "cleaner" query
        let user = {email: email,
                    last_name: lastname, 
                    first_name: firstname, 
                    pw_hash: hash,
                    zip: zip,
                    city: city,
                    street: street,
                    house_number: house_number,
                    phone: phone,
                    role: 'user',
                    provider: 'vksz',
                    provider_id: 0,
                    avatar: avatarData,
                    device_token: device_token
                };

        let blacklisted = 0;
        //Check the blacklist table for email
        db.query('SELECT * FROM `blacklist` WHERE email LIKE ?', [email], (err1, results1) => {
            if(err1){
                console.log(err1);
                res.status(400).json('Wrong query1');
            }else{
                if(results1.length === 1){
                    blacklisted = 1;
                }
                //Is Email in db?
                db.query('SELECT * FROM `users` WHERE email LIKE ?', [email], (err2, results2) => {
                    if(err2){
                        console.log(err2);
                        res.status(400).json('Wrong query2');
                    }else{
                        //Check if registered before and if blacklisted
                        if(results2.length === 0 && blacklisted === 0){
                            //Insert gottten user
                            db.query('INSERT INTO users SET ?', user, (err3, results3) => {
                                if(err3){
                                    console.log(err3);
                                    res.status(400).json('Wrong query3');
                                }else{
                                    console.log('InsertedID: ' + results3.insertId);
                                    //Get all of the news services 
                                    db.query('SELECT * FROM `news_services`', (err4, results4) => {
                                        if(err4){
                                            console.log(err4);
                                            res.status(400).json('Wrong query4');
                                        }else{
                                            //Make the notifications populating query
                                            let sql = 'INSERT INTO `user_notifs` (user_id, service_id) VALUES ';
                                            results4.map(r => {
                                                sql += `(${results3.insertId}, ${r.service_id}),`;
                                            });
                                            // console.log(sql);
                                            var str1 = sql.replace(/,$/,";");
                                            // console.log(str1);

                                            //Execute the notifications populating query
                                            db.query(str1, (err5, results5) => {
                                                if(err5){
                                                    console.log(err5);
                                                    res.status(400).json('Wrong query5');
                                                }else{
                                                    console.log(results5);
                                                    sendEmailVerification(req.body.email);
                                                    res.json({result: true});                                             
                                                }
                                            });                                       
                                        }       
                                    });                               
                                }
                            });
                        }else{
                            //If already registered or blacklisted
                            if(blacklisted === 1){
                                res.status(400).json('Email blacklisted');
                            }else{
                                res.status(400).json('Email already registered');
                            }
                        }
                    }        
                });  
            }
        });
        // console.log('No error');
        // res.json('No error');
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }   
});

//Confirmation Email
router.get('/confirmation/:token', (req, res) => {
    const token = req.params.token;

    if(token){
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if(err){
                return res.status(403).json("Token is invalid");
            }
            var decoded = jwt_decode(token);
            if(decoded.ver === "email"){
                db.query('SELECT * FROM users WHERE email LIKE ? AND provider LIKE \'vksz\'', [decoded.user], (err, results) => {
                    if(err){
                        console.log('Confirmation select user query error');
                        res.status(400).json('Confirmation select user query error');
                    }else{
                        if(results.length === 1){
                            if(results[0].confirmed === 0){
                                db.query('UPDATE users SET confirmed = 1 WHERE email LIKE ?', [decoded.user], (err, results) => {
                                    if(err){
                                        console.log('Email confirmation: Updating user\'s status failed');
                                        res.status(400).json('Email confirmation: Updating user\'s status failed');
                                    }else{
                                        return res.redirect(`${process.env.CLIENT_URL}/auth/login`);
                                    }
                                });
                            }else{
                                console.log('Email confirmation: Email already confirmed');
                                res.status(400).json('Email confirmation: Email already confirmed');
                            }
                        }else{
                            console.log('Email confirmation: There\'s no such user');
                            res.status(400).json('Email confirmation: There\'s no such user');
                        }
                    }
                });
            }else{
                res.status(400).json("Wrong token ver");
            }           
        });
    } else{
        res.status(401).json("Not authenticated");
    }
});

router.post('/confirmation', (req, res) => {
    const { error, value } = emailValidate.validate({ 
        email: req.body.email
    });
    
    if(!error){
        db.query('SELECT * FROM users WHERE email LIKE ? AND provider LIKE \'vksz\'', [req.body.email], (err, results)=>{
            if(err){
                console.log('Confirmation query error');
                res.status(400).json('Confirmation query error');
            }else{
                if(results.length === 1 && results[0].confirmed === 0){
    
                    sendEmailVerification(req.body.email);
                
                    res.json({result: true});
    
                }else{
                    if(results.length === 0){
                        console.log('There\'s no such email registered');
                        res.status(400).json('There\'s no such email registered');
                    }else if(results[0].confirmed === 1){
                        console.log('Email already confirmed');
                        res.status(400).json('Email already confirmed');
                    }
                    
                }
            }
        });
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }   
});

//Forgot password/reset password
router.get('/reset-password/:token', (req, res) => {
    const token = req.params.token;

    if(token){
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if(err){
                return res.status(403).json("Token is invalid");
            }
            var decoded = jwt_decode(token);
            if(decoded.ver === "password"){
                db.query('SELECT * FROM users WHERE email LIKE ? AND provider LIKE \'vksz\'', [decoded.user], (err, results) => {
                    if(err){
                        console.log('Confirmation select user query error');
                        res.status(400).json('Confirmation select user query error');
                    }else{
                        if(results.length === 1){
                            const pass = randomstring.generate({
                                length: 8,
                                charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                            });

                            const hash = bcrypt.hashSync(pass, saltRounds); 

                            db.query('UPDATE users SET pw_hash = ? WHERE email LIKE ? AND provider LIKE \'vksz\'', [hash, decoded.user], (err, results) => {
                                if(err){
                                    console.log('Password reset query failed');
                                    res.status(400).json('Password reset query failed');
                                }else{
                                    sendEmail(decoded.user, "Password Reset Successful", `Your password has been reset: ${pass}\nPlease change it quickly once you login`);

                                    res.json({result: true});
                                }
                            });
                        }else{
                            console.log('Email confirmation: There\'s no such user');
                            res.status(400).json('Email confirmation: There\'s no such user');
                        }
                    }
                });
            }else{
                res.status(400).json("Wrong token ver");
            }           
        });
    } else{
        res.status(401).json("Not authenticated");
    }
});

router.post('/reset-password', (req, res) => {
    const { error, value } = emailValidate.validate({ 
        email: req.body.email
    });
    
    if(!error){
        db.query('SELECT * FROM users WHERE email LIKE ? AND provider LIKE \'vksz\'', [req.body.email], (err, results)=>{
            if(err){
                console.log('Confirmation query error');
                res.status(400).json('Confirmation query error');
            }else{
                if(results.length === 1){
    
                    passwordReset(req.body.email);
                
                    res.json({result: true});
    
                }else{
                    if(results.length === 0){
                        console.log('There\'s no such email registered');
                        res.status(400).json('There\'s no such email registered');
                    }else{
                        console.log('Reset password something wrong');
                        res.status(400).json('Reset password something wrong');
                    }                   
                }
            }
        });
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }   
});

//Send User Model
router.get('/get-user', verify, (req, res) => {
    console.log('UserID:' + req.user.id);

    const { error, value } = idValidate.validate({ 
        req_user_id: req.user.id,
        req_body_user_id: req.user.id
    });
    
    if(!error){
        db.query('SELECT * FROM users WHERE user_id = ?',req.user.id, (err, results) => {
            if(err){
                console.log(err);
                res.status(400).json('Query error');
            }else{
                try {
                    const {user_id, email, last_name, first_name, role, pw_hash, phone, avatar, zip, city, street, house_number, provider} = results[0];
    
                db.query('SELECT * FROM `user_notifs` un LEFT JOIN `news_services` ns ON un.service_id = ns.service_id  WHERE un.user_id = ?', [req.user.id], (err1, results1) => {
                    if(err1){
                        console.log(err1);
                        res.status(400).json('Query error1');
                    }else{
                        if(results1.length !== 0){
                            let communications = [];
                            results1.map(r => {
                                communications.push({name: r.service_name, email: r.notif_email, sms: r.notif_sms, phone: r.notif_push_up, service_id: r.service_id});
                            });
                            // console.log(communication);
                            // res.send(communication);
                            //console.log(Buffer.from(avatar, 'base64').toString('base64') === avatar);
                            res.json({
                                id: user_id,
                                username: last_name + " " + first_name,
                                //password: "",
                                email: email,
                                firstname: first_name,
                                lastname: last_name,
                                phone: phone,
                                roles: [role],
                                provider: provider,
                                pic: avatar,
                                zip: zip,
                                city: city,
                                house_number: house_number,
                                street: street,
                                communication: communications
                            });
                            //console.log('Sent json');
                        }else{
                            console.log('No notifications available for this user');
                            res.status(400).json('No notifications available for this user: ' + email);
                        }           
                    }
                }); 
                } catch (error) {
                    console.log('Trycatch error');
                    res.status(400).json(error);
                }    
            }        
        });
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }    
});

/* Facebook login VALIDATION/CHECKING ON SERVER */
passport.use('facebook-token', new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    fbGraphVersion: 'v11.0',
    passReqToCallback:true
    },function(req,accessToken, refreshToken, profile, done) {
    //
    db.query('SELECT * FROM `blacklist` WHERE email LIKE ?', [profile.emails[0].value], (err, resultStart) => {
        if(err){
            console.log('facebook token login query error resultStart');
            return done(err);
        }else{
            let blacklisted = 0;
            if(resultStart.length > 0){
                blacklisted = 1;
            }

            if(blacklisted === 0){
                db.query('SELECT * FROM `users` WHERE email LIKE ? && provider LIKE \'facebook\'', [profile.emails[0].value], (err, result) => {
                    if(err){
                        console.log('facebook token login query error result');
                        return done(err);
                    }else{
                        if(result.length === 1){
                            if(result[0].confirmed === 1){
                                console.log('facebook login');
                                const accessToken = jwt.sign({ email: profile.emails[0].value, role: result[0].role, id: result[0].user_id, provider: result[0].provider},
                                    process.env.SECRET_KEY,
                                    {expiresIn: "30m"}
                                );
                                done(null,accessToken);
                            }else{
                                console.log('facebook token login user blacklisted or unconfirmed');
                                return done('facebook token login user blacklisted or unconfirmed');
                            }
                        }else if(result.length === 0){
                            console.log('facebook registering');
                            axios.get(profile.photos[0].value)
                            .then(function (response){
                                console.log(response.request.res.responseUrl);
                                axios.get(response.request.res.responseUrl,{responseType: 'arraybuffer'})
                                .then( response => {
                                    const user = {
                                        email: profile.emails[0].value,
                                        last_name: profile.name.familyName, 
                                        first_name: profile.name.middleName === ""? profile.name.givenName : (profile.name.givenName + " " + profile.name.middleName), 
                                        pw_hash: "",
                                        zip: 0000,
                                        city: "",
                                        street: "",
                                        house_number: "",
                                        phone: "",
                                        role: 'user',
                                        provider: 'facebook',
                                        provider_id: profile.id,
                                        confirmed: 1,
                                        avatar: Buffer.from(response.data, 'binary').toString('base64'),
                                        device_token: req.body.device_token
                                    };

                                    db.query('INSERT INTO users SET ?', user, (err3, results3) => {
                                        if(err3){
                                            console.log(err3);
                                            done(err3);
                                        }else{
                                            console.log('InsertedID: ' + results3.insertId);
                                            //Get all of the news services 
                                            db.query('SELECT * FROM `news_services`', (err4, results4) => {
                                                if(err4){
                                                    console.log(err4);
                                                    done(err4)
                                                }else{
                                                    //Make the notifications populating query
                                                    let sql = 'INSERT INTO `user_notifs` (user_id, service_id) VALUES ';
                                                    results4.map(r => {
                                                        sql += `(${results3.insertId}, ${r.service_id}),`;
                                                    });
                                                    var str1 = sql.replace(/,$/,";");

                                                    //Execute the notifications populating query
                                                    db.query(str1, (err5, results5) => {
                                                        if(err5){
                                                            console.log(err5);
                                                            done(err5);
                                                        }else{
                                                            console.log(results5);
                                                            const accessToken = jwt.sign({ email: profile.emails[0].value, role: 'user', id: results3.insertId, provider: 'facebook'},
                                                                process.env.SECRET_KEY,
                                                                {expiresIn: "30m"}
                                                            );
                                                            done(null,accessToken);                                           
                                                        }
                                                    });                                       
                                                }       
                                            });                               
                                        }
                                    });
                                }).catch(function (error){
                                    done(error);
                                })
                            }).catch(function (error){
                                done(error);
                            })
                        }else{
                            done(`There are more than 0 and 1 results with email: ${profile.emails[0].value} with the provider: facebook`);
                        }
                    }
                })               
            }else{
                return done('Facebook login/register blacklisted');
            }           
        }
    })
    }
));

router.get('/facebook/token', (req, res) => {
        passport.authenticate('facebook-token', function (err, accessToken, info) {
            if(err){
                if(err.oauthError){
                    var oauthError = JSON.parse(err.oauthError.data);
                    res.status(400).json(oauthError.error.message);
                } else {
                    res.status(400).json(err);
                }
            } else {
                console.log('Facebook Token all login/register all good');
                res.json(accessToken);
            }
        })(req, res);
    }
);
/* Facebook login VALIDATION/CHECKING ON SERVER */

/* Twitter login VALIDATION/CHECKING ON SERVER */
passport.use(new TwitterTokenStrategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_KEY_SECRET,
    includeEmail: true,
    passReqToCallback:true
    }, function(req, token, tokenSecret, profile, done) {
        db.query('SELECT * FROM `blacklist` WHERE email LIKE ?', [profile.emails[0].value], (err, resultStart) => {
        if(err){
            console.log('Twitter token login query error resultStart');
            return done(err);
        }else{
            let blacklisted = 0;
            if(resultStart.length > 0){
                blacklisted = 1;
            }

            if(blacklisted === 0){
                db.query('SELECT * FROM `users` WHERE email LIKE ? && provider LIKE \'twitter\'', [profile.emails[0].value], (err, result) => {
                    if(err){
                        console.log('Twitter token login query error result');
                        return done(err);
                    }else{
                        if(result.length === 1){
                            if(result[0].confirmed === 1){
                                console.log('twitter login');
                                const accessToken = jwt.sign({ email: profile.emails[0].value, role: result[0].role, id: result[0].user_id, provider: result[0].provider},
                                    process.env.SECRET_KEY,
                                    {expiresIn: "30m"}
                                );
                                done(null,accessToken);
                            }else{
                                console.log('Twitter token login user blacklisted or unconfirmed');
                                return done('Twitter token login user blacklisted or unconfirmed');
                            }
                        }else if(result.length === 0){
                            console.log('twitter registering');
                            axios.get(profile.photos[0].value,{responseType: 'arraybuffer'})
                            .then( response => {
                                const user = {
                                    email: profile.emails[0].value,
                                    last_name: profile.displayName, 
                                    first_name: "", 
                                    pw_hash: "",
                                    zip: 0000,
                                    city: "",
                                    street: "",
                                    house_number: "",
                                    phone: "",
                                    role: 'user',
                                    provider: 'twitter',
                                    provider_id: profile.id,
                                    confirmed: 1,
                                    avatar: Buffer.from(response.data, 'binary').toString('base64'),
                                    device_token: req.body.device_token
                                };
            
                                db.query('INSERT INTO users SET ?', user, (err3, results3) => {
                                    if(err3){
                                        console.log(err3);
                                        done(err3);
                                    }else{
                                        console.log('InsertedID: ' + results3.insertId);
                                        //Get all of the news services 
                                        db.query('SELECT * FROM `news_services`', (err4, results4) => {
                                            if(err4){
                                                console.log(err4);
                                                done(err4)
                                            }else{
                                                //Make the notifications populating query
                                                let sql = 'INSERT INTO `user_notifs` (user_id, service_id) VALUES ';
                                                results4.map(r => {
                                                    sql += `(${results3.insertId}, ${r.service_id}),`;
                                                });
                                                // console.log(sql);
                                                var str1 = sql.replace(/,$/,";");
                                                // console.log(str1);
            
                                                //Execute the notifications populating query
                                                db.query(str1, (err5, results5) => {
                                                    if(err5){
                                                        console.log(err5);
                                                        done(err5);
                                                    }else{
                                                        console.log(results5);
                                                        const accessToken = jwt.sign({ email: profile.emails[0].value, role: 'user', id: results3.insertId, provider: 'twitter'},
                                                            process.env.SECRET_KEY,
                                                            {expiresIn: "30m"}
                                                        );
                                                        done(null,accessToken);                                           
                                                    }
                                                });                                       
                                            }       
                                        });                               
                                    }
                                });
                            })
                            .catch(function (error){
                                done(error);
                            })
                        }else{
                            done(`There are more than 0 and 1 people with email: ${profile.emails[0].value} with the provider: twitter`);
                        }
                    }
                })               
            }else{
                return done('Twitter login/register blacklisted');
            }           
        }
    })
  }
));

router.get('/twitter/token', (req, res) => {
        passport.authenticate('twitter-token', function (err, accessToken, info) {
            if(err){
                if(err.oauthError){
                    res.status(400).json(err.oauthError.data);
                } else {
                    res.status(400).json(err);
                }
            } else {
                console.log('Twitter Token all login/register all good');
                res.json(accessToken);
            }
        })(req, res);
    }
);
/* Twitter login VALIDATION/CHECKING ON SERVER */

/* Google login VALIDATION/CHECKING ON SERVER */
passport.use(new GoogleTokenStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    passReqToCallback: true
  },
    function(req, accessToken, refreshToken, profile, done) {
        console.log(profile);
        db.query('SELECT * FROM `blacklist` WHERE email LIKE ?', [profile.emails[0].value], (err, resultStart) => {
            if(err){
                console.log('google token login query error resultStart');
                return done(err);
            }else{
                let blacklisted = 0;
                if(resultStart.length > 0){
                    blacklisted = 1;
                }

                if(blacklisted === 0){
                    db.query('SELECT * FROM `users` WHERE email LIKE ? && provider LIKE \'google\'', [profile.emails[0].value], (err, result) => {
                        if(err){
                            console.log('google token login query error result');
                            return done(err);
                        }else{
                            if(result.length === 1){
                                if(result[0].confirmed === 1){
                                    console.log('google login');
                                    const accessToken = jwt.sign({ email: profile.emails[0].value, role: result[0].role, id: result[0].user_id, provider: result[0].provider},
                                        process.env.SECRET_KEY,
                                        {expiresIn: "30m"}
                                    );
                                    done(null,accessToken);
                                }else{
                                    console.log('google token login user blacklisted or unconfirmed');
                                    return done('google token login user blacklisted or unconfirmed');
                                }
                            }else if(result.length === 0){
                                console.log('google registering');
                                axios.get(profile._json.picture,{responseType: 'arraybuffer'})
                                .then( response => {
                                    const user = {
                                        email: profile.emails[0].value,
                                        last_name: profile.name.familyName, 
                                        first_name: profile.name.givenName, 
                                        pw_hash: "",
                                        zip: 0000,
                                        city: "",
                                        street: "",
                                        house_number: "",
                                        phone: "",
                                        role: 'user',
                                        provider: 'google',
                                        provider_id: profile.id,
                                        confirmed: 1,
                                        avatar: Buffer.from(response.data, 'binary').toString('base64'),
                                        device_token: req.body.device_token
                                    };
                
                                    db.query('INSERT INTO users SET ?', user, (err3, results3) => {
                                        if(err3){
                                            console.log(err3);
                                            done(err3);
                                        }else{
                                            console.log('InsertedID: ' + results3.insertId);
                                            //Get all of the news services 
                                            db.query('SELECT * FROM `news_services`', (err4, results4) => {
                                                if(err4){
                                                    console.log(err4);
                                                    done(err4)
                                                }else{
                                                    //Make the notifications populating query
                                                    let sql = 'INSERT INTO `user_notifs` (user_id, service_id) VALUES ';
                                                    results4.map(r => {
                                                        sql += `(${results3.insertId}, ${r.service_id}),`;
                                                    });
                                                    // console.log(sql);
                                                    var str1 = sql.replace(/,$/,";");
                                                    // console.log(str1);
                
                                                    //Execute the notifications populating query
                                                    db.query(str1, (err5, results5) => {
                                                        if(err5){
                                                            console.log(err5);
                                                            done(err5);
                                                        }else{
                                                            console.log(results5);
                                                            const accessToken = jwt.sign({ email: profile.emails[0].value, role: 'user', id: results3.insertId, provider: 'google'},
                                                                process.env.SECRET_KEY,
                                                                {expiresIn: "30m"}
                                                            );
                                                            done(null,accessToken);                                           
                                                        }
                                                    });                                       
                                                }       
                                            });                               
                                        }
                                    });
                                })
                                .catch(function (error){
                                    done(error);
                                })
                            }else{
                                done(`There are more than 0 and 1 people with email: ${profile.emails[0].value} with the provider: google`);
                            } 
                        }
                    })               
                }else{
                    return done('Google login/register blacklisted');
                }           
            }
        })
    }
));

router.get('/google/token', (req, res) => {
        passport.authenticate('google-token', function (err, accessToken, info) {
            if(err){
                if(err.oauthError){
                    res.status(400).json(err.oauthError.data);
                } else {
                    res.status(400).json(err);
                }
            } else {
                console.log('Google Token all login/register all good');
                res.json(accessToken);
            }
        })(req, res);
    }
);
/* Google login VALIDATION/CHECKING ON SERVER */

module.exports = router;