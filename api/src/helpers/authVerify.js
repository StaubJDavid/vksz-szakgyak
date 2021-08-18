const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });

const verify = (req, res, next) =>{
    const authHeader = req.headers.authorization;
    console.log(process.env.SECRET_KEY);
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

module.exports = verify;