const jwt = require('jsonwebtoken')
const con = require('../database/db')
module.exports = (req, res, next) => {
    const token = req.query.token
    console.log(token)
    if(!token) return res.send('<h1>Please click the link that was sent to your email </h1>')
    jwt.verify(token, 'mat-khau-bi-mat', (err, user) => {
        if(err) return res.send('<h2>Invalid token or token expired</h2>')
        req.user = user
        next()

    })
    
}