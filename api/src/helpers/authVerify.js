const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

require('dotenv').config();

const verify = (req, res, next) =>{
    const authHeader = req.headers.authorization;
    if(authHeader){
        //authHeader: "Bearer ..."
        //Remove the Bearer part
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if(err){
                return res.status(403).json("Token is invalid");
            }

            if(user.role === 'admin'){
                req.user = user;
                next();
            }

            if(user.role === 'user'){
                db.query('SELECT * FROM blacklist WHERE blacklist_id = ?', [user.id], (err, results) => {
                    if(err){
                        return res.status(400).json('Verify User Query error');
                    }else{
                        if(results.length === 0){
                            req.user = user;
                            next();
                        }else{
                            return res.status(400).json('User id blacklisted');
                        }
                    }
                })
            }    
        });
    } else{
        res.status(401).json("Not authenticated");
    }
};

module.exports = verify;