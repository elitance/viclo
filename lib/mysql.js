const mysql = require('mysql');
const fs = require('fs');

const profile = fs.readFileSync('profile.txt','utf8').split(',');

const connection = mysql.createConnection({
    host: 'localhost',
    user: profile[0],
    password: profile[1],
    database: 'wiki'
});

connection.connect();

module.exports = connection;