const express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../db');
const jwt_decode = require('jwt-decode');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');

/*LOGIN:

*/
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

//email: string, firstname: string, lastname: string, password: string
//Register
router.get('/pfp', (req, res) => {
    
     
    res.send(avatarData);
});

router.post('/register', (req, res) => {
    const {email, firstname, lastname, password, zip, city, street, house_number, phone} = req.body;

    const avatarData = fs.readFileSync('./src/test.jpg', {encoding: 'base64'});

    //Password Crypt
    const hash = bcrypt.hashSync(password, saltRounds); 
    //console.log('HashedPassword2: ' + hash);

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

const verify = (req, res, next) =>{
    const authHeader = req.headers.authorization;

    if(authHeader){
        //authHeader: "Bearer ..."
        //Remove the Bearer part
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if(err){
                return res.status(403).json("Token is invalid");
            }
            console.log('Authorized');
            req.user = user;
            next();
        });
    } else{
        res.status(401).json("Not authenticated");
    }
};

//Send User Model
router.get('/get-user', verify, (req, res) => {
    // console.log("User: " + req.user.email);
    // console.log("User: " + req.user.role);

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
                            password: "no password for u",
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

router.get('/admin/get-user-by-email', verify, (req,res) => {
    if(req.user.role === 'admin'){
        db.query('SELECT * FROM users WHERE email LIKE ?',req.body.email, (err, results) => {
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
                                password: "no password for u",
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
                            console.log('Result is 0');
                            res.send('Result is 0');
                        }           
                    }
                });
                //res.json({id: id, username: `${last_name} ${first_name}`, password: pw_hash, email: email, firstname: first_name,lastname: last_name});           
            }        
        }); 
    }else{
        console.log('Nem admin');
        res.end('No result');
    }
})

router.post('/change-details', verify, (req, res) => {
    console.log(req.user.email);
    console.log(req.body);
    db.query('SELECT * FROM `users` WHERE email LIKE ?', [req.user.email], (err, results) => {
        if(err){
            console.log(err);
            res.json({result: false});
        }else{
            //console.log(req.body.firstname === '' ? results[0].first_name:req.body.firstname);
            db.query('UPDATE `users` SET first_name = ? , last_name = ? , zip = ? , city = ? , street = ? , house_number = ? , phone = ? WHERE email LIKE ?', [
                (req.body.firstname === '' ? results[0].first_name : req.body.firstname),
                (req.body.lastname === '' ? results[0].last_name : req.body.lastname),
                (req.body.zip === '' ? results[0].zip : req.body.zip),
                (req.body.city === '' ? results[0].city : req.body.city),
                (req.body.street === '' ? results[0].street : req.body.street),
                (req.body.house_number === '' ? results[0].house_number : req.body.house_number),
                (req.body.phone === '' ? results[0].phone : req.body.phone),
                req.user.email
            ], (err1, results1) => {
                if(err){
                    console.log(err1);
                    res.json({result: false});
                }else{
                    //console.log(results1);
                    res.json({result: true})
                }
            })
        }
    });
})

router.get('/admin/get-users', verify, (req, res) => {
    if(req.user.role === 'admin'){       
        db.query('SELECT u.*, b.email AS BlackListEmail FROM `users` u '+ 
        'LEFT JOIN `blacklist` b ON u.email = b.email', (err, results) => {
            if(err){
                console.log(err);
                res.status(400).json(err);
            }else{
                let users = [];
                results.map(r => {
                    users.push({id: r.id, email: r.email, firstname: r.first_name, lastname: r.last_name, pic: r.avatar, phone: r.phone, blacklisted: (r.BlackListEmail === null ? 0:1)});
                })
                //console.log(users);
                res.json({users: users});
            }
        })
    }else{
        console.log('Nem admin');
        res.json({result: false});
    }
});

router.post('/admin/block-user', verify, (req, res) => {
    if(req.user.role === 'admin'){
        // console.log('Requester is admin');
        // console.log('Email sent: ' + req.body.email);
        db.query('SELECT u.*, b.email AS BlackListEmail FROM `users` u '+ 
        'LEFT JOIN `blacklist` b ON u.email = b.email ' +
        'WHERE u.email LIKE ?',[req.body.email], (err, results) => {
            if(err){
                console.log(err);
                res.status(400).json(err);
            }else{
                // console.log('BlacklistEmail: ' + results[0].BlackListEmail);
                // console.log(results[0].BlackListEmail === req.body.email);
                if(results[0].BlackListEmail === null){
                    db.query('INSERT INTO `blacklist` (email) VALUES (?)', [req.body.email], (err, results) => {
                        if(err){
                            console.log(err);
                            res.status(400).json({result: false});
                        }else{
                            // console.log(results);
                            res.json({result: true});
                        }
                    });
                }else if(results[0].BlackListEmail === req.body.email){
                    db.query('DELETE FROM `blacklist` WHERE email LIKE ?', [req.body.email], (err, results) => {
                        if(err){
                            console.log(err);
                            res.status(400).json({result: false});
                        }else{
                            // console.log(results);
                            res.json({result: true});
                        }
                    });
                }else{
                    console.log('BlacklistMail is not null and not equals the req.body.email');
                    res.status(400).json({result: false});
                }
            }
        })
    }else{
        console.log('Nem admin');
        res.json({result: false});
    }
})

router.put('/update-notifications', verify, (req,res) => {
    let count = 0;
    req.body.notifications.map((n) => {
        db.query('UPDATE `user_notifs` SET `notif_email`= ? , `notif_sms` = ? , `notif_push_up` = ? WHERE `email` LIKE ? && `service_name` LIKE ?', 
                [n.email, n.sms, n.phone, req.user.email, n.name], 
                (err, results) => {
                    if(err){
                        console.log(err);
                        res.json({result: false});
                    }{
                        count++;
                        if(count === req.body.notifications.length){
                            res.json({result: true});
                        }
                    }
                }
        )
    });   
});

module.exports = router;