const express = require('express')
const app = express.Router()

app.get('/', (req, res) => {
    // req.session.user = ''
    // req.session.role = ''
    // req.session.is_admin = ''
    // req.session.first_login = ''

    
    req.session.destroy()
    
    res.redirect('/login')

    
})

module.exports = app
