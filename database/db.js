const mysql = require('mysql2')
require('dotenv').config()

const con = mysql.createPool({
    connectionLimit: 20,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'POS'
})

module.exports = con
