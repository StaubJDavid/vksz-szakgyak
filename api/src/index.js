const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db= require('./database/db');
const fs = require('fs');

require('dotenv').config();

const app = express();
app.use('*',cors());
app.use(express.json({ limit: '12MB' }));

var authRouter = require('./routes/auth');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

app.use('/api/auth', cors(), authRouter);
app.use('/api/user', cors(), userRouter);
app.use('/api/admin', cors(), adminRouter);

app.get('/', (req, res) => {
    res.send('Home');
});

//Helpers/Tests

app.get('/query', (req, res) => {

});

app.get('/createdb', (req, res) => {
    let sql = 'CREATE TABLE IF NOT EXISTS `users` (' +
        '`id` INT NOT NULL AUTO_INCREMENT,' +
        '`email` VARCHAR(255),' +
        '`last_name` VARCHAR(255),' +
        '`first_name` VARCHAR(20),' +
        '`pw_hash` VARCHAR(255),' +
        '`zip` VARCHAR(4),' +
        '`city` VARCHAR(20),' +
        '`street` VARCHAR(20),' +
        '`house_number` VARCHAR(20),' +
        '`phone` VARCHAR(20),' +
        '`role` ENUM(\'user\', \'admin\'),' +
        '`avatar` MEDIUMBLOB,' +
        'PRIMARY KEY (`id`)' +
    ');';

    db.query(sql, (err, result) =>{
        if(err){
            console.log('Something\'s wrong with the user table creation: ' + err);
        }else{
            console.log('Users created');
        }        
    });

    //News Services Table
    sql = 'CREATE TABLE IF NOT EXISTS `news_services` (' +
        '`service_id` INT NOT NULL AUTO_INCREMENT,' +
        '`service_name` VARCHAR(255),' +
        'PRIMARY KEY (`service_id`)' +
    ');';

    db.query(sql, (err, result) =>{
        if(err){
            console.log('Something\'s wrong with the News Services table creation: ' + err);
        }else{
            console.log('News Services created');
        }        
    });

    //Notif Type Table
    sql = 'CREATE TABLE IF NOT EXISTS `notif_type` (' +
        '`notif_id` INT NOT NULL AUTO_INCREMENT,' +
        '`notif_name` VARCHAR(255),' +
        'PRIMARY KEY (`notif_id`)' +
    ');';

    db.query(sql, (err, result) =>{
        if(err){
            console.log('Something\'s wrong with the Notif Type table creation: ' + err);
        }else{
            console.log('Notif Type created');
        }        
    });

    //Blacklist Table
    sql = 'CREATE TABLE IF NOT EXISTS `blacklist` (' +
        '`id` INT NOT NULL AUTO_INCREMENT,' +
        '`email` VARCHAR(255),' +
        'PRIMARY KEY (`id`)' +
    ');';

    db.query(sql, (err, result) =>{
        if(err){
            console.log('Something\'s wrong with the Blacklist table creation: ' + err);
        }else{
            console.log('Blacklist table created');
        }        
    });

    //User Notif Table
    sql = 'CREATE TABLE IF NOT EXISTS `user_notifs` (' +
        '`user_notif_id` INT NOT NULL AUTO_INCREMENT,' +
        '`email` VARCHAR(255),' +
        '`service_name` VARCHAR(255),' +
        '`notif_email` BOOLEAN DEFAULT 0,' +
        '`notif_sms` BOOLEAN DEFAULT 0,' +
        '`notif_push_up` BOOLEAN DEFAULT 0,'+
        'PRIMARY KEY (`user_notif_id`)' +
    ');';

    db.query(sql, (err, result) =>{
        if(err){
            console.log('Something\'s wrong with the User Notifs table creation: ' + err);
        }else{
            console.log('User Notifs created');
        }        
    });
    res.send('DB Check log');
});

app.listen(process.env.PORT, () =>{
    console.log(`Listening to ${process.env.PORT}`);
});