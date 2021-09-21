const express = require('express');
var router = express.Router();
const db = require('../database/db');
const verify = require('../helpers/authVerify');
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
const saltRounds = 10;
const {changeEmailValidate, changePasswordValidate, idValidate, sendUsersNotifValidate, sendUserNotifValidate} = require('../helpers/validations');

var admin = require('firebase-admin');

var serviceAccount = require('../pushup-test-vksz-firebase-adminsdk-hy1hr-b70f68fdc3.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

//Admin Stuff
router.post('/get-user-by-id', verify, (req,res) => {
    console.log('Got a id request');

    const { error, value } = idValidate.validate({
        req_user_id: req.user.id,
        req_body_user_id: req.body.user_id
    });

    if(!error){
        if(req.user.role === 'admin'){
            // console.log('Request body email: ' + req.body.email);
            console.log(req.body.user_id);
            db.query('SELECT * FROM users WHERE user_id = ?',[req.body.user_id], (err, results) => {
                if(err){
                    console.log(req.body.user_id);
                    console.log('Query1');
                    console.log(err);
                    res.status(400).json('Query error');
                }else{
                    try {
                        const {user_id, email, last_name, first_name, role, pw_hash, phone, avatar, zip, city, street, house_number} = results[0];
                        console.log(results);
                        db.query('SELECT * FROM `user_notifs` un LEFT JOIN `news_services` ns ON un.service_id = ns.service_id  WHERE un.user_id = ?', [req.body.user_id], (err1, results1) => {
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
                                        id: req.body.user_id,
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
                    } catch (error) {
                        console.log('Trycatch error');
                        res.status(400).json(error);
                    }
                 }
            });
        }else{
            console.log('You don\'t have the permission for this');
            res.status(400).json('You don\'t have the permission for this');
        }
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }
});

router.get('/get-users', verify, (req, res) => {

    const { error, value } = idValidate.validate({
        req_user_id: req.user.id,
        req_body_user_id: req.user.id
    });

    if(!error){
        if(req.user.role === 'admin'){
            db.query('SELECT u.*, b.blacklist_id, b.email as BlackListEmail FROM `users` u '+
            'LEFT JOIN `blacklist` b ON u.email LIKE b.email ' +
            'GROUP BY u.user_id', (err, results) => {
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
                            provider: r.provider,
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
            res.status(400).json('Not admin');
        }
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }
});

router.post('/block-user', verify, (req, res) => {
    const { error, value } = idValidate.validate({
        req_user_id: req.user.id,
        req_body_user_id: req.body.user_id
    });

    if(!error){
        if(req.user.role === 'admin'){

            db.query('SELECT u.*, b.blacklist_id, b.email AS BlackListEmail FROM `users` u '+
            'LEFT JOIN `blacklist` b ON u.email = b.email ' +
            'WHERE u.email LIKE ? && b.blacklist_id = ?',[req.body.email, req.body.user_id], (err, results) => {
                if(err){
                    console.log(err);
                    res.status(400).json(err);
                }else{
                    if(results.length === 0){
                        db.query('SELECT user_id, email FROM `users` WHERE email LIKE ? ',[req.body.email], (err, results2) => {
                            if(err){
                                console.log(err);
                                res.status(400).json({result: false});
                            }else{
                                let sql = 'INSERT INTO `blacklist` (blacklist_id, email) VALUES ';
                                results2.map(r => {
                                    sql += `(${r.user_id}, '${r.email}'),`;
                                });
                                var str1 = sql.replace(/,$/,";");
                                console.log(str1);
                                db.query(str1, (err3, results3) => {
                                    if(err3){
                                        console.log(err3);
                                        res.status(400).json({result: false});
                                    }else{
                                        res.json({result: true});                                          
                                    }
                                });
                            }
                        })
                    }else if(results.length > 0 && results[0].BlackListEmail === req.body.email){
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
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }
});

router.post('/change/password', verify, (req, res) => {
    const { error, value } = changePasswordValidate.validate({
        password: req.body.new_pass,
        repeat_password: req.body.new_pass2,
        req_user_id: req.user.id,
        req_body_user_id: req.body.user_id
    });

    if(!error){
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
                    // console.log(result);
                    if(JSON.parse(JSON.stringify(result)).changedRows === 0) {
                        console.log('Didnt change anything');
                        res.status(400).json('Didn\'t change anything');
                    }else{
                        console.log('changed');
                        res.json({result: true});
                    }
                }
            });
        }else{
            console.log('Unauthorized, or passwords dont match');
            res.status(400).json('Unauthorized pw change, or passwords dont match');
        }
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }
});

router.post('/change/email', verify, (req, res) => {
    const { error, value } = changeEmailValidate.validate({
        email: req.body.email,
        req_user_id: req.user.id,
        req_body_user_id: req.body.user_id
    });

    if(!error){
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
                    if(JSON.parse(JSON.stringify(result)).changedRows === 0) {
                        console.log('Didnt change anything');
                        res.status(400).json('Didn\'t change anything');
                    }else{
                        console.log('changed');
                        res.json({result: true});
                    }
                }
            });
        }else{
            console.log('Not admin');
            res.status(400).json('Not admin');
        }
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }
});

router.post('/send/users/notification', verify, (req, res) => {
    let {service_id, notif_id, title, message} = req.body;
    console.log(req.body);

    service_id = parseInt(req.body.service_id, 10);
    notif_id = parseInt(req.body.notif_id, 10);

    const { error, value } = sendUsersNotifValidate.validate({
        service_id: service_id,
        notif_id: notif_id,
        title: title,
        message: message
    });
    console.log('If elott');
    if(!error){
        console.log('If utan nem error');
        //Send the same notification to every user who is "subscribed" to the given service_id and notif_id from req.body
        if(req.user.role === 'admin'){
            db.query('SELECT t.*, u.email, u.phone, u.device_token, ns.service_name, nt.notif_id FROM (select user_id, service_id, \'notif_email\' col, notif_email value ' +
            'from user_notifs '+
            'union all '+
            'select user_id, service_id, \'notif_sms\' col, notif_sms value '+
            'from user_notifs  '+
            'union all '+
            'select user_id, service_id, \'notif_push_up\' col, notif_push_up value '+
            'from user_notifs) as t LEFT JOIN users u ON t.user_id = u.user_id '+
            'LEFT JOIN news_services ns ON t.service_id = ns.service_id '+
            'LEFT JOIN notif_type nt ON t.col = nt.notif_name '+
            'WHERE nt.notif_id = ? && t.service_id = ? && value = 1', [notif_id, service_id], (err, results) => {
                if(err){
                    console.log(err);
                    res.status(400).json({result: false});
                }else{
                    //Send to "subscribed" people Push Up
                    if(notif_id === 3){
                        console.log('push up notif');
                        const emails = [];
                        results.map(r => {
                            emails.push({email: r.email, device_token: r.device_token});
                        })
                        const device_tokens = [];
                        emails.map(d => {
                            if(d.device_token){
                                device_tokens.push(d.device_token);
                            }               
                        });
                        
                        message = message.replace(/<(.|\n)*?>/g, '');
                        const push_up_message = {
                            notification: {
                                title: title,
                                body: message
                            },
                            tokens: device_tokens,
                        };
                        
                        admin.messaging().sendMulticast(push_up_message)
                            .then((response) => {
                            console.log(response.successCount + ' messages were sent successfully');
                            res.json({result: true});
                            }).catch((error) => {
                                console.log(error);
                                res.status(400).json({result: false});
                            });
                    }
                    
                    //Send to "subscribed" people email
                    if(notif_id === 1){
                        console.log('Email notif');

                        const emails = [];
                        results.map(r => {
                            emails.push(r.email);
                        })

                        const transporter = nodemailer.createTransport({
                            host: process.env.EMAIL_HOST,
                            port: process.env.EMAIL_PORT,
                            auth: {
                                user: process.env.EMAIL_USERNAME,
                                pass: process.env.EMAIL_PASSWORD
                            }
                        });

                        var mailOptions = {
                            from: process.env.EMAIL_USERNAME,
                            subject: title,
                            html: `<b>${message}</b>`
                        };
                    
                        
                        emails.forEach(function (to, i , array) {
                            mailOptions.to = to;
                        
                            transporter.sendMail(mailOptions, function (err) {
                                if (err) { 
                                    console.log('Sending to ' + to + ' failed: ' + err);
                                    return;
                                }/* else { 
                                    console.log('Sent to ' + to);
                                }*/
                        
                                if (i === emails.length - 1) { mailOptions.transport.close(); }
                            });
                        });
                        console.log('Sent out emails');
                        res.json({result: true});
                    }

                    //Send sms to "subscribed" users
                    if(notif_id === 2){
                        console.log('sms notif');
                        res.json({result: true});
                    }
                }
            });
        }else{
            console.log('Not admin');
            res.status(400).json('Not admin');
        }
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }  
});

router.post('/send/user/notification', verify, (req, res) => {
    let {notif_id, title, message, user_id} = req.body;
    user_id = parseInt(req.body.user_id, 10);
    notif_id = parseInt(req.body.notif_id, 10);

    const { error, value } = sendUserNotifValidate.validate({
        notif_id: notif_id,
        title: title,
        message: message,
        user_id: user_id
    });

    if(!error){
        if(req.user.role === 'admin'){
            db.query('SELECT user_id, email, phone, device_token FROM users WHERE user_id = ?', [req.body.user_id], (err, results) => {
                if(err){
                    console.log('Send/User/Notification first query error');
                    res.status(400).json(err);
                }else{
                    if(results.length === 1){

                        //Push up notif
                        if(notif_id === 3){
                            console.log('push up notif');

                            message = message.replace(/<(.|\n)*?>/g, '');
                            const push_up_message = {
                                notification: {
                                    title: title,
                                    body: message
                                },
                                token: results[0].device_token,
                            };
                            
                            admin.messaging().send(push_up_message)
                                .then((response) => {
                                console.log('Sent messages response: ', response);
                                res.json({result: true});
                                }).catch((error) => {
                                    console.log(error);
                                    res.status(400).json(error);
                                });
                        }
                        
                        //Send to "subscribed" people email
                        if(notif_id === 1){
                            console.log('Email notif');
            
                            const transporter = nodemailer.createTransport({
                                host: process.env.EMAIL_HOST,
                                port: process.env.EMAIL_PORT,
                                auth: {
                                    user: process.env.EMAIL_USERNAME,
                                    pass: process.env.EMAIL_PASSWORD
                                }
                            });
            
                            var mailOptions = {
                                from: process.env.EMAIL_USERNAME,
                                subject: title,
                                to: results[0].email,
                                html: `<b>${message}</b>`
                            };
                        
                            transporter.sendMail(mailOptions, function (err,info) {
                                if (err) { 
                                    console.log('Sending to ' + to + ' failed: ' + err);
                                    res.status(400).json(err);
                                } else { 
                                    console.log('Sent out email: ', info);
                                    res.json({result: true});
                                    mailOptions.transport.close();
                                }
                            });
    
                        }
            
                        //Send sms to "subscribed" users
                        if(notif_id === 2){
                            console.log('sms notif');
                            res.json({result: true});
                        }
                    }else{
                        console.log('No such user found Id: ', req.body.user_id);
                        res.status(400).json('No such user found Id: '+ req.body.user_id);
                    }
                }
            });
        }else{
            console.log('Not admin');
            res.status(400).json('Not admin');
        }
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }      
});

// /api/admin/get-news-notifs
router.get('/get-news-notifs', verify, (req, res) => {
    if(req.user.role === 'admin'){
        db.query('SELECT * FROM notif_type', (err1, notif_types2) => {
            if(err1){
                console.log(err1);
                res.status(400).json(err1);
            }else{
                db.query('SELECT * FROM news_services', (err2, news_services2) => {
                    if(err2){
                        console.log(err2);
                        res.status(400).json(err2);
                    }else{
                        const notif_types_array = [];
                        notif_types2.map(nt => {
                            notif_types_array.push({notif_id: nt.notif_id, notif_name: nt.notif_name});
                        });

                        const news_services_array = [];
                        news_services2.map(ns => {
                            news_services_array.push({service_id: ns.service_id, service_name: ns.service_name});
                        });
                        console.log('Huh');
                        res.json({news_notifs:{notif_types: notif_types_array, news_services: news_services_array}});
                    }
                });
            }
        });
    }else{
        console.log('Nem admin');
        res.status(400).json('Nem admin');
    }
});

function verifyFCMToken (fcmToken){
    return admin.messaging().send({
        token: fcmToken
    }, true)
}

router.get('/test', (req, res) => {
    verifyFCMToken("ft904rBfRqSVx6LbdAVQ2q:APA91bFTvpUelNMTtcWQLev9oawYfzyTI3HBpU1-YIyEHmrsXEUTXZODJ9G-u7dPe7JiP_jxpxi1fzBA8jv9NiJEf5H8-1YkUWFvHnpxVuBU7dbU71ByGz8FPdUgwYwP0tiH6dtkUDCl")
    .then(result => {
        console.log('Valid token');
        res.json('Valid token');
    })
    .catch(err => {
        console.log('Invalid token');
        res.json('Invalid token');
    })
});

module.exports = router;