const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db= require('./db');
const fs = require('fs');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

var authRouter = require('./routes/auth');

app.use('/auth', authRouter);
app.get('/', (req, res) => {
    res.send('Home');
});


//Helpers/Tests
app.get('/pfp', (req, res) => {
    // fs.readFile('./src/blank.png','base64', (err, data) => {
    //     if(err){
    //         console.log(err);
    //     } else {            
    //         fs.writeFile("./src/out.png", data, 'base64', function(err) {
    //             console.log(err);
    //           });
    //         console.log("Pic decode gucci");
    //     }       
    // });

    //const pathName = require('path').basename('G:\\School\\vksz-webapp\\api\\src\\blank.png');

    /**/
    // const avatarData = fs.readFileSync('./src/blank.png', {encoding: 'base64'});
     
    // res.send(avatarData);
    const email = "davidkah20@gmail.com";
    db.query('SELECT avatar FROM users WHERE email = ?', [email], (err, results) => {
        if(err){
            console.log(err);
            res.send(err);
        }else{
            const img = Buffer.from(results[0].avatar, 'base64');
            console.log(img);
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
             });

            res.end(img); 
        }
    });
});

app.get('/query', (req, res) => {
    /*const email = 'email@email.com';
    let query = db.query('SELECT * FROM users WHERE email LIKE ?', [email], (err, results) => {
        if(err){
            console.log(err);
            res.send(err);
        }else{
            if(results.length === 0){
                console.log('Mehet a menet');
            }

            res.send(results);
        }        
    });  */ 
    // let query = db.query('SELECT * FROM news_services',(err, results) => {
    //     if(err){
    //         console.log(err);
    //         res.send(err);
    //     }else{
    //         console.log(results.length);
    //         res.send(results);
    //     }        
    // });
    // let s = "";
    // if(s === ""){
    //     console.log('Ures');
    // } else{
    //     console.log('nem ures');
    // }
    // db.query('SELECT u.*, b.email AS BlackListEmail FROM `users` u '+ 
    //             'LEFT JOIN `blacklist` b ON u.email = b.email ' +
    //             'WHERE u.email LIKE ?', 'kavicskah20@gmail.com', 
    //             (err, results) => {
    //                 if(err){
    //                     console.log(err);
    //                 }{
    //                     console.log(results);
    //                     // if(results[0].BlackListEmail === null){
    //                     //     console.log(results[0].BlackListEmail);
    //                     // }else{
    //                     //     console.log('else');
    //                     // }
    //                     res.send('Done');
    //                 }
                    
    //             });
    // const email = 'davidkah20@gmail.com';
    // db.query('SELECT * FROM `news_services`', (err, results) => {
    //     if(err){
    //         console.log(err);
    //     }else{
    //         //console.log(results);
    //         let sql = 'INSERT INTO `user_notifs` (email, service_name) VALUES ';
    //         results.map(r => {
    //             sql += `(${email}, ${r.service_name}),`;
    //         });
    //         var str1 = sql.replace(/,$/,";");
    //         res.send(str1);
    //     }       
    // });
    // db.query('SELECT * FROM `user_notifs` WHERE email LIKE ?', email, (err, results) => {
    //     if(err){
    //         console.log(err);
    //         res.send(err);
    //     }{
    //         if(results.length !== 0){
    //             let communication = [];
    //             results.map(r => {
    //                 communication.push({name: r.service_name, email: r.notif_email, sms: r.notif_sms, phone: r.notif_push_up});
    //             });
    //             console.log(communication);
    //             res.send(communication);
    //         }else{
    //             console.log('Not Good');
    //             res.send('Not Good');
    //         }           
    //     }
    // });
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