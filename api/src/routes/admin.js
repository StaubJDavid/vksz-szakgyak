const express = require('express');
var router = express.Router();
const db = require('../database/db');
const verify = require('../helpers/authVerify');
const bcrypt = require('bcrypt');
const saltRounds = 10;


//Admin Stuff
router.post('/get-user-by-email', verify, (req,res) => {
    console.log('Got a id request');
    if(req.user.role === 'admin'){
        // console.log('Request body email: ' + req.body.email);
        console.log(req.body.id);
        db.query('SELECT * FROM users WHERE user_id = ?',[req.body.id], (err, results) => {
            if(err){
                console.log(req.body.id);
                console.log('Query1');
                console.log(err);
                res.status(400).json('Query error');
            }else{
                const {user_id, email, last_name, first_name, role, pw_hash, phone, avatar, zip, city, street, house_number} = results[0];
                console.log(results);
                db.query('SELECT * FROM `user_notifs` un LEFT JOIN `news_services` ns ON un.service_id = ns.service_id  WHERE un.user_id = ?', [req.body.id], (err1, results1) => {
                    if(err1){
                        console.log('Query2');
                        console.log(err1);
                        res.status(400).json('Query error1');
                    }else{
                        if(results1.length !== 0){
                            let communications = [];
                            results1.map(r => {
                                communications.push({name: r.service_name, email: r.notif_email, sms: r.notif_sms, phone: r.notif_push_up, service_id: r.service_id});
                            });

                            console.log({
                                id: req.body.id,
                                username: last_name + " " + first_name,
                                //password: "no password for u",
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

                            res.json({user:{
                                id: user_id,
                                username: last_name + " " + first_name,
                                //password: "no password for u",
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
                            }});
                            console.log('Sent json');
                        }else{
                            console.log('There\'s no such user');
                            res.status(400).json('There\'s no such user');
                        }           
                    }
                });      
             }        
        }); 
    }else{
        console.log('You don\'t have the permission for this');
        res.status(400).json('You don\'t have the permission for this');
    }
});

router.get('/get-users', verify, (req, res) => {
    if(req.user.role === 'admin'){       
        db.query('SELECT u.*, b.blacklist_id, b.email as BlackListEmail FROM `users` u '+ 
        'LEFT JOIN `blacklist` b ON u.user_id = b.blacklist_id', (err, results) => {
            if(err){
                console.log(err);
                res.status(400).json(err);
            }else{
                let users = [];
                results.map(r => {
                    users.push({id: r.user_id, 
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
        // console.log('Nem admin');
    }
});

router.post('/block-user', verify, (req, res) => {
    if(req.user.role === 'admin'){

        db.query('SELECT u.*, b.blacklist_id, b.email AS BlackListEmail FROM `users` u '+ 
        'LEFT JOIN `blacklist` b ON u.user_id = b.blacklist_id ' +
        'WHERE u.user_id = ?',[req.body.id], (err, results) => {
            if(err){
                console.log(err);
                res.status(400).json(err);
            }else{
                if(results[0].BlackListEmail === null){
                    db.query('INSERT INTO `blacklist` (blacklist_id, email) VALUES (?,?)', [req.body.id, req.body.email], (err, results) => {
                        if(err){
                            console.log(err);
                            res.status(400).json({result: false});
                        }else{
                            // console.log(results);
                            res.json({result: true});
                        }
                    });
                }else if(results[0].BlackListEmail === req.body.email){
                    db.query('DELETE FROM `blacklist` WHERE blacklist_id = ?', [req.body.id], (err, results) => {
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

router.post('/change/password', verify, (req, res) => {
    console.log('Did I get called?');
    console.log(req.body.user_id);
    console.log(req.user.id);
    // res.json({result: true});
    if(req.user.role === 'admin' && req.body.new_pass === req.body.new_pass2){
        const hash = bcrypt.hashSync(req.body.new_pass, saltRounds); 
        db.query('UPDATE users SET pw_hash = ? WHERE user_id = ? ', [hash, req.body.user_id], (err, result) => {
            if(err){
                console.log(err);
                res.status(400).json('Password update query fail');
            }else{
                console.log(result);
                res.json({result: true});
            }
        });
    }else{
        console.log('Unauthorized, or passwords dont match');
        res.status(400).json('Unauthorized pw change, or passwords dont match');
    } 
});

router.post('/change/email', verify, (req, res) => {
    console.log('Did I get called?');
    console.log(req.body);
    console.log(req.user.id);
    // res.json({result: true});
    if(req.user.role == 'admin'){
        db.query('UPDATE users SET email = ? WHERE user_id = ? ', [req.body.email, req.body.user_id], (err, result) => {
            if(err){
                console.log(err);
                res.status(400).json('Email update query fail');
            }else{
                console.log(result);
                res.json({result: true});
            }
        });
    }else{
        console.log('Not admin');
        res.status(400).json('Not admin');
    }
});

module.exports = router;