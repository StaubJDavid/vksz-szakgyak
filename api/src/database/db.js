const mysql = require('mysql');

require('dotenv').config();
//SQL connection
let db = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
});

db.connect((err) => {
    if(err){
        console.log(err);
        throw(err);
        return;
    }
    console.log('MySql connected...');
});

module.exports = db;