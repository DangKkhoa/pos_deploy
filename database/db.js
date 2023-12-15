const mysql = require('mysql2')

const con = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'dkkhoa',
    password: 'dkkhoa123',
    database: 'POS'
})

module.exports = con
