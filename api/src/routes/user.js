const express = require('express');
var router = express.Router();
const db = require('../database/db');
const verify = require('../helpers/authVerify');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {changeDetailsValidate, changeEmailValidate, changePasswordValidate, avatarValidate, idValidate, updateDeviceToken} = require('../helpers/validations');


router.post('/change/details', verify, (req, res) => {
    const { error, value } = changeDetailsValidate.validate({ 
        req_user_id: req.user.id,
        req_body_user_id: req.body.user_id,
        lastname: req.body.lastname, 
        firstname: req.body.firstname,
        zip: req.body.zip,
        city: req.body.city,
        street: req.body.street,
        house_number: req.body.house_number,
        phone: req.body.phone
    });
    
    if(!error){
        console.log('Header: ' + req.user.id + '---' + req.user.role);
        console.log('Body: ' + req.body.user_id);
        if(req.user.id === req.body.user_id || (req.user.role === 'admin')){
            db.query('SELECT * FROM `users` WHERE user_id = ?', [req.body.user_id], (err, results) => {
                if(err){
                    console.log(err);
                    res.status(400).json('Wrong ProfileDetails change');
                }else{
                    //console.log(req.body.firstname === '' ? results[0].first_name:req.body.firstname);
                    db.query('UPDATE `users` SET first_name = ? , last_name = ? , zip = ? , city = ? , street = ? , house_number = ? , phone = ? WHERE user_id = ?', [
                        (req.body.firstname === '' ? results[0].first_name : req.body.firstname),
                        (req.body.lastname === '' ? results[0].last_name : req.body.lastname),
                        (req.body.zip === '' ? results[0].zip : req.body.zip),
                        (req.body.city === '' ? results[0].city : req.body.city),
                        (req.body.street === '' ? results[0].street : req.body.street),
                        (req.body.house_number === '' ? results[0].house_number : req.body.house_number),
                        (req.body.phone === '' ? results[0].phone : req.body.phone),
                        req.body.user_id
                    ], (err1, results1) => {
                        if(err){
                            console.log(err1);
                            res.status(400).json('Wrong ProfileDetails change');
                        }else{
                            if(JSON.parse(JSON.stringify(results1)).changedRows === 0) {
                                console.log('Didnt change anything');
                                res.status(400).json('Didn\'t change anything');
                            }else{
                                // console.log('changed');
                                res.json({result: true});
                            }
                        }
                    })
                }
            });
        }else{
            console.log('user.id nem egyenlő body.user_id val, vagy nem admin');
            res.status(400).json('Wrong ProfileDetails change111');
        }
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }  
});

//data:image/jpeg;base64,
router.post('/change/avatar', verify, (req, res) => {
    let cutBase64 = req.body.avatar;

    if(req.body.avatar.includes('data:image/jpeg;base64,')){
        cutBase64 = req.body.avatar.slice(req.body.avatar.indexOf(',')+1, req.body.avatar.length);
        cutBase64 = cutBase64.slice(0, cutBase64.length-1);
    }
    const buffer = Buffer.from(cutBase64);
    const { error, value } = avatarValidate.validate({ 
        avatar: cutBase64,
        req_user_id: req.user.id,
        req_body_user_id: req.body.user_id
    });
    
    if(!error){
        console.log('Header: ' + req.user.id + '---' + req.user.role);
        console.log('Body: ' + req.body.user_id);
        if(req.user.id === req.body.user_id || (req.user.role === 'admin')){
            // console.log("Byte length: " + buffer.length);
            console.log("KB: " + buffer.length / 1e+3);

            if((buffer.length / 1e+3) > 800){
                console.log('Upload a smaller picture');
                res.status(400).json('Upload a picture under 700KB');
            }else{
                db.query('UPDATE `users` SET avatar = ? WHERE user_id = ?', [cutBase64, req.body.user_id], (err, results) => {
                    if(err){
                        console.log('Error updating avataqr: ' + req.body.user_id);
                        // console.log(err);
                        res.status(400).json('There is a problem with updating the avatar');
                    }else{
                        if(JSON.parse(JSON.stringify(results)).changedRows === 0) {
                            console.log('Didnt change anything');
                            res.status(400).json('Didn\'t change anything');
                        }else{
                            console.log('changed');
                            res.json({result: true});
                        }
                    }
                })  
            }
        }else{
            console.log('Avatar: user.id nem egyenlő body.user_id val, vagy nem admin');
            res.status(400).json('Wrong Avatar change111');
        } 
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }  
});

router.put('/change/notifications', verify, (req,res) => {
    const { error, value } = idValidate.validate({ 
        req_user_id: req.user.id,
        req_body_user_id: req.body.user_id
    });
    
    if(!error){
        console.log('Header: ' + req.user.id + '---' + req.user.role);
        console.log('Body: ' + req.body.user_id);
        if(req.user.id === req.body.user_id || (req.user.role === 'admin')){
            let count = 0;
            req.body.notifications.map((n) => {
                db.query('UPDATE `user_notifs` SET `notif_email`= ? , `notif_sms` = ? , `notif_push_up` = ? WHERE `user_id` = ? && `service_id` = ?', 
                        [n.email, n.sms, n.phone, req.body.user_id, n.service_id], 
                        (err, results) => {
                            if(err){
                                console.log(err);
                                res.status(400).json('Wrong query');
                            }{
                                count++;
                                if(count === req.body.notifications.length){
                                    res.json({result: true});
                                }
                            }
                        }
                )
            }); 
        }else{
            console.log('Notifications: user.id nem egyenlő body.user_id val, vagy nem admin');
            res.status(400).json('Wrong Notifications change111');
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
        console.log(req.body);
        console.log(req.user.id);
        // res.json({result: true});
        if(req.user.id === req.body.user_id && req.body.new_pass === req.body.new_pass2){
            db.query('SELECT user_id, email, pw_hash FROM users WHERE user_id = ?', [req.body.user_id], (err, results) => {
                if(err){
                    console.log(err);
                    res.status(400).json('Change Password bad SELECT query');
                }else{
                    if(results.length === 1){
                        if(!bcrypt.compareSync(req.body.new_pass, results[0].pw_hash)){
                            bcrypt.compare(req.body.current_pass, results[0].pw_hash, function(err, result) {
                                if(err){
                                    console.log(err);
                                    res.status(400).json('Compare password error');
                                }else{
                                    if(result){
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
                                        console.log('Current passwords don\'t match');
                                        res.status(400).json('Current passwords don\'t match');
                                    }
                                }
                            });
                        }else{
                            console.log('New password cant\'t be your old password');
                            res.status(400).json('New password cant\'t be your old password');
                        }
                    }else{
                        console.log('There\'s no such user: ' + req.user.id);
                        res.status(400).json('There\'s no such user: ' + req.user.id);
                    }
                }
            }); 
        }else{
            console.log('Req user, user id doesnt match or new password and password confirmation doesnt match');
            res.status(400).json('Req user, user id doesnt match or new password and password confirmation doesnt match');
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
        if(req.user.id == req.body.user_id && req.user.email !== req.body.email){
            db.query('SELECT user_id, email, pw_hash FROM users WHERE user_id = ? AND provider = \'vksz\'', [req.body.user_id], (err, results) => {
                if(err){
                    console.log(err);
                    res.status(400).json('change email query error');
                }else{
                    if(results.length === 1){
                        if(bcrypt.compareSync(req.body.current_pass, results[0].pw_hash)){
                            // const hash = bcrypt.hashSync(req.body.current_pass, saltRounds); 
                            db.query('SELECT user_id, email, provider FROM users WHERE email LIKE ? AND provider = \'vksz\'', [req.body.email], (err, result1) => {
                                if(err){
                                    console.log(err);
                                    res.status(400).json('New Email query fail');
                                }else{
                                    if(result1.length === 0){
                                        db.query('UPDATE users SET email = ? WHERE user_id = ? AND provider = \'vksz\'', [req.body.email, req.body.user_id], (err, result) => {
                                            if(err){
                                                console.log(err);
                                                res.status(400).json('Email update query fail');
                                            }else{
                                                console.log(result);
                                                res.json({result: true});
                                            }
                                        });
                                    }else{
                                        console.log('New Email already exists');
                                        res.status(400).json('New Email already exists');
                                    }
                                }
                            })
                        }else{
                            console.log('Wrong password');
                            res.status(400).json('Wrong password');
                        }
                    }else{
                        console.log('Theres no such user');
                        res.status(400).json('Theres no such user');
                    }
                }
            });
        }else{
            console.log('Same email');
            res.status(400).json('Same email');
        }
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }
});

router.post('/update/device-token', verify, (req, res) => {
    const { error, value } = updateDeviceToken.validate({ 
        email: req.body.email,
        req_user_id: req.user.id,
        req_body_user_id: req.body.user_id,
        device_token: req.body.device_token
    });

    if(!error){
        if(req.user.id === req.body.user_id){
            db.query('UPDATE users SET device_token = ? WHERE user_id = ? ', [req.body.device_token, req.body.user_id], (err, result) => {
                if(err){
                    console.log(err);
                    res.status(400).json(err);
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
            console.log(error);
            res.status(400).json('req body user id !== req user id');
        }
    }else{
        console.log('Error:')
        console.log(error);
        res.status(400).json(error.message);
    }
});

module.exports = router;