const mysql = require('mysql');
//SQL connection
let db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'vksz'
});

db.connect((err) => {
    if(err){
        console.log("No mysql connection");
        return;
    }
    console.log('MySql connected...');
});

module.exports = db;