const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./database/db');
const fs = require('fs');
var nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { registerValidate, emailTestValidate } = require('./helpers/validations');

require('dotenv').config();

const app = express();
app.use('*', cors());
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

app.get('/test', (req, res) => {

});

app.get('/createdb', (req, res) => {
    let sql = 'CREATE TABLE IF NOT EXISTS `users` (' +
        '`user_id` INT NOT NULL AUTO_INCREMENT,' +
        '`email` VARCHAR(255),' +
        '`last_name` VARCHAR(20),' +
        '`first_name` VARCHAR(20),' +
        '`pw_hash` VARCHAR(255),' +
        '`zip` VARCHAR(4),' +
        '`city` VARCHAR(35),' +
        '`street` VARCHAR(35),' +
        '`house_number` VARCHAR(10),' +
        '`phone` VARCHAR(20),' +
        '`role` ENUM(\'user\', \'admin\'),' +
        '`confirmed` BOOLEAN DEFAULT 0,' +
        '`avatar` MEDIUMBLOB,' +
        '`device_token` VARCHAR(255),' +
        'PRIMARY KEY (`user_id`)' +
        ');';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('Something\'s wrong with the user table creation: ' + err);
        } else {
            console.log('Users created');
        }
    });

    //News Services Table
    sql = 'CREATE TABLE IF NOT EXISTS `news_services` (' +
        '`service_id` INT NOT NULL AUTO_INCREMENT,' +
        '`service_name` VARCHAR(255),' +
        'PRIMARY KEY (`service_id`)' +
        ');';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('Something\'s wrong with the News Services table creation: ' + err);
        } else {
            console.log('News Services created');
        }
    });

    //Notif Type Table
    sql = 'CREATE TABLE IF NOT EXISTS `notif_type` (' +
        '`notif_id` INT NOT NULL AUTO_INCREMENT,' +
        '`notif_name` VARCHAR(255),' +
        'PRIMARY KEY (`notif_id`)' +
        ');';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('Something\'s wrong with the Notif Type table creation: ' + err);
        } else {
            console.log('Notif Type created');
        }
    });

    //Blacklist Table
    sql = 'CREATE TABLE IF NOT EXISTS `blacklist` (' +
        '`blacklist_id` INT NOT NULL AUTO_INCREMENT,' +
        '`email` VARCHAR(255),' +
        'FOREIGN KEY (blacklist_id) REFERENCES users(user_id)' +
        ');';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('Something\'s wrong with the Blacklist table creation: ' + err);
        } else {
            console.log('Blacklist table created');
        }
    });

    //User Notif Table
    sql = 'CREATE TABLE IF NOT EXISTS `user_notifs` (' +
        '`user_notif_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,' +
        '`user_id` INT NOT NULL,' +
        '`service_id` INT NOT NULL,' +
        '`notif_email` BOOLEAN DEFAULT 0,' +
        '`notif_sms` BOOLEAN DEFAULT 0,' +
        '`notif_push_up` BOOLEAN DEFAULT 0,' +
        'FOREIGN KEY (user_id) REFERENCES users(user_id), ' +
        'FOREIGN KEY (service_id) REFERENCES news_services(service_id) ' +
        ');';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('Something\'s wrong with the User Notifs table creation: ' + err);
        } else {
            console.log('User Notifs created');
        }
    });

    sql = "INSERT INTO `notif_type`(`notif_name`) VALUES ('notif_email'), ('notif_sms'), ('notif_push_up')";
    db.query(sql, (err, result) => {
        if (err) {
            console.log('Notif type Insert something wrong: ' + err);
        } else {
            console.log('Inserted into notif_type');
        }
    });

    sql = "INSERT INTO `news_services`(`service_name`) VALUES ('Hulladékszállítás'), ('Lomtalanítás'), ('Hírek'), ('Valami'), ('PluszCucc')";
    db.query(sql, (err, result) => {
        if (err) {
            console.log('news services Insert something wrong: ' + err);
        } else {
            console.log('Inserted into news_services');
        }
    });

    res.json('DB Check log');
});

app.listen(process.env.PORT, () => {
    console.log(`Listening to ${process.env.PORT}`);
});