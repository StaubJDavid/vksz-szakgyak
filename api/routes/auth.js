const express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../db');
const jwt_decode = require('jwt-decode');

/*LOGIN:

*/
router.post('/login', (req, res) => {
    const { email, password} = req.body;

    let query = db.query("SELECT * FROM users WHERE email LIKE ?",[email], (err, results) => {
        if(err){
            res.send('Hiba');
        }else {
            // console.log(results[0]);
            // res.send(results[0]);
            console.log(results.length);
            console.log(results);
            if(results.length === 1){
                const userEmail = results[0].email;
                if(userEmail){
                    //Generate webtoken
                    const accessToken = jwt.sign({ email: userEmail, role: "admin"},
                        process.env.SECRET_KEY,
                        {expiresIn: "2m"}
                        );
                    res.json({
                        accessToken: accessToken,
                        role: "admin",
                        email: userEmail,
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

router.post('/register', (req, res) => {
    console.log('Register: ' + req.body);

    const accessToken = jwt.sign({ email: req.body.email, role: "admin"},
                        process.env.SECRET_KEY,
                        {expiresIn: "2m"}
                        );
                    res.json({
                        accessToken: accessToken,
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

router.get('/get-user', verify, (req, res) => {
    console.log(jwt_decode(req.headers.authorization));
    // console.log(req.hea)
    res.json({id:1, username:"admin", password:"hashed", email:"email", firstname:"firstname",lastname:"lastname"});
});

module.exports = router;