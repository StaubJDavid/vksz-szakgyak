const express = require('express');
var router = express.Router();
const db = require('../database/db');
const verify = require('../helpers/authVerify');


router.post('/change-details', verify, (req, res) => {
    // console.log(req.user.email);
    // console.log(req.body);
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
});

router.post('/update/avatar', verify, (req, res) => {
    let cutBase64 = req.body.avatar.slice(req.body.avatar.indexOf(',')+1, req.body.avatar.length);
    cutBase64 = cutBase64.slice(0, cutBase64.length-1);
    db.query('UPDATE `users` SET avatar = ? WHERE email LIKE ?', [cutBase64, req.user.email], (err, results) => {
        if(err){
            console.log(err);
            res.json({result: false});
        }else{
            // console.log(results);
            res.json({result: true});
        }
    })   
});

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

router.post('/forgot-password', (req, res) => {
    res.json({result: true});
});

module.exports = router;