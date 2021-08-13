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

    let query = db.query("SELECT * FROM users WHERE email LIKE ?",[email], (err, results) => {
        if(err){
            res.send('Hiba');
        }else {
            console.log(results.length);
            console.log(results);
            if(results.length === 1){
                const userEmail = results[0].email;
                const dbPassHash = results[0].pw_hash;
                if(userEmail){
                    //Generate webtoken
                    const accessToken = jwt.sign({ email: userEmail, role: "user"},
                        process.env.SECRET_KEY,
                        {expiresIn: "2m"}
                        );
                    res.json({
                        accessToken: accessToken
                    });
                }else{
                    res.status(400).json('Username or password incorrect');
                }
            }else{
                res.status(400).json('Username or password incorrect');
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
    //Is Email in db?
    db.query('SELECT * FROM users WHERE email LIKE ?', [email], (err, results) => {
        if(err){
            console.log(err);
            res.status(400).end();
        }else{
            //If didn't register before
            if(results.length === 0){
                //Insert gottten user
                db.query('INSERT INTO users SET ?', user, (err, results) => {
                    if(err){
                        console.log(err);
                        res.status(400).end();
                    }else{
                        console.log(results);
                        const accessToken = jwt.sign({ email: email, role: "user"},
                            process.env.SECRET_KEY,
                            {expiresIn: "2m"}
                        );
                        res.json({accessToken: accessToken});
                    }
                });
            }else{
                res.status(400).end();
            }
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
    const email = jwt_decode(req.headers.authorization);
    console.log(jwt_decode(req.headers.authorization));
    // console.log(req.hea)
    res.json({id:1, username:"admin", password:"hashed", email:email.email, firstname:"firstname",lastname:"lastname"});
});

module.exports = router;