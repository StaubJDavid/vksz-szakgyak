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
            console.loh('Bad query');
            res.status(400).json('Bad query');
        }else {
            console.log(results.length);
            console.log(results);
            if(results.length === 1 && results[0].BlackListEmail === null){
                const userEmail = results[0].email;
                //const dbPassHash = results[0].pw_hash;
                if(userEmail === email && bcrypt.compareSync(password, results[0].pw_hash)){
                    //Generate webtoken
                    const accessToken = jwt.sign({ email: userEmail, role: results[0].role},
                            process.env.SECRET_KEY,
                            {expiresIn: "2m"}
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

    const avatarData = fs.readFileSync('./src/blank.png', {encoding: 'base64'});

    //Password Crypt
    const hash = bcrypt.hashSync(password, saltRounds); 
    console.log('HashedPassword2: ' + hash);

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
    db.query('SELECT * FROM `blacklist` WHERE email LIKE ?', [email], (err1, results1) => {
        if(err1){
            console.log(err1);
            res.status(400).end();
        }else{
            if(results1.length === 1){
                blacklisted = 1;
            }

            console.log('Blacklisted?: ' + blacklisted);
            //Is Email in db?
            db.query('SELECT * FROM `users` WHERE email LIKE ?', [email], (err2, results2) => {
                if(err2){
                    console.log(err2);
                    res.status(400).end();
                }else{
                    //If didn't register before
                    if(results2.length === 0 && blacklisted === 0){
                        //Insert gottten user
                        db.query('INSERT INTO users SET ?', user, (err3, results3) => {
                            if(err3){
                                console.log(err3);
                                res.status(400).end();
                            }else{
                                //console.log(results);
                                const accessToken = jwt.sign({ email: email, role: "user"},
                                    process.env.SECRET_KEY,
                                    {expiresIn: "2m"}
                                );
                                res.json({accessToken: accessToken});
                            }
                        });
                    }else{
                        // if(results2.length > 0){
                        //     res.status(400).end();
                        // }

                        if(blacklisted === 1){
                            res.status(400).json('Email blacklisted');
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
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if(err){
                return res.status(403).json("Token is invalid");
            }

            req.user = user;
            next();
        });
    } else{
        res.status(401).json("Not authenticated");
    }
};

//Send User Model
router.get('/get-user', verify, (req, res) => {
    console.log("User: " + req.user.email);
    console.log("User: " + req.user.role);

    db.query('SELECT * FROM users WHERE email LIKE ?',req.user.email, (err, results) => {
        if(err){
            res.status(400).json('Query error');
        }else{
            const {id, email, last_name, first_name, role, pw_hash} = results[0];
            res.json({id: id, username: `${last_name} ${first_name}`, password: pw_hash, email: email, firstname: first_name,lastname: last_name});
            console.log('Sent json');
        }
        
    });
    
});

module.exports = router;