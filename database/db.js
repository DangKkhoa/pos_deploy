const mysql = require('mysql2')

const con = mysql.createPool({
    connectionLimit: 20,
    host: 127.0.0.1,
    user: 'root',
    password: '',
    database: 'POS'
})

module.exports = con
