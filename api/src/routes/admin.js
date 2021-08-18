const express = require('express');
var router = express.Router();
const db = require('../database/db');
const verify = require('../helpers/authVerify');


//Admin Stuff
router.post('/get-user-by-email', verify, (req,res) => {
    // console.log(req.user.role);
    if(req.user.role === 'admin'){
        // console.log('Request body email: ' + req.body.email);
        db.query('SELECT * FROM users WHERE user_id = ?',[req.body.id], (err, results) => {
            if(err){
                console.log(err);
                res.status(400).json('Query error');
            }else{
                const {user_id, email, last_name, first_name, role, pw_hash, phone, avatar, zip, city, street, house_number} = results[0];
    
                db.query('SELECT * FROM `user_notifs` WHERE user_id = ?', [user_id], (err1, results1) => {
                    if(err1){
                        console.log(err1);
                        res.status(400).json('Query error1');
                    }else{
                        if(results1.length !== 0){
                            let communications = [];
                            results1.map(r => {
                                communications.push({name: r.service_name, email: r.notif_email, sms: r.notif_sms, phone: r.notif_push_up, service_id: r.service_id});
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
                                address: {addressLine: zip + " " + city + " " + street + " " + house_number, city: city, state: city + ' megye', street: street, house_number: house_number, postCode: zip},
                                communication: communications
                            }});
                            //console.log('Sent json');
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

module.exports = router;