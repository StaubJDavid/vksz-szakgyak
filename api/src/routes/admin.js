const express = require('express');
var router = express.Router();
const db = require('../database/db');
const verify = require('../helpers/authVerify');


//Admin Stuff
router.post('/get-user-by-email', verify, (req,res) => {
    // console.log(req.user.role);
    if(req.user.role === 'admin'){
        // console.log('Request body email: ' + req.body.email);
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
                            res.json({user:{
                                id: id,
                                username: last_name + " " + first_name,
                                //password: "no password for u",
                                email: email,
                                firstname: first_name,
                                lastname: last_name,
                                phone: phone,
                                roles: [role],
                                pic: avatar,
                                address: {addressLine: zip + " " + city + " " + street + " " + house_number, city: city, state: city + ' megye', street: street, house_number: house_number, postCode: zip},
                                communication: communications
                            }});
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
});

router.get('/get-users', verify, (req, res) => {
    if(req.user.role === 'admin'){       
        db.query('SELECT u.*, b.email AS BlackListEmail FROM `users` u '+ 
        'LEFT JOIN `blacklist` b ON u.email = b.email', (err, results) => {
            if(err){
                console.log(err);
                res.status(400).json(err);
            }else{
                let users = [];
                results.map(r => {
                    users.push({id: r.id, 
                        email: r.email, 
                        firstname: r.first_name, 
                        lastname: r.last_name, 
                        pic: r.avatar, 
                        phone: r.phone, 
                        blacklisted: (r.BlackListEmail === null ? 0:1),
                        zip: r.zip,
                        city: r.city,
                        street: r.street,
                        house_number: r.house_number,
                    });
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

router.post('/block-user', verify, (req, res) => {
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
});

module.exports = router;