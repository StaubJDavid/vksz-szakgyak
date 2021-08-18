const express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const verify = require('../helpers/authVerify');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');

//LOGIN:
router.post('/login', (req, res) => {
    const { email, password} = req.body;

    let query = db.query('SELECT u.*, b.email AS BlackListEmail FROM `users` u '+ 
                        'LEFT JOIN `blacklist` b ON u.email = b.email ' +
                        'WHERE u.email LIKE ?',[email], (err, results) => {
        if(err){
            console.log(err);
            res.status(400).json(err);
        }else {
            // console.log(results.length);
            // console.log(results);
            if(results.length === 1 && results[0].BlackListEmail === null){
                const userEmail = results[0].email;
                //const dbPassHash = results[0].pw_hash;
                if(userEmail === email && bcrypt.compareSync(password, results[0].pw_hash)){
                    //Generate webtoken
                    const accessToken = jwt.sign({ email: userEmail, role: results[0].role},
                            process.env.SECRET_KEY,
                            {expiresIn: "10m"}
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
                }

                if(results.length > 1){
                    console.log("More Email found?");
                    res.status(400).json('More Email found');
                }

                if(results[0].BlackListEmail !== null){
                    console.log("Email blacklisted?");
                    res.status(400).json('Email blacklisted');
                }
                
            }            
        }
    });
});

//Register
router.post('/register', (req, res) => {
    const {email, firstname, lastname, password, zip, city, street, house_number, phone} = req.body;

    //Load Default Avatar
    const avatarData = fs.readFileSync('./media/blank.png', {encoding: 'base64'});

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
            };

    let blacklisted = 0;
    //Check the blacklist table for email
    db.query('SELECT * FROM `blacklist` WHERE email LIKE ?', [email], (err1, results1) => {
        if(err1){
            console.log(err1);
            res.status(400).end();
        }else{
            if(results1.length === 1){
                blacklisted = 1;
            }
            //Is Email in db?
            db.query('SELECT * FROM `users` WHERE email LIKE ?', [email], (err2, results2) => {
                if(err2){
                    console.log(err2);
                    res.status(400).end();
                }else{
                    //Check if registered before and if blacklisted
                    if(results2.length === 0 && blacklisted === 0){
                        //Insert gottten user
                        db.query('INSERT INTO users SET ?', user, (err3, results3) => {
                            if(err3){
                                console.log(err3);
                                res.status(400).end();
                            }else{

                                //Get all of the news services 
                                db.query('SELECT * FROM `news_services`', (err4, results4) => {
                                    if(err4){
                                        console.log(err4);
                                    }else{
                                        //Make the notifications populating query
                                        let sql = 'INSERT INTO `user_notifs` (email, service_name) VALUES ';
                                        results4.map(r => {
                                            sql += `('${email}', '${r.service_name}'),`;
                                        });
                                        var str1 = sql.replace(/,$/,";");
                                        //console.log(str1);

                                        //Execute the notifications populating query
                                        db.query(str1, (err5, results5) => {
                                            if(err5){
                                                console.log(err5);
                                                res.status(400).end();
                                            }else{
                                                //Everything is good, inserted user to users table, inserted default user notifications into user_notifs
                                                //Create a JWT with current user email, and role user
                                                const accessToken = jwt.sign({ email: email, role: "user"},
                                                    process.env.SECRET_KEY,
                                                    {expiresIn: "2m"}
                                                );
                                                //Send the auth model to frontend
                                                res.json({accessToken: accessToken});
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
});

//Send User Model
router.get('/get-user', verify, (req, res) => {
    db.query('SELECT * FROM users WHERE email LIKE ?',req.user.email, (err, results) => {
        if(err){
            res.status(400).json('Query error');
        }else{
            const {id, email, last_name, first_name, role, pw_hash, phone, avatar, zip, city, street, house_number} = results[0];

            db.query('SELECT * FROM `user_notifs` WHERE email LIKE ?', email, (err1, results1) => {
                if(err1){
                    console.log(err1);
                    res.send(err1);
                }else{
                    if(results1.length !== 0){
                        let communications = [];
                        results1.map(r => {
                            communications.push({name: r.service_name, email: r.notif_email, sms: r.notif_sms, phone: r.notif_push_up});
                        });
                        // console.log(communication);
                        // res.send(communication);
                        //console.log(Buffer.from(avatar, 'base64').toString('base64') === avatar);
                        res.json({
                            id: id,
                            username: last_name + " " + first_name,
                            //password: "",
                            email: email,
                            firstname: first_name,
                            lastname: last_name,
                            phone: phone,
                            roles: [role],
                            pic: avatar,
                            address: {addressLine: zip + " " + city + " " + street + " " + house_number, city: city, state: city + ' megye', street: street, house_number: house_number, postCode: zip},
                            communication: communications
                        });
                        //console.log('Sent json');
                    }else{
                        console.log('Not Good');
                        res.send('Not Good');
                    }           
                }
            });
            //res.json({id: id, username: `${last_name} ${first_name}`, password: pw_hash, email: email, firstname: first_name,lastname: last_name});           
        }        
    });   
});

module.exports = router;