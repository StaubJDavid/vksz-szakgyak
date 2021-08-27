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
const {registerValidate, loginValidate, emailValidate, idValidate} = require('../helpers/validations');
const Joi = require('joi');
require('dotenv').config();
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
                        'WHERE u.email LIKE ?',[email], (err, results) => {
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
                        const accessToken = jwt.sign({ email: userEmail, role: results[0].role, id: results[0].user_id},
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
            db.query('SELECT * FROM users WHERE email LIKE ?', [decoded.user], (err, results) => {
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
        db.query('SELECT * FROM users WHERE email LIKE ?', [req.body.email], (err, results)=>{
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
                const {user_id, email, last_name, first_name, role, pw_hash, phone, avatar, zip, city, street, house_number} = results[0];
    
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
            }        
        });
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }    
});

module.exports = router;