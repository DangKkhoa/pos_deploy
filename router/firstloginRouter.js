const express = require('express')
const jwt = require('jsonwebtoken')
const app = express.Router()
const con = require('../database/db')
const bcrypt = require('bcrypt')
const clickLinkGmailMiddleware = require('../middlewares/clickLinkGmailMiddleware');
app.get('/', clickLinkGmailMiddleware, (req, res) => {
    res.render('firstlogin', {username: '', password: '', error: ''})
    
})


app.post('/',  (req, res) => {
    const { username, password } = req.body;
    let error_msg = ''
    console.log(username, password)
        // Fetch the hashed password from the database
        const selectQuery = 'SELECT * FROM Users WHERE username = ?';
        const param = [username]
        con.query(selectQuery, param, (selectErr, selectResult) => {
            if (selectErr) {
                res.status(500).json({ error: selectErr });
            } else if(selectResult.length > 0) {

                const hashedPassword = selectResult[0].password;

                // Compare the provided password with the hashed password from the database
                const passwordMatch = bcrypt.compareSync(password, hashedPassword)
                if (passwordMatch) {

                    
                    const {password, ...userData} = selectResult[0]
                    req.session.user = userData
                    
                    // If first time log in the system, redirect to change password
                    if(selectResult[0].first_login) {
                        return res.redirect('/set_password')
                    }
                    return res.redirect('/')
                } 
                // If wrong password, prompt user to try again
                error_msg = 'Wrong username or password'
                res.render('firstlogin', {error: error_msg, username: username, password: ''});            
            }
            else {
                error_msg = 'Account does not exist'
                res.render('firstlogin', {error: error_msg, username: username, password: ''});
            }
        });

        // con.end()    
});

module.exports = app