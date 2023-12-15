const jwt = require('jsonwebtoken')
const con = require('../database/db')
module.exports = (req, res, next) => {
    const { token, username } = req.query
    con.query('SELECT * FROM Users WHERE username = ?', [username], (err, result) => {
        if(err) {
            res.send('<h1>INTERNAL SERVER ERROR</h1>')
        }
        else if(result.length > 0 && result[0].first_login) {
            if(result[0])
        }
    })

    next()
}