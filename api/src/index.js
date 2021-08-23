const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./database/db');
const fs = require('fs');
var nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

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

app.get('/insert', (req, res) => {
    db.query("INSERT INTO `users`(`email`, `last_name`, `first_name`, `pw_hash`, `zip`, `city`, `street`, `house_number`, `phone`, `role`) " + 
        "VALUES ('email','last_name','first_name','pw_hash','zip','city','street','house_number','phone','admin')", (err, result) => {
            if(err){
                console.log(err);
                res.send(err);
            }else{
                console.log(result.insertId);
                res.send({id: result.insertId});
            }
        })
 
});

app.get('/email', (req, res) => {

    // https://ethereal.email/create
  // create reusable transporter object using the default SMTP transport
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
    to: 'davidkah20@gmail.com',
    subject: 'Hello ✔',
    text: 'Hello world?',
    html: "<b>Hello world?</b>"
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.send(mailOptions);
    }
  }); 
});


app.get('/createdb', (req, res) => {
    let sql = 'CREATE TABLE IF NOT EXISTS `users` (' +
        '`user_id` INT NOT NULL AUTO_INCREMENT,' +
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
        '`confirmed` BOOLEAN DEFAULT 0,' +
        '`avatar` MEDIUMBLOB,' +       
        'PRIMARY KEY (`user_id`)' +
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
        '`blacklist_id` INT NOT NULL AUTO_INCREMENT,' +
        '`email` VARCHAR(255),' +
        'FOREIGN KEY (blacklist_id) REFERENCES users(user_id)' +
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
        '`user_notif_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,' +
        '`user_id` INT NOT NULL,' +
        '`service_id` INT NOT NULL,' +
        '`notif_email` BOOLEAN DEFAULT 0,' +
        '`notif_sms` BOOLEAN DEFAULT 0,' +
        '`notif_push_up` BOOLEAN DEFAULT 0,'+
        'FOREIGN KEY (user_id) REFERENCES users(user_id), ' +
        'FOREIGN KEY (service_id) REFERENCES news_services(service_id) ' +
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